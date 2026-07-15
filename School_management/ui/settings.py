import customtkinter as ctk
from utils.i18n import get_translator, set_locale

_ = get_translator()

class SettingsWindow:
    def __init__(self, parent_frame, db, user=None):
        self.parent_frame = parent_frame
        self.db = db
        self.user = user

    def show(self):
        # Clear parent frame
        for widget in self.parent_frame.winfo_children():
            widget.destroy()

        # Create main container
        container = ctk.CTkFrame(self.parent_frame)
        container.pack(fill="both", expand=True, padx=10, pady=10)

        # Title
        title = ctk.CTkLabel(container, text=_("⚙️ Application Settings"), 
                           font=ctk.CTkFont(size=24, weight="bold"))
        title.pack(pady=10)

        # Theme Setting
        theme_frame = ctk.CTkFrame(container)
        theme_frame.pack(fill="x", padx=20, pady=10)
        ctk.CTkLabel(theme_frame, text=_("🎨 App Appearance:"), font=ctk.CTkFont(size=14, weight="bold")).pack(side="left", padx=10)
        
        self.appearance_mode_optionemenu = ctk.CTkOptionMenu(theme_frame, values=["Light", "Dark", "System"],
                                                               command=self.change_appearance_mode_event)
        self.appearance_mode_optionemenu.set(ctk.get_appearance_mode())
        self.appearance_mode_optionemenu.pack(side="left", padx=10)

        # Notification Settings
        notification_frame = ctk.CTkFrame(container)
        notification_frame.pack(fill="x", padx=20, pady=10)
        ctk.CTkLabel(notification_frame, text=_("🔔 Notification Settings:"), font=ctk.CTkFont(size=14, weight="bold")).pack(side="left", padx=10)
        
        self.enable_notifications_var = ctk.BooleanVar(value=True) # Default to true
        notification_checkbox = ctk.CTkCheckBox(notification_frame, text=_("✅ Enable Notifications"),
                                                variable=self.enable_notifications_var)
        notification_checkbox.pack(side="left", padx=10)

        # Language Setting
        language_frame = ctk.CTkFrame(container)
        language_frame.pack(fill="x", padx=20, pady=10)
        ctk.CTkLabel(language_frame, text=_("🌐 Select Language:"), font=ctk.CTkFont(size=14, weight="bold")).pack(side="left", padx=10)

        self.language_options = {
            _("English"): "en",
            _("Spanish"): "es"
        }
        self.language_optionemenu = ctk.CTkOptionMenu(language_frame, 
                                                        values=list(self.language_options.keys()),
                                                        command=self.change_language_event)
        
        # Get current language from DB or use default
        import config
        current_lang_code = self.db.get_setting('LANGUAGE', config.DEFAULT_LANGUAGE)
        
        # Find the display name for the current language code
        current_lang_display = next((display for display, code in self.language_options.items() if code == current_lang_code), _("English"))
        self.language_optionemenu.set(current_lang_display) 
        self.language_optionemenu.pack(side="left", padx=10)

        # About Section
        about_frame = ctk.CTkFrame(container)
        about_frame.pack(fill="x", padx=20, pady=10)
        ctk.CTkLabel(about_frame, text=_("ℹ️ About:"), font=ctk.CTkFont(size=14, weight="bold")).pack(side="left", padx=10)
        
        ctk.CTkLabel(about_frame, text=_("🚀 App Name: EASI Student Management System"), font=ctk.CTkFont(size=12)).pack(anchor="w", padx=20)
        ctk.CTkLabel(about_frame, text=_("✨ Version: 1.0.0"), font=ctk.CTkFont(size=12)).pack(anchor="w", padx=20)
        ctk.CTkLabel(about_frame, text=_("💻 Developed by ProTech Assist Limited"), font=ctk.CTkFont(size=12)).pack(anchor="w", padx=20)
        ctk.CTkLabel(about_frame, text=_("©️ 2026 Dr. Strange. All rights reserved."), font=ctk.CTkFont(size=12)).pack(anchor="w", padx=20)

    def change_appearance_mode_event(self, new_appearance_mode: str):
        ctk.set_appearance_mode(new_appearance_mode)

    def change_language_event(self, new_language_display: str):
        lang_code = self.language_options[new_language_display]
        print(f"Changing language to: {new_language_display} ({lang_code})")
        set_locale(lang_code)
        self.db.set_setting('LANGUAGE', lang_code) # Save the selected language to the database
        # In a real application, you'd likely want to refresh the UI here
        # For now, just a confirmation message
        from tkinter import messagebox
        messagebox.showinfo(_("Language Change"), _("Language changed successfully. Please restart the application to apply all changes."))