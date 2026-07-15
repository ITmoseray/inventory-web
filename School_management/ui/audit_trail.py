import customtkinter as ctk
from db.database import get_db_manager
from utils.i18n import get_translator
from datetime import datetime

_ = get_translator()

class AuditTrailWindow(ctk.CTkToplevel):
    def __init__(self, master=None):
        super().__init__(master)
        self.title(_("Payment Audit Trail"))
        self.geometry("1000x700")
        self.transient(master)
        self.grab_set()

        self.create_widgets()
        self.load_audit_trail()

    def create_widgets(self):
        ctk.CTkLabel(self, text=_("🛡️ Payment Audit Trail"), font=ctk.CTkFont(size=22, weight="bold")).pack(pady=15)

        # Filters
        filter_frame = ctk.CTkFrame(self)
        filter_frame.pack(fill="x", padx=20, pady=5)

        self.refresh_btn = ctk.CTkButton(filter_frame, text=_("🔄 Refresh"), command=self.load_audit_trail)
        self.refresh_btn.pack(side="right", padx=10, pady=10)

        # Container
        self.log_container = ctk.CTkScrollableFrame(self)
        self.log_container.pack(fill="both", expand=True, padx=20, pady=10)

    def load_audit_trail(self):
        for widget in self.log_container.winfo_children():
            widget.destroy()

        # Fetch activities related to payments
        query = """
        SELECT al.*, u.username 
        FROM activity_logs al
        LEFT JOIN users u ON al.user_id = u.id
        WHERE al.action ILIKE '%Payment%'
        ORDER BY al.created_at DESC
        LIMIT 200
        """
        activities = get_db_manager().fetch_all(query)

        if not activities:
            ctk.CTkLabel(self.log_container, text=_("No payment transactions found in audit trail.")).pack(pady=30)
            return

        # Headers
        header_frame = ctk.CTkFrame(self.log_container, fg_color="gray20")
        header_frame.pack(fill="x", padx=5, pady=2)
        
        headers = [(_("Date/Time"), 180), (_("Staff"), 120), (_("Action"), 150), (_("Details"), 0)]
        for text, width in headers:
            lbl = ctk.CTkLabel(header_frame, text=text, font=ctk.CTkFont(weight="bold"))
            if width > 0: lbl.configure(width=width)
            lbl.pack(side="left", padx=10)

        for i, act in enumerate(activities):
            bg = "gray25" if i % 2 == 0 else "gray30"
            row = ctk.CTkFrame(self.log_container, fg_color=bg)
            row.pack(fill="x", padx=5, pady=1)

            ts = act['created_at'].strftime("%Y-%m-%d %H:%M") if isinstance(act['created_at'], datetime) else str(act['created_at'])
            
            ctk.CTkLabel(row, text=ts, width=180).pack(side="left", padx=10)
            ctk.CTkLabel(row, text=act.get('username', '---'), width=120).pack(side="left", padx=10)
            ctk.CTkLabel(row, text=act['action'], width=150).pack(side="left", padx=10)
            ctk.CTkLabel(row, text=act.get('details', ''), justify="left").pack(side="left", padx=10, fill="x", expand=True)
