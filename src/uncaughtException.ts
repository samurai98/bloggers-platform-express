import { emailsManager } from './common/emails/emails-manager';

process.on('uncaughtException', async err => {
  console.error('on uncaughtException: ' + err.message);
  await emailsManager.sendAdminEmailAboutError(err);
  process.exit(1);
});
