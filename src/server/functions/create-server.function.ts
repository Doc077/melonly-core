import { Server } from '../server.class'

interface Registrations {
  controllers: any[]
  channels?: any[]
  globalMiddleware?: any[]
}

export const createServer = (params: Registrations): Server => {
  const instance = new Server()

  instance.registerControllers(params.controllers)
  instance.registerChannels(params.channels ?? [])
  instance.registerGlobalMiddleware(params.globalMiddleware ?? [])

  return instance
}
