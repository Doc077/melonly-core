import { Query } from './query.class'

export abstract class Entity {
  protected static table(): string {
    return this.constructor.name
  }

  public static select(columns?: string[] | string): Query {
    const query = new Query(this.table())

    if (!columns) {
      query.selectColumns = ['*']

      return query
    }

    query.selectColumns = [...columns]

    return query
  }
}
