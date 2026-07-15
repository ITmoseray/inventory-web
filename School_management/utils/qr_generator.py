import qrcode
import os

def generate_student_qr(student_id):
    """
    Generates a QR code for a student ID and saves it in static/qrcodes.
    Returns the web path to the QR code image.
    """
    # Create the directory if it doesn't exist
    qr_dir = os.path.join('static', 'qrcodes')
    if not os.path.exists(qr_dir):
        os.makedirs(qr_dir)
        
    # Generate QR code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(student_id)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    
    # Save the image
    filename = f"{student_id}_qr.png"
    filepath = os.path.join(qr_dir, filename)
    img.save(filepath)
    
    # Return the relative path for web use
    return f"qrcodes/{filename}"
