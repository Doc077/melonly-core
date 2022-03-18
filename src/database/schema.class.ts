import { SchemaType } from './schema-type.enum'

interface Columns {
    [column: string]: SchemaType
}

export class Schema {
    public createTable(name: string, fields: Columns): void {
        // 
    }

    public dropTable(name: string): void {
        // 
    }
}
