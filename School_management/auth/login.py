import customtkinter as ctk
from tkinter import messagebox
import bcrypt
import sys
import os

# Add the parent directory to the path to allow imports from the 'ui' and 'auth' folders
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db.database import DatabaseManager
import sys
import os
from PIL import Image
from customtkinter import CTkImage

# Add the parent directory to the path to allow imports from the 'ui' and 'auth' folders
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ui.dashboard import Dashboard
from auth.register import RegisterWindow
from ui.tooltip import Tooltip
from utils.i18n import get_translator

_ = get_translator()

ctk.set_appearance_mode("System")  # Modes: "System" (default), "Dark", "Light"
ctk.set_default_color_theme("blue")  # Themes: "blue" (default), "green", "dark-blue"

class LoginWindow:
    def __init__(self):
        self.db = DatabaseManager()
        self.user = None
        self.window = ctk.CTk()
        self.window.title(_("Student Management System - Login"))
        self.window.geometry("450x580") # Slightly increased height for icon
        self.window.grid_columnconfigure(0, weight=1)
        self.window.grid_rowconfigure(0, weight=1)

        # Create main frame with padding
        self.main_frame = ctk.CTkFrame(self.window, corner_radius=10)
        self.main_frame.grid(row=0, column=0, padx=30, pady=30, sticky="nsew")

        # Configure main_frame grid for centering content vertically and horizontally
        self.main_frame.grid_columnconfigure(0, weight=1)
        # We will use row weights to push content to the center
        self.main_frame.grid_rowconfigure(0, weight=1) # Spacer
        self.main_frame.grid_rowconfigure(8, weight=1) # Spacer

        # Display EASI logo icon
        try:
            logo_image = CTkImage(light_image=Image.open("assets/LOGO.jpeg"),
                                  dark_image=Image.open("assets/LOGO.jpeg"),
                                  size=(100, 100))
            image_label = ctk.CTkLabel(self.main_frame, text="", image=logo_image)
        except Exception as e:
            print(f"Error loading logo: {e}")
            image_label = ctk.CTkLabel(self.main_frame, text="🔒", font=ctk.CTkFont(size=60))
        
        image_label.grid(row=1, column=0, pady=(15, 5))

        # Title
        title = ctk.CTkLabel(self.main_frame, text=_("Student Management System"),
                           font=ctk.CTkFont(size=24, weight="bold"))
        title.grid(row=2, column=0, pady=(5, 0))

        # Subtitle
        subtitle = ctk.CTkLabel(self.main_frame, text=_("Secure Login Portal"),
                                font=ctk.CTkFont(size=14))
        subtitle.grid(row=3, column=0, pady=(0, 25))

        # Username
        username_frame = ctk.CTkFrame(self.main_frame, fg_color="gray20", corner_radius=5)
        username_frame.grid(row=4, column=0, pady=(10, 10), padx=20, sticky="ew") # Adjusted pady
        username_frame.grid_columnconfigure(0, weight=0) # Icon column
        username_frame.grid_columnconfigure(1, weight=1) # Entry column
        username_frame.grid_columnconfigure(2, weight=0) # Placeholder for password toggle button

        username_icon = ctk.CTkLabel(username_frame, text="👤", font=ctk.CTkFont(size=20))
        username_icon.grid(row=0, column=0, padx=(5, 5)) # Adjusted padx

        self.username_entry = ctk.CTkEntry(username_frame, placeholder_text=_("Username or Email"))
        self.username_entry.grid(row=0, column=1, sticky="ew", pady=5) # Added pady for internal spacing

        # Add an empty frame to take the space of the password toggle button
        username_toggle_placeholder = ctk.CTkFrame(username_frame, width=30, height=30, fg_color="transparent")
        username_toggle_placeholder.grid(row=0, column=2, padx=(5,5)) # Adjusted padx

        # Password
        password_frame = ctk.CTkFrame(self.main_frame, fg_color="gray20", corner_radius=5)
        password_frame.grid(row=5, column=0, pady=(0, 10), padx=20, sticky="ew") # Adjusted pady
        password_frame.grid_columnconfigure(0, weight=0) # Icon column
        password_frame.grid_columnconfigure(1, weight=1) # Entry column
        password_frame.grid_columnconfigure(2, weight=0) # Toggle button column

        password_icon = ctk.CTkLabel(password_frame, text="🔑", font=ctk.CTkFont(size=20))
        password_icon.grid(row=0, column=0, padx=(5, 5)) # Adjusted padx

        self.password_entry = ctk.CTkEntry(password_frame, placeholder_text=_("Password"),
                                         show="*")
        self.password_entry.grid(row=0, column=1, sticky="ew", pady=5) # Added pady for internal spacing

        # Password visibility toggle button
        self.eye_open_image = CTkImage(light_image=Image.open("assets/eye_open.png"),
                                        dark_image=Image.open("assets/eye_open.png"),
                                        size=(20, 20))
        self.eye_closed_image = CTkImage(light_image=Image.open("assets/eye_closed.png"),
                                          dark_image=Image.open("assets/eye_closed.png"),
                                          size=(20, 20))

        self.password_toggle_button = ctk.CTkButton(password_frame, text="",
                                                    image=self.eye_closed_image,
                                                    width=30, height=30,
                                                    command=self._toggle_password_visibility,
                                                    fg_color="transparent")
        self.password_toggle_button.grid(row=0, column=2, padx=(5,5)) # Adjusted padx
        
        # Options Frame (Remember me & Forgot Password)
        options_frame = ctk.CTkFrame(self.main_frame, fg_color="transparent")
        options_frame.grid(row=6, column=0, pady=(10, 5), padx=20, sticky="ew") # Adjusted pady

        options_frame.grid_columnconfigure(0, weight=1)
        options_frame.grid_columnconfigure(1, weight=1)

        # Remember Me checkbox
        self.remember_me_checkbox = ctk.CTkCheckBox(options_frame, text=_("Remember Me"))
        self.remember_me_checkbox.grid(row=0, column=0, sticky="w")

        # Forgot Password button
        forgot_password_button = ctk.CTkButton(options_frame, text=_("Forgot Password?"),
                                             command=self._open_forgot_password_dialog,
                                             fg_color="transparent",
                                             font=ctk.CTkFont(underline=True),
                                             hover_color="#333333") # Added hover_color for consistency
        forgot_password_button.grid(row=0, column=1, sticky="e")

        # Load remembered username on startup
        self._load_remembered_username()

        # Button frame
        button_frame = ctk.CTkFrame(self.main_frame, fg_color="transparent")
        button_frame.grid(row=7, column=0, pady=15, padx=20, sticky="ew") # Adjusted pady
        button_frame.grid_columnconfigure(0, weight=1)

        # Login button
        login_button = ctk.CTkButton(button_frame, text=_("Login"),
                                    command=self.login, corner_radius=5) # Added corner_radius
        login_button.grid(row=0, column=0, pady=(0, 5), sticky="ew") # Adjusted pady
        Tooltip(login_button, _("Log in to the system"))

        # Register button
        register_button = ctk.CTkButton(button_frame, text=_("Register"),
                                       command=self.open_register, fg_color="transparent",
                                       hover_color="#333333", corner_radius=5) # Added corner_radius
        register_button.grid(row=1, column=0, pady=(5, 0), sticky="ew") # Adjusted pady
        Tooltip(register_button, _("Create a new user account"))

    def _open_forgot_password_dialog(self):
        """Opens a dialog for the 'Forgot Password?' functionality."""
        dialog = ctk.CTkInputDialog(text=_("Enter your username or email to reset password:"), 
                                    title=_("Forgot Password"))
        user_input = dialog.get_input()
        if user_input:
            messagebox.showinfo(_("Password Reset"), _(f"A password reset link has been sent to {user_input} (This is a placeholder message)."))
        elif user_input == "":
            messagebox.showwarning(_("Password Reset"), _("Username or email cannot be empty."))

    def _toggle_password_visibility(self):
        """Toggles the visibility of the password entry."""
        if self.password_entry.cget("show") == "*":
            self.password_entry.configure(show="")
            self.password_toggle_button.configure(image=self.eye_open_image)
        else:
            self.password_entry.configure(show="*")
            self.password_toggle_button.configure(image=self.eye_closed_image)

    def _get_remember_me_file_path(self):
        """Returns the path to the remember me configuration file."""
        app_data_dir = os.path.join(os.path.expanduser("~"), ".sms_app_data")
        os.makedirs(app_data_dir, exist_ok=True)
        return os.path.join(app_data_dir, "remember_me.conf")

    def _load_remembered_username(self):
        """Loads the remembered username from the config file."""
        config_file = self._get_remember_me_file_path()
        if os.path.exists(config_file):
            with open(config_file, "r") as f:
                username = f.readline().strip()
                if username:
                    self.username_entry.insert(0, username)
                    self.remember_me_checkbox.select()

    def _save_remembered_username(self, username):
        """Saves the username to the config file if 'Remember Me' is checked."""
        config_file = self._get_remember_me_file_path()
        if self.remember_me_checkbox.get() == 1: # Checkbox is checked
            with open(config_file, "w") as f:
                f.write(username)
        elif os.path.exists(config_file): # Checkbox is unchecked, delete file if exists
            os.remove(config_file)

    def login(self):
        username = self.username_entry.get()
        password = self.password_entry.get()

        if not username or not password:
            messagebox.showerror(_("Error"), _("Please enter both username and password"))
            return

        try:
            query = "SELECT * FROM users WHERE username = %s"
            user = self.db.fetch_one(query, (username,))
            
            if user and bcrypt.checkpw(password.encode('utf-8'), 
                                     user['password'].encode('utf-8')):
                if not user['is_approved']:
                    messagebox.showwarning(_("Pending Approval"), _("Your account is pending admin approval. Please try again later."))
                    return
                
                self.user = user # Store the user
                self._save_remembered_username(username) # Save username if remembered
                self.window.destroy()
            else:
                messagebox.showerror(_("Error"), _("Invalid username or password"))
        except Exception as e:
                import traceback
                messagebox.showerror(_("Error"), _(f"Login failed: {str(e)}\n\n{traceback.format_exc()}"))
                traceback.print_exc() # This will print the full traceback to your console

    def open_register(self):
        self.window.destroy()
        register = RegisterWindow()
        register.run()

    def run(self):
        self.window.mainloop()
        return self.user
