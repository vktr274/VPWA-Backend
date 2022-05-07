import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'

export default class StatusController {
  public async setSatus(ctx: HttpContextContract) {
    try {
      const user = await User.findByOrFail(
        "username",
        ctx.auth.user!.username
      )
      user.status = ctx.request.input("status")
      await user.save()
      return { ok: "done" }
    } catch (error) {
      return { error: error.message }
    }
  }

  public async getStatus(ctx: HttpContextContract) {
    try {
      const user = await User.findByOrFail(
        "username",
        ctx.auth.user!.username
      )
      return { status: user.status }
    } catch (error) {
      return { error: error.message }
    }
  }
}
