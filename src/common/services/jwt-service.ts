import jwt from "jsonwebtoken";

import { UserDB } from "modules/users/user";
import { SETTINGS } from "settings/config";

export const jwtService = {
  async createJWT(user: UserDB, lifeTime: string = "15m"): Promise<string> {
    const accessToken = jwt.sign(
      // createdAt need for generate unique jwt
      { userId: user.accountData.id, createdAt: new Date().getTime() },
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
