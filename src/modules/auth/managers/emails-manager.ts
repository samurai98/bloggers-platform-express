import { SETTINGS } from '../../../settings/config';
import { UserDB } from '../../users/user';

import { emailAdapter } from '../adapters/email-adapter';

export const emailsManager = {
  async sendEmailConfirmationMessage(user: UserDB) {
    await emailAdapter.sendEmail({
      email: user.accountData.email,
      subject: 'Finish your registration',
      message: `
      <h1>Thank for your registration</h1>
      <p>To finish registration please follow the link below:
         <a href='${SETTINGS.CLIENT_URL}/registration-confirmation?code=${user.emailConfirmation.confirmationCode}'>
            complete registration
         </a>
     </p>
     `,
    });
  },

  async sendEmailPasswordRecovery(user: UserDB) {
    await emailAdapter.sendEmail({
      email: user.accountData.email,
      subject: 'Password Recovery',
      message: `
      <h1>Password recovery</h1>
       <p>To finish password recovery please follow the link below:
          <a href='${SETTINGS.CLIENT_URL}/password-recovery?recoveryCode=${user.passwordRecovery?.recoveryCode}'>recovery password</a>
      </p>
     `,
    });
  },
};
