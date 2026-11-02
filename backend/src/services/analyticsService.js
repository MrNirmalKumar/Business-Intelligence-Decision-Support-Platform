const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const Dataset = require('../models/Dataset');
const DatasetRecord = require('../models/DatasetRecord');
const HealthScore = require('../models/HealthScore');
const Insight = require('../models/Insight');
const { calculateHealthScore, generateDynamicDaxInsights } = require('../utils/daxAnalytics');

const normalizeKey = (key) => {
    return key ? key.toString().trim().toLowerCase().replace(/[\s_.-]+/g, '') : '';
};

const findField = (row, candidateKeys) => {
    const rowKeys = Object.keys(row);
    for (const cand of candidateKeys) {
        const normCand = cand.toLowerCase().replace(/[\s_.-]+/g, '');
        const matched = rowKeys.find(k => normalizeKey(k) === normCand);
        if (matched !== undefined) {
            return row[matched];
        }
    }
    return undefined;
};

const parseCustomDate = (val) => {
    if (!val) return new Date();
    if (val instanceof Date) return isNaN(val.getTime()) ? new Date() : val;
    if (typeof val === 'number') {
        if (val > 1000 && val < 100000) {
            return new Date(Math.round((val - 25569) * 86400 * 1000));
        }
        return new Date(val);
    }
    const str = String(val).trim();
    if (str.includes('-')) {
        const parts = str.split('-');
        if (parts.length === 3) {
            if (parts[0].length === 4) {
                // YYYY-MM-DD
                const d = new Date(str);
                if (!isNaN(d.getTime())) return d;
            } else if (parts[2].length === 4) {
                // DD-MM-YYYY
                const day = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1;
                const year = parseInt(parts[2], 10);
                const d = new Date(year, month, day);
                if (!isNaN(d.getTime())) return d;
            }
        }
    } else if (str.includes('/')) {
        const parts = str.split('/');
        if (parts.length === 3) {
            const p0 = parseInt(parts[0], 10);
            const p1 = parseInt(parts[1], 10);
            const p2 = parseInt(parts[2], 10);
            const year = p2 < 100 ? (p2 > 50 ? 1900 + p2 : 2000 + p2) : p2;
            if (p0 > 12) {
                // Day first
                const d = new Date(year, p1 - 1, p0);
                if (!isNaN(d.getTime())) return d;
            } else {
                // Default Day first if consistent with etl_pipeline.py
                const d = new Date(year, p1 - 1, p0);
                if (!isNaN(d.getTime())) return d;
            }
        }
    }
    const fallback = new Date(str);
    return isNaN(fallback.getTime()) ? new Date() : fallback;
};

const parseFileRecords = async (filePath, fileType) => {
    const ext = path.extname(filePath).toLowerCase();
    const records = [];

    if (ext === '.csv') {
        return new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (data) => records.push(data))
                .on('end', () => resolve(records))
                .on('error', (err) => reject(err));
        });
    } else if (ext === '.xlsx' || ext === '.xls') {
        const workbook = xlsx.readFile(filePath);
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        return xlsx.utils.sheet_to_json(worksheet, { cellDates: true });
    }
    throw new Error('Unsupported file extension: ' + ext);
};

const processDatasetAnalytics = async (datasetId) => {
    const dataset = await Dataset.findById(datasetId);
    if (!dataset) {
        throw new Error('Dataset not found');
    }

    try {
        dataset.status = 'processing';
        await dataset.save();

        const rawRows = await parseFileRecords(dataset.file_path, dataset.file_type);

        if (!rawRows || rawRows.length === 0) {
            dataset.status = 'failed';
            await dataset.save();
            throw new Error('The uploaded file is empty');
        }

        // Clean existing records if any
        await DatasetRecord.deleteMany({ dataset_id: datasetId });
        await Insight.deleteMany({ dataset_id: datasetId });
        await HealthScore.deleteMany({ dataset_id: datasetId });

        // Map, clean and deduplicate rows
        const recordsToInsert = [];
        const seenSignatures = new Set();
        let totalSales = 0;
        let totalProfit = 0;
        let totalQuantity = 0;
        let totalShippingCost = 0;
        let totalDiscount = 0;
        const uniqueOrders = new Set();
        const uniqueCustomers = new Set();

        const categoryMap = {};
        const subCategoryMap = {};
        const regionMap = {};
        const marketMap = {};
        const segmentMap = {};
        const shipModeMap = {};
        const priorityMap = {};

        for (let i = 0; i < rawRows.length; i++) {
            const row = rawRows[i];

            // 1. Primary Identifiers
            const rawRowId = parseInt(findField(row, ['rowid', 'row_id', 'id']), 10);
            const row_id = isNaN(rawRowId) ? (i + 1) : rawRowId;
            const order_id = String(findField(row, ['orderid', 'order_id', 'invoice', 'invoiceno']) || `ORD-${i + 1}`).trim();
            const customer_id = String(findField(row, ['customerid', 'customer_id', 'clientid']) || `CUST-${order_id}`).trim();
            const customer_name = String(findField(row, ['customername', 'customer_name', 'client', 'name']) || customer_id).trim();

            // Check duplicate signature if row_id exists
            const rowSignature = `${row_id}-${order_id}`;
            if (seenSignatures.has(rowSignature)) {
                continue; // Skip duplicate record as per etl_pipeline.py
            }
            seenSignatures.add(rowSignature);

            // 2. Dates
            const rawOrderDate = findField(row, ['orderdate', 'order_date', 'date']);
            const rawShipDate = findField(row, ['shipdate', 'ship_date']);
            const order_date = parseCustomDate(rawOrderDate);
            const ship_date = rawShipDate ? parseCustomDate(rawShipDate) : order_date;

            // 3. Shipping & Customer Segment
            const ship_mode = String(findField(row, ['shipmode', 'ship_mode', 'deliverytype']) || 'Standard Class').trim();
            const segment = String(findField(row, ['segment', 'customersegment', 'type']) || 'Consumer').trim();
            const order_priority = String(findField(row, ['orderpriority', 'order_priority', 'priority']) || 'Medium').trim();

            // 4. Geographic fields
            const city = String(findField(row, ['city', 'town']) || '').trim();
            const state = String(findField(row, ['state', 'province']) || '').trim();
            const country = String(findField(row, ['country', 'nation']) || '').trim();
            const rawPostal = parseInt(findField(row, ['postalcode', 'postal_code', 'zip', 'zipcode']), 10);
            const postal_code = isNaN(rawPostal) ? null : rawPostal;
            const market = String(findField(row, ['market', 'regionmarket']) || 'Global').trim();
            const region = String(findField(row, ['region', 'territory', 'location']) || 'Global').trim();

            // 5. Product fields
            const product_id = String(findField(row, ['productid', 'product_id', 'skuid', 'sku']) || `PRD-${i + 1}`).trim();
            const category = String(findField(row, ['category', 'productcategory', 'department']) || 'General').trim();
            const sub_category = String(findField(row, ['subcategory', 'sub_category', 'sub-category']) || category).trim();
            const product_name = String(findField(row, ['productname', 'product_name', 'itemname', 'description']) || product_id).trim();

            // 6. Numerics
            const rawSales = parseFloat(findField(row, ['sales', 'revenue', 'amount', 'total', 'price'])) || 0;
            const rawQty = parseInt(findField(row, ['quantity', 'qty', 'units', 'count']), 10) || 1;
            const rawDiscount = parseFloat(findField(row, ['discount', 'rebate'])) || 0;
            const rawProfit = parseFloat(findField(row, ['profit', 'netprofit', 'margin'])) || 0;
            const rawShippingCost = parseFloat(findField(row, ['shippingcost', 'shipping_cost', 'freight'])) || 0;

            const sales = Math.round(rawSales * 100) / 100;
            const quantity = Math.max(1, rawQty);
            const discount = Math.min(1, Math.max(0, rawDiscount > 1 ? rawDiscount / 100 : rawDiscount));
            const profit = Math.round(rawProfit * 100) / 100;
            const shipping_cost = Math.round(rawShippingCost * 100) / 100;

            // Aggregations
            totalSales += sales;
            totalProfit += profit;
            totalQuantity += quantity;
            totalShippingCost += shipping_cost;
            totalDiscount += discount;
            uniqueOrders.add(order_id);
            uniqueCustomers.add(customer_id);

            // Category & Sub-Category
            if (!categoryMap[category]) categoryMap[category] = { sales: 0, profit: 0, quantity: 0, count: 0 };
            categoryMap[category].sales += sales;
            categoryMap[category].profit += profit;
            categoryMap[category].quantity += quantity;
            categoryMap[category].count += 1;

            if (!subCategoryMap[sub_category]) subCategoryMap[sub_category] = { sales: 0, profit: 0, quantity: 0, discountSum: 0, count: 0 };
            subCategoryMap[sub_category].sales += sales;
            subCategoryMap[sub_category].profit += profit;
            subCategoryMap[sub_category].quantity += quantity;
            subCategoryMap[sub_category].discountSum += discount;
            subCategoryMap[sub_category].count += 1;

            // Region & Market
            if (!regionMap[region]) regionMap[region] = { sales: 0, profit: 0, quantity: 0, count: 0 };
            regionMap[region].sales += sales;
            regionMap[region].profit += profit;
            regionMap[region].quantity += quantity;
            regionMap[region].count += 1;

            if (!marketMap[market]) marketMap[market] = { sales: 0, profit: 0, count: 0 };
            marketMap[market].sales += sales;
            marketMap[market].profit += profit;
            marketMap[market].count += 1;

            // Segment & Ship Mode & Priority
            if (!segmentMap[segment]) segmentMap[segment] = { sales: 0, profit: 0, count: 0 };
            segmentMap[segment].sales += sales;
            segmentMap[segment].profit += profit;
            segmentMap[segment].count += 1;

            if (!shipModeMap[ship_mode]) shipModeMap[ship_mode] = { sales: 0, profit: 0, shipping_cost: 0, count: 0 };
            shipModeMap[ship_mode].sales += sales;
            shipModeMap[ship_mode].profit += profit;
            shipModeMap[ship_mode].shipping_cost += shipping_cost;
            shipModeMap[ship_mode].count += 1;

            if (!priorityMap[order_priority]) priorityMap[order_priority] = { orders: new Set(), sales: 0, profit: 0 };
            priorityMap[order_priority].orders.add(order_id);
            priorityMap[order_priority].sales += sales;
            priorityMap[order_priority].profit += profit;

            recordsToInsert.push({
                dataset_id: datasetId,
                row_id,
                order_id,
                order_date,
                ship_date,
                ship_mode,
                customer_id,
                customer_name,
                segment,
                city,
                state,
                country,
                postal_code,
                market,
                region,
                product_id,
                category,
                sub_category,
                product_name,
                sales,
                quantity,
                discount,
                profit,
                shipping_cost,
                order_priority
            });
        }

        // Insert records in batches
        const batchSize = 10000;
        for (let i = 0; i < recordsToInsert.length; i += batchSize) {
            await DatasetRecord.insertMany(recordsToInsert.slice(i, i + batchSize), { ordered: false });
        }

        // Calculate KPI values
        const totalOrdersCount = uniqueOrders.size;
        const totalCustomersCount = uniqueCustomers.size;
        const profitMargin = totalSales > 0 ? (totalProfit / totalSales) : 0;
        const avgOrderValue = totalOrdersCount > 0 ? (totalSales / totalOrdersCount) : 0;

        // Calculate DAX Business Health Score
        const { score: healthScoreValue, category: healthCategory } = calculateHealthScore(profitMargin);

        const healthScoreDoc = await HealthScore.create({
            dataset_id: datasetId,
            score: healthScoreValue,
            score_category: healthCategory,
            breakdown: {
                total_sales: Math.round(totalSales * 100) / 100,
                total_profit: Math.round(totalProfit * 100) / 100,
                total_orders: totalOrdersCount,
                total_customers: totalCustomersCount,
                total_quantity: totalQuantity,
                profit_margin_pct: Math.round(profitMargin * 10000) / 100,
                avg_order_value: Math.round(avgOrderValue * 100) / 100,
                formula: "SWITCH(Profit Margin >= 0.15 => 90, >= 0.10 => 80, >= 0.05 => 70, >= 0.02 => 60, >= 0 => 50, 30)"
            }
        });

        // Generate Dynamic DAX Insights & Recommendations
        const daxInsightsResult = generateDynamicDaxInsights({
            totalSales,
            totalProfit,
            margin: profitMargin,
            categoryMap,
            subCategoryMap
        });

        const insightsToInsert = [];

        // 1. Primary Executive DAX Narrative Insight
        insightsToInsert.push({
            dataset_id: datasetId,
            category: 'Executive Overview',
            title: 'Business Insights & Recommendations (DAX Reference)',
            description: daxInsightsResult.daxNarrative,
            severity: profitMargin < 0.05 ? 'high' : (profitMargin < 0.10 ? 'medium' : 'low'),
            recommendation: daxInsightsResult.recommendation
        });

        // 2. Loss-Making Sub-Categories Insight
        if (daxInsightsResult.lossSubCategories.length > 0) {
            const worst = daxInsightsResult.lossSubCategories[0];
            insightsToInsert.push({
                dataset_id: datasetId,
                category: 'Sub-Category Profitability',
                title: `Loss-Making Sub-Category Detected: ${worst.name}`,
                description: `${worst.name} generated a negative net profit of $${Math.abs(worst.profit).toLocaleString()} across ${worst.sales ? '$' + Math.round(worst.sales).toLocaleString() : ''} in sales.`,
                severity: 'high',
                recommendation: `Review ${worst.name} pricing structure and restrict promotional discount margins.`
            });
        }

        // 3. Top Category Driver
        insightsToInsert.push({
            dataset_id: datasetId,
            category: 'Category Performance',
            title: `Highest Revenue Driver: ${daxInsightsResult.topCategory}`,
            description: `${daxInsightsResult.topCategory} generated $${Math.round(daxInsightsResult.topCatSales).toLocaleString()} in revenue, contributing most significantly to overall sales volume.`,
            severity: 'low',
            recommendation: `Allocate additional inventory and marketing capital to high-margin SKUs within ${daxInsightsResult.topCategory}.`
        });

        // 4. Regional & Market Performance
        const sortedRegions = Object.entries(regionMap).sort((a, b) => b[1].sales - a[1].sales);
        if (sortedRegions.length > 0) {
            const topRegion = sortedRegions[0];
            const lossRegions = sortedRegions.filter(([r, d]) => d.profit < 0);
            if (lossRegions.length > 0) {
                insightsToInsert.push({
                    dataset_id: datasetId,
                    category: 'Regional Analysis',
                    title: `Loss-Making Region: ${lossRegions[0][0]}`,
                    description: `The ${lossRegions[0][0]} region operated with negative net profit ($${Math.abs(Math.round(lossRegions[0][1].profit)).toLocaleString()}).`,
                    severity: 'high',
                    recommendation: `Audit logistics and freight partners in ${lossRegions[0][0]} to reduce fulfillment costs.`
                });
            } else {
                insightsToInsert.push({
                    dataset_id: datasetId,
                    category: 'Regional Analysis',
                    title: `Top Performing Region: ${topRegion[0]}`,
                    description: `${topRegion[0]} leads regional sales with $${Math.round(topRegion[1].sales).toLocaleString()} and healthy profit of $${Math.round(topRegion[1].profit).toLocaleString()}.`,
                    severity: 'low',
                    recommendation: `Replicate ${topRegion[0]} fulfillment and distribution strategy across secondary markets.`
                });
            }
        }

        await Insight.insertMany(insightsToInsert);

        dataset.row_count = recordsToInsert.length;
        dataset.status = 'processed';
        await dataset.save();

        return {
            dataset,
            healthScore: healthScoreDoc,
            insightsCount: insightsToInsert.length,
            recordsCount: recordsToInsert.length
        };
    } catch (err) {
        console.error('Error processing dataset analytics:', err);
        dataset.status = 'failed';
        await dataset.save();
        throw err;
    }
};

module.exports = {
    processDatasetAnalytics
};
