import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase # New import
from email import encoders # New import
import config
import os # New import

def send_email(to_address, subject, body, attachments=None):
    """
    Sends an email using the configuration from config.py.
    Supports attachments.
    """
    try:
        # Create the email message
        msg = MIMEMultipart()
        msg['From'] = config.SMTP_USER
        msg['To'] = to_address
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))

        # Add attachments
        if attachments:
            for file_path in attachments:
                if not os.path.exists(file_path):
                    print(f"Attachment file not found: {file_path}")
                    continue

                with open(file_path, "rb") as attachment:
                    part = MIMEBase("application", "octet-stream")
                    part.set_payload(attachment.read())
                encoders.encode_base64(part)
                part.add_header(
                    "Content-Disposition",
                    f"attachment; filename= {os.path.basename(file_path)}",
                )
                msg.attach(part)

        # Connect to the SMTP server and send the email
        with smtplib.SMTP(config.SMTP_HOST, config.SMTP_PORT) as server:
            server.starttls()  # Secure the connection
            server.login(config.SMTP_USER, config.SMTP_PASSWORD)
            server.send_message(msg)
        
        return True, "Email sent successfully!"
    except Exception as e:
        return False, f"Failed to send email: {str(e)}"
