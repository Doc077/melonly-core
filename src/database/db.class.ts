import { Query } from './query.class'

export abstract class DB {
  public static raw(query: string): any {
    // 
  }

  public static query(table: string): Query {
    return new Query(table)
  }
}
