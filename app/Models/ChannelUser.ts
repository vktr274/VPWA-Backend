import { DateTime } from 'luxon'
import { BaseModel, column, hasOne, HasOne } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Channel from './Channel'

enum Role {
  owner = 'owner',
  regular = 'regular'
}

export default class ChannelUser extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @hasOne(() => User, { foreignKey: "user_id" })
  public user: HasOne<typeof User>

  @hasOne(() => Channel, { foreignKey: "channel_id" })
  public channel: HasOne<typeof Channel>

  @column()
  public role: Role

  @column()
  public kickCount: number

  @column.dateTime()
  public joinedAt: DateTime

  @column.dateTime({ autoCreate: true })
  public invitedAt: DateTime
}
