import { Server as BroadcastServer, Socket } from 'socket.io'
import { Server } from 'http'
import { Logger } from '../console/logger.class'

export class Broadcaster {
    private static broadcastServer: BroadcastServer | null = null

    public static event(name: string, channel: string, data: object = {}): void {
        this.broadcastServer?.emit(name, data)
    }

    public static init(server: Server): void {
        this.broadcastServer = new BroadcastServer(server)

        this.broadcastServer.on('connection', (socket: Socket) => {
            Logger.info(`Websocket connection: ${socket.id}`)
        })
    }
}
