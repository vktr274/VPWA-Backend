import { DateTime } from 'luxon'
import { BaseModel, column, HasOne, hasOne } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Channel from './Channel'

export default class Message extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @hasOne(() => User, { foreignKey: "user_id" })
  public user: HasOne<typeof User>

  @hasOne(() => Channel, { foreignKey: "channel_id" })
  public channel: HasOne<typeof Channel>

  @column()
  public text: string

  @column.dateTime({ autoCreate: true })
  public sentAt: DateTime
}
