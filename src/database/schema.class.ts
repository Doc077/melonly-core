import { DB } from './db.class'
import { SchemaType } from './enums/schema-type.enum'

export class Schema {
  public createTable(name: string, columns: Record<string, SchemaType>): void {
    // 
  }

  public dropTable(table: string): void {
    // 
  }
}
