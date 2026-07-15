import customtkinter as ctk
from tkinter import messagebox
from db.timetable_queries import get_timetable_by_course, add_timetable_entry, update_timetable_entry, delete_timetable_entry
from utils.i18n import get_translator

_ = get_translator()

class TimetableWindow:
    def __init__(self, parent_frame, db, course_id, course_name):
        self.parent_frame = parent_frame
        self.db = db
        self.course_id = course_id
        self.course_name = course_name

    def show(self):
        self.window = ctk.CTkToplevel(self.parent_frame)
        self.window.title(_(f"Timetable for {self.course_name}"))
        self.window.geometry("800x600")
        self.window.transient(self.parent_frame.winfo_toplevel())
        self.window.grab_set()

        # Header
        ctk.CTkLabel(self.window, text=_(f"Manage Timetable: {self.course_name}"), font=ctk.CTkFont(size=20, weight="bold")).pack(pady=20)

        # Form Frame
        form_frame = ctk.CTkFrame(self.window)
        form_frame.pack(fill="x", padx=20, pady=10)

        ctk.CTkLabel(form_frame, text=_("Day:")).grid(row=0, column=0, padx=5, pady=5)
        self.day_var = ctk.StringVar(value="Monday")
        days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        ctk.CTkComboBox(form_frame, variable=self.day_var, values=days).grid(row=0, column=1, padx=5, pady=5)

        ctk.CTkLabel(form_frame, text=_("Start Time (HH:MM):")).grid(row=0, column=2, padx=5, pady=5)
        self.start_time_entry = ctk.CTkEntry(form_frame, placeholder_text="09:00")
        self.start_time_entry.grid(row=0, column=3, padx=5, pady=5)

        ctk.CTkLabel(form_frame, text=_("End Time (HH:MM):")).grid(row=1, column=0, padx=5, pady=5)
        self.end_time_entry = ctk.CTkEntry(form_frame, placeholder_text="11:00")
        self.end_time_entry.grid(row=1, column=1, padx=5, pady=5)

        ctk.CTkLabel(form_frame, text=_("Room:")).grid(row=1, column=2, padx=5, pady=5)
        self.room_entry = ctk.CTkEntry(form_frame, placeholder_text="Room 101")
        self.room_entry.grid(row=1, column=3, padx=5, pady=5)

        add_button = ctk.CTkButton(form_frame, text=_("➕ Add Entry"), command=self._add_entry, fg_color="forestgreen")
        add_button.grid(row=2, column=0, columnspan=4, pady=10)

        # List Frame
        self.list_frame = ctk.CTkScrollableFrame(self.window)
        self.list_frame.pack(fill="both", expand=True, padx=20, pady=10)

        self._load_timetable()

    def _load_timetable(self):
        for widget in self.list_frame.winfo_children():
            widget.destroy()

        entries = get_timetable_by_course(self.course_id)
        
        headers = [_("Day"), _("Time"), _("Room"), _("Actions")]
        for i, h in enumerate(headers):
            ctk.CTkLabel(self.list_frame, text=h, font=ctk.CTkFont(weight="bold")).grid(row=0, column=i, padx=10, pady=5, sticky="w")

        for r, entry in enumerate(entries):
            row = r + 1
            ctk.CTkLabel(self.list_frame, text=entry['day_of_week']).grid(row=row, column=0, padx=10, pady=5, sticky="w")
            
            start = entry['start_time'].strftime("%H:%M") if entry['start_time'] else "N/A"
            end = entry['end_time'].strftime("%H:%M") if entry['end_time'] else "N/A"
            ctk.CTkLabel(self.list_frame, text=f"{start} - {end}").grid(row=row, column=1, padx=10, pady=5, sticky="w")
            
            ctk.CTkLabel(self.list_frame, text=entry['room'] or "---").grid(row=row, column=2, padx=10, pady=5, sticky="w")

            btn_frame = ctk.CTkFrame(self.list_frame, fg_color="transparent")
            btn_frame.grid(row=row, column=3, padx=10, pady=5)
            
            ctk.CTkButton(btn_frame, text=_("🗑️"), width=30, fg_color="firebrick", command=lambda e=entry: self._delete_entry(e['id'])).pack(side="left", padx=2)

    def _add_entry(self):
        day = self.day_var.get()
        start = self.start_time_entry.get()
        end = self.end_time_entry.get()
        room = self.room_entry.get()

        if not start or not end:
            messagebox.showwarning(_("Warning"), _("Start and end times are required."))
            return

        if add_timetable_entry(self.course_id, day, start, end, room):
            messagebox.showinfo(_("Success"), _("Timetable entry added."))
            self._load_timetable()
            self.start_time_entry.delete(0, 'end')
            self.end_time_entry.delete(0, 'end')
            self.room_entry.delete(0, 'end')
        else:
            messagebox.showerror(_("Error"), _("Failed to add entry."))

    def _delete_entry(self, entry_id):
        if messagebox.askyesno(_("Confirm"), _("Are you sure you want to delete this entry?")):
            if delete_timetable_entry(entry_id):
                self._load_timetable()
            else:
                messagebox.showerror(_("Error"), _("Failed to delete entry."))
