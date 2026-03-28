require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*'
}));

const transporter = nodemailer.createTransport({
  host: 'c2781652.ferozo.com',
  port: 465,
  secure: true, // SSL
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

app.post('/api/contact', async (req, res) => {
  const { nombre, email, telefono, mensaje } = req.body;

  if (!nombre || !email || !mensaje) {
    return res.status(400).json({ error: 'Faltan campos requeridos.' });
  }

  const mailOptions = {
    from: `"ARKHON Consultora" <${process.env.SMTP_USER}>`,
    to: process.env.SMTP_USER, // consultas@arkhon.com.ar
    replyTo: email,
    subject: `Nueva consulta de ${nombre}`,
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1e293b;">
        <div style="border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px;">
          <h1 style="font-size: 24px; font-weight: 800; letter-spacing: -0.02em; margin: 0;">
            ARKHON<span style="font-weight: 300; color: #94a3b8;">Consultora</span>
          </h1>
          <p style="color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; margin-top: 6px;">Nueva consulta recibida</p>
        </div>

        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #94a3b8; width: 120px;">Nombre</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; font-size: 16px; color: #0f172a; font-weight: 600;">${nombre}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #94a3b8;">Email</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; font-size: 16px; color: #2563eb;">${email}</td>
          </tr>
          ${telefono ? `
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #94a3b8;">Teléfono</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; font-size: 16px; color: #0f172a;">${telefono}</td>
          </tr>` : ''}
          <tr>
            <td style="padding: 16px 0; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #94a3b8; vertical-align: top;">Mensaje</td>
            <td style="padding: 16px 0; font-size: 16px; color: #334155; line-height: 1.7;">${mensaje.replace(/\n/g, '<br>')}</td>
          </tr>
        </table>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center;">
          Mensaje enviado desde arkhon.com.ar
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Mensaje enviado correctamente.' });
  } catch (error) {
    console.error('Error enviando mail:', error);
    res.status(500).json({ error: 'No se pudo enviar el mensaje. Intente más tarde.' });
  }
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API corriendo en puerto ${PORT}`));
