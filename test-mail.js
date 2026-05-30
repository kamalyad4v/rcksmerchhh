const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // TLS
  auth: {
    user: 'rcksmerchhh@gmail.com',
    pass: 'kufzovqkqdfqtifu',
  },
});

const htmlContent = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #000; color: #fff; padding: 20px; border: 1px solid #333;">
  <h1 style="color: #D0FF00; text-transform: uppercase;">Order Confirmed</h1>
  <p>Hi Test User,</p>
  <p>Thank you for shopping with AG AGUU. Your payment of <strong>₹499</strong> was completely successful and your order is now being processed.</p>
  
  <h3 style="color: #D0FF00; border-bottom: 1px solid #333; padding-bottom: 10px; margin-top: 30px;">Order Summary</h3>
  <ul style="list-style: none; padding: 0;">
    <li style="margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #222;">
      <strong>AGUU Signature Tee</strong><br/>
      <span style="color: #aaa;">Size: L | Qty: 1</span><br/>
      <span style="color: #D0FF00;">₹499</span>
    </li>
  </ul>
  
  <p style="margin-top: 30px; color: #888;">We will notify you once your order is shipped.</p>
  <p>Best regards,<br/><strong>AG AGUU Team</strong></p>
</div>
`;

transporter.sendMail({
  from: '"AG AGUU" <rcksmerchhh@gmail.com>',
  to: 'ky9876979@gmail.com',
  subject: 'TEST: AG AGUU Order Receipt',
  html: htmlContent,
})
.then(info => console.log('Mail sent successfully!', info.messageId))
.catch(err => console.error('Error sending mail:', err));
