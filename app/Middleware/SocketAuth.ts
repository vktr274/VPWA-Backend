import ApiToken from 'App/Models/ApiToken'
import User from 'App/Models/User'
import crypto from 'crypto'
import { Socket } from 'socket.io'

// https://github.com/adonisjs/core/discussions/2051?sort=new#discussioncomment-274111

class SocketAuth {
  decodeId(encoded: string) {
    return Buffer.from(encoded, 'base64').toString('utf-8')
  }

  generateHash(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex')
  }

  parseToken(token: string) {
    const tokenParts = token.split('.')

    if (tokenParts.length != 2) {
      throw new Error('E_INVALID_API_TOKEN')
    }

    const tokenId = this.decodeId(tokenParts[0]);

    if (!tokenId) {
      throw new Error('E_INVALID_API_TOKEN');
    }

    return {
      id: tokenId,
      token: this.generateHash(tokenParts[1])
    }
  }

  async checkToken(token: string) {
    const parsedToken = this.parseToken(token)

    // TODO: delete later
    console.log(parsedToken)

    const apiToken = await ApiToken.query()
      .select('user_id')
      .where('id', parsedToken.id)
      .andWhere('token', parsedToken.token)
      .first()

    if (apiToken == null) {
      throw new Error('E_INVALID_API_TOKEN');
    }
    return apiToken.user as User;
  }

  async authenticate(socket: Socket) {
    const token = socket.handshake.auth.token

    if (!token || typeof token !== 'string') {
      throw new Error('MISSING_TOKEN')
    }

    try {
      return await this.checkToken(token)
    } catch (error) {
      throw new Error('BAD_CREDENTIALS');
    }
  }
}

export default new SocketAuth()
