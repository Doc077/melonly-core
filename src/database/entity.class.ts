import { Query } from './query.class'

export abstract class Entity {
  protected static table(): string {
    return this.constructor.name
  }

  public static query(): Query {
    const query = new Query(this.table())

    return query
  }
}
