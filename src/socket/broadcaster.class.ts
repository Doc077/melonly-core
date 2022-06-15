import { Server as BroadcastServer, Socket } from 'socket.io'
import { Server } from 'http'
import { Authorize } from '../contracts/authorize.interface'
import { Injector } from '../container/injector.class'
import { Logger } from '../console/logger.class'

export class Broadcaster {
  private static broadcastServer: null | BroadcastServer = null

  private static channels: Authorize[] = []

  public static emit(event: string, channelName: string, ...data: any[]): void {
    this.channels.forEach((channel: Authorize & any) => {
      if (channel.nameRegex.test(channelName) && channel.userAuthorized()) {
        this.broadcastServer?.emit(`${channelName}/${event}`, ...data)

        Logger.success(`Broadcasted event: ${channelName}/${event}`, 'socket')

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

  public static registerChannels(channels: Authorize[]): void {
    channels.forEach((channel: any) => {
      const instance = Injector.resolve<any>(channel)

      this.channels.push(instance)
    })
  }
}
