import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from './User'

export default class ApiToken extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @belongsTo(() => User, { foreignKey: "user_id" })
  public user: BelongsTo<typeof User>

  @column()
  public name: string

  @column()
  public type: string

  @column()
  public token: string

  @column.dateTime()
  public expiresAt: DateTime

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime
}
