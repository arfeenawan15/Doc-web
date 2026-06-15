import nodemailer from 'nodemailer';

/* ─── Gmail SMTP Transporter ─── */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.EMAIL_APP_PASSWORD, // Gmail App Password (16-char)
  },
});

/**
 * Generate plain-text version of the email (required for anti-spam)
 */
function generatePlainText(appointment, newStatus) {
  const isConfirmed = newStatus === 'confirmed';
  const statusText = isConfirmed ? 'Confirmed' : 'Cancelled';

  let text = `Appointment ${statusText} - Dr. Waqas Ahmad Awan\n`;
  text += `Pediatric Surgeon & Child Specialist\n`;
  text += `${'─'.repeat(50)}\n\n`;

  text += `Dear ${appointment.guardianName},\n\n`;

  if (isConfirmed) {
    text += `We are pleased to inform you that the appointment for ${appointment.patientName} has been confirmed.\n\n`;
  } else {
    text += `We regret to inform you that the appointment for ${appointment.patientName} has been cancelled.\n\n`;
  }

  text += `APPOINTMENT DETAILS\n`;
  text += `${'─'.repeat(30)}\n`;
  text += `Patient Name: ${appointment.patientName}\n`;
  text += `Age: ${appointment.age} years\n`;
  text += `Guardian: ${appointment.guardianName}\n`;
  text += `Phone: ${appointment.phone}\n`;
  text += `Date: ${appointment.date}\n`;
  text += `Time: ${appointment.time}\n`;
  text += `Hospital: ${appointment.hospital}\n`;
  text += `Service: ${appointment.service}\n`;

  if (appointment.concern) {
    text += `Concern: ${appointment.concern}\n`;
  }
  if (appointment.doctorNotes) {
    text += `Doctor's Notes: ${appointment.doctorNotes}\n`;
  }

  text += `\n`;

  if (isConfirmed) {
    text += `REMINDERS:\n`;
    text += `- Please arrive 10-15 minutes before your scheduled time.\n`;
    text += `- Bring any previous medical reports or records.\n`;
    text += `- Contact us if you need to reschedule.\n`;
  } else {
    text += `If you believe this was a mistake or wish to rebook, please contact our clinic directly or book a new appointment through our website.\n`;
  }

  text += `\n${'─'.repeat(50)}\n`;
  text += `Dr. Waqas Ahmad Awan - Pediatric Surgeon & Child Specialist\n`;
  text += `This is an automated notification from our clinic.\n`;

  return text;
}

/**
 * Send appointment status email to the patient/guardian
 * @param {Object} appointment - The appointment document from MongoDB
 * @param {string} newStatus - 'confirmed' or 'cancelled'
 */
export async function sendAppointmentEmail(appointment, newStatus) {
  const isConfirmed = newStatus === 'confirmed';

  const statusColor = isConfirmed ? '#10b981' : '#ef4444';
  const statusText = isConfirmed ? 'CONFIRMED' : 'CANCELLED';

  // Clean subject lines — NO emoji (major spam trigger in Gmail)
  const subject = isConfirmed
    ? `Appointment Confirmed - Dr. Waqas Ahmad Awan`
    : `Appointment Update - Dr. Waqas Ahmad Awan`;

  const htmlBody = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Appointment ${isConfirmed ? 'Confirmation' : 'Update'}</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f4f6f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9; padding:30px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:16px; overflow:hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
            
            <!-- Header -->
            <tr>
              <td style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a8e 100%); padding:30px 40px; text-align:center;">
                <h1 style="margin:0; color:#ffffff; font-size:22px; font-weight:700; letter-spacing:0.5px;">
                  Dr. Waqas Ahmad Awan
                </h1>
                <p style="margin:6px 0 0; color:#a8c8e8; font-size:13px;">Pediatric Surgeon &amp; Child Specialist</p>
              </td>
            </tr>

            <!-- Status Badge -->
            <tr>
              <td style="padding:30px 40px 10px; text-align:center;">
                <div style="display:inline-block; background:${statusColor}; color:#ffffff; padding:10px 28px; border-radius:50px; font-size:16px; font-weight:700; letter-spacing:1px;">
                  APPOINTMENT ${statusText}
                </div>
              </td>
            </tr>

            <!-- Greeting -->
            <tr>
              <td style="padding:20px 40px 10px;">
                <p style="margin:0; color:#333; font-size:15px; line-height:1.6;">
                  Dear <strong>${appointment.guardianName}</strong>,
                </p>
                <p style="margin:8px 0 0; color:#555; font-size:14px; line-height:1.6;">
                  ${isConfirmed 
                    ? `We are pleased to inform you that the appointment for <strong>${appointment.patientName}</strong> has been <span style="color:${statusColor}; font-weight:700;">confirmed</span>. Please find the details below:`
                    : `We regret to inform you that the appointment for <strong>${appointment.patientName}</strong> has been <span style="color:${statusColor}; font-weight:700;">cancelled</span>. Below are the appointment details for your reference:`
                  }
                </p>
              </td>
            </tr>

            <!-- Appointment Details Card -->
            <tr>
              <td style="padding:20px 40px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc; border-radius:12px; border:1px solid #e2e8f0;">
                  <tr>
                    <td style="padding:24px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding:8px 0; border-bottom:1px solid #e2e8f0;">
                            <span style="color:#6b7280; font-size:12px; text-transform:uppercase; letter-spacing:0.5px;">Patient Name</span><br>
                            <span style="color:#1e3a5f; font-size:15px; font-weight:600;">${appointment.patientName}</span>
                          </td>
                          <td style="padding:8px 0; border-bottom:1px solid #e2e8f0; text-align:right;">
                            <span style="color:#6b7280; font-size:12px; text-transform:uppercase; letter-spacing:0.5px;">Age</span><br>
                            <span style="color:#1e3a5f; font-size:15px; font-weight:600;">${appointment.age} years</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:8px 0; border-bottom:1px solid #e2e8f0;">
                            <span style="color:#6b7280; font-size:12px; text-transform:uppercase; letter-spacing:0.5px;">Guardian Name</span><br>
                            <span style="color:#1e3a5f; font-size:15px; font-weight:600;">${appointment.guardianName}</span>
                          </td>
                          <td style="padding:8px 0; border-bottom:1px solid #e2e8f0; text-align:right;">
                            <span style="color:#6b7280; font-size:12px; text-transform:uppercase; letter-spacing:0.5px;">Phone</span><br>
                            <span style="color:#1e3a5f; font-size:15px; font-weight:600;">${appointment.phone}</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:8px 0; border-bottom:1px solid #e2e8f0;">
                            <span style="color:#6b7280; font-size:12px; text-transform:uppercase; letter-spacing:0.5px;">Date</span><br>
                            <span style="color:#1e3a5f; font-size:15px; font-weight:600;">${appointment.date}</span>
                          </td>
                          <td style="padding:8px 0; border-bottom:1px solid #e2e8f0; text-align:right;">
                            <span style="color:#6b7280; font-size:12px; text-transform:uppercase; letter-spacing:0.5px;">Time</span><br>
                            <span style="color:#1e3a5f; font-size:15px; font-weight:600;">${appointment.time}</span>
                          </td>
                        </tr>
                        <tr>
                          <td colspan="2" style="padding:8px 0; border-bottom:1px solid #e2e8f0;">
                            <span style="color:#6b7280; font-size:12px; text-transform:uppercase; letter-spacing:0.5px;">Hospital</span><br>
                            <span style="color:#1e3a5f; font-size:15px; font-weight:600;">${appointment.hospital}</span>
                          </td>
                        </tr>
                        <tr>
                          <td colspan="2" style="padding:8px 0; border-bottom:1px solid #e2e8f0;">
                            <span style="color:#6b7280; font-size:12px; text-transform:uppercase; letter-spacing:0.5px;">Service</span><br>
                            <span style="color:#1e3a5f; font-size:15px; font-weight:600;">${appointment.service}</span>
                          </td>
                        </tr>
                        ${appointment.concern ? `
                        <tr>
                          <td colspan="2" style="padding:8px 0; border-bottom:1px solid #e2e8f0;">
                            <span style="color:#6b7280; font-size:12px; text-transform:uppercase; letter-spacing:0.5px;">Concern</span><br>
                            <span style="color:#1e3a5f; font-size:14px;">${appointment.concern}</span>
                          </td>
                        </tr>
                        ` : ''}
                        ${appointment.doctorNotes ? `
                        <tr>
                          <td colspan="2" style="padding:8px 0;">
                            <span style="color:#6b7280; font-size:12px; text-transform:uppercase; letter-spacing:0.5px;">Doctor's Notes</span><br>
                            <span style="color:#1e3a5f; font-size:14px;">${appointment.doctorNotes}</span>
                          </td>
                        </tr>
                        ` : ''}
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            ${isConfirmed ? `
            <!-- Reminder for confirmed -->
            <tr>
              <td style="padding:0 40px 20px;">
                <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:10px; padding:16px 20px;">
                  <p style="margin:0; color:#166534; font-size:13px; line-height:1.6;">
                    <strong>Reminders:</strong><br>
                    - Please arrive 10-15 minutes before your scheduled time.<br>
                    - Bring any previous medical reports or records.<br>
                    - Contact us if you need to reschedule.
                  </p>
                </div>
              </td>
            </tr>
            ` : `
            <!-- Info for cancelled -->
            <tr>
              <td style="padding:0 40px 20px;">
                <div style="background:#fef2f2; border:1px solid #fecaca; border-radius:10px; padding:16px 20px;">
                  <p style="margin:0; color:#991b1b; font-size:13px; line-height:1.6;">
                    <strong>Note:</strong><br>
                    If you believe this was a mistake or wish to rebook, please contact our clinic directly or book a new appointment through our website.
                  </p>
                </div>
              </td>
            </tr>
            `}

            <!-- Footer -->
            <tr>
              <td style="background:#f8fafc; padding:24px 40px; text-align:center; border-top:1px solid #e2e8f0;">
                <p style="margin:0; color:#6b7280; font-size:12px; line-height:1.5;">
                  This is an automated notification from <strong>Dr. Waqas Ahmad Awan's</strong> clinic.
                </p>
                <p style="margin:10px 0 0; color:#9ca3af; font-size:11px;">
                  Dr. Waqas Ahmad Awan - Pediatric Surgeon &amp; Child Specialist
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  const mailOptions = {
    from: {
      name: 'Dr. Waqas Ahmad Awan',
      address: process.env.ADMIN_EMAIL,
    },
    replyTo: process.env.ADMIN_EMAIL,
    to: appointment.guardianEmail,
    subject,
    text: generatePlainText(appointment, newStatus),  // Plain-text fallback (anti-spam)
    html: htmlBody,
    headers: {
      'X-Priority': '1',
      'X-Mailer': 'DrWaqasClinic-Notifier',
      'Precedence': 'bulk',
      'List-Unsubscribe': `<mailto:${process.env.ADMIN_EMAIL}?subject=Unsubscribe>`,
    },
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${appointment.guardianEmail}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`Email failed to ${appointment.guardianEmail}:`, error.message);
    return { success: false, error: error.message };
  }
}
