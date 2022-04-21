import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Channel from './Channel'

export enum Role {
  owner = 'owner',
  regular = 'regular'
}

export default class ChannelUser extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @belongsTo(() => User, { foreignKey: "user_id" })
  public user: BelongsTo<typeof User>

  @belongsTo(() => Channel, { foreignKey: "channel_id" })
  public channel: BelongsTo<typeof Channel>

  @column()
  public role: Role

  @column()
  public kickCount: number

  @column.dateTime()
  public joinedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  public invitedAt: DateTime
}
