import Ws from "App/Services/Ws"

export default class WsController {
  public static wsInit(ws: Ws) {
    ws.boot()
    ws.io.on('connection', (socket) => {
      socket.emit('news', { hello: 'world' })

      socket.on('addMessage', (data) => {
        console.log(data)
      })
    })
  }
}
