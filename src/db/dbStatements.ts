import { Connection, DbRetriveDataParams } from "@customTypes/db";
import { DbInsertionParams } from "@customTypes/db";

export async function insertRows(input: DbInsertionParams) {
    const { queriesColumns, queryValues, dataInserted, dbConnection } = input;

    if (queryValues.length === 0) {
        console.log(`No new ${dataInserted} to insert`);
        return
    }

    await dbConnection?.query(queriesColumns + queryValues.join(',\n'));
    console.log(`Inserted ${queryValues.length} ${dataInserted}`);

}

export async function getExistingValues(input: DbRetriveDataParams) {
    const { table, column, localData, dbConnection } = input;

    // @ts-ignore
    const [rows] = await dbConnection?.query(`SELECT ${column} FROM ${table};`)
    const existingData = new Set(rows.map((row: any) => Object.values(row).at(0)));
    const dataToinsert = localData.difference(existingData);

    return { dataToinsert }
}

export async function insertAll(input: {
    queries: DbInsertionParams,
    retriveData: DbRetriveDataParams,
    dbConnection: Connection
}) {

    const {
        queries: { dataInserted, queriesColumns, queryValues },
        retriveData: { column, localData, table }, dbConnection
    } = input;

    const { dataToinsert } = await getExistingValues({ table, column, localData, dbConnection });

    if (dataToinsert.size === 0) {
        console.log(`No new ${dataInserted} to insert`);
        return;
    }

    await insertRows({
        queriesColumns,
        queryValues,
        dataInserted,
        dbConnection
    });
}