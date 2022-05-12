import { Server as BroadcastServer, Socket } from 'socket.io'
import { Server } from 'http'
import { Injector } from '../container/injector.class'
import { Logger } from '../console/logger.class'

export class Broadcaster {
  private static broadcastServer: null | BroadcastServer = null

  private static channels: any[] = []

  public static event(name: string, channelName: string, data: object = {}): void {
    for (const channel of this.channels) {
      if (channel.nameRegex.test(channelName)) {
        this.broadcastServer?.emit(name, data)

        Logger.info(`Broadcast event: ${name}`)

        break
      }
    }
  }

  public static init(server: Server): void {
    this.broadcastServer = new BroadcastServer(server)

    this.broadcastServer.on('connection', (socket: Socket) => {
      Logger.success(`Websocket connection: ${socket.id}`)
    })
  }

  public static registerChannels(channels: any[]): void {
    for (const channel of channels) {
      const instance = Injector.resolve(channel)

      this.channels.push(instance)
    }
  }
}
