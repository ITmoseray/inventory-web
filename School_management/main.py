import customtkinter as ctk
from auth.login import LoginWindow
from utils.i18n import set_locale
import config
from ui.dashboard import Dashboard # Import Dashboard

class SplashWindow(ctk.CTk):
    def __init__(self):
        super().__init__()
        self.title("Loading...")
        self.geometry("600x300")
        self.overrideredirect(True) # Remove window decorations
        self.eval('tk::PlaceWindow . center') # Center the window

        self.configure(fg_color="#0D1B2A") # Dark background

        # Main frame for content
        content_frame = ctk.CTkFrame(self, fg_color="transparent")
        content_frame.pack(expand=True, padx=20, pady=20)

        # Title with emoji
        ctk.CTkLabel(content_frame, 
                     text="📚 EASI Student Management System", 
                     font=ctk.CTkFont(size=24, weight="bold"),
                     text_color="white").pack(pady=10) # Changed font size from 28 to 24 for consistency

        # Developer info
        ctk.CTkLabel(content_frame, 
                     text="Developed by ProTech Assist Limited", 
                     font=ctk.CTkFont(size=16),
                     text_color="#a0a0a0").pack(pady=5)

        # Copyright
        ctk.CTkLabel(content_frame, 
                     text="2026 All Rights Reserved", 
                     font=ctk.CTkFont(size=14),
                     text_color="#a0a0a0").pack(pady=5)
        
        # Progress bar (optional, but good for user feedback)
        self.progressbar = ctk.CTkProgressBar(self, mode="indeterminate")
        self.progressbar.pack(side="bottom", fill="x", padx=50, pady=20)
        self.progressbar.start()

    def show(self):
        self.after(7000, self._start_login) # Show for 7 seconds
        self.mainloop()

    def _start_login(self):
        self.destroy() # Close splash screen


def main():
    set_locale(config.DEFAULT_LANGUAGE)
    # Set CustomTkinter appearance (these will apply to LoginWindow as well)
    ctk.set_appearance_mode("dark")
    ctk.set_default_color_theme("blue")
    
    # Create and run splash screen
    splash_app = SplashWindow()
    splash_app.show()

    # After the splash screen is destroyed, create and run the login window
    login_app = LoginWindow()
    user = login_app.run() # Get the logged-in user

    if user: # If login was successful
        dashboard_app = Dashboard(user)
        dashboard_app.run()

if __name__ == "__main__":
    main()
