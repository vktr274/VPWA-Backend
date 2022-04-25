import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Ws from 'App/Services/Ws'
import WsController from '../ws/WsController'

var ws = new Ws()

export default class UsersController {
  public async register(ctx: HttpContextContract) {
    const user = await User.create({
      username: ctx.request.input("username"),
      name: ctx.request.input("name"),
      surname: ctx.request.input("surname"),
      email: ctx.request.input("email"),
      password: ctx.request.input("password")
    })
    const token = await ctx.auth.use("api").login(
      user,
      {
        expiresIn: "10 days"
      }
    )
    WsController.wsInit(ws)
    return token.toJSON()
  }

  public async login(ctx: HttpContextContract) {
    const token = await ctx.auth.use("api").attempt(
      ctx.request.input("username"),
      ctx.request.input("password"),
      {
        expiresIn: "10 days"
      }
    )
    WsController.wsInit(ws)
    return token.toJSON()
  }

  public async logout(ctx: HttpContextContract) {
    await ctx.auth.use('api').revoke()
    return {
      revoked: true
    }
  }
}

export { ws }
