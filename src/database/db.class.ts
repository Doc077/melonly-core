import { createConnection, Connection, MysqlError } from 'mysql'
import { Exception } from '../handler/exception.class'
import { Query } from './query.class'

export abstract class DB {
  private static connection: null | Connection = null

  public static establishConnection(): void {
    this.connection = createConnection({
      host: '',
    })
  }

  public static async raw(query: string): Promise<any[]> {
    this.connection?.connect((error: MysqlError) => {
      if (error) {
        throw new Exception('Database connection failed')
      }
    })

    const result = await this.connection?.query(query)

    return result
  }

  public static query(table: string): Query {
    return new Query(table)
  }
}
