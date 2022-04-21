import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Channel from './Channel'
import User from './User'

export default class KickedChannelUser extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @belongsTo(() => User, { foreignKey: "user_id" })
  public user: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: "by_user_id" })
  public byUser: BelongsTo<typeof User>

  @belongsTo(() => Channel, { foreignKey: "channel_id" })
  public channel: BelongsTo<typeof Channel>

  @column.dateTime({ autoCreate: true })
  public kickedAt: DateTime
}
