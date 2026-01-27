import nodemailer from 'nodemailer';

// Email configuration
// For Gmail, you need to:
// 1. Enable 2-Factor Authentication on your Google account
// 2. Generate an App Password at https://myaccount.google.com/apppasswords
// 3. Use that App Password as EMAIL_PASS in .env

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

interface SendReplyEmailParams {
  to: string;
  customerName: string;
  originalSubject: string;
  originalMessage: string;
  replyMessage: string;
}

export async function sendReplyEmail({
  to,
  customerName,
  originalSubject,
  originalMessage,
  replyMessage,
}: SendReplyEmailParams): Promise<{ success: boolean; error?: string }> {
  // Check if email credentials are configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('Email credentials not configured. Skipping email send.');
    return { 
      success: false, 
      error: 'Email belum dikonfigurasi. Balasan tersimpan di database.' 
    };
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #8B4513 0%, #5D3A1A 100%);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
        }
        .header p {
          margin: 10px 0 0 0;
          opacity: 0.9;
        }
        .content {
          background: #fff;
          padding: 30px;
          border: 1px solid #e0e0e0;
          border-top: none;
        }
        .greeting {
          font-size: 18px;
          color: #8B4513;
          margin-bottom: 20px;
        }
        .original-message {
          background: #f5f5f5;
          padding: 15px;
          border-left: 4px solid #8B4513;
          margin: 20px 0;
          border-radius: 0 8px 8px 0;
        }
        .original-message h4 {
          margin: 0 0 10px 0;
          color: #666;
          font-size: 14px;
        }
        .reply-message {
          background: #FFF8E7;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #D4A574;
          margin: 20px 0;
        }
        .reply-message h4 {
          margin: 0 0 10px 0;
          color: #8B4513;
        }
        .footer {
          background: #f9f9f9;
          padding: 20px;
          text-align: center;
          border: 1px solid #e0e0e0;
          border-top: none;
          border-radius: 0 0 10px 10px;
          font-size: 12px;
          color: #666;
        }
        .footer a {
          color: #8B4513;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>☕ BARIZTA Coffee</h1>
        <p>Balasan untuk Pesan Anda</p>
      </div>
      
      <div class="content">
        <p class="greeting">Halo ${customerName},</p>
        
        <p>Terima kasih telah menghubungi BARIZTA Coffee. Berikut adalah balasan untuk pesan Anda:</p>
        
        <div class="original-message">
          <h4>📩 Pesan Asli Anda:</h4>
          <p><strong>Subjek:</strong> ${originalSubject}</p>
          <p>${originalMessage}</p>
        </div>
        
        <div class="reply-message">
          <h4>💬 Balasan dari Tim BARIZTA:</h4>
          <p>${replyMessage.replace(/\n/g, '<br>')}</p>
        </div>
        
        <p>Jika Anda memiliki pertanyaan lebih lanjut, jangan ragu untuk menghubungi kami kembali.</p>
        
        <p>Salam hangat,<br><strong>Tim BARIZTA Coffee</strong></p>
      </div>
      
      <div class="footer">
        <p>© ${new Date().getFullYear()} BARIZTA Coffee. All rights reserved.</p>
        <p>
          <a href="https://barizta.com">Website</a> | 
          <a href="https://instagram.com/bariztacoffee">Instagram</a>
        </p>
        <p style="margin-top: 10px; font-size: 11px; color: #999;">
          Email ini dikirim karena Anda menghubungi kami melalui form kontak.
        </p>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"BARIZTA Coffee" <${process.env.EMAIL_USER}>`,
    to: to,
    subject: `Re: ${originalSubject} - BARIZTA Coffee`,
    html: htmlContent,
    text: `
Halo ${customerName},

Terima kasih telah menghubungi BARIZTA Coffee. Berikut adalah balasan untuk pesan Anda:

--- Pesan Asli Anda ---
Subjek: ${originalSubject}
${originalMessage}

--- Balasan dari Tim BARIZTA ---
${replyMessage}

Jika Anda memiliki pertanyaan lebih lanjut, jangan ragu untuk menghubungi kami kembali.

Salam hangat,
Tim BARIZTA Coffee
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send email' 
    };
  }
}

// ============================================
// Password Reset Email using Resend
// ============================================
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(
  email: string, 
  resetToken: string,
  userName: string
) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3000';
  const resetUrl = `${baseUrl}/auth/reset-password?token=${resetToken}`;
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'Barizta Coffee <onboarding@resend.dev>',
      to: email,
      subject: 'Reset Password - Barizta Coffee',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #1D1714; font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: #26201D; border-radius: 16px; padding: 40px; border: 1px solid rgba(255,255,255,0.06);">
              
              <!-- Logo -->
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #F7F2EE; font-size: 28px; margin: 0;">BARIZTA</h1>
                <p style="color: #D2B48C; font-size: 12px; margin: 5px 0 0; letter-spacing: 2px;">SPECIALTY COFFEE</p>
              </div>
              
              <!-- Content -->
              <div style="color: #F7F2EE;">
                <p style="font-size: 16px; margin-bottom: 20px;">Halo <strong>${userName}</strong>,</p>
                
                <p style="font-size: 14px; color: #B6B3AC; line-height: 1.6; margin-bottom: 25px;">
                  Kami menerima permintaan untuk mereset password akun Barizta Coffee Anda. 
                  Klik tombol di bawah untuk membuat password baru:
                </p>
                
                <!-- Button -->
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${resetUrl}" 
                     style="display: inline-block; background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%); 
                            color: white; text-decoration: none; padding: 14px 40px; border-radius: 12px; 
                            font-size: 16px; font-weight: 600;">
                    Reset Password
                  </a>
                </div>
                
                <p style="font-size: 13px; color: #888; line-height: 1.6; margin-top: 25px;">
                  Link ini akan kadaluarsa dalam <strong>1 jam</strong>. 
                  Jika Anda tidak meminta reset password, abaikan email ini.
                </p>
                
                <p style="font-size: 12px; color: #666; margin-top: 20px; word-break: break-all;">
                  Atau copy link berikut: <br>
                  <span style="color: #D2B48C;">${resetUrl}</span>
                </p>
              </div>
              
              <!-- Footer -->
              <div style="border-top: 1px solid rgba(255,255,255,0.1); margin-top: 30px; padding-top: 20px; text-align: center;">
                <p style="color: #666; font-size: 12px; margin: 0;">
                  © ${new Date().getFullYear()} Barizta Coffee. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: 'Failed to send email' };
  }
}
