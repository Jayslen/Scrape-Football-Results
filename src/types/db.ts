import { Connection as DBConnection } from 'mysql2/promise'

export type Connection = DBConnection

export type DbDataInsertionParams = {
    queriesColumns: string
    queryValues: string[]
    dataInserted: string
    dbConnection?: Connection
}

export type DbRetriveDataParams = {
    table: string
    column: string
    localData: Set<string>
    dbConnection?: Connection
}
