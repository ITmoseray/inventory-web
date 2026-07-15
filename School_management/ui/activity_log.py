import customtkinter as ctk
from db.activity_queries import get_recent_activities
from utils.i18n import get_translator
from datetime import datetime

_ = get_translator()

class ActivityLogWindow(ctk.CTkToplevel):
    def __init__(self, master=None):
        super().__init__(master)
        self.title(_("Staff Activity Log"))
        self.geometry("900x600")
        self.transient(master)
        self.grab_set()

        self.create_widgets()
        self.load_activities()

    def create_widgets(self):
        # Title
        ctk.CTkLabel(self, text=_("📜 Staff Activity Log"), font=ctk.CTkFont(size=20, weight="bold")).pack(pady=10)

        # Filter/Refresh Frame
        filter_frame = ctk.CTkFrame(self)
        filter_frame.pack(fill="x", padx=20, pady=5)

        self.refresh_btn = ctk.CTkButton(filter_frame, text=_("🔄 Refresh"), command=self.load_activities)
        self.refresh_btn.pack(side="right", padx=10, pady=5)

        # Scrollable area for logs
        self.log_container = ctk.CTkScrollableFrame(self)
        self.log_container.pack(fill="both", expand=True, padx=20, pady=10)

    def load_activities(self):
        # Clear existing logs
        for widget in self.log_container.winfo_children():
            widget.destroy()

        activities = get_recent_activities(limit=100)

        if not activities:
            ctk.CTkLabel(self.log_container, text=_("No activities recorded yet.")).pack(pady=20)
            return

        # Header
        header_frame = ctk.CTkFrame(self.log_container, fg_color="gray20")
        header_frame.pack(fill="x", padx=5, pady=2)
        
        ctk.CTkLabel(header_frame, text=_("Timestamp"), width=150, font=ctk.CTkFont(weight="bold")).pack(side="left", padx=5)
        ctk.CTkLabel(header_frame, text=_("User"), width=100, font=ctk.CTkFont(weight="bold")).pack(side="left", padx=5)
        ctk.CTkLabel(header_frame, text=_("Action"), width=150, font=ctk.CTkFont(weight="bold")).pack(side="left", padx=5)
        ctk.CTkLabel(header_frame, text=_("Details"), font=ctk.CTkFont(weight="bold")).pack(side="left", padx=5, fill="x", expand=True)

        for i, activity in enumerate(activities):
            bg_color = "gray25" if i % 2 == 0 else "gray30"
            row_frame = ctk.CTkFrame(self.log_container, fg_color=bg_color)
            row_frame.pack(fill="x", padx=5, pady=1)

            timestamp = activity['created_at'].strftime("%Y-%m-%d %H:%M:%S") if isinstance(activity['created_at'], datetime) else str(activity['created_at'])
            
            ctk.CTkLabel(row_frame, text=timestamp, width=150).pack(side="left", padx=5)
            ctk.CTkLabel(row_frame, text=activity.get('username', 'Unknown'), width=100).pack(side="left", padx=5)
            ctk.CTkLabel(row_frame, text=activity['action'], width=150).pack(side="left", padx=5)
            ctk.CTkLabel(row_frame, text=activity.get('details', ''), justify="left").pack(side="left", padx=5, fill="x", expand=True)
