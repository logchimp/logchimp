import { afterAll, beforeAll } from "vitest";
import database from "./src/database";

export interface TableInserts {
  tableName: string;
  columnName: string;
  uniqueValue: string | number | string;
}

declare global {
  var tableInserts: TableInserts[];
}

beforeAll(async () => {
  globalThis.tableInserts = [];
});

afterAll(async () => {
  console.log("totalTables: ", globalThis.tableInserts.length);

    while (globalThis.tableInserts.length > 0) {
      const inserts = globalThis.tableInserts.shift();
      if (inserts) {
        await database
        .table(inserts.tableName)
        .where(inserts.columnName, inserts.uniqueValue)
        .del();
      }
    }
});
