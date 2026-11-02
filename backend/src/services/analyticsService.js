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

// Build fast field accessors once per file instead of repeatedly scanning keys for every row
const buildFieldAccessors = (sampleRow) => {
    if (!sampleRow) return {};
    const rowKeys = Object.keys(sampleRow);
    const normMap = {};
    for (const key of rowKeys) {
        normMap[normalizeKey(key)] = key;
    }

    const resolve = (candidateKeys) => {
        for (const cand of candidateKeys) {
            const normCand = normalizeKey(cand);
            if (normMap[normCand] !== undefined) {
                return normMap[normCand];
            }
        }
        return null;
    };

    return {
        row_id: resolve(['rowid', 'row_id', 'id']),
        order_id: resolve(['orderid', 'order_id', 'invoice', 'invoiceno']),
        customer_id: resolve(['customerid', 'customer_id', 'clientid']),
        customer_name: resolve(['customername', 'customer_name', 'client', 'name']),
        order_date: resolve(['orderdate', 'order_date', 'date']),
        ship_date: resolve(['shipdate', 'ship_date']),
        ship_mode: resolve(['shipmode', 'ship_mode', 'deliverytype']),
        segment: resolve(['segment', 'customersegment', 'type']),
        order_priority: resolve(['orderpriority', 'order_priority', 'priority']),
        city: resolve(['city', 'town']),
        state: resolve(['state', 'province']),
        country: resolve(['country', 'nation']),
        postal_code: resolve(['postalcode', 'postal_code', 'zip', 'zipcode']),
        market: resolve(['market', 'regionmarket']),
        region: resolve(['region', 'territory', 'location']),
        product_id: resolve(['productid', 'product_id', 'skuid', 'sku']),
        category: resolve(['category', 'productcategory', 'department']),
        sub_category: resolve(['subcategory', 'sub_category', 'sub-category']),
        product_name: resolve(['productname', 'product_name', 'itemname', 'description']),
        sales: resolve(['sales', 'revenue', 'amount', 'total', 'price']),
        quantity: resolve(['quantity', 'qty', 'units', 'count']),
        discount: resolve(['discount', 'rebate']),
        profit: resolve(['profit', 'netprofit', 'margin']),
        shipping_cost: resolve(['shippingcost', 'shipping_cost', 'freight'])
    };
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

const parseCustomDateFast = (val, dateCache) => {
    if (!val) return new Date();
    if (val instanceof Date) return isNaN(val.getTime()) ? new Date() : val;
    if (typeof val === 'number') {
        if (val > 1000 && val < 100000) {
            return new Date(Math.round((val - 25569) * 86400 * 1000));
        }
        return new Date(val);
    }
    const str = String(val).trim();
    if (!str) return new Date();

    if (dateCache.has(str)) return dateCache.get(str);

    let d;
    if (str.length === 10) {
        if (str.charCodeAt(4) === 45 && str.charCodeAt(7) === 45) { // YYYY-MM-DD
            const y = parseInt(str.substring(0, 4), 10);
            const m = parseInt(str.substring(5, 7), 10) - 1;
            const day = parseInt(str.substring(8, 10), 10);
            d = new Date(Date.UTC(y, m, day));
        } else if (str.charCodeAt(2) === 45 && str.charCodeAt(5) === 45) { // DD-MM-YYYY
            const day = parseInt(str.substring(0, 2), 10);
            const m = parseInt(str.substring(3, 5), 10) - 1;
            const y = parseInt(str.substring(6, 10), 10);
            d = new Date(Date.UTC(y, m, day));
        }
    }
    if (!d || isNaN(d.getTime())) {
        d = parseCustomDate(str);
    }
    if (dateCache.size < 5000) {
        dateCache.set(str, d);
    }
    return d;
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

        // Map, clean and deduplicate rows using fast O(1) field accessors
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

        const accessors = buildFieldAccessors(rawRows[0]);
        const dateCache = new Map();

        for (let i = 0; i < rawRows.length; i++) {
            const row = rawRows[i];

            // 1. Primary Identifiers
            const rawRowId = accessors.row_id ? parseInt(row[accessors.row_id], 10) : NaN;
            const row_id = isNaN(rawRowId) ? (i + 1) : rawRowId;
            const rawOrderId = accessors.order_id ? row[accessors.order_id] : null;
            const order_id = (rawOrderId ? String(rawOrderId).trim() : `ORD-${i + 1}`);

            // Check duplicate signature if row_id exists
            const rowSignature = `${row_id}-${order_id}`;
            if (seenSignatures.has(rowSignature)) {
                continue; // Skip duplicate record as per etl_pipeline.py
            }
            seenSignatures.add(rowSignature);

            const rawCustId = accessors.customer_id ? row[accessors.customer_id] : null;
            const customer_id = (rawCustId ? String(rawCustId).trim() : `CUST-${order_id}`);
            const rawCustName = accessors.customer_name ? row[accessors.customer_name] : null;
            const customer_name = (rawCustName ? String(rawCustName).trim() : customer_id);

            // 2. Dates
            const rawOrderDate = accessors.order_date ? row[accessors.order_date] : null;
            const rawShipDate = accessors.ship_date ? row[accessors.ship_date] : null;
            const order_date = parseCustomDateFast(rawOrderDate, dateCache);
            const ship_date = rawShipDate ? parseCustomDateFast(rawShipDate, dateCache) : order_date;

            // 3. Shipping & Customer Segment
            const rawShipMode = accessors.ship_mode ? row[accessors.ship_mode] : null;
            const ship_mode = rawShipMode ? String(rawShipMode).trim() : 'Standard Class';
            const rawSegment = accessors.segment ? row[accessors.segment] : null;
            const segment = rawSegment ? String(rawSegment).trim() : 'Consumer';
            const rawPriority = accessors.order_priority ? row[accessors.order_priority] : null;
            const order_priority = rawPriority ? String(rawPriority).trim() : 'Medium';

            // 4. Geographic fields
            const city = accessors.city && row[accessors.city] ? String(row[accessors.city]).trim() : '';
            const state = accessors.state && row[accessors.state] ? String(row[accessors.state]).trim() : '';
            const country = accessors.country && row[accessors.country] ? String(row[accessors.country]).trim() : '';
            const rawPostal = accessors.postal_code ? parseInt(row[accessors.postal_code], 10) : NaN;
            const postal_code = isNaN(rawPostal) ? null : rawPostal;
            const market = accessors.market && row[accessors.market] ? String(row[accessors.market]).trim() : 'Global';
            const region = accessors.region && row[accessors.region] ? String(row[accessors.region]).trim() : 'Global';

            // 5. Product fields
            const rawProdId = accessors.product_id ? row[accessors.product_id] : null;
            const product_id = rawProdId ? String(rawProdId).trim() : `PRD-${i + 1}`;
            const rawCategory = accessors.category ? row[accessors.category] : null;
            const category = rawCategory ? String(rawCategory).trim() : 'General';
            const rawSubCat = accessors.sub_category ? row[accessors.sub_category] : null;
            const sub_category = rawSubCat ? String(rawSubCat).trim() : category;
            const rawProdName = accessors.product_name ? row[accessors.product_name] : null;
            const product_name = rawProdName ? String(rawProdName).trim() : product_id;

            // 6. Numerics
            const rawSales = accessors.sales ? parseFloat(row[accessors.sales]) : 0;
            const rawQty = accessors.quantity ? parseInt(row[accessors.quantity], 10) : 1;
            const rawDiscount = accessors.discount ? parseFloat(row[accessors.discount]) : 0;
            const rawProfit = accessors.profit ? parseFloat(row[accessors.profit]) : 0;
            const rawShippingCost = accessors.shipping_cost ? parseFloat(row[accessors.shipping_cost]) : 0;

            const sales = Math.round((isNaN(rawSales) ? 0 : rawSales) * 100) / 100;
            const quantity = Math.max(1, isNaN(rawQty) ? 1 : rawQty);
            const discVal = isNaN(rawDiscount) ? 0 : rawDiscount;
            const discount = Math.min(1, Math.max(0, discVal > 1 ? discVal / 100 : discVal));
            const profit = Math.round((isNaN(rawProfit) ? 0 : rawProfit) * 100) / 100;
            const shipping_cost = Math.round((isNaN(rawShippingCost) ? 0 : rawShippingCost) * 100) / 100;

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

        // Insert records in optimized batches directly using native driver for 10x throughput
        const batchSize = 3000;
        for (let i = 0; i < recordsToInsert.length; i += batchSize) {
            const batch = recordsToInsert.slice(i, i + batchSize);
            await DatasetRecord.collection.insertMany(batch, { ordered: false });
        }
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
