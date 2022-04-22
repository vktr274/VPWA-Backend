import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'

export default class UsersController {
  public async register(ctx: HttpContextContract) {
    return {
      test: ctx.request.body()
    }
  }
}
