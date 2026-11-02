-- BIDSP - SQL Analysis Queries
-- Database: bidsp
-- Table: sales_data
-- Purpose: Reference analytics queries used for Power BI / website validation.

USE bidsp;

-- 1. OVERALL KPIs
SELECT COUNT(DISTINCT `Order ID`) AS Total_Orders,
       COUNT(DISTINCT `Customer ID`) AS Total_Customers,
       SUM(`Sales`) AS Total_Sales,
       SUM(`Profit`) AS Total_Profit,
       SUM(`Quantity`) AS Total_Quantity
FROM sales_data;

-- 2. SALES & PROFIT BY CATEGORY
SELECT `Category`, SUM(`Sales`) AS Total_Sales,
       SUM(`Profit`) AS Total_Profit, SUM(`Quantity`) AS Total_Quantity
FROM sales_data GROUP BY `Category` ORDER BY Total_Sales DESC;

-- 3. SALES & PROFIT BY SUB-CATEGORY
SELECT `Sub-Category`, SUM(`Sales`) AS Total_Sales,
       SUM(`Profit`) AS Total_Profit, SUM(`Quantity`) AS Total_Quantity
FROM sales_data GROUP BY `Sub-Category` ORDER BY Total_Sales DESC;

-- 4. LOSS-MAKING SUB-CATEGORIES
SELECT `Sub-Category`, SUM(`Sales`) AS Total_Sales,
       SUM(`Profit`) AS Total_Profit, SUM(`Quantity`) AS Total_Quantity
FROM sales_data GROUP BY `Sub-Category`
HAVING SUM(`Profit`) < 0 ORDER BY Total_Profit ASC;

-- 5. YEAR-WISE SALES & PROFIT
SELECT YEAR(`Order Date`) AS Year, SUM(`Sales`) AS Total_Sales,
       SUM(`Profit`) AS Total_Profit, SUM(`Quantity`) AS Total_Quantity
FROM sales_data GROUP BY YEAR(`Order Date`) ORDER BY Year;

-- 6. REGION-WISE SALES & PROFIT
SELECT `Region`, SUM(`Sales`) AS Total_Sales,
       SUM(`Profit`) AS Total_Profit, SUM(`Quantity`) AS Total_Quantity
FROM sales_data GROUP BY `Region` ORDER BY Total_Sales DESC;

-- 7. MARKET-WISE SALES & PROFIT
SELECT `Market`, SUM(`Sales`) AS Total_Sales,
       SUM(`Profit`) AS Total_Profit, SUM(`Quantity`) AS Total_Quantity
FROM sales_data GROUP BY `Market` ORDER BY Total_Sales DESC;

-- 9. SHIPPING MODE PERFORMANCE
SELECT `Ship Mode`, SUM(`Sales`) AS Total_Sales,
       SUM(`Profit`) AS Total_Profit, SUM(`Quantity`) AS Total_Quantity
FROM sales_data GROUP BY `Ship Mode` ORDER BY Total_Sales DESC;

-- 10. TOP 10 CUSTOMERS BY SALES
SELECT `Customer ID`, `Customer Name`, SUM(`Sales`) AS Total_Sales,
       SUM(`Profit`) AS Total_Profit
FROM sales_data GROUP BY `Customer ID`, `Customer Name`
ORDER BY Total_Sales DESC LIMIT 10;

-- 11. TOP 10 PRODUCTS BY SALES
SELECT `Product ID`, `Product Name`, SUM(`Sales`) AS Total_Sales,
       SUM(`Profit`) AS Total_Profit
FROM sales_data GROUP BY `Product ID`, `Product Name`
ORDER BY Total_Sales DESC LIMIT 10;

-- 12. ORDERS BY PRIORITY
SELECT `Order Priority`, COUNT(DISTINCT `Order ID`) AS Total_Orders,
       SUM(`Sales`) AS Total_Sales, SUM(`Profit`) AS Total_Profit
FROM sales_data GROUP BY `Order Priority` ORDER BY Total_Orders DESC;

-- 13. SHIPPING COST BY SHIPPING MODE
SELECT `Ship Mode`, SUM(`Shipping Cost`) AS Total_Shipping_Cost,
       SUM(`Sales`) AS Total_Sales, SUM(`Profit`) AS Total_Profit
FROM sales_data GROUP BY `Ship Mode` ORDER BY Total_Shipping_Cost DESC;

-- 14. SEGMENT-WISE SALES & PROFIT
SELECT `Segment`, SUM(`Sales`) AS Total_Sales,
       SUM(`Profit`) AS Total_Profit, SUM(`Quantity`) AS Total_Quantity
FROM sales_data GROUP BY `Segment` ORDER BY Total_Sales DESC;

-- 15. MONTHLY SALES
SELECT YEAR(`Order Date`) AS Year, MONTH(`Order Date`) AS Month_Number,
       DATE_FORMAT(`Order Date`, '%Y-%m') AS Year_Month,
       SUM(`Sales`) AS Total_Sales
FROM sales_data
GROUP BY YEAR(`Order Date`), MONTH(`Order Date`), DATE_FORMAT(`Order Date`, '%Y-%m')
ORDER BY Year, Month_Number;

-- 16. DISCOUNT VS PROFIT
SELECT `Sub-Category`, AVG(`Discount`) AS Average_Discount,
       SUM(`Profit`) AS Total_Profit, SUM(`Sales`) AS Total_Sales
FROM sales_data GROUP BY `Sub-Category` ORDER BY Average_Discount;

-- 17. DATA QUALITY CHECKS
SELECT COUNT(*) AS Total_Rows FROM sales_data;

SELECT COUNT(*) AS Duplicate_Row_IDs
FROM (
    SELECT `Row ID` FROM sales_data
    GROUP BY `Row ID` HAVING COUNT(*) > 1
) AS duplicates;

SELECT COUNT(*) AS Missing_Postal_Code
FROM sales_data WHERE `Postal Code` IS NULL;
