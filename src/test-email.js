// import nodemailer from 'nodemailer';
// import dotenv from 'dotenv';

// dotenv.config();

// const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM } =
//   process.env;

// const transporter = nodemailer.createTransport({
//   host: SMTP_HOST,
//   port: Number(SMTP_PORT),
//   secure: true,
//   auth: {
//     user: SMTP_USER,
//     pass: SMTP_PASSWORD,
//   },
// });

// const mailOptions = {
//   from: SMTP_FROM,
//   to: 'tarasenko.y.1988@ukr.net', // ← сюди свою пошту
//   subject: 'Test email',
//   text: 'Це тестовий лист від nodemailer + Brevo!',
// };

// transporter.sendMail(mailOptions, (error, info) => {
//   if (error) {
//     console.error('❌ ПОМИЛКА ВІДПРАВКИ:', error);
//   } else {
//     console.log('✅ Лист відправлено:', info.response);
//   }
// });
