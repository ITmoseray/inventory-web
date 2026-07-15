import customtkinter as ctk
from tkinter import messagebox
import bcrypt
from db.database import DatabaseManager
from ui.tooltip import Tooltip
from utils.i18n import get_translator

_ = get_translator()

class RegisterWindow:
    def __init__(self):
        self.db = DatabaseManager()
        self.window = ctk.CTk()
        self.window.title(_("Student Management System - Register"))
        self.window.geometry("400x600")
        
        # Configure grid
        self.window.grid_columnconfigure(0, weight=1)
        self.window.grid_rowconfigure(0, weight=1)

        # Create main frame
        self.main_frame = ctk.CTkFrame(self.window)
        self.main_frame.grid(row=0, column=0, padx=20, pady=20, sticky="nsew")

        # Title
        title = ctk.CTkLabel(self.main_frame, text=_("Create Account"), 
                           font=ctk.CTkFont(size=24, weight="bold"))
        title.pack(pady=(20, 40))

        # Username
        self.username_entry = ctk.CTkEntry(self.main_frame, placeholder_text=_("Username"))
        self.username_entry.pack(pady=10, padx=20, fill="x")

        # Password
        self.password_entry = ctk.CTkEntry(self.main_frame, placeholder_text=_("Password"), 
                                         show="*")
        self.password_entry.pack(pady=10, padx=20, fill="x")

        # Confirm Password
        self.confirm_password_entry = ctk.CTkEntry(self.main_frame, 
                                                 placeholder_text=_("Confirm Password"), 
                                                 show="*")
        self.confirm_password_entry.pack(pady=10, padx=20, fill="x")

        # Role selection
        self.role_var = ctk.StringVar(value="staff")
        role_frame = ctk.CTkFrame(self.main_frame)
        role_frame.pack(pady=10, padx=20, fill="x")
        
        ctk.CTkLabel(role_frame, text=_("Role:")).pack(side="left", padx=10)
        ctk.CTkRadioButton(role_frame, text=_("Admin"), 
                          variable=self.role_var, value="admin").pack(side="left", padx=10)
        ctk.CTkRadioButton(role_frame, text=_("Staff"), 
                          variable=self.role_var, value="staff").pack(side="left", padx=10)

        # Register button
        register_button = ctk.CTkButton(self.main_frame, text=_("Register"), 
                                      command=self.register)
        register_button.pack(pady=20, padx=20, fill="x")
        Tooltip(register_button, _("Create your new account"))

        # Back to login button
        back_button = ctk.CTkButton(self.main_frame, text=_("Back to Login"), 
                                  command=self.back_to_login)
        back_button.pack(pady=10, padx=20, fill="x")
        Tooltip(back_button, _("Return to the login screen"))

    def register(self):
        username = self.username_entry.get()
        password = self.password_entry.get()
        confirm_password = self.confirm_password_entry.get()
        role = self.role_var.get()

        if not all([username, password, confirm_password]):
            messagebox.showerror(_("Error"), _("Please fill all fields"))
            return

        if password != confirm_password:
            messagebox.showerror(_("Error"), _("Passwords do not match"))
            return

        if len(password) < 8:
            messagebox.showerror(_("Error"), _("Password must be at least 8 characters"))
            return

        try:
            # Hash password
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), 
                                          bcrypt.gensalt()).decode('utf-8')

            # Insert new user
            query = "INSERT INTO users (username, password, role, is_approved) VALUES (%s, %s, %s, FALSE)"
            self.db.execute(query, (username, hashed_password, role))

            messagebox.showinfo(_("Success"), _("Account created successfully!"))
            self.back_to_login()
        except Exception as e:
            messagebox.showerror(_("Error"), _(f"Registration failed: {str(e)}"))

    def back_to_login(self):
        self.window.destroy()
        from auth.login import LoginWindow
        login = LoginWindow()
        login.run()

    def run(self):
        self.window.mainloop()
