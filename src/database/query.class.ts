import { Logger } from '../console/logger.class'

export class Query {
  private type: string = 'select'

  private limitAmount: number | null = null

  private whereConditions: Map<string, string> = new Map()

  private orWhereConditions: Map<string, string> = new Map()

  public selectColumns: string[] = []

  constructor(private table: string) {}

  public limit(amount: number): this {
    this.limitAmount = amount

    return this
  }

  public fetch(): any[] {
    const wheres = [...this.whereConditions.keys()]

    let conditions: string[] = []

    // wheres.map((key: string, i: number) => {
    //   conditions = {
    //     ...conditions,
    //     [key + ' and ']: [...this.whereConditions.values()][i],
    //   }
    // })
    this.whereConditions.forEach((value: string, key: string) => {
      conditions.push(`${key} ${value}`)
    })

    const query = `${this.type} ${this.selectColumns.join('`, `')} from ${this.table}${this.whereConditions.size ? ` where ${conditions.join(' and ')}` : ''}${this.limitAmount ? ` limit ${this.limitAmount}` : ''}`

    Logger.info(`Database query: ${query}`)

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

/*
  const users = User.select().where('name', 'like', `%${name}%`).orWhere('age', '=', 20).fetch()

  User.create({
    name: 'User1',
    email: 'user1@gmail.com',
    password: '123',
  })

  select * from `users` where `name` like '%name%' or `age` = 20

  insert into `users` (name, email, password) values ('User1', 'user1@gmail.com', '123')
*/
