import { Server } from 'socket.io'
import AdonisServer from '@ioc:Adonis/Core/Server'

export default class Ws {
  public io: Server
  private booted = false

  public boot() {
    if (this.booted) {
      return
    }

    this.booted = true
    this.io = new Server(AdonisServer.instance!)
    console.log("ws up")
  }
}
