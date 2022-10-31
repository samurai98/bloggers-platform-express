import { UserDB } from "modules/users/user";
import { SETTINGS } from "settings/config";

import { emailAdapter } from "../adapters/email-adapter";
import { authPath } from "../routes/auth-router";

export const emailsManager = {
  async sendEmailConfirmationMessage(user: UserDB) {
    await emailAdapter.sendEmail({
      email: user.accountData.email,
      subject: "Finish your registration",
      message: `
      <h1>Thank for your registration</h1>
      <p>To finish registration please follow the link below:
         <a href='${SETTINGS.CLIENT_URL}${authPath.confirmRegistration}?code=${user.emailConfirmation.confirmationCode}'>
            complete registration
         </a>
     </p>
     `,
    });
  },
};
