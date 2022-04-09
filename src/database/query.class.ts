export class Query {
  private type: string = 'select'

  private whereConditions: Map<string, string> = new Map()

  private orWhereConditions: Map<string, string> = new Map()

  public selectColumns: string[] = []

  constructor(private table: string) {}

  public fetch(): any[] {
    const query = `${this.type} ${this.selectColumns.join('`, `')} from ${this.table} ${this.whereConditions.size ? ` where ${[...this.whereConditions.keys()].join(' and ')}` : ''}`

    console.log('SQL: ', query)

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
