import { Connection, ResultSetHeader } from 'mysql2/promise'
import { InsertionConfig } from './InsertionConfig.js'
import { FilesData } from '@customTypes/fs'
import { Insertions } from '@customTypes/core'
import DB from 'src/db/dbInstance.js'

export class InsertionCommand {
  private dbConnection!: Connection
  private static instance: InsertionCommand | null = null

  private constructor() {}

  public static async getInstance(): Promise<InsertionCommand> {
    if (!InsertionCommand.instance) {
      const newInstance = new InsertionCommand()
      newInstance.dbConnection = await DB.getInstance()
      InsertionCommand.instance = newInstance
    }
    return InsertionCommand.instance
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

  private async Insertion(input: Insertions, values: string[][]) {
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

  public async insertTeamsData(input: Insertions, values: string[][]) {
    await this.Insertion(input, values)
  }
}
