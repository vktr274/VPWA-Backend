import ApiToken from 'App/Models/ApiToken'
import User from 'App/Models/User'
import crypto from 'crypto'

interface Token {
  id: string,
  token: string
}

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
    var parsedToken: Token | undefined = undefined

    try {
      parsedToken = this.parseToken(token)
    } catch (error) {
      throw new Error('CANNOT_PARSE_TOKEN');
    }

    try {
      const apiToken = await ApiToken.query()
        .select('user_id')
        .where('id', parsedToken.id)
        .andWhere('token', parsedToken.token)
        .preload('user')
        .firstOrFail()

      return apiToken.user as User;
    } catch (error) {
      throw new Error('E_INVALID_API_TOKEN')
    }
  }

  async authenticate(token: string) {
    try {
      console.log(token)
      return await this.checkToken(token)
    } catch (error) {
      throw new Error('BAD_CREDENTIALS');
    }
  }
}

export default new SocketAuth()
