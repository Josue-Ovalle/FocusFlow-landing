import nodemailer from 'nodemailer';

// Configurar transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

// Plantilla de email de contacto
export const sendContactEmail = async ({ name, email, message }) => {
  if (!process.env.SMTP_HOST) {
    console.log('SMTP not configured, skipping email send');
    return;
  }

  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.SMTP_FROM || 'FocusFlow <noreply@focusflow.com>',
    to: process.env.CONTACT_EMAIL || 'contact@focusflow.com',
    subject: 'Nuevo mensaje de contacto - FocusFlow',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Nuevo mensaje de contacto</h2>
        <p><strong>Nombre:</strong> ${name || 'No proporcionado'}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${message || 'No message provided'}</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #6b7280; font-size: 14px;">
          Este mensaje fue enviado desde el formulario de contacto de FocusFlow.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Contact email sent successfully');
  } catch (error) {
    console.error('Error sending contact email:', error);
    throw error;
  }
};

// Plantilla de email de bienvenida
export const sendWelcomeEmail = async (email) => {
  if (!process.env.SMTP_HOST) {
    console.log('SMTP not configured, skipping welcome email');
    return;
  }

  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.SMTP_FROM || 'FocusFlow <noreply@focusflow.com>',
    to: email,
    subject: '¡Bienvenido a FocusFlow!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">¡Gracias por suscribirte!</h2>
        <p>Estamos emocionados de tenerte en nuestra comunidad de FocusFlow.</p>
        <p>Pronto recibirás actualizaciones sobre productividad, tips y nuevas características.</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" 
           style="display: inline-block; padding: 12px 24px; background-color: #2563eb; 
                  color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Comenzar a usar FocusFlow
        </a>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #6b7280; font-size: 14px;">
          Si no solicitaste esta suscripción, por favor ignora este email.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully');
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
};