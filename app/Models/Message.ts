import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Channel from './Channel'
import Env from '@ioc:Adonis/Core/Env'

export default class Message extends BaseModel {
  public static table = Env.get('PG_SCHEMA') + '.messages'

  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @belongsTo(() => User, { foreignKey: "userId" })
  public user: BelongsTo<typeof User>

  @column()
  public channelId: number

  @belongsTo(() => Channel, { foreignKey: "channelId" })
  public channel: BelongsTo<typeof Channel>

  @column()
  public text: string

  @column.dateTime({ autoCreate: true })
  public sentAt: DateTime
}
