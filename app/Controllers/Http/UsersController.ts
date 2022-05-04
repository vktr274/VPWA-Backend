import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'

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
    //return data
    return {
      token: token.toJSON(),
      user: {
        username: user?.username,
        email: user?.email,
      }
    }
  }

  public async login(ctx: HttpContextContract) {
    const token = await ctx.auth.use("api").attempt(
      ctx.request.input("username"),
      ctx.request.input("password"),
      {
        expiresIn: "10 days"
      }
    )
    //return data
    return {
      token: token.toJSON(),
      user: {
        username: ctx.auth.user?.name,
        email: ctx.auth.user?.email,
      }
    }
  }

  public async logout(ctx: HttpContextContract) {
    await ctx.auth.use('api').revoke()
    return {
      revoked: true
    }
  }
}
