import {
  usersQueryRepository,
  usersRepository,
} from "modules/users/repositories";
import { UserDB } from "modules/users/user";

import { emailsManager } from "../managers/emails-manager";

export const authService = {
  async sendConfirmEmail(user: UserDB): Promise<boolean> {    
    try {
      await emailsManager.sendEmailConfirmationMessage(user);
    } catch (error) {
      console.error(error);
      return false;
    }

    return true;
  },

  async confirmEmail(code: string): Promise<boolean> {
    const user = await usersQueryRepository.findUserByConfirmationCode(code);
    
    if (
      !user ||
      user.emailConfirmation.confirmationCode !== code ||
      user.emailConfirmation.isConfirmed ||
      user.emailConfirmation.expirationDate < new Date()
    )
      return false;

    return await usersRepository.confirmEmail(user.accountData.id);
  },
};
