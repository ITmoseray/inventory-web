import os

# --- PostgreSQL Database Configuration ---
# Render provides a DATABASE_URL environment variable
# Format: postgres://USER:PASSWORD@HOST:PORT/DATABASE
# We will parse this URL to get the connection details.

DATABASE_URL = os.environ.get('DATABASE_URL', 'postgresql://neondb_owner:npg_ITzl7Y6kxbgO@ep-bitter-term-a4qjl3zx-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require')

if DATABASE_URL:
    # If DATABASE_URL is set, parse it
    from urllib.parse import urlparse
    result = urlparse(DATABASE_URL)
    DB_USER = result.username
    DB_PASSWORD = result.password
    DB_HOST = result.hostname
    DB_PORT = result.port or 5432
    DB_NAME = result.path[1:] # The path component starts with a '/', so we strip it.
else:
    # Fallback to individual environment variables or local defaults
    # This is useful for local development without setting DATABASE_URL
    DB_HOST = os.environ.get('DB_HOST', 'localhost')
    DB_PORT = int(os.environ.get('DB_PORT', 5432)) # Default PostgreSQL port is 5432
    DB_NAME = os.environ.get('DB_NAME', 'student_management')
    DB_USER = os.environ.get('DB_USER', 'postgres') # Default PostgreSQL user
    DB_PASSWORD = os.environ.get('DB_PASSWORD', 'Trovegs35')


# --- Email Configuration ---
# WARNING: Do not commit this file to version control with real credentials.
# Use environment variables or a secure vault in a production environment.
SMTP_HOST = os.environ.get('SMTP_HOST', 'smtp.gmail.com')
SMTP_PORT = int(os.environ.get('SMTP_PORT', 587))
SMTP_USER = os.environ.get('SMTP_USER', 'your_email@example.com')
SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD', 'your_email_password')


# --- Application Settings ---
DEFAULT_LANGUAGE = 'en'

# --- Cloudinary Configuration ---
CLOUDINARY_CLOUD_NAME = os.environ.get('CLOUDINARY_CLOUD_NAME', 'daojpref4')
CLOUDINARY_API_KEY = os.environ.get('API_KEY', '735557396322891')
CLOUDINARY_API_SECRET = os.environ.get('CLOUDINARY_API_SECRET', 'hsfmmP4Cx_IOCUehmn-vdrkyjxg')

# --- SMS & WhatsApp Configuration (Twilio Example) ---
TWILIO_ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID', 'your_sid_here')
TWILIO_AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN', 'your_token_here')
TWILIO_PHONE_NUMBER = os.environ.get('TWILIO_PHONE_NUMBER', 'your_twilio_number')
TWILIO_WHATSAPP_NUMBER = os.environ.get('TWILIO_WHATSAPP_NUMBER', 'whatsapp:+14155238886') # Twilio Sandbox default