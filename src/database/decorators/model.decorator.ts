interface Data {
  table?: string
}

export const Model = (data?: Data) => {
  return (target: any): any => {
    const instance = new target()

    return class extends target {
      protected static table(): string {
        return data?.table
          ? data.table
          : instance.constructor.name.toString().toLowerCase() + 's'
      }
    }
  }
}
