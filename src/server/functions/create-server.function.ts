import { Server } from '../server.class'

interface Registrations {
  controllers: any[]
  channels?: any[]
}

export const createServer = (params: Registrations): Server => {
  const instance = new Server()

  instance.registerControllers(params.controllers)
  instance.registerChannels(params.channels ?? [])

  return instance
}
