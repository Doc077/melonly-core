import { Logger } from '../console/logger.class'

export class Query {
  private type: string = 'select'

  private limitAmount: null | number = null

  private whereConditions: Map<string, string> = new Map()

  private orWhereConditions: Map<string, string> = new Map()

  public selectColumns: string[] = []

  constructor(private table: string) {}

  public limit(amount: number): this {
    this.limitAmount = amount

    return this
  }

  public fetch(): any[] {
    let conditions: string[] = []

    this.whereConditions.forEach((value: string, key: string) => {
      conditions.push(`${conditions.length ? ' and ' : ''}\`${key}\` ${typeof value === 'string' ? `'${value}'` : value}`)
    })

    this.orWhereConditions.forEach((value: string, key: string) => {
      conditions.push(`${conditions.length ? ' or ' : ''}\`${key}\` ${typeof value === 'string' ? `'${value}'` : value}`)
    })

    const query = `${this.type} ${this.selectColumns.join(', ')} from \`${this.table}\`${this.whereConditions.size ? ` where ${conditions.join('')}` : ''}${this.limitAmount ? ` limit ${this.limitAmount}` : ''}`

    Logger.success(`Database query: ${query}`)

    return []
  }

  public where(column: string, operator: string, value: any): this {
    this.whereConditions.set(column, `${operator} ${value}`)

    return this
  }

  public orWhere(column: string, operator: string, value: any): this {
    this.orWhereConditions.set(column, `${operator} ${value}`)

    return this
  }
}
