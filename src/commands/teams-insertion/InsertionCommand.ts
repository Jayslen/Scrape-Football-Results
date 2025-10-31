import { Connection, ResultSetHeader } from 'mysql2/promise'
import { InsertionConfig } from './InsertionConfig.js'
import { FilesData } from '@customTypes/fs'
import { Insertions } from '@customTypes/core'
import DB from 'src/db/dbInstance.js'

export class InsertionCommand {
  private dbConnection!: Connection
  private static instance: InsertionCommand | null = null

  constructor(dbConnection: Connection) {
    this.dbConnection = dbConnection
  }

  private GenerateQuery(
    table: string,
    columns: string[],
    values: (string | number)[][]
  ) {
    return `
            INSERT IGNORE INTO ${table} (${columns.join(', ')})
            VALUES \n
            ${values
              .map(
                (valueSet) =>
                  `(${valueSet
                    .map((value) =>
                      typeof value === 'number' ||
                      value.startsWith('UUID_TO_BIN(') ||
                      value.startsWith('(SELECT') ||
                      value.startsWith('STR_TO_DATE(') ||
                      value === 'NULL'
                        ? value
                        : `'${value.replace(/'/g, "\\'")}'`
                    )
                    .join(', ')})`
              )
              .join(',\n')}
        `
  }

  public async Insertion(input: Insertions, values: string[][]) {
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
}
