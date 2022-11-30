import { add } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

import { emailsManager } from '../../../common/emails/emails-manager';
import { usersService } from '../../users/services/users-service';

import { PasswordRecovery, UserDB, UserEmailConfirmation } from '../../users/user';

//@ts-ignore | Need that not send message on tests mails
import { validUsers } from '../../../../tests/common/data';

const confirmEmailCodeLifeTime: Duration = { hours: 1 };

export const emailsService = {
  async sendConfirmEmail(user: UserDB): Promise<boolean> {
    const testingEmails = validUsers.map(user => user.email);
    if (testingEmails.includes(user.accountData.email)) return true;

    try {
      await emailsManager.sendEmailConfirmationMessage(user);
    } catch (error) {
      console.error(error);
      return false;
    }

    return true;
  },

  async confirmEmail(code: string): Promise<boolean> {
    const user = await usersService.getUserByConfirmationCode(code);

    if (
      !user ||
      user.emailConfirmation.confirmationCode !== code ||
      user.emailConfirmation.isConfirmed ||
      user.emailConfirmation.expirationDate < new Date()
    )
      return false;

    return await usersService.confirmEmail(user.accountData.id);
  },

  async resendingEmail(email: string): Promise<boolean> {
    const user = await usersService.getUserByLoginOrEmail(email);

    if (!user || user.emailConfirmation.isConfirmed) return false;

    const updatedUser = await this.updateEmailConfirmation(user);
    const isSend = updatedUser && (await this.sendConfirmEmail(updatedUser));

    return Boolean(isSend);
  },

  async updateEmailConfirmation(user: UserDB): Promise<UserDB | null> {
    const newConfirmationData: Partial<UserEmailConfirmation> = {
      confirmationCode: uuidv4(),
      expirationDate: add(new Date(), confirmEmailCodeLifeTime),
    };

    const isUpdated = usersService.updateEmailConfirmationData(user.accountData.id, newConfirmationData);

    if (!isUpdated) return null;

    return usersService.getUserByLoginOrEmail(user.accountData.email);
  },

  async sendPasswordRecovery(user: UserDB, recoveryData: PasswordRecovery) {
    const testingEmails = validUsers.map(user => user.email);
    if (testingEmails.includes(user.accountData.email)) return true;

    try {
      await emailsManager.sendEmailPasswordRecovery({ ...user, passwordRecovery: recoveryData });
    } catch (error) {
      console.error(error);
      return false;
    }

    return true;
  },
};
