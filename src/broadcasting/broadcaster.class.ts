import { Server as BroadcastServer, Socket } from 'socket.io'
import { Server } from 'http'
import { ChannelInterface } from './channel.interface'
import { Injector } from '../container/injector.class'
import { Logger } from '../console/logger.class'

export class Broadcaster {
    private static broadcastServer: BroadcastServer | null = null

    private static channels: ChannelInterface[] = []

    public static event(name: string, channelName: string, data: object = {}): void {
        for (const channel of this.channels) {
            if (channel.nameRegex.test(channelName)) {
                this.broadcastServer?.emit(name, data)

                Logger.info(`Websocket event: ${name}`)

                break
            }
        }
    }

    public static init(server: Server): void {
        this.broadcastServer = new BroadcastServer(server)

        this.broadcastServer.on('connection', (socket: Socket) => {
            Logger.info(`Websocket connection: ${socket.id}`)
        })
    }

    public static registerChannels(channels: any[]): void {
        for (const channel of channels) {
            const instance = Injector.resolve(channel)

            this.channels.push(instance)
        }
    }
}
