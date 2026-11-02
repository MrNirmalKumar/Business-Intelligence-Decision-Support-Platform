import pandas as pd
import mysql.connector
from pathlib import Path


# ============================================================
# 1. PATH CONFIGURATION
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

RAW_FILE = BASE_DIR / "data" / "Global_Superstore2.csv"
CLEAN_FILE = BASE_DIR / "data" / "Global_Superstore2_Cleaned.csv"


# ============================================================
# 2. READ RAW DATA
# ============================================================

print("===== ETL PIPELINE STARTED =====")

df = pd.read_csv(
    RAW_FILE,
    encoding="cp1252"
)

print(f"Raw Dataset Loaded: {df.shape}")


# ============================================================
# 3. DATA VALIDATION
# ============================================================

expected_columns = [
    "Row ID",
    "Order ID",
    "Order Date",
    "Ship Date",
    "Ship Mode",
    "Customer ID",
    "Customer Name",
    "Segment",
    "City",
    "State",
    "Country",
    "Postal Code",
    "Market",
    "Region",
    "Product ID",
    "Category",
    "Sub-Category",
    "Product Name",
    "Sales",
    "Quantity",
    "Discount",
    "Profit",
    "Shipping Cost",
    "Order Priority"
]

missing_columns = [
    col for col in expected_columns
    if col not in df.columns
]

if missing_columns:
    raise ValueError(
        f"Missing columns in dataset: {missing_columns}"
    )

print("Column validation: PASSED")


# ============================================================
# 4. REMOVE DUPLICATE RECORDS
# ============================================================

duplicate_count = df.duplicated().sum()

print(f"Duplicate Rows Found: {duplicate_count}")

if duplicate_count > 0:
    df = df.drop_duplicates()

print(f"Rows after duplicate handling: {len(df)}")


# ============================================================
# 5. DATE TRANSFORMATION
# ============================================================

df["Order Date"] = pd.to_datetime(
    df["Order Date"],
    format="mixed",
    dayfirst=True,
    errors="coerce"
)

df["Ship Date"] = pd.to_datetime(
    df["Ship Date"],
    format="mixed",
    dayfirst=True,
    errors="coerce"
)

invalid_order_dates = df["Order Date"].isna().sum()
invalid_ship_dates = df["Ship Date"].isna().sum()

print(f"Invalid Order Dates: {invalid_order_dates}")
print(f"Invalid Ship Dates: {invalid_ship_dates}")


# ============================================================
# 6. NUMERIC DATA TYPE VALIDATION
# ============================================================

numeric_columns = [
    "Row ID",
    "Postal Code",
    "Sales",
    "Quantity",
    "Discount",
    "Profit",
    "Shipping Cost"
]

for column in numeric_columns:
    df[column] = pd.to_numeric(
        df[column],
        errors="coerce"
    )

print("Numeric datatype conversion: PASSED")


# ============================================================
# 7. POSTAL CODE HANDLING
# ============================================================

# Postal Code is optional location information.
# Missing values are preserved.

df["Postal Code"] = df["Postal Code"].astype("Int64")

print(
    "Missing Postal Codes:",
    df["Postal Code"].isna().sum()
)


# ============================================================
# 8. FINAL DATA QUALITY CHECK
# ============================================================

print("\n===== FINAL DATA QUALITY =====")

print("Rows:", len(df))
print("Columns:", len(df.columns))
print("Duplicate Rows:", df.duplicated().sum())

print("\nMissing Values:")
print(df.isna().sum())


# ============================================================
# 9. SAVE CLEANED DATASET
# ============================================================

df.to_csv(
    CLEAN_FILE,
    index=False,
    encoding="utf-8-sig"
)

print(
    f"\nCleaned Dataset Saved:\n{CLEAN_FILE}"
)


# ============================================================
# 10. MYSQL CONNECTION
# ============================================================

print("\n===== MYSQL CONNECTION =====")

mysql_password = input("Enter MySQL password: ")

connection = mysql.connector.connect(
    host="localhost",
    user="root",
    password=mysql_password,
    database="bidsp",
    allow_local_infile=True
)

cursor = connection.cursor()

print("MySQL connection: SUCCESS")


# ============================================================
# 11. CREATE TABLE
# ============================================================

create_table_query = """
CREATE TABLE IF NOT EXISTS sales_data (
    `Row ID` INT,
    `Order ID` VARCHAR(50),
    `Order Date` DATE,
    `Ship Date` DATE,
    `Ship Mode` VARCHAR(30),
    `Customer ID` VARCHAR(30),
    `Customer Name` VARCHAR(150),
    `Segment` VARCHAR(30),
    `City` VARCHAR(100),
    `State` VARCHAR(100),
    `Country` VARCHAR(100),
    `Postal Code` INT NULL,
    `Market` VARCHAR(30),
    `Region` VARCHAR(50),
    `Product ID` VARCHAR(50),
    `Category` VARCHAR(50),
    `Sub-Category` VARCHAR(50),
    `Product Name` VARCHAR(255),
    `Sales` DECIMAL(15,3),
    `Quantity` INT,
    `Discount` DECIMAL(5,3),
    `Profit` DECIMAL(15,4),
    `Shipping Cost` DECIMAL(15,3),
    `Order Priority` VARCHAR(20)
)
"""

cursor.execute(create_table_query)

print("Table validation: SUCCESS")


# ============================================================
# 12. CLEAR OLD DATA
# ============================================================

cursor.execute("TRUNCATE TABLE sales_data")

print("Existing table data cleared")


# ============================================================
# 13. PREPARE DATA FOR MYSQL
# ============================================================

df_mysql = df.copy()

# Convert datetime to Python date
df_mysql["Order Date"] = df_mysql["Order Date"].dt.date
df_mysql["Ship Date"] = df_mysql["Ship Date"].dt.date

# Convert pandas NA to None
df_mysql = df_mysql.astype(object).where(
    pd.notna(df_mysql),
    None
)


# ============================================================
# 14. INSERT DATA INTO MYSQL
# ============================================================

insert_query = """
INSERT INTO sales_data (
    `Row ID`,
    `Order ID`,
    `Order Date`,
    `Ship Date`,
    `Ship Mode`,
    `Customer ID`,
    `Customer Name`,
    `Segment`,
    `City`,
    `State`,
    `Country`,
    `Postal Code`,
    `Market`,
    `Region`,
    `Product ID`,
    `Category`,
    `Sub-Category`,
    `Product Name`,
    `Sales`,
    `Quantity`,
    `Discount`,
    `Profit`,
    `Shipping Cost`,
    `Order Priority`
)
VALUES (
    %s, %s, %s, %s, %s, %s,
    %s, %s, %s, %s, %s, %s,
    %s, %s, %s, %s, %s, %s,
    %s, %s, %s, %s, %s, %s
)
"""


data = list(
    df_mysql.itertuples(
        index=False,
        name=None
    )
)

print(f"Records ready for MySQL: {len(data)}")


# Insert in batches
batch_size = 1000

for i in range(0, len(data), batch_size):

    batch = data[i:i + batch_size]

    cursor.executemany(
        insert_query,
        batch
    )

    connection.commit()

    print(
        f"Inserted: {min(i + batch_size, len(data))}/{len(data)}"
    )


# ============================================================
# 15. VERIFY MYSQL DATA
# ============================================================

cursor.execute(
    "SELECT COUNT(*) FROM sales_data"
)

mysql_count = cursor.fetchone()[0]

print("\n===== MYSQL VERIFICATION =====")
print("Rows in MySQL:", mysql_count)


# ============================================================
# 16. CLOSE CONNECTION
# ============================================================

cursor.close()
connection.close()

print("\n===== ETL PIPELINE COMPLETED =====")