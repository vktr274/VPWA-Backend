import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import Env from '@ioc:Adonis/Core/Env'

export enum ChannelType {
  private = 'private',
  public = 'public'
}

export default class Channel extends BaseModel {
  public static table = Env.get('PG_SCHEMA') + '.channels'

  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public type: ChannelType

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime
}
