import { createConnection, Connection, MysqlError, Query as MysqlQuery } from 'mysql'
import { Config } from '../config/config.class'
import { Exception } from '../handler/exception.class'
import { Query } from './query.class'

export abstract class DB {
  private static connection: null | Connection = null

  public static establishConnection(): void {
    this.connection = createConnection({
      host: Config.database.host,
      user: Config.database.user,
      password: Config.database.password,
    })
  }

  public static raw(query: string): Promise<any[]> | MysqlQuery | undefined {
    this.connection?.connect((error: MysqlError) => {
      if (error) {
        throw new Exception('Database connection failed')
      }
    })

    const result = this.connection?.query(query)

    return result
  }

  public static query(table: string): Query {
    return new Query(table)
  }
}
