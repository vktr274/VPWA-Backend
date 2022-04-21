import { DateTime } from 'luxon'
import { BaseModel, column, hasOne, HasOne } from '@ioc:Adonis/Lucid/Orm'
import Channel from './Channel'
import User from './User'

export default class KickedChannelUser extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @hasOne(() => User, { foreignKey: "user_id" })
  public user: HasOne<typeof User>

  @hasOne(() => User, { foreignKey: "by_user_id" })
  public byUser: HasOne<typeof User>

  @hasOne(() => Channel, { foreignKey: "channel_id" })
  public channel: HasOne<typeof Channel>

  @column.dateTime({ autoCreate: true })
  public kickedAt: DateTime
}
