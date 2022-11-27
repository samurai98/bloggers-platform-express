import jwt from 'jsonwebtoken';

import { SETTINGS } from '../../settings/config';

export const jwtService = {
  async createJWT(payload: object, lifeTime: string = '15m'): Promise<string> {
    const accessToken = jwt.sign(
      // createdAt need for generate unique jwt
      { createdAt: new Date().getTime(), ...payload },
      SETTINGS.JWT_SECRET,
      { expiresIn: lifeTime }
    );

    return accessToken;
  },

  async getUserIdByToken(token: string): Promise<string | null> {
    try {
      const result: any = jwt.verify(token, SETTINGS.JWT_SECRET);

      return result.userId;
    } catch {
      return null;
    }
  },
};
