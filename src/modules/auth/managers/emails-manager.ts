import { UserDB } from "modules/users/user";
import { SETTINGS } from "settings/config";
import { emailAdapter } from "../adapters/email-adapter";

const url = SETTINGS.IS_LOCAL_VERSION
  ? `http://localhost:${SETTINGS.PORT}`
  : SETTINGS.PORT;

export const emailsManager = {
  async sendEmailConfirmationMessage(user: UserDB) {
    await emailAdapter.sendEmail({
      email: user.accountData.email,
      subject: "Finish your registration",
      message: `
      <h1>Thank for your registration</h1>
      <p>To finish registration please follow the link below:
         <a href='${url}/registration-confirmation?code=${user.emailConfirmation.confirmationCode}'>
            complete registration
         </a>
     </p>
     `,
    });
  },
};
