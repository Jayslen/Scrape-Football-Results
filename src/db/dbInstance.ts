import mysql from 'mysql2/promise';
import { databaseConfig } from '../config.js'


export class DB {
    static instace: mysql.Connection | null = null

    static async initialize() {
        if (!DB.instace) {
            DB.instace = await mysql.createConnection(databaseConfig)
            return DB.instace
        }
        return DB.instace
    }
}

export default DB;