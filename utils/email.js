const nodemailer = require('nodemailer');
const htmlToText = require('html-to-text');
const pug = require('pug');
//  new Email(user,url);
module.exports = class Email {
  constructor(user, url) {
    this.firstname = user.name.split(' ')[0];
    this.to = user.email;
    this.from = process.env.EMAIL_FROM;
    this.url = url;
  }
  newTransport() {
    if (process.env.NODE_ENV === 'development') {
      return nodemailer.createTransport({
        host: 'smtp.mailtrap.io',
        port: 2525,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    }
    return nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: process.env.SENDGRID_USERNAME,
        pass: process.env.SENDGRID_PASSWORD,
      },
    });
  }
  async send(template, subject) {
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        FirstName: this.firstname,
        url: this.url,
        subject: this.subject,
      }
    );
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      html,
      text: htmlToText.fromString(html),
    };
    console.log('mailoption set');
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcomeEmail', 'Welcome From Natours');
  }
  async sendResetPassword() {
    console.log('send Reset Password', this.url);
    await this.send('resetEmail', 'forgotten your password click this link');
  }
};

// const sendMail = async (options) => {
//   console.log('sending mail');
//   const transporter = nodemailer.createTransport({
//     host: 'smtp.mailtrap.io',
//     port: 2525,
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//   });

//   const mailOptions = {
//     from: 'siva010928@gmail.com  <siva prakash>',
//     to: options.email,
//     subject: options.subject,
//     html:
//     text: options.message,
//   };
//   await transporter.sendMail(mailOptions);
// };
