const { neon } = require("@neondatabase/serverless");
require("dotenv").config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);

// 使用方法: node scripts/db-utils.js [コマンド] [テーブル名] [カラム名]

async function main() {
  const command = process.argv[2];
  const tableName = process.argv[3];
  const columnName = process.argv[4];

  if (!command) {
    console.log("使用方法:");
    console.log(
      "  node scripts/db-utils.js check [テーブル名]     - テーブル構造を確認",
    );
    console.log(
      "  node scripts/db-utils.js add [テーブル名] [カラム名] [型] - カラムを追加",
    );
    console.log(
      "  node scripts/db-utils.js drop [テーブル名] [カラム名] - カラムを削除",
    );
    console.log("  node scripts/db-utils.js list - 全テーブル一覧");
    return;
  }

  try {
    switch (command) {
      case "check":
        if (!tableName) {
          console.error("テーブル名を指定してください");
          return;
        }
        await checkTable(tableName);
        break;

      case "add": {
        if (!tableName || !columnName) {
          console.error("テーブル名とカラム名を指定してください");
          return;
        }
        const dataType = process.argv[5] || "TEXT";
        await addColumn(tableName, columnName, dataType);
        break;
      }

      case "drop":
        if (!tableName || !columnName) {
          console.error("テーブル名とカラム名を指定してください");
          return;
        }
        await dropColumn(tableName, columnName);
        break;

      case "list":
        await listTables();
        break;

      default:
        console.error("不明なコマンド:", command);
    }
  } catch (error) {
    console.error("❌ エラー:", error.message);
  }
}

async function checkTable(tableName) {
  const columns = await sql`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns 
    WHERE table_name = ${tableName}
    AND table_schema = 'public'
    ORDER BY ordinal_position
  `;

  console.log(`📋 ${tableName}テーブルの構造:`);
  columns.forEach((col) => {
    const nullable = col.is_nullable === "YES" ? "NULL" : "NOT NULL";
    const defaultVal = col.column_default
      ? ` DEFAULT ${col.column_default}`
      : "";
    console.log(
      `  - ${col.column_name}: ${col.data_type} (${nullable})${defaultVal}`,
    );
  });
}

async function addColumn(tableName, columnName, dataType) {
  await sql.unsafe(
    `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${dataType}`,
  );
  console.log(
    `✅ ${tableName}テーブルに${columnName}カラム(${dataType})を追加しました`,
  );
}

async function dropColumn(tableName, columnName) {
  await sql.unsafe(`ALTER TABLE ${tableName} DROP COLUMN ${columnName}`);
  console.log(`✅ ${tableName}テーブルから${columnName}カラムを削除しました`);
}

async function listTables() {
  const tables = await sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `;

  console.log("📋 データベース内のテーブル一覧:");
  tables.forEach((table) => {
    console.log(`  - ${table.table_name}`);
  });
}

main();
