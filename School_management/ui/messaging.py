import customtkinter as ctk
from tkinter import messagebox
from db.database import get_db_manager
from utils.email_sender import send_email
from db import student_queries, course_queries
from utils.i18n import get_translator

_ = get_translator()

class MessagingWindow:
    def __init__(self, parent_frame, db, user):
        self.parent_frame = parent_frame
        self.db = db
        self.user = user

    def show(self):
        for widget in self.parent_frame.winfo_children():
            widget.destroy()

        container = ctk.CTkFrame(self.parent_frame)
        container.pack(fill="both", expand=True, padx=20, pady=20)

        ctk.CTkLabel(container, text=_("📢 Bulk Messaging & Notifications"), font=ctk.CTkFont(size=20, weight="bold")).pack(pady=10)

        # Target selection
        target_frame = ctk.CTkFrame(container)
        target_frame.pack(fill="x", padx=10, pady=10)

        ctk.CTkLabel(target_frame, text=_("Send To:")).pack(side="left", padx=10)
        self.target_var = ctk.StringVar(value="all")
        
        ctk.CTkRadioButton(target_frame, text=_("All Students"), variable=self.target_var, value="all", command=self.update_selection_fields).pack(side="left", padx=10)
        ctk.CTkRadioButton(target_frame, text=_("Specific Course"), variable=self.target_var, value="course", command=self.update_selection_fields).pack(side="left", padx=10)
        ctk.CTkRadioButton(target_frame, text=_("Individual Student"), variable=self.target_var, value="individual", command=self.update_selection_fields).pack(side="left", padx=10)

        self.selection_frame = ctk.CTkFrame(container, fg_color="transparent")
        self.selection_frame.pack(fill="x", padx=10, pady=5)

        # Message body
        ctk.CTkLabel(container, text=_("Message:")).pack(pady=(10, 0), anchor="w", padx=20)
        self.message_text = ctk.CTkTextbox(container, height=150)
        self.message_text.pack(fill="x", padx=20, pady=5)

        # Channels
        channel_frame = ctk.CTkFrame(container)
        channel_frame.pack(fill="x", padx=10, pady=10)

        self.email_var = ctk.BooleanVar(value=True)
        ctk.CTkCheckBox(channel_frame, text=_("📧 Send Email"), variable=self.email_var).pack(side="left", padx=20)

        self.portal_var = ctk.BooleanVar(value=True)
        ctk.CTkCheckBox(channel_frame, text=_("💻 Post to Portal"), variable=self.portal_var).pack(side="left", padx=20)

        # Send button
        self.send_btn = ctk.CTkButton(container, text=_("🚀 Send Message"), command=self.send_bulk_message, fg_color="green", hover_color="darkgreen")
        self.send_btn.pack(pady=20)

        self.update_selection_fields()

    def update_selection_fields(self):
        for widget in self.selection_frame.winfo_children():
            widget.destroy()

        target = self.target_var.get()
        if target == "course":
            courses = course_queries.get_all_courses()
            course_names = [c['course_name'] for c in courses]
            self.course_map = {c['course_name']: c['id'] for c in courses}
            self.course_combo = ctk.CTkComboBox(self.selection_frame, values=course_names)
            self.course_combo.pack(padx=10, pady=5)
        elif target == "individual":
            students = student_queries.get_all_students()
            student_names = [f"{s['first_name']} {s['last_name']} ({s['student_id']})" for s in students]
            self.student_map = {f"{s['first_name']} {s['last_name']} ({s['student_id']})": s['id'] for s in students}
            self.student_combo = ctk.CTkComboBox(self.selection_frame, values=student_names)
            self.student_combo.pack(padx=10, pady=5)

    def send_bulk_message(self):
        message = self.message_text.get("1.0", "end-1c").strip()
        if not message:
            messagebox.showwarning(_("Warning"), _("Please enter a message."))
            return

        target_type = self.target_var.get()
        target_id = None
        
        # Get recipient list
        recipients = []
        if target_type == "all":
            recipients = student_queries.get_all_students()
        elif target_type == "course":
            course_name = self.course_combo.get()
            target_id = self.course_map.get(course_name)
            # Fetch students in this course
            query = "SELECT s.* FROM students s JOIN enrollments e ON s.id = e.student_id WHERE e.course_id = :cid"
            recipients = get_db_manager().fetch_all(query, {"cid": target_id})
        elif target_type == "individual":
            student_name = self.student_combo.get()
            target_id = self.student_map.get(student_name)
            recipients = [student_queries.get_student_by_pk_id(target_id)]

        if not recipients:
            messagebox.showwarning(_("Warning"), _("No recipients found."))
            return

        # Confirmation
        if not messagebox.askyesno(_("Confirm"), _(f"Are you sure you want to send this message to {len(recipients)} recipients?")):
            return

        success_count = 0
        
        # Send via Portal
        if self.portal_var.get():
            try:
                get_db_manager().execute(
                    "INSERT INTO notifications (user_id, target_type, target_id, message) VALUES (:uid, :type, :tid, :msg)",
                    {"uid": self.user['id'], "type": target_type, "tid": target_id, "msg": message}
                )
            except Exception as e:
                print(f"Error saving portal notification: {e}")

        # Send via Email
        if self.email_var.get():
            for s in recipients:
                if s['email']:
                    res, msg = send_email(s['email'], _("Notification from EASI Portal"), message)
                    if res: success_count += 1
            messagebox.showinfo(_("Success"), _(f"Email notifications sent: {success_count} / {len(recipients)}"))
        
        messagebox.showinfo(_("Completed"), _("Bulk messaging process completed."))
        self.message_text.delete("1.0", "end")
