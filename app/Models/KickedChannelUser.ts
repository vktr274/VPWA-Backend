import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Channel from './Channel'
import User from './User'
import Env from '@ioc:Adonis/Core/Env'

export default class KickedChannelUser extends BaseModel {
  public static table = Env.get('PG_SCHEMA') + '.kicked_channel_users'

  @column({ isPrimary: true })
  public id: number

  @column()
  public byUserId: number;

  @belongsTo(() => User, { foreignKey: "byUserId" })
  public byUser: BelongsTo<typeof User>

  @column()
  public userId: number;

  @belongsTo(() => User, { foreignKey: "userId" })
  public user: BelongsTo<typeof User>

  @column()
  public channelId: number;

  @belongsTo(() => Channel, { foreignKey: "channelId" })
  public channel: BelongsTo<typeof Channel>
}
