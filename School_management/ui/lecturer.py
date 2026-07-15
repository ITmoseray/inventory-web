import customtkinter as ctk
from tkinter import messagebox, Menu, filedialog
import pandas as pd
from datetime import datetime
import random
import string
from ui.tooltip import Tooltip
from utils.i18n import get_translator
from utils.mixins import UndoRedoEntryMixin
from db import lecturer_queries # Import lecturer queries

_ = get_translator()

class LecturerWindow:
    def __init__(self, parent_frame, db):
        self.parent_frame = parent_frame
        self.db = db
        self.current_lecturer_id = None
        self.tooltips = []
        self.main_container = None

    def show(self):
        for tooltip in self.tooltips:
            tooltip.hide()
        self.tooltips = []

        if self.main_container and self.main_container.winfo_exists():
            self.main_container.destroy()

        container = ctk.CTkFrame(self.parent_frame)
        container.pack(fill="both", expand=True, padx=10, pady=10)
        self.main_container = container

        title = ctk.CTkLabel(container, text=_("👨‍🏫 Lecturer Management"), 
                           font=ctk.CTkFont(size=24, weight="bold"))
        title.pack(pady=10)
        
        # Create a frame for the form at the top
        form_wrapper_frame = ctk.CTkFrame(container)
        form_wrapper_frame.pack(side="top", fill="both", padx=5, pady=5) # No expand here for the form

        # Create the form inside its wrapper frame
        self.create_lecturer_form(form_wrapper_frame) 

        # Create a frame for the lecturer list at the bottom, expanding to fill remaining space
        list_wrapper_frame = ctk.CTkFrame(container)
        list_wrapper_frame.pack(side="bottom", fill="both", expand=True, padx=5, pady=5) # Expand here for the list

        # Create lecturer list inside its wrapper frame
        self.create_lecturer_list(list_wrapper_frame) 

        self.load_lecturers()

    def create_lecturer_form(self, parent):
        form_title = ctk.CTkLabel(parent, text=_("📝 Lecturer Details"), 
                                font=ctk.CTkFont(size=18, weight="bold"))
        form_title.pack(pady=10)

        fields = [
            (_("Lecturer ID"), "lecturer_id_entry"),
            (_("Full Name"), "full_name_entry"), # Replaced first/last name
            (_("Phone"), "phone_entry"),
            (_("Email"), "email_entry"),
            (_("Department"), "department_entry") # Replaced address/specialization
        ]

        self.entries = {}
        for field_name, attr_name in fields:
            frame = ctk.CTkFrame(parent)
            frame.pack(fill="x", padx=20, pady=5)

            label = ctk.CTkLabel(frame, text=f"➡️ {field_name}:", width=100)
            label.pack(side="left", padx=5)

            entry = UndoRedoEntryMixin(frame)
            entry.pack(side="left", fill="x", expand=True, padx=5)
            self.entries[attr_name] = entry
        
        button_frame = ctk.CTkFrame(parent)
        button_frame.pack(pady=20)

        buttons_info = [
            (_("➕ Add"), self.add_lecturer, _("Add a new lecturer record"), "forestgreen", "seagreen"),
            (_("📝 Update"), self.update_lecturer, _("Update the selected lecturer's record"), "royalblue", "cornflowerblue"),
            (_("🧹 Clear"), self.clear_form, _("Clear all fields in the form"), "gray", "dimgray"),
            (_("📤 Export"), self.export_lecturers, _("Export all lecturer data to an Excel file"), "goldenrod", "darkgoldenrod")
        ]

        for text, command, tooltip_text, fg_color, hover_color in buttons_info:
            button = ctk.CTkButton(button_frame, text=text, command=command, fg_color=fg_color, hover_color=hover_color)
            button.pack(side="left", padx=5)
            self.tooltips.append(Tooltip(button, tooltip_text))

    def create_lecturer_list(self, parent):
        list_title = ctk.CTkLabel(parent, text=_("👨‍🏫 All Lecturers"), 
                                 font=ctk.CTkFont(size=18, weight="bold"))
        list_title.pack(pady=10)

        self.lecturers_frame = ctk.CTkScrollableFrame(parent)
        self.lecturers_frame.pack(fill="both", expand=True, padx=10, pady=10)

    def generate_lecturer_id(self):
        while True:
            prefix = "LCT"
            year = datetime.now().year
            random_num = ''.join(random.choices(string.digits, k=4))
            lecturer_id = f"{prefix}{year}{random_num}"
            
            query = "SELECT lecturer_id FROM lecturers WHERE lecturer_id = %s"
            result = self.db.fetch_one(query, (lecturer_id,))
            if not result:
                return lecturer_id

    def add_lecturer(self):
        try:
            if not all([self.entries['full_name_entry'].get(),
                       self.entries['phone_entry'].get(),
                       self.entries['department_entry'].get()]):
                messagebox.showerror(_("Error"), _("Please fill all required fields"))
                return

            lecturer_id = self.entries['lecturer_id_entry'].get()
            if not lecturer_id:
                lecturer_id = self.generate_lecturer_id()
                self.entries['lecturer_id_entry'].delete(0, 'end')
                self.entries['lecturer_id_entry'].insert(0, lecturer_id)

            lecturer_queries.add_lecturer(
                lecturer_id,
                self.entries['full_name_entry'].get(),
                self.entries['email_entry'].get(),
                self.entries['phone_entry'].get(),
                self.entries['department_entry'].get()
            )
            messagebox.showinfo(_("Success"), _("Lecturer added successfully!"))
            self.clear_form()
            self.load_lecturers()
        except Exception as e:
            messagebox.showerror(_("Error"), _(f"Failed to add lecturer: {str(e)}"))

    def update_lecturer(self):
        if not self.current_lecturer_id:
            messagebox.showerror(_("Error"), _("Please select a lecturer to update"))
            return

        try:
            lecturer_queries.update_lecturer(
                self.current_lecturer_id,
                self.entries['lecturer_id_entry'].get(),
                self.entries['full_name_entry'].get(),
                self.entries['email_entry'].get(),
                self.entries['phone_entry'].get(),
                self.entries['department_entry'].get()
            )
            messagebox.showinfo(_("Success"), _("Lecturer updated successfully!"))
            self.clear_form()
            self.load_lecturers()
        except Exception as e:
            messagebox.showerror(_("Error"), _(f"Failed to update lecturer: {str(e)}"))

    def delete_lecturer(self, lecturer_id):
        if messagebox.askyesno(_("Confirm"), _("Are you sure you want to delete this lecturer?")):
            try:
                lecturer_queries.delete_lecturer(lecturer_id)
                messagebox.showinfo(_("Success"), _("Lecturer deleted successfully!"))
                self.load_lecturers()
            except Exception as e:
                messagebox.showerror(_("Error"), _(f"Failed to delete lecturer: {str(e)}"))

    def clear_form(self):
        self.current_lecturer_id = None
        for name, entry in self.entries.items():
            if isinstance(entry, ctk.CTkEntry) or isinstance(entry, UndoRedoEntryMixin):
                entry.delete(0, 'end')
        
        # Re-generate lecturer ID for new entry
        self.entries['lecturer_id_entry'].delete(0, 'end')
        self.entries['lecturer_id_entry'].insert(0, self.generate_lecturer_id())


    def load_lecturers(self):
        for widget in self.lecturers_frame.winfo_children():
            widget.destroy()

        try:
            lecturers = lecturer_queries.get_all_lecturers()
            for lecturer in lecturers:
                frame = ctk.CTkFrame(self.lecturers_frame, fg_color="transparent")
                frame.pack(fill="x", padx=5, pady=5)

                frame.bind("<Enter>", lambda event, f=frame: f.configure(fg_color="#3a3a3a"))
                frame.bind("<Leave>", lambda event, f=frame: f.configure(fg_color="transparent"))

                info_text = f"➡️ {lecturer['lecturer_id']} - {lecturer['full_name']} ({lecturer['department']})"
                label = ctk.CTkLabel(frame, text=info_text)
                label.pack(side="left", fill="x", expand=True, padx=10, pady=5)
                
                label.bind("<Enter>", lambda event, f=frame: f.configure(fg_color="#3a3a3a"))
                label.bind("<Leave>", lambda event, f=frame: f.configure(fg_color="transparent"))

                frame.bind("<Double-Button-1>", lambda event, l=lecturer: self.view_lecturer_details(l))
                label.bind("<Double-Button-1>", lambda event, l=lecturer: self.view_lecturer_details(l))

                frame.bind("<Button-3>", lambda event, l=lecturer: self.show_context_menu(event, l))
                label.bind("<Button-3>", lambda event, l=lecturer: self.show_context_menu(event, l))

        except Exception as e:
            messagebox.showerror(_("Error"), _(f"Failed to load lecturers: {str(e)}"))

    def copy_to_clipboard(self, text):
        self.parent_frame.clipboard_clear()
        self.parent_frame.clipboard_append(text)
        messagebox.showinfo(_("Copied"), _(f"'{text}' copied to clipboard."))

    def show_context_menu(self, event, lecturer):
        context_menu = Menu(self.lecturers_frame, tearoff=0)
        context_menu.add_command(label=_("View profile"), command=lambda: self.view_lecturer_details(lecturer))
        context_menu.add_command(label=_("Copy ID"), command=lambda: self.copy_to_clipboard(lecturer['lecturer_id']))
        context_menu.add_separator()
        context_menu.add_command(label=_("Edit"), command=lambda: self.load_lecturer(lecturer))
        context_menu.add_command(label=_("Delete"), command=lambda: self.delete_lecturer(lecturer['id']))
        context_menu.post(event.x_root, event.y_root)

    def load_lecturer(self, lecturer):
        self.clear_form()
        self.current_lecturer_id = lecturer['id']
        self.entries['lecturer_id_entry'].delete(0, 'end')
        self.entries['lecturer_id_entry'].insert(0, lecturer['lecturer_id'])
        self.entries['full_name_entry'].delete(0, 'end')
        self.entries['full_name_entry'].insert(0, lecturer['full_name'])
        self.entries['phone_entry'].delete(0, 'end')
        self.entries['phone_entry'].insert(0, lecturer['phone'])
        self.entries['email_entry'].delete(0, 'end')
        self.entries['email_entry'].insert(0, lecturer['email'] or '')
        self.entries['department_entry'].delete(0, 'end')
        self.entries['department_entry'].insert(0, lecturer['department'] or '')

    def view_lecturer_details(self, lecturer):
        detail_window = ctk.CTkToplevel(self.parent_frame)
        detail_window.title(_(f"Details: {lecturer['full_name']}"))
        detail_window.geometry("800x700") # Increased size for consistency

        detail_window.transient(self.parent_frame.winfo_toplevel())
        detail_window.lift()
        detail_window.focus_force()
        detail_window.grab_set()

        main_display_frame = ctk.CTkFrame(detail_window)
        main_display_frame.pack(fill="both", expand=True, padx=20, pady=20)

        details_to_show = {
            _("Lecturer ID"): lecturer['lecturer_id'],
            _("Full Name"): lecturer['full_name'],
            _("Phone"): lecturer['phone'],
            _("Email"): lecturer['email'],
            _("Department"): lecturer['department'],
            _("Created At"): lecturer['created_at']
        }
        for key, value in details_to_show.items():
            frame = ctk.CTkFrame(main_display_frame, fg_color="#1F262E")
            frame.pack(fill="x", pady=2, padx=5)
            ctk.CTkLabel(frame, text=_(f"➡️ {key}:"), font=ctk.CTkFont(weight="bold"), text_color="#FFFFFF").pack(side="left", anchor="w", padx=5)
            ctk.CTkLabel(frame, text=str(value), text_color="#FFFFFF").pack(side="left", anchor="w", padx=5)

        close_button = ctk.CTkButton(detail_window, text=_("❌ Close"), command=detail_window.destroy, fg_color="firebrick", hover_color="indianred")
        close_button.pack(pady=10)

    def export_lecturers(self):
        try:
            lecturers = lecturer_queries.get_all_lecturers()

            # Prepare data with translated, user-friendly column names
            exported_data = []
            for lecturer in lecturers:
                exported_data.append({
                    _("Lecturer ID"): lecturer['lecturer_id'],
                    _("Full Name"): lecturer['full_name'],
                    _("Email"): lecturer['email'],
                    _("Phone"): lecturer['phone'],
                    _("Department"): lecturer['department'],
                    _("Created At"): lecturer['created_at']
                })
            
            df = pd.DataFrame(exported_data)


            file_path = filedialog.asksaveasfilename(
                defaultextension=".xlsx",
                filetypes=[(_("Excel files"), "*.xlsx"), (_("All files"), "*.*")]
            )
            
            if file_path:
                df.to_excel(file_path, index=False)
                messagebox.showinfo(_("Success"), _("Lecturers exported successfully!"))
        except Exception as e:
            messagebox.showerror(_("Error"), _(f"Failed to export lecturers: {str(e)}"))