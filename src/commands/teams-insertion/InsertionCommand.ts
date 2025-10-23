import { Connection, ResultSetHeader } from 'mysql2/promise'
import { InsertionConfig } from './InsertionConfig.js'
import { FilesData } from '@customTypes/fs'
import { BasicInsertions } from '@customTypes/core'

export class InsertionCommand {
  private dbConnection: Connection
  private FilesData: FilesData
  constructor(dbConnection: Connection, filesData: FilesData) {
    this.dbConnection = dbConnection
    this.FilesData = filesData
  }

  private GenerateQuery(table: string, columns: string[], values: string[][]) {
    return `
            INSERT IGNORE INTO ${table} (${columns.join(', ')})
            VALUES ${values
              .map(
                (valueSet) =>
                  `(${valueSet
                    .map((value) =>
                      value.startsWith('UUID_TO_BIN(') ||
                      value.startsWith('(SELECT') ||
                      value.startsWith('CAST(') ||
                      value === 'NULL'
                        ? value
                        : `'${value.replace(/'/g, "\\'")}'`
                    )
                    .join(', ')})`
              )
              .join(', ')}
        `
  }

  private async BasicInsertion(input: BasicInsertions, values: string[][]) {
    const currentInsertion = InsertionConfig[input]
    const QUERY = this.GenerateQuery(
      currentInsertion.table,
      currentInsertion.columns,
      values
    )
    const [result] = await this.dbConnection.query<ResultSetHeader>(QUERY)
    console.log(
      `Inserted ${result.affectedRows} ${currentInsertion.dataInserted}`
    )
  }

  public async InsertBasics(input: BasicInsertions[]) {
    for (const insertion of input) {
      const valuesKey = `${insertion}Values` as keyof FilesData
      await this.BasicInsertion(insertion, this.FilesData[valuesKey])
    }
    this.dbConnection.end()
  }
}
