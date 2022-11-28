import { SETTINGS } from '../../settings/config';
import { UserDB } from '../../modules/users/user';

import { emailAdapter } from './email-adapter';

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

  async sendAdminEmailAboutError(err: Error) {
    await emailAdapter.sendEmail({
      email: SETTINGS.GMAIL_EMAIL || '',
      subject: '⛔ APPLICATION CRASHED',
      message: `
      <h1>Application crashed with an error</h1>
       <p><b>Error name:</b> ${err.name}</p>
       <p><b>Error message:</b> ${err.message}</p>
       <p><b>Error stack:</b> ${err.stack}</p>
     `,
    });
  },
};
