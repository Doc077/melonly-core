import { Server as BroadcastServer, Socket } from 'socket.io'
import { Server } from 'http'
import { Injector } from '../container/injector.class'
import { Logger } from '../console/logger.class'

export class Broadcaster {
  private static broadcastServer: null | BroadcastServer = null

  private static channels: any[] = []

  public static emit(event: string, channelName: string, data: object = {}): void {
    this.channels.forEach((channel: any) => {
      if (channel.nameRegex.test(channelName)) {
        this.broadcastServer?.emit(event, data)

        Logger.info(`Broadcasted event: ${event}`, 'socket')

        return
      }
    })
  }

  public static init(server: Server): void {
    this.broadcastServer = new BroadcastServer(server)

    this.broadcastServer.on('connection', (socket: Socket) => {
      Logger.success(`Established connection: ${socket.id}`, 'socket')
    })
  }

  public static registerChannels(channels: any[]): void {
    channels.forEach((channel: any) => {
      const instance = Injector.resolve<any>(channel)

      this.channels.push(instance)
    })
  }
}
