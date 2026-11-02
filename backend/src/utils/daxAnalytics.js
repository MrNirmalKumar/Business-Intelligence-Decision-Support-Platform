/**
 * DAX Analytics & Business Logic Reference
 * Exact deterministic calculations mirrored from BIDSP.pbix and BIDSP_SQL_Analysis.sql
 */

/**
 * Business Health Score calculation directly mapped from DAX measure:
 * 
 * VAR Margin = [Profit Margin]
 * RETURN
 * SWITCH(
 *     TRUE(),
 *     Margin >= 0.15, 90,
 *     Margin >= 0.10, 80,
 *     Margin >= 0.05, 70,
 *     Margin >= 0.02, 60,
 *     Margin >= 0, 50,
 *     30
 * )
 */
function calculateHealthScore(profitMargin) {
    let score = 30;
    let category = 'Needs Attention';

    if (profitMargin >= 0.15) {
        score = 90;
        category = 'Excellent';
    } else if (profitMargin >= 0.10) {
        score = 80;
        category = 'Good';
    } else if (profitMargin >= 0.05) {
        score = 70;
        category = 'Average';
    } else if (profitMargin >= 0.02) {
        score = 60;
        category = 'Fair';
    } else if (profitMargin >= 0.00) {
        score = 50;
        category = 'Marginal';
    } else {
        score = 30;
        category = 'Critical (Loss-Making)';
    }

    return { score, category };
}

/**
 * Generates dynamic Business Insights & Recommendations matching the PBIX DAX measure:
 * 
 * VAR Margin = [Profit Margin]
 * VAR TechSales = CALCULATE([Total Sales], 'bidsp sales_data'[Category] = "Technology")
 * VAR TablesProfit = CALCULATE([Total Profit], 'bidsp sales_data'[Sub-Category] = "Tables")
 * RETURN
 *     "Profit Margin: " & FORMAT(Margin, "0.0%")
 *     & UNICHAR(10)
 *     & "Technology is the highest-sales category with " & FORMAT(TechSales, "#,##0") & " sales."
 *     & UNICHAR(10)
 *     & "Tables is the only loss-making sub-category with profit of " & FORMAT(TablesProfit, "#,##0") & "."
 *     & UNICHAR(10)
 *     & "Recommendation: Review Tables pricing and discount strategy to improve profitability."
 */
function generateDynamicDaxInsights({ totalSales, totalProfit, margin, categoryMap = {}, subCategoryMap = {} }) {
    const formattedMargin = (margin * 100).toFixed(1) + '%';

    // 1. Find Highest-Sales Category
    let topCategory = 'Technology';
    let topCatSales = 0;
    for (const [cat, data] of Object.entries(categoryMap)) {
        if (data.sales > topCatSales) {
            topCatSales = data.sales;
            topCategory = cat;
        }
    }
    const formattedTopSales = Math.round(topCatSales).toLocaleString();

    // 2. Find Loss-Making Sub-Categories
    const lossSubCategories = [];
    for (const [subCat, data] of Object.entries(subCategoryMap)) {
        if (data.profit < 0) {
            lossSubCategories.push({
                name: subCat,
                profit: data.profit,
                sales: data.sales,
                discount: data.discount
            });
        }
    }

    // Sort by largest loss (most negative profit)
    lossSubCategories.sort((a, b) => a.profit - b.profit);

    let lossStatement = '';
    let recommendation = '';

    if (lossSubCategories.length === 1) {
        const item = lossSubCategories[0];
        const formattedLoss = Math.round(item.profit).toLocaleString();
        lossStatement = `${item.name} is the only loss-making sub-category with profit of ${formattedLoss}.`;
        recommendation = `Review ${item.name} pricing and discount strategy to improve profitability.`;
    } else if (lossSubCategories.length > 1) {
        const worst = lossSubCategories[0];
        const formattedLoss = Math.round(worst.profit).toLocaleString();
        const otherNames = lossSubCategories.map(s => s.name).join(', ');
        lossStatement = `${lossSubCategories.length} sub-categories (${otherNames}) are loss-making, led by ${worst.name} with net profit of ${formattedLoss}.`;
        recommendation = `Restructure discount ceilings on ${otherNames} and eliminate negative margin fulfillment tiers.`;
    } else {
        lossStatement = 'All sub-categories are currently operating with positive net profit.';
        recommendation = 'Maintain current pricing controls and scale high-margin product catalog inventory.';
    }

    // Exact formatted multiline DAX string
    const daxNarrative = [
        `Profit Margin: ${formattedMargin}`,
        `${topCategory} is the highest-sales category with ${formattedTopSales} sales.`,
        lossStatement,
        `Recommendation: ${recommendation}`
    ].join('\n');

    return {
        daxNarrative,
        topCategory,
        topCatSales,
        lossSubCategories,
        recommendation
    };
}

module.exports = {
    calculateHealthScore,
    generateDynamicDaxInsights
};
