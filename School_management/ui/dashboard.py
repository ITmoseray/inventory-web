import math
import customtkinter as ctk
from tkinter import messagebox, Canvas, Frame, Label
from db.database import DatabaseManager
from datetime import datetime, timedelta
import calendar
from ui.students import StudentsWindow
from ui.courses import CoursesWindow
from ui.payments import PaymentsWindow
from ui.attendance import AttendanceWindow
from ui.settings import SettingsWindow
from ui.reports import ReportsWindow
from ui.settings import SettingsWindow
from ui.reports import ReportsWindow
from ui.admin_approval import AdminApprovalWindow
from ui.form import FormPaymentWindow
from ui.backup_restore import BackupRestoreWindow
from ui.lecturer import LecturerWindow # Import the new LecturerWindow
from ui.salary import SalaryWindow # Import the new SalaryWindow

from ui.graduation import GraduationPaymentsWindow # Import the new GraduationPaymentsWindow
from ui.petty_cash import PettyCashWindow # Import the new PettyCashWindow
from ui.payment_tailor_shop import TailorShopWindow # Import the new TailorShopWindow
from ui.activity_log import ActivityLogWindow # Import the new ActivityLogWindow
from ui.messaging import MessagingWindow # Import the new MessagingWindow
from auth.permissions import (
    is_admin_and_approved, 
    is_sub_admin_or_higher, 
    is_lecturer, 
    can_manage_payments, 
    can_view_financials
)
from ui.tooltip import Tooltip
from matplotlib.figure import Figure
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
import numpy as np
import matplotlib.pyplot as plt
from utils.email_sender import send_email
from utils.plugin_loader import PluginLoader
from utils.i18n import get_translator

_ = get_translator()

class PendingPaymentsNotificationWindow(ctk.CTkToplevel):
    def __init__(self, master, pending_payments):
        super().__init__(master)
        self.title(_("Pending Payment Reminders"))
        self.geometry("600x400")
        self.transient(master)
        self.pending_payments = pending_payments

        ctk.CTkLabel(self, text=_("⚠️ Students with Pending Payments"), font=ctk.CTkFont(size=18, weight="bold")).pack(pady=10)

        scrollable_frame = ctk.CTkScrollableFrame(self)
        scrollable_frame.pack(fill="both", expand=True, padx=10, pady=10)

        if not pending_payments:
            ctk.CTkLabel(scrollable_frame, text=_("No pending payments found.")).pack(pady=20)
        else:
            for payment in pending_payments:
                info = (f"Student: {payment['first_name']} {payment['last_name']}\n"
                        f"Course: {payment['course_name']}\n"
                        f"Amount: Le {payment['amount']:,.2f}\n"
                        f"Date: {payment['payment_date']}")
                ctk.CTkLabel(scrollable_frame, text=info, justify="left").pack(anchor="w", padx=10, pady=5)
        
        button_frame = ctk.CTkFrame(self)
        button_frame.pack(pady=10)

        close_button = ctk.CTkButton(button_frame, text=_("Close"), command=self.destroy)
        close_button.pack(side="left", padx=10)

        if self.pending_payments:
            send_emails_button = ctk.CTkButton(button_frame, text=_("Send Email Reminders"), command=self.send_email_reminders)
            send_emails_button.pack(side="left", padx=10)

    def send_email_reminders(self):
        """Formats and sends email reminders to students with pending payments."""
        if not messagebox.askyesno(_("Confirm"), _(f"Are you sure you want to send email reminders to {len(self.pending_payments)} students?")):
            return

        success_count = 0
        failure_count = 0
        
        for payment in self.pending_payments:
            student_name = f"{payment['first_name']} {payment['last_name']}"
            to_address = payment['email']
            
            if not to_address:
                print(f"Skipping {student_name} due to missing email address.")
                failure_count += 1
                continue

            subject = _("Pending Payment Reminder - EASI")
            body = f"""
Dear {student_name},

This is a friendly reminder that you have a pending payment for your enrollment at the Empowerment Academy of Skills and Innovation (EASI).

Payment Details:
- Course: {payment['course_name']}
- Amount Due: Le {payment['amount']:,.2f}
- Original Payment Date: {payment['payment_date']}

Please make the payment at your earliest convenience to clear your balance.

If you have any questions, please contact our administration.

Thank you,
EASI Management
"""
            
            success, message = send_email(to_address, subject, body)
            if success:
                success_count += 1
            else:
                failure_count += 1
                print(f"Failed to send email to {student_name} ({to_address}): {message}")

        messagebox.showinfo(_("Email Results"), _(f"Successfully sent {success_count} emails.\nFailed to send {failure_count} emails (see console for details)."))
        self.destroy()

class EndingCoursesNotificationWindow(ctk.CTkToplevel):
    def __init__(self, master, ending_enrollments):
        super().__init__(master)
        self.title(_("Ending Course Alerts"))
        self.geometry("600x400")
        self.transient(master)

        ctk.CTkLabel(self, text=_("🔔 Student Enrollments Ending Soon"), font=ctk.CTkFont(size=18, weight="bold")).pack(pady=10)

        scrollable_frame = ctk.CTkScrollableFrame(self)
        scrollable_frame.pack(fill="both", expand=True, padx=10, pady=10)

        if not ending_enrollments:
            ctk.CTkLabel(scrollable_frame, text=_("No enrollments are ending within the next 14 days.")).pack(pady=20)
        else:
            for enrollment in ending_enrollments:
                info = (f"Student: {enrollment['first_name']} {enrollment['last_name']}\n"
                        f"Course: {enrollment['course_name']}\n"
                        f"Completion Date: {enrollment['completion_date']}")
                ctk.CTkLabel(scrollable_frame, text=info, justify="left").pack(anchor="w", padx=10, pady=5)

        close_button = ctk.CTkButton(self, text=_("Close"), command=self.destroy)
        close_button.pack(pady=10)

class Dashboard:
    def __init__(self, user):
        self.db = DatabaseManager()
        self.user = user
        self.window = ctk.CTk()
        self.window.title(_("Student Management System - Dashboard"))
        self.window.geometry("1400x900")
        
        # Set color theme
        ctk.set_appearance_mode("dark")
        ctk.set_default_color_theme("blue")
        
        # Initialize Plugin Loader
        self.plugin_loader = PluginLoader(self)
        self.plugin_loader.load_plugins()

        # Configure grid
        self.window.grid_columnconfigure(0, weight=0, minsize=220) # Sidebar column
        self.window.grid_columnconfigure(1, weight=1)
        self.window.grid_rowconfigure(0, weight=1)

        # Initialize sidebar state
        self.sidebar_visible = True
        self.sidebar_widgets = [] # To store references to widgets in the sidebar

        # Create main content area
        self.create_main_content()
        self._display_welcome_message() # Display welcome message on initial load
        
        # Create sidebar
        self.create_sidebar()

    def _display_welcome_message(self):
        """Displays a cool welcome message in the dashboard's main content area."""
        # Clear module content frame
        for widget in self.module_content_frame.winfo_children():
            widget.destroy()

        # Welcome message
        welcome_text = _("✨ Welcome to EASI Student Management System! ✨\n\n" \
                         "Your central hub for academic excellence.\n" \
                         "Explore the sidebar to manage students, courses, payments, and more.\n" \
                         "Click '📊 Dashboard' to see your comprehensive overview.")
        
        ctk.CTkLabel(self.module_content_frame, 
                     text=welcome_text, 
                     font=ctk.CTkFont(size=20, weight="bold"),
                     text_color="white",
                     wraplength=600,
                     justify="center").pack(pady=50, padx=20)
        
        ctk.CTkLabel(self.module_content_frame, 
                     text=_("Developed by ProTech Assist Limited - 2026 All Rights Reserved"), 
                     font=ctk.CTkFont(size=12),
                     text_color="#a0a0a0").pack(side="bottom", pady=10)
        
        # Add Quick Actions to the welcome screen too
        self.create_quick_actions()


    def toggle_sidebar(self):
        if self.sidebar_visible:
            # Collapse sidebar
            for widget in self.sidebar_widgets:
                widget.configure(state="disabled") # Hide content

            self.sidebar_frame.configure(width=40)
            self.window.grid_columnconfigure(0, weight=0, minsize=40) # Sidebar column
            self.window.grid_columnconfigure(1, weight=1) # Main content column
            self.collapse_button.grid(row=0, column=0, padx=5, pady=5, sticky="ne") # Reposition collapse button
            self.collapse_button.configure(text="▶")
            Tooltip(self.collapse_button, _("Expand Sidebar"))

            # Re-grid navigation buttons to occupy only one column in collapsed state
            buttons_info = [
                (_("📊 Dashboard"), self.show_dashboard, "dashboard", _("Return to the main dashboard overview")),
                (_("🧑‍🎓 Students"), self.show_students, "students", _("Manage student records")),
                (_("📚 Courses"), self.show_courses, "courses", _("Manage course information")),
                (_("💵 Payments"), self.show_payments, "payments", _("Manage student payments")),
                (_("✅ Attendance"), self.show_attendance, "attendance", _("Track student attendance")),
                (_("📄 Reports"), self.show_reports, "reports", _("Generate and view reports")),
                (_("⚙️ Settings"), self.show_settings, "settings", _("Configure application settings")),
                (_("📝 Form Payments"), self.show_form_payments, "form_payments", _("Manage form-related payments")),
                (_("👨‍🏫 Lecturers"), self.show_lecturers, "lecturers", _("Manage lecturer records")),
                (_("💰 Salaries"), self.show_salaries, "salaries", _("Manage lecturer salaries")),
                (_("🎓 Graduation"), self.show_graduation_payments, "graduation_payments", _("Manage graduation fees")),
                (_("🧵 Tailor Shop"), self.show_tailor_shop, "tailor_shop", _("Manage tailor shop orders")),
                (_("💰 Petty Cash"), self.show_petty_cash, "petty_cash", _("Manage petty cash transactions")),
                (_("📢 Messaging"), self.show_messaging, "messaging", _("Send bulk messages and notifications")),
                (_("📜 Activity Log"), self.show_activity_log, "activity_log", _("View staff activity history")),
                (_("⭐ User Approvals"), self.show_admin_approval, "admin_approval", _("Approve or deny new user registrations")),
                (_("💾 Backup/Restore"), self.show_backup_restore, "backup_restore", _("Backup or restore the database"))
            ]

            for i, (text, command, name, tooltip_text) in enumerate(buttons_info, start=3):
                btn = self.sidebar_buttons[name]
                btn.grid(row=i, column=0, padx=10, pady=5, sticky="ew", columnspan=1)
                # Update text to only show emoji
                emoji = text.split(" ")[0]
                btn.configure(text=emoji)
            
            plugin_button_start_row = len(buttons_info) + 3
            for plugin in self.plugin_loader.get_loaded_plugins():
                for menu_item_text, menu_item_command in plugin.get_menu_items():
                    btn_name = f"plugin_{plugin.get_name()}_{menu_item_text.replace(' ', '_').lower()}"
                    btn = self.sidebar_buttons[btn_name]
                    btn.grid(row=plugin_button_start_row, column=0, padx=10, pady=5, sticky="ew", columnspan=1)
                    # Update text to only show first char (assuming it's an icon/emoji)
                    btn.configure(text=menu_item_text[0])
                    plugin_button_start_row += 1

            self.sidebar_buttons["logout"].grid(row=plugin_button_start_row + 1, column=0, padx=10, pady=20, sticky="ew", columnspan=1)
            self.sidebar_buttons["logout"].configure(text="🚪")


            self.sidebar_visible = False
        else:
            # Expand sidebar
            for widget in self.sidebar_widgets:
                widget.configure(state="normal") # Show content

            self.sidebar_frame.configure(width=220)
            self.window.grid_columnconfigure(0, weight=0, minsize=220) # Sidebar column
            self.window.grid_columnconfigure(1, weight=1) # Main content column
            self.collapse_button.grid(row=0, column=1, padx=5, pady=5, sticky="ne")
            self.collapse_button.configure(text="◀")
            Tooltip(self.collapse_button, _("Collapse Sidebar"))

            # Re-grid navigation buttons to occupy two columns in expanded state
            buttons_info = [
                (_("📊 Dashboard"), self.show_dashboard, "dashboard", _("Return to the main dashboard overview")),
                (_("🧑‍🎓 Students"), self.show_students, "students", _("Manage student records")),
                (_("📚 Courses"), self.show_courses, "courses", _("Manage course information")),
                (_("💵 Payments"), self.show_payments, "payments", _("Manage student payments")),
                (_("✅ Attendance"), self.show_attendance, "attendance", _("Track student attendance")),
                (_("📄 Reports"), self.show_reports, "reports", _("Generate and view reports")),
                (_("⚙️ Settings"), self.show_settings, "settings", _("Configure application settings")),
                (_("📝 Form Payments"), self.show_form_payments, "form_payments", _("Manage form-related payments")),
                (_("👨‍🏫 Lecturers"), self.show_lecturers, "lecturers", _("Manage lecturer records")),
                (_("💰 Salaries"), self.show_salaries, "salaries", _("Manage lecturer salaries")),
                (_("🎓 Graduation"), self.show_graduation_payments, "graduation_payments", _("Manage graduation fees")),
                (_("🧵 Tailor Shop"), self.show_tailor_shop, "tailor_shop", _("Manage tailor shop orders")),
                (_("💰 Petty Cash"), self.show_petty_cash, "petty_cash", _("Manage petty cash transactions")),
                (_("📢 Messaging"), self.show_messaging, "messaging", _("Send bulk messages and notifications")),
                (_("📜 Activity Log"), self.show_activity_log, "activity_log", _("View staff activity history")),
                (_("⭐ User Approvals"), self.show_admin_approval, "admin_approval", _("Approve or deny new user registrations")),
                (_("💾 Backup/Restore"), self.show_backup_restore, "backup_restore", _("Backup or restore the database"))
            ]

            for i, (text, command, name, tooltip_text) in enumerate(buttons_info, start=3):
                btn = self.sidebar_buttons[name]
                btn.grid(row=i, column=0, padx=10, pady=5, sticky="ew", columnspan=2)
                btn.configure(text=text) # Restore original text
            
            plugin_button_start_row = len(buttons_info) + 3
            for plugin in self.plugin_loader.get_loaded_plugins():
                for menu_item_text, menu_item_command in plugin.get_menu_items():
                    btn_name = f"plugin_{plugin.get_name()}_{menu_item_text.replace(' ', '_').lower()}"
                    btn = self.sidebar_buttons[btn_name]
                    btn.grid(row=plugin_button_start_row, column=0, padx=10, pady=5, sticky="ew", columnspan=2)
                    btn.configure(text=menu_item_text) # Restore original text
                    plugin_button_start_row += 1

            self.sidebar_buttons["logout"].grid(row=plugin_button_start_row + 1, column=0, padx=10, pady=20, sticky="ew", columnspan=2)
            self.sidebar_buttons["logout"].configure(text=_("🚪 Logout"))

            self.sidebar_visible = True

    # Navigation Methods
    def show_dashboard(self):
        """Refresh the dashboard view"""
        self.load_dashboard_data()

    def show_students(self):
        """Open students management window"""
        students_window = StudentsWindow(self.module_content_frame, self.db, self.user)
        students_window.show()

    def show_courses(self):
        """Open courses management window"""
        courses_window = CoursesWindow(self.module_content_frame, self.db, self.user)
        courses_window.show()

    def show_payments(self):
        """Open payments management window"""
        payments_window = PaymentsWindow(self.module_content_frame, self.db, self.user)
        payments_window.show()

    def show_attendance(self):
        """Open attendance management window"""
        attendance_window = AttendanceWindow(self.module_content_frame, self.db, self.user)
        attendance_window.show()

    def show_reports(self):
        """Open reports window"""
        reports_window = ReportsWindow(self.module_content_frame, self.db, self.user)
        reports_window.show()

    def show_settings(self):
        """Open settings window"""
        settings_window = SettingsWindow(self.module_content_frame, self.db, self.user)
        settings_window.show()

    def show_activity_log(self):
        """Open staff activity log window"""
        activity_log_window = ActivityLogWindow(self.window)
        activity_log_window.wait_window()

    def show_messaging(self):
        """Open bulk messaging and notifications window"""
        messaging_window = MessagingWindow(self.module_content_frame, self.db, self.user)
        messaging_window.show()

    def show_admin_approval(self):
        """Open admin approval window"""
        admin_approval_window = AdminApprovalWindow(self.window)
        admin_approval_window.wait_window()

    def show_form_payments(self):
        """Open form payments management window"""
        form_payment_window = FormPaymentWindow(self.module_content_frame, self.db, self.user)
        form_payment_window.show()

    def show_backup_restore(self):
        """Open backup/restore window"""
        backup_restore_window = BackupRestoreWindow(self.window)
        backup_restore_window.wait_window()

    def show_lecturers(self):
        """Open lecturer management window"""
        lecturer_window = LecturerWindow(self.module_content_frame, self.db)
        lecturer_window.show()

    def show_salaries(self):
        """Open salary management window"""
        salary_window = SalaryWindow(self.module_content_frame, self.db)
        salary_window.show()



    def show_graduation_payments(self):
        """Open graduation payments management window"""
        graduation_payments_window = GraduationPaymentsWindow(self.module_content_frame, self.db)
        graduation_payments_window.show()

    def show_petty_cash(self):
        """Open petty cash management window"""
        petty_cash_window = PettyCashWindow(self.module_content_frame, self.db, self.user)
        petty_cash_window.show()

    def show_tailor_shop(self):
        """Open tailor shop management window"""
        tailor_shop_window = TailorShopWindow(self.module_content_frame, self.db)
        tailor_shop_window.show()

    def logout(self):
        """Logout and return to login screen"""
        self.window.destroy()
        from auth.login import LoginWindow
        login = LoginWindow()
        login.run()

    # UI Creation Methods
    def create_sidebar(self):
        """Create the navigation sidebar with clickable quick stats"""
        # Create sidebar
        self.sidebar_frame = ctk.CTkFrame(self.window, width=220, fg_color="#0D1B2A", corner_radius=10) # Added corner_radius
        self.sidebar_frame.grid(row=0, column=0, sticky="nsew", padx=10, pady=10) # Added padx, pady

        # EASI Student Management Heading
        self.sidebar_logo_label = ctk.CTkLabel(self.sidebar_frame, text=_("EASI Student Management"),
                           font=ctk.CTkFont(size=16, weight="bold"),
                           text_color=('#ffffff', '#ffffff'))
        self.sidebar_logo_label.grid(row=0, column=0, padx=10, pady=10, sticky="ew")
        self.sidebar_widgets.append(self.sidebar_logo_label)

        # Collapse Button (visible only when expanded)
        self.collapse_button = ctk.CTkButton(self.sidebar_frame, text="◀", width=30, command=self.toggle_sidebar, corner_radius=5) # Added corner_radius
        self.collapse_button.grid(row=0, column=1, padx=5, pady=5, sticky="ne")
        Tooltip(self.collapse_button, _("Collapse Sidebar"))
        # The collapse button itself doesn't get hidden as it's the toggle
        
        # User info with colored frame
        self.user_frame = ctk.CTkFrame(self.sidebar_frame, fg_color="#1B263B", corner_radius=5) # Added corner_radius
        self.user_frame.grid(row=1, column=0, padx=10, pady=10, sticky="ew", columnspan=2) # Adjusted pady
        
        self.user_label = ctk.CTkLabel(self.user_frame, text=_("Welcome, {self.user['username']}"), 
                                font=ctk.CTkFont(size=14, weight="bold"),
                                text_color=('#ffffff', '#ffffff'))
        self.user_label.pack(pady=5)
        self.sidebar_widgets.append(self.user_label)
        
        self.role_label = ctk.CTkLabel(self.user_frame, text=_("Role: {self.user['role'].title()}"), 
                                font=ctk.CTkFont(size=12),
                                text_color=('#a0a0a0', '#a0a0a0'))
        self.role_label.pack(pady=5)
        self.sidebar_widgets.append(self.role_label)

        # Quick Stats with colored frame
        self.stats_frame = ctk.CTkFrame(self.sidebar_frame, fg_color="#1B263B", corner_radius=5) # Added corner_radius
        self.stats_frame.grid(row=2, column=0, padx=10, pady=10, sticky="ew", columnspan=2) # Consistent pady
        
        quick_stats_label = ctk.CTkLabel(self.stats_frame, text=_("Quick Stats"), 
                    font=ctk.CTkFont(size=14, weight="bold"),
                    text_color=('#ffffff', '#ffffff'))
        quick_stats_label.pack(pady=5)
        self.sidebar_widgets.append(quick_stats_label)
        
        self.quick_stats = {}
        colors = ["#1f6aa5", "#ff6b6b", "#ffd93d"]  # Blue, Red, Yellow
        
        # Create clickable stat buttons
        stats_info = [
            (_("Today's Attendance"), self.show_attendance, "#1f6aa5", _("View today's attendance records")),
            (_("Pending Payments"), self.show_payments, "#ff6b6b", _("View pending payments")),
            (_("Active Courses"), self.show_courses, "#ffd93d", _("View all active courses"))
        ]

        
        for stat, command, color, tooltip_text in stats_info:
            # Create a button for the stat
            stat_button = ctk.CTkButton(
                self.stats_frame,
                text=_("{stat}: ---"),
                font=ctk.CTkFont(size=11),
                text_color=color,
                fg_color="transparent",  # Use transparent as base to show frame color
                hover_color="#3a3a3a", # Consistent hover color
                command=command,
                height=30,
                anchor="w",
                corner_radius=5 # Added corner_radius
            )
            stat_button.pack(fill="x", padx=10, pady=2)
            self.quick_stats[stat] = stat_button
            Tooltip(stat_button, tooltip_text)
            self.sidebar_widgets.append(stat_button) # Add stat buttons to the list

        self.active_button_name = "dashboard" # Keep track of the currently active button
        self.sidebar_buttons = {}

        # Navigation buttons with hover effects
        buttons_info = [
            (_("📊 Dashboard"), self.show_dashboard, "dashboard", _("Return to the main dashboard overview")),
            (_("🧑‍🎓 Students"), self.show_students, "students", _("Manage student records")),
            (_("📚 Courses"), self.show_courses, "courses", _("Manage course information")),
            (_("💵 Payments"), self.show_payments, "payments", _("Manage student payments")),
            (_("✅ Attendance"), self.show_attendance, "attendance", _("Track student attendance")),
            (_("📄 Reports"), self.show_reports, "reports", _("Generate and view reports")),
            (_("⚙️ Settings"), self.show_settings, "settings", _("Configure application settings")),
            (_("📝 Form Payments"), self.show_form_payments, "form_payments", _("Manage form-related payments")),
            (_("👨‍🏫 Lecturers"), self.show_lecturers, "lecturers", _("Manage lecturer records")),
            (_("💰 Salaries"), self.show_salaries, "salaries", _("Manage lecturer salaries")),
            (_("🎓 Graduation"), self.show_graduation_payments, "graduation_payments", _("Manage graduation fees")),
            (_("🧵 Tailor Shop"), self.show_tailor_shop, "tailor_shop", _("Manage tailor shop orders")),
            (_("💰 Petty Cash"), self.show_petty_cash, "petty_cash", _("Manage petty cash transactions")),
            (_("📢 Messaging"), self.show_messaging, "messaging", _("Send bulk messages and notifications")),
            (_("📜 Activity Log"), self.show_activity_log, "activity_log", _("View staff activity history")),
            (_("⭐ User Approvals"), self.show_admin_approval, "admin_approval", _("Approve or deny new user registrations")),
            (_("💾 Backup/Restore"), self.show_backup_restore, "backup_restore", _("Backup or restore the database"))
        ]
        for i, (text, command, name, tooltip_text) in enumerate(buttons_info, start=3):
            is_admin_only = (name == "admin_approval")
            self._create_sidebar_button(self.sidebar_frame, text, command, name, i, tooltip_text, is_admin_only)

        # Add plugin-provided buttons
        plugin_button_start_row = len(buttons_info) + 3 # Start after core buttons
        for plugin in self.plugin_loader.get_loaded_plugins():
            for menu_item_text, menu_item_command in plugin.get_menu_items():
                self._create_sidebar_button(self.sidebar_frame, menu_item_text, menu_item_command, 
                                            f"plugin_{plugin.get_name()}_{menu_item_text.replace(' ', '_').lower()}", 
                                            plugin_button_start_row, _(f"Plugin: {menu_item_text}"))
                plugin_button_start_row += 1

        # Set initial active button style
        self.set_active_sidebar_button(self.active_button_name)

        # Logout button with distinct color
        logout_btn = ctk.CTkButton(self.sidebar_frame, 
                                 text=_("🚪 Logout"), 
                                 command=self.logout,
                                 fg_color="#ff4444",  # Red
                                 hover_color="#ff6666",
                                 font=ctk.CTkFont(size=13),
                                 corner_radius=5) # Added corner_radius
        logout_btn.grid(row=plugin_button_start_row + 1, column=0, padx=10, pady=20, sticky="ew", columnspan=2) # Position after plugins
        self.sidebar_buttons["logout"] = logout_btn # Add logout button to sidebar_buttons
        self.sidebar_widgets.append(logout_btn)
        Tooltip(logout_btn, _("Logout from the application"))

    def handle_sidebar_click(self, command, button_name):
        self.set_active_sidebar_button(button_name)
        
        # Clear the module content frame before loading new content
        for widget in self.module_content_frame.winfo_children():
            widget.destroy()
        
        command()

    def set_active_sidebar_button(self, name):
        # Reset previous active button to normal font
        if self.active_button_name and self.active_button_name in self.sidebar_buttons:
            self.sidebar_buttons[self.active_button_name].configure(font=ctk.CTkFont(size=13))
        
        # Set new active button to bold font
        button = self.sidebar_buttons.get(name)
        if button:
            button.configure(font=ctk.CTkFont(size=13, weight="bold"))
            self.active_button_name = name

    def create_main_content(self):
        """Create the main content area"""
        self.main_frame = ctk.CTkScrollableFrame(self.window, fg_color="#1B263B", corner_radius=10) # Added corner_radius
        self.main_frame.grid(row=0, column=1, sticky="nsew", padx=(10, 10), pady=(10, 10)) # Adjusted padx, pady
        self.main_frame.grid_columnconfigure(0, weight=1)

        # Create a dedicated frame for module content, packed into main_frame
        self.module_content_frame = ctk.CTkFrame(self.main_frame, fg_color="transparent")
        self.module_content_frame.pack(fill="both", expand=True)

    def load_dashboard_data(self):
        """Load and display dashboard data"""
        self.set_active_sidebar_button("dashboard") # Set dashboard button as active
        self._load_dashboard_data()

    def _load_dashboard_data(self):
        # Clear module content frame
        for widget in self.module_content_frame.winfo_children():
            widget.destroy()

        # Dashboard content will now be packed into self.module_content_frame
        # No need to configure grid for self.module_content_frame here, as it's packed into main_frame.
        # Its children will be packed.
        
        # Title and date with colored frame
        title_frame = ctk.CTkFrame(self.module_content_frame, fg_color="#0D1B2A")
        title_frame.pack(fill="x", pady=10, padx=10)
        
        title = ctk.CTkLabel(title_frame, text=_("Dashboard Overview"), 
                           font=ctk.CTkFont(size=24, weight="bold"),
                           text_color=('#ffffff', '#ffffff'))
        title.pack(side="left", padx=20)

        refresh_button = ctk.CTkButton(title_frame, text=_("🔄 Refresh"), command=self.load_dashboard_data, width=100)
        refresh_button.pack(side="right", padx=20)
        Tooltip(refresh_button, _("Reload the dashboard data"))
        
        date_label = ctk.CTkLabel(title_frame, 
                                text=datetime.now().strftime("%A, %B %d, %Y"),
                                font=ctk.CTkFont(size=14),
                                text_color=('#a0a0a0', '#a0a0a0'))
        date_label.pack(side="right", padx=20)

        # Statistics cards with colors
        self.create_statistics_cards()

        # Quick Actions
        self.create_quick_actions()

        # Charts section
        self.create_charts()

        # Update sidebar quick stats
        self._update_quick_stats_sidebar()

        # Show notification pop-ups
        self.show_pending_payments_notification()
        self.show_ending_courses_notification()

    def create_statistics_cards(self):
        """Create statistics cards with colors"""
        stats_frame = ctk.CTkFrame(self.module_content_frame, fg_color="#0D1B2A")
        stats_frame.pack(fill="x", pady=10, padx=10)

        try:
            # Get comprehensive statistics
            attendance_rate = self.get_attendance_rate()
            pending_payments = self.get_pending_payments_count()
            stats = {
                _("Total Students"): (self.get_total_students(), "👥", "#4CAF50"), # Green
                _("Active Students"): (self.get_active_students(), "🧑‍🎓", "#2196F3"), # Blue
                _("Attendance Rate"): (f"{attendance_rate:.1f}%", "📈", "#FFC107"), # Amber
                _("Pending Payments"): (pending_payments, "💵", "#F44336") # Red
            }

            # Use grid for internal layout of cards within stats_frame
            stats_frame.grid_columnconfigure(0, weight=1)
            stats_frame.grid_columnconfigure(1, weight=1)

            for i, ((label, (value, icon, color))) in enumerate(stats.items()):
                row, col = divmod(i, 2)
                card = ctk.CTkFrame(stats_frame, fg_color=color)
                card.grid(row=row, column=col, padx=10, pady=10, sticky="nsew")
                
                icon_label = ctk.CTkLabel(card, text=icon, font=ctk.CTkFont(size=30))
                icon_label.pack(pady=5)

                ctk.CTkLabel(card, text=label, 
                            font=ctk.CTkFont(size=12),
                            text_color=('#ffffff', '#ffffff')).pack(pady=5)
                
                ctk.CTkLabel(card, text=str(value), 
                            font=ctk.CTkFont(size=20, weight="bold"),
                            text_color=('#ffffff', '#ffffff')).pack(pady=5)

        except Exception as e:
            messagebox.showerror(_("Error"), _(f"Failed to load statistics: {str(e)}"))

    def create_quick_actions(self):
        """Create quick action buttons area"""
        actions_frame = ctk.CTkFrame(self.module_content_frame, fg_color="#0D1B2A")
        actions_frame.pack(fill="x", pady=10, padx=10, before=None) # Pack it normally
        
        # We use side="top" to ensure it's not buried
        ctk.CTkLabel(actions_frame, text=_("Quick Actions"), font=ctk.CTkFont(size=16, weight="bold")).pack(pady=5, side="top")
        
        # Add Paper Application Button
        paper_app_btn = ctk.CTkButton(actions_frame, 
                                     text=_("➕ Add Paper Application"), 
                                     command=self.add_paper_application,
                                     fg_color="#2e8b57", # SeaGreen
                                     hover_color="#3cb371",
                                     font=ctk.CTkFont(size=14, weight="bold"),
                                     height=40)
        paper_app_btn.pack(side="top", pady=10) # Center it vertically
        Tooltip(paper_app_btn, _("Convert a paper application form into a digital student record"))

    def add_paper_application(self):
        """Open students management window with 'manual' source preset"""
        # Clear the module content frame before loading new content
        for widget in self.module_content_frame.winfo_children():
            widget.destroy()

        students_window = StudentsWindow(self.module_content_frame, self.db, self.user, initial_source='manual')
        students_window.show()
        self.set_active_sidebar_button("students")

    def _update_quick_stats_sidebar(self):
        """Update the quick stats in the sidebar with live data."""
        try:
            today_date = datetime.now().strftime("%Y-%m-%d")

            # Get data
            todays_attendance = self.get_todays_attendance_count(today_date)
            pending_payments = self.get_pending_payments_count()
            active_courses = self.get_total_courses() # Reusing total courses for now

            # Update sidebar buttons
            if _("Today's Attendance") in self.quick_stats:
                self.quick_stats[_("Today's Attendance")].configure(text=_("Today's Attendance: {todays_attendance}"))
            if _("Pending Payments") in self.quick_stats:
                self.quick_stats[_("Pending Payments")].configure(text=_("Pending Payments: {pending_payments}"))
                # Conditional coloring
                if pending_payments > 0:
                    self.quick_stats[_("Pending Payments")].configure(text_color="#ff6b6b") # Red
                else:
                    self.quick_stats[_("Pending Payments")].configure(text_color="#2e8b57") # Green
            if _("Active Courses") in self.quick_stats:
                self.quick_stats[_("Active Courses")].configure(text=_("Active Courses: {active_courses}"))

        except Exception as e:
            print(f"Error updating quick stats sidebar: {e}") # Use print for non-critical UI update errors

    def create_charts(self):
        """Create charts area"""
        charts_frame = ctk.CTkFrame(self.module_content_frame, fg_color="#0D1B2A")
        charts_frame.pack(fill="both", expand=True, pady=10, padx=10)
        charts_frame.grid_columnconfigure(0, weight=1)
        charts_frame.grid_columnconfigure(1, weight=1)
        charts_frame.grid_rowconfigure(1, weight=1) # Allow charts to expand vertically
        charts_frame.grid_rowconfigure(3, weight=1)

        # Course Enrollment Distribution
        ctk.CTkLabel(charts_frame, text=_("Students Distribution by Course"), font=ctk.CTkFont(size=16, weight="bold")).grid(row=0, column=0, columnspan=2, pady=(10,0))
        self.create_course_enrollment_distribution_chart(charts_frame)
        self.create_attendance_rate_by_course_chart(charts_frame)


        # Monthly Admission Trends
        ctk.CTkLabel(charts_frame, text=_("Monthly Admission Trends (last 12 Months)"), font=ctk.CTkFont(size=16, weight="bold")).grid(row=2, column=0, columnspan=2, pady=(20,0))
        self.create_monthly_admission_trends_chart(charts_frame)

        # Enrollment vs Payments Trend
        ctk.CTkLabel(charts_frame, text=_("Enrollment vs Payments (Last 12 Months)"), font=ctk.CTkFont(size=16, weight="bold")).grid(row=4, column=0, columnspan=2, pady=(20,0))
        self.create_enrollment_payment_trends_chart(charts_frame)

    def create_enrollment_payment_trends_chart(self, parent):
        """Create a combined bar and line chart for enrollments and payments."""
        try:
            # Fetch enrollment data
            enrollment_query = """
            SELECT DATE_FORMAT(enrollment_date, '%Y-%m') as month, COUNT(id) as count
            FROM enrollments
            WHERE enrollment_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
            GROUP BY month ORDER BY month
            """
            enrollment_data = {row['month']: row['count'] for row in self.db.fetch_all(enrollment_query)}

            # Fetch payment data including tailor shop
            payment_query = """
            SELECT DATE_FORMAT(payment_date, '%Y-%m') as month, SUM(amount) as total
            FROM (
                SELECT amount, payment_date FROM payments
                UNION ALL
                SELECT amount, payment_date FROM tailor_shop_payments
            ) p
            WHERE payment_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
            GROUP BY month ORDER BY month
            """
            payment_data = {row['month']: row['total'] for row in self.db.fetch_all(payment_query)}

            # Combine data
            months = sorted(list(set(enrollment_data.keys()) | set(payment_data.keys())))
            enrollments = [enrollment_data.get(m, 0) for m in months]
            payments = [payment_data.get(m, 0) for m in months]

            chart_frame = ctk.CTkFrame(parent, fg_color="#1B263B")
            chart_frame.grid(row=5, column=0, columnspan=2, sticky="nsew", padx=10, pady=10)

            fig = Figure(figsize=(10, 5), dpi=100, facecolor="#1B263B")
            ax1 = fig.add_subplot(111)
            
            # Bar chart for enrollments
            ax1.bar(months, enrollments, color='skyblue', label=_('New Enrollments'))
            ax1.set_xlabel(_('Month'), color='white')
            ax1.set_ylabel(_('New Enrollments'), color='skyblue')
            ax1.tick_params(axis='y', labelcolor='skyblue')
            ax1.tick_params(axis='x', colors='white')
            ax1.spines['left'].set_color('skyblue')
            
            # Line chart for payments
            ax2 = ax1.twinx()
            ax2.plot(months, payments, color='gold', marker='o', label=_('Total Payments (Le)'))
            ax2.set_ylabel(_('Total Payments (Le)'), color='gold')
            ax2.tick_params(axis='y', labelcolor='gold')
            ax2.spines['right'].set_color('gold')
            
            # Styling
            ax1.set_facecolor("#1B263B")
            ax1.spines['bottom'].set_color('white')
            ax1.spines['top'].set_color('#1B263B')
            ax1.spines['left'].set_color('skyblue')
            ax2.spines['bottom'].set_color('white')
            ax2.spines['top'].set_color('#1B263B')

            fig.tight_layout()
            plt.setp(ax1.get_xticklabels(), rotation=45, ha="right")

            canvas = FigureCanvasTkAgg(fig, master=chart_frame)
            canvas.draw()
            canvas.get_tk_widget().pack(fill="both", expand=True)

        except Exception as e:
            print(f"Error creating enrollment vs payment chart: {e}")


    def create_course_enrollment_distribution_chart(self, parent):
        """Create course enrollment distribution pie chart"""
        try:
            query = "SELECT c.course_name, COUNT(e.student_id) as enrollment_count FROM courses c LEFT JOIN enrollments e ON c.id = e.course_id GROUP BY c.id, c.course_name"
            data = {row['course_name']: row['enrollment_count'] for row in self.db.fetch_all(query)}
            self.create_simple_chart(parent, "Course Enrollment Distribution", data, "pie", 1, 0)
        except Exception as e:
            print(f"Error creating course enrollment chart: {e}")

    def create_attendance_rate_by_course_chart(self, parent):
        """Create attendance rate by course bar chart"""
        try:
            query = "SELECT c.course_name, (SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) * 100.0 / COUNT(a.id)) as attendance_rate FROM courses c JOIN attendance a ON c.id = a.course_id GROUP BY c.id, c.course_name"
            data = {row['course_name']: row['attendance_rate'] for row in self.db.fetch_all(query)}
            self.create_simple_chart(parent, "Attendance Performance by Course", data, "bar", 1, 1)
        except Exception as e:
            print(f"Error creating attendance rate by course chart: {e}")

    def create_monthly_admission_trends_chart(self, parent):
        """Create monthly admission trends bar chart"""
        try:
            query = "SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count FROM students WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH) GROUP BY month ORDER BY month"
            data = {row['month']: row['count'] for row in self.db.fetch_all(query)}
            self.create_simple_chart(parent, "Student Admission Trends", data, "bar", 3, 0, 2)
        except Exception as e:
            print(f"Error creating monthly admission trends chart: {e}")


    def create_simple_chart(self, parent, title, data, chart_type, grid_row, grid_column, columnspan=1):
        """Create a simple chart using Matplotlib"""
        chart_frame = ctk.CTkFrame(parent, fg_color="#1B263B")
        chart_frame.grid(row=grid_row, column=grid_column, columnspan=columnspan, sticky="nsew", padx=10, pady=10)

        title_frame = ctk.CTkFrame(chart_frame, fg_color="transparent")
        title_frame.pack(fill="x", pady=(10,0))
        ctk.CTkLabel(title_frame, text=title, font=ctk.CTkFont(size=16, weight="bold")).pack(side="left", padx=10)
        ctk.CTkButton(title_frame, text=_("Export CSV"), width=100, command=lambda: self.export_to_csv(title, data)).pack(side="right", padx=10)

        if not data or sum(data.values()) == 0:
            ctk.CTkLabel(chart_frame, text=_("No data available")).pack(expand=True)
            return

        fig = Figure(figsize=(5, 4), dpi=100, facecolor="#1B263B")
        ax = fig.add_subplot(111)
        ax.set_facecolor("#1B263B")
        fig.subplots_adjust(left=0.1, right=0.9, top=0.9, bottom=0.2)

        ax.tick_params(colors='white')
        ax.spines['bottom'].set_color('white')
        ax.spines['top'].set_color('#1B263B')
        ax.spines['right'].set_color('#1B263B')
        ax.spines['left'].set_color('#1B263B')
        ax.yaxis.label.set_color('white')
        ax.xaxis.label.set_color('white')

        annot = ax.annotate("", xy=(0,0), xytext=(20,20), textcoords="offset points",
                            bbox=dict(boxstyle="round", fc="w"),
                            arrowprops=dict(arrowstyle="->"))
        annot.set_visible(False)

        if chart_type == "pie":
            labels = list(data.keys())
            sizes = list(data.values())
            
            fig.subplots_adjust(left=0.1, right=0.6, top=0.9, bottom=0.1) # Give more space for legend

            wedges, texts, autotexts = ax.pie(sizes, autopct='%1.1f%%', startangle=90,
                                             pctdistance=0.85, colors=plt.cm.viridis(np.linspace(0, 1, len(labels))))
            ax.axis('equal')
            ax.legend(wedges, labels, title=_("Legend"), loc="center left", bbox_to_anchor=(1, 0, 0.5, 1),
                      labelcolor='white', facecolor='#1B263B', edgecolor='none')
            for text in autotexts:
                text.set_color('white')

            def hover(event):
                vis = annot.get_visible()
                if event.inaxes == ax:
                    for i, w in enumerate(wedges):
                        cont, _ = w.contains(event)
                        if cont:
                            annot.set_text(f"{labels[i]}: {sizes[i]}")
                            annot.set_visible(True)
                            fig.canvas.draw_idle()
                            return
                if vis:
                    annot.set_visible(False)
                    fig.canvas.draw_idle()
            fig.canvas.mpl_connect("motion_notify_event", hover)

        elif chart_type == "bar":
            bars = ax.bar(data.keys(), data.values(), color=plt.cm.viridis(np.linspace(0, 1, len(data))))
            ax.set_ylabel(_('Values'), color='white')
            plt.setp(ax.get_xticklabels(), rotation=45, ha="right", rotation_mode="anchor", color='white')
            
            def hover(event):
                vis = annot.get_visible()
                if event.inaxes == ax:
                    for i, bar in enumerate(bars):
                        cont, _ = bar.contains(event)
                        if cont:
                            label = list(data.keys())[i]
                            value = list(data.values())[i]
                            annot.set_text(f"{label}: {value:.2f}")
                            annot.set_visible(True)
                            fig.canvas.draw_idle()
                            return
                if vis:
                    annot.set_visible(False)
                    fig.canvas.draw_idle()
            fig.canvas.mpl_connect("motion_notify_event", hover)


        canvas = FigureCanvasTkAgg(fig, master=chart_frame)
        canvas.draw()
        canvas.get_tk_widget().pack(fill="both", expand=True)


    # Data Methods
    def get_total_students(self):
        """Get total students"""
        try:
            result = self.db.fetch_one("SELECT COUNT(*) as count FROM students")
            return result['count'] or 0
        except Exception:
            return 0
    
    def get_total_courses(self):
        """Get total courses"""
        try:
            result = self.db.fetch_one("SELECT COUNT(*) as count FROM courses")
            return result['count'] or 0
        except Exception:
            return 0

    def get_active_students(self):
        """Get active students"""
        try:
            result = self.db.fetch_one("SELECT COUNT(*) as count FROM students WHERE id IN (SELECT DISTINCT student_id FROM enrollments WHERE status = 'Active')")
            return result['count'] or 0
        except Exception:
            return 0

    def get_attendance_rate(self):
        """Get attendance rate"""
        try:
            result = self.db.fetch_one("SELECT SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as rate FROM attendance")
            return result['rate'] or 0
        except Exception:
            return 0

    def get_todays_attendance_count(self, today_date):
        """Get total attendance for today"""
        try:
            query = "SELECT COUNT(*) as count FROM attendance WHERE date = %s AND status = 'Present'"
            result = self.db.fetch_one(query, (today_date,))
            return result['count'] or 0
        except Exception as e: # Catch specific exception to print it
            print(f"ERROR in get_todays_attendance_count: {e}") # Debug print
            return 0

    def get_pending_payments_count(self):
        """Get total pending payments from both regular and tailor shop payments"""
        try:
            query = """
            SELECT (
                (SELECT COUNT(*) FROM payments WHERE status = 'Pending') +
                (SELECT COUNT(*) FROM tailor_shop_payments WHERE status = 'Pending')
            ) as count
            """
            result = self.db.fetch_one(query)
            return result['count'] or 0
        except Exception:
            return 0


    def export_to_csv(self, chart_title, data):
        """Export chart data to a CSV file"""
        if not data:
            messagebox.showinfo(_("Export Error"), _("No data to export."))
            return

        try:
            import csv
            from tkinter import filedialog

            filepath = filedialog = filedialog.asksaveasfilename(defaultextension=".csv",
                                                    filetypes=[(_("CSV files"), "*.csv")],
                                                    initialfile=f"{chart_title.replace(' ', '_')}.csv")
            if not filepath:
                return

            with open(filepath, 'w', newline='') as csvfile:
                writer = csv.writer(csvfile)
                writer.writerow([_('Label'), _('Value')])
                for label, value in data.items():
                    writer.writerow([label, value])
            
            messagebox.showinfo(_("Export Successful"), _(f"Data exported to {filepath}"))

        except Exception as e:
            messagebox.showerror(_("Export Error"), _(f"Failed to export data: {str(e)}"))

    def show_pending_payments_notification(self):
        """Checks for pending payments and shows a notification window."""
        pending_payments = self.get_pending_payment_details()
        
        if pending_payments:
            notification_window = PendingPaymentsNotificationWindow(self.window, pending_payments)
            notification_window.grab_set()

    def get_pending_payment_details(self):
        """Fetches details of students with pending payments from both regular and tailor shop."""
        try:
            query = """
                SELECT s.first_name, s.last_name, s.email, COALESCE(c.course_name, 'Tailor Shop') as course_name, p.amount, p.payment_date
                FROM (
                    SELECT student_id, course_id, amount, payment_date, status FROM payments
                    UNION ALL
                    SELECT student_id, NULL as course_id, amount, payment_date, status FROM tailor_shop_payments
                ) p
                JOIN students s ON p.student_id = s.id
                LEFT JOIN courses c ON p.course_id = c.id
                WHERE p.status = 'Pending'
                ORDER BY p.payment_date ASC
            """
            return self.db.fetch_all(query)
        except Exception as e:
            print(f"Error fetching pending payment details: {e}")
            return []

    def get_ending_enrollment_details(self):
        """Fetches details of enrollments completing within the next 14 days."""
        try:
            today = datetime.now().strftime("%Y-%m-%d")
            fourteen_days_later = (datetime.now() + timedelta(days=14)).strftime("%Y-%m-%d")
            
            query = """
                SELECT s.first_name, s.last_name, c.course_name, e.completion_date
                FROM enrollments e
                JOIN students s ON e.student_id = s.id
                JOIN courses c ON e.course_id = c.id
                WHERE e.completion_date BETWEEN %s AND %s
                ORDER BY e.completion_date ASC
            """
            return self.db.fetch_all(query, (today, fourteen_days_later))
        except Exception as e:
            print(f"Error fetching ending enrollment details: {e}")
            return []

    def show_ending_courses_notification(self):
        """Checks for enrollments ending soon and shows a notification window."""
        ending_enrollments = self.get_ending_enrollment_details()
        
        if ending_enrollments:
            notification_window = EndingCoursesNotificationWindow(self.window, ending_enrollments)
            notification_window.grab_set()

    def adjust_color(self, color, factor):
        """Adjust color brightness for hover effects"""
        color = color.lstrip('#')
        rgb = tuple(int(color[i:i+2], 16) for i in (0, 2, 4))
        rgb = tuple(min(255, int(c + (255 - c) * factor)) for c in rgb)
        return '#%02x%02x%02x' % rgb

    def _create_sidebar_button(self, sidebar, text, command, name, row_index, tooltip_text, is_admin_only=False):
        normal_color = "#ffffff"
        hover_color = "#cccccc"
        
        btn = ctk.CTkButton(sidebar, 
                          text=text, 
                          command=lambda cmd=command, n=name: self.handle_sidebar_click(cmd, n),
                          fg_color="transparent",
                          text_color=normal_color,
                          hover_color=self.adjust_color("#1f6aa5", 0.2),
                          anchor="w",
                          font=ctk.CTkFont(size=13),
                          corner_radius=5)
        btn.grid(row=row_index, column=0, padx=10, pady=5, sticky="ew")

        # Enhanced hover effect
        def on_enter(event):
            btn.configure(text_color=hover_color)
        def on_leave(event):
            btn.configure(text_color=normal_color)

        btn.bind("<Enter>", on_enter)
        btn.bind("<Leave>", on_leave)

        # Apply Role-Based Access Control (RBAC)
        if name in ["payments", "form_payments", "graduation_payments", "salaries"] and not can_manage_payments(self.user):
            btn.configure(state="disabled", text_color=('#808080', '#808080'))
        
        if name in ["admin_approval", "activity_log", "backup_restore", "reports"] and not is_admin_and_approved(self.user):
            btn.configure(state="disabled", text_color=('#808080', '#808080'))

        if name in ["lecturers"] and not is_admin_and_approved(self.user):
             btn.configure(state="disabled", text_color=('#808080', '#808080'))
        
        self.sidebar_buttons[name] = btn
        Tooltip(btn, tooltip_text)
        self.sidebar_widgets.append(btn)

    def run(self):
        """Start the dashboard application"""
        self.window.mainloop()