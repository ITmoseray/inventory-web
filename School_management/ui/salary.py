import customtkinter as ctk
from tkinter import messagebox, Menu, filedialog
import pandas as pd
import random # Import the random module
import os # Import the os module
import tempfile # New import for temporary file/directory creation
import shutil # New import for high-level file operations, like removing directories
from datetime import datetime
from ui.tooltip import Tooltip
from utils.i18n import get_translator
from db import lecturer_queries
from db import salary_queries
from utils import pdf_generator # Import PDF generator utility
from utils import email_sender # Import email sender utility

_ = get_translator()

class SalaryWindow:
    def __init__(self, parent_frame, db):
        self.parent_frame = parent_frame
        self.db = db
        self.current_salary_id = None
        self.tooltips = []
        self.main_container = None
        self.lecturers_for_dropdown = []
        self.lecturer_map = {}

    def show(self):
        for tooltip in self.tooltips:
            tooltip.hide()
        self.tooltips = []

        if self.main_container and self.main_container.winfo_exists():
            self.main_container.destroy()

        container = ctk.CTkFrame(self.parent_frame)
        container.pack(fill="both", expand=True, padx=10, pady=10)
        self.main_container = container

        title = ctk.CTkLabel(container, text=_("💰 Lecturer Salary Management"), 
                           font=ctk.CTkFont(size=24, weight="bold"))
        title.pack(pady=10)
        
        self.load_lecturers_for_dropdown()

        # Create a frame for the form at the top
        form_wrapper_frame = ctk.CTkFrame(container)
        form_wrapper_frame.pack(side="top", fill="both", padx=5, pady=5) # No expand here for the form

        # Create the form inside its wrapper frame
        self.create_salary_form(form_wrapper_frame) 

        # Create a frame for the salary list at the bottom, expanding to fill remaining space
        list_wrapper_frame = ctk.CTkFrame(container)
        list_wrapper_frame.pack(side="bottom", fill="both", expand=True, padx=5, pady=5) # Expand here for the list

        # Create salary list inside its wrapper frame
        self.create_salary_list(list_wrapper_frame) 

        self.load_salary_data()

    def load_lecturers_for_dropdown(self):
        try:
            lecturers = lecturer_queries.get_all_lecturers_for_dropdown()
            self.lecturers_for_dropdown = [l['full_name'] for l in lecturers]
            self.lecturer_map = {l['full_name']: l['lecturer_id'] for l in lecturers}
        except Exception as e:
            messagebox.showerror(_("Error"), _(f"Failed to load lecturers for dropdown: {str(e)}"))

    def create_salary_form(self, parent):
        form_title = ctk.CTkLabel(parent, text=_("💸 Salary Details"), 
                                font=ctk.CTkFont(size=18, weight="bold"))
        form_title.pack(pady=10)

        fields = [
            (_("Lecturer"), "lecturer_var"),
            (_("Amount"), "amount_entry"),
            (_("Payment Date"), "payment_date_entry"),
            (_("Receipt Number"), "receipt_number_entry"),
            (_("Status"), "status_var"),
            (_("Notes"), "notes_textbox")
        ]

        self.entries = {}
        for field_name, attr_name in fields:
            frame = ctk.CTkFrame(parent)
            frame.pack(fill="x", padx=20, pady=5)

            label = ctk.CTkLabel(frame, text=f"➡️ {field_name}:", width=100)
            label.pack(side="left", padx=5)

            if field_name == _("Lecturer"):
                self.entries[attr_name] = ctk.StringVar(value=_("Select Lecturer"))
                lecturer_combobox = ctk.CTkComboBox(frame,
                                                  variable=self.entries[attr_name],
                                                  values=[_("Select Lecturer")] + self.lecturers_for_dropdown)
                lecturer_combobox.pack(side="left", fill="x", expand=True, padx=5)
            elif field_name == _("Status"):
                self.entries[attr_name] = ctk.StringVar(value=_("Pending"))
                status_combobox = ctk.CTkComboBox(frame,
                                                  variable=self.entries[attr_name],
                                                  values=[_("Paid"), _("Pending")])
                status_combobox.pack(side="left", fill="x", expand=True, padx=5)
            elif field_name == _("Notes"):
                entry = ctk.CTkTextbox(frame, height=70)
                entry.pack(side="left", fill="x", expand=True, padx=5)
                self.entries[attr_name] = entry
            else:
                entry = ctk.CTkEntry(frame)
                if field_name == _("Payment Date"):
                    entry.insert(0, datetime.now().strftime("%Y-%m-%d"))
                elif field_name == _("Receipt Number"):
                    entry.insert(0, self.generate_receipt_number()) # Generate a default receipt number
                entry.pack(side="left", fill="x", expand=True, padx=5)
                self.entries[attr_name] = entry
        
        button_frame = ctk.CTkFrame(parent)
        button_frame.pack(pady=20)

        buttons_info = [
            (_("➕ Add"), self.add_salary_record, _("Add a new salary record"), "forestgreen", "seagreen"),
            (_("📝 Update"), self.update_salary_record, _("Update the selected salary record"), "royalblue", "cornflowerblue"),
            (_("🧹 Clear"), self.clear_form, _("Clear all fields in the form"), "gray", "dimgray"),
            (_("📤 Export"), self.export_salary_data, _("Export salary data to an Excel file"), "goldenrod", "darkgoldenrod"),
            (_("📱 Copy WhatsApp Message"), self.copy_whatsapp_message, _("Generate and copy an appreciation message for WhatsApp"), "mediumseagreen", "seagreen")
        ]

        for text, command, tooltip_text, fg_color, hover_color in buttons_info:
            button = ctk.CTkButton(button_frame, text=text, command=command, fg_color=fg_color, hover_color=hover_color)
            button.pack(side="left", padx=5)
            self.tooltips.append(Tooltip(button, tooltip_text))

    def create_salary_list(self, parent):
        list_title = ctk.CTkLabel(parent, text=_("💰 Salary Records"), 
                                 font=ctk.CTkFont(size=18, weight="bold"))
        list_title.pack(pady=10)

        self.salary_records_frame = ctk.CTkScrollableFrame(parent)
        self.salary_records_frame.pack(fill="both", expand=True, padx=10, pady=10)

    def validate_date(self, date_string):
        """Validate date string and return proper format"""
        try:
            date_obj = datetime.strptime(date_string, "%Y-%m-%d")
            return date_obj.strftime("%Y-%m-%d")
        except ValueError:
            return None

    def generate_receipt_number(self):
        """Generate a unique receipt number"""
        while True:
            prefix = "SAL"
            year = datetime.now().year
            random_num = ''.join(random.choices('0123456789', k=6)) # 6 random digits
            receipt_number = f"{prefix}{year}{random_num}"
            
            # Check if receipt number already exists
            query = "SELECT receipt_number FROM salaries WHERE receipt_number = %s"
            result = self.db.fetch_one(query, (receipt_number,))
            if not result:
                return receipt_number

    def add_salary_record(self):
        try:
            lecturer_full_name = self.entries['lecturer_var'].get()
            if lecturer_full_name == _("Select Lecturer"):
                messagebox.showerror(_("Error"), _("Please select a lecturer"))
                return
            lecturer_id = self.lecturer_map.get(lecturer_full_name)
            if not lecturer_id:
                messagebox.showerror(_("Error"), _("Invalid lecturer selected"))
                return

            amount = self.entries['amount_entry'].get()
            if not amount:
                messagebox.showerror(_("Error"), _("Please enter an amount"))
                return
            try:
                amount = float(amount)
            except ValueError:
                messagebox.showerror(_("Error"), _("Amount must be a number"))
                return

            payment_date_str = self.entries['payment_date_entry'].get()
            payment_date = self.validate_date(payment_date_str)
            if not payment_date:
                messagebox.showerror(_("Error"), _("Please enter a valid payment date (YYYY-MM-DD)"))
                return

            status = self.entries['status_var'].get()
            notes = self.entries['notes_textbox'].get("1.0", "end-1c")
            receipt_number = self.entries['receipt_number_entry'].get()
            if not receipt_number:
                messagebox.showerror(_("Error"), _("Please enter a receipt number"))
                return

            salary_queries.add_salary_record(lecturer_id, amount, payment_date, status, notes, receipt_number)
            messagebox.showinfo(_("Success"), _("Salary record added successfully!"))
            self.clear_form()
            self.load_salary_data()

            if status == 'Paid':
                subject, body, lecturer_email = self.generate_appreciation_message(
                    {'amount': amount, 'payment_date': payment_date, 'receipt_number': receipt_number, 'status': status, 'notes': notes},
                    {'lecturer_id': lecturer_id} # Pass minimal info, generate_appreciation_message fetches full_lecturer_info
                )
                if subject and body and lecturer_email:
                    if messagebox.askyesno(_("Send Appreciation?"), _(f"Would you like to send an appreciation email to {lecturer_full_name}?\n\nSubject: {subject}")):
                        success, msg = email_sender.send_email(lecturer_email, subject, body)
                        if success:
                            messagebox.showinfo(_("Email Sent"), _(f"Appreciation email sent to {lecturer_full_name}."))
                        else:
                            messagebox.showerror(_("Email Failed"), _(f"Failed to send appreciation email: {msg}"))
                else:
                    messagebox.showwarning(_("Email Not Sent"), _("Could not generate or send appreciation email (missing lecturer email or details)."))

                # Add WhatsApp message copying prompt
                # Only proceed if subject and body were successfully generated (lecturer_email might be None for WhatsApp)
                if subject and body: # subject and body are from generate_appreciation_message
                    if messagebox.askyesno(_("Copy WhatsApp Message?"), _(f"Would you like to copy an appreciation message for {lecturer_full_name} to your clipboard for WhatsApp?")):
                        self.copy_to_clipboard(body)
                        messagebox.showinfo(_("WhatsApp Message Copied"), _("The appreciation message has been copied to your clipboard, ready to be pasted into WhatsApp."))

        except Exception as e:
            messagebox.showerror(_("Error"), _(f"Failed to add salary record: {str(e)}"))

    def update_salary_record(self):
        if not self.current_salary_id:
            messagebox.showerror(_("Error"), _("Please select a salary record to update"))
            return

        try:
            lecturer_full_name = self.entries['lecturer_var'].get()
            if lecturer_full_name == _("Select Lecturer"):
                messagebox.showerror(_("Error"), _("Please select a lecturer"))
                return
            lecturer_id = self.lecturer_map.get(lecturer_full_name)
            if not lecturer_id:
                messagebox.showerror(_("Error"), _("Invalid lecturer selected"))
                return

            amount = self.entries['amount_entry'].get()
            if not amount:
                messagebox.showerror(_("Error"), _("Please enter an amount"))
                return
            try:
                amount = float(amount)
            except ValueError:
                messagebox.showerror(_("Error"), _("Amount must be a number"))
                return

            payment_date_str = self.entries['payment_date_entry'].get()
            payment_date = self.validate_date(payment_date_str)
            if not payment_date:
                messagebox.showerror(_("Error"), _("Please enter a valid payment date (YYYY-MM-DD)"))
                return

            status = self.entries['status_var'].get()
            notes = self.entries['notes_textbox'].get("1.0", "end-1c")
            receipt_number = self.entries['receipt_number_entry'].get()
            if not receipt_number:
                messagebox.showerror(_("Error"), _("Please enter a receipt number"))
                return

            salary_queries.update_salary_record(self.current_salary_id, lecturer_id, amount, payment_date, status, notes, receipt_number)
            messagebox.showinfo(_("Success"), _("Salary record updated successfully!"))
            self.clear_form()
            self.load_salary_data()

            if status == 'Paid':
                subject, body, lecturer_email = self.generate_appreciation_message(
                    {'amount': amount, 'payment_date': payment_date, 'receipt_number': receipt_number, 'status': status, 'notes': notes},
                    {'lecturer_id': lecturer_id} # Pass minimal info, generate_appreciation_message fetches full_lecturer_info
                )
                if subject and body and lecturer_email:
                    if messagebox.askyesno(_("Send Appreciation?"), _(f"Would you like to send an appreciation email to {lecturer_full_name}?\n\nSubject: {subject}")):
                        success, msg = email_sender.send_email(lecturer_email, subject, body)
                        if success:
                            messagebox.showinfo(_("Email Sent"), _(f"Appreciation email sent to {lecturer_full_name}."))
                        else:
                            messagebox.showerror(_("Email Failed"), _(f"Failed to send appreciation email: {msg}"))
                else:
                    messagebox.showwarning(_("Email Not Sent"), _("Could not generate or send appreciation email (missing lecturer email or details)."))
                
                # Add WhatsApp message copying prompt
                # Only proceed if subject and body were successfully generated (lecturer_email might be None for WhatsApp)
                if subject and body: # subject and body are from generate_appreciation_message
                    if messagebox.askyesno(_("Copy WhatsApp Message?"), _(f"Would you like to copy an appreciation message for {lecturer_full_name} to your clipboard for WhatsApp?")):
                        self.copy_to_clipboard(body)
                        messagebox.showinfo(_("WhatsApp Message Copied"), _("The appreciation message has been copied to your clipboard, ready to be pasted into WhatsApp."))

        except Exception as e:
            messagebox.showerror(_("Error"), _(f"Failed to update salary record: {str(e)}"))

    def delete_salary_record(self, salary_id):
        if messagebox.askyesno(_("Confirm"), _("Are you sure you want to delete this salary record?")):
            try:
                salary_queries.delete_salary_record(salary_id)
                messagebox.showinfo(_("Success"), _("Salary record deleted successfully!"))
                self.load_salary_data()
            except Exception as e:
                messagebox.showerror(_("Error"), _(f"Failed to delete salary record: {str(e)}"))

    def clear_form(self):
        self.current_salary_id = None
        self.entries['lecturer_var'].set(_("Select Lecturer"))
        self.entries['amount_entry'].delete(0, 'end')
        self.entries['payment_date_entry'].delete(0, 'end')
        self.entries['payment_date_entry'].insert(0, datetime.now().strftime("%Y-%m-%d"))
        self.entries['receipt_number_entry'].delete(0, 'end')
        self.entries['receipt_number_entry'].insert(0, self.generate_receipt_number()) # Generate a new receipt number
        self.entries['status_var'].set(_("Pending"))
        self.entries['notes_textbox'].delete("1.0", "end")

    def load_salary_data(self):
        for widget in self.salary_records_frame.winfo_children():
            widget.destroy()

        try:
            # Using the new query to get all lecturers with their salary status
            lecturer_salary_status = salary_queries.get_all_lecturers_with_salary_status()

            for lecturer_info in lecturer_salary_status:
                frame = ctk.CTkFrame(self.salary_records_frame, fg_color="transparent")
                frame.pack(fill="x", padx=5, pady=5)

                frame.bind("<Enter>", lambda event, f=frame: f.configure(fg_color="#3a3a3a"))
                frame.bind("<Leave>", lambda event, f=frame: f.configure(fg_color="transparent"))

                last_paid = lecturer_info['last_paid_date'] if lecturer_info['last_paid_date'] else _("N/A")
                last_amount = f"Le {lecturer_info['last_paid_amount']:,.2f}" if lecturer_info['last_paid_amount'] else _("N/A")
                pending_payments = lecturer_info['pending_payments_count']

                info_text = (
                    f"➡️ {lecturer_info['full_name']} ({lecturer_info['lecturer_id']}) - Dept: {lecturer_info['department']}\n"
                    f"Last Paid: {last_paid} (Amount: {last_amount}) - Pending Payments: {pending_payments}"
                )
                label = ctk.CTkLabel(frame, text=info_text, justify="left")
                label.pack(side="left", fill="x", expand=True, padx=10, pady=5)
                
                label.bind("<Enter>", lambda event, f=frame: f.configure(fg_color="#3a3a3a"))
                label.bind("<Leave>", lambda event, f=frame: f.configure(fg_color="transparent"))

                # Add context menu for detailed salary records if needed
                frame.bind("<Button-3>", lambda event, l=lecturer_info: self.show_salary_context_menu(event, l))
                label.bind("<Button-3>", lambda event, l=lecturer_info: self.show_salary_context_menu(event, l))
                
                # Add double-click to view history directly
                frame.bind("<Double-Button-1>", lambda event, l=lecturer_info: self.view_lecturer_salary_history(l))
                label.bind("<Double-Button-1>", lambda event, l=lecturer_info: self.view_lecturer_salary_history(l))

        except Exception as e:
            messagebox.showerror(_("Error"), _(f"Failed to load salary data: {str(e)}"))

    def show_salary_context_menu(self, event, lecturer_info):
        context_menu = Menu(self.salary_records_frame, tearoff=0)
        context_menu.add_command(label=_("📚 View All Salary Records"), command=lambda: self.view_lecturer_salary_history(lecturer_info))
        context_menu.add_separator()
        context_menu.add_command(label=_("📝 Edit Lecturer"), command=lambda: messagebox.showinfo(_("Info"), _("Please go to 'Lecturer Management' to edit this lecturer's details.")))
        context_menu.add_command(label=_("🗑️ Delete Lecturer"), command=lambda: messagebox.showinfo(_("Info"), _("Please go to 'Lecturer Management' to delete this lecturer.")))
        context_menu.add_command(label=_("📋 Copy Lecturer Details"), command=lambda: self.copy_lecturer_details(lecturer_info))
        context_menu.post(event.x_root, event.y_root)

    def view_lecturer_salary_history(self, lecturer_info_dict):
        lecturer_id = lecturer_info_dict['lecturer_id']
        lecturer_full_name = lecturer_info_dict['full_name']

        history_window = ctk.CTkToplevel(self.parent_frame)
        history_window.title(_(f"💰 Salary History for {lecturer_full_name}"))
        history_window.geometry("900x700") # Increased size for consistency
        history_window.transient(self.parent_frame.winfo_toplevel())
        history_window.lift()
        history_window.focus_force()
        history_window.grab_set()

        title = ctk.CTkLabel(history_window, text=_(f"💰 Salary History: {lecturer_full_name}"), font=ctk.CTkFont(size=18, weight="bold"))
        title.pack(pady=10)

        history_frame = ctk.CTkScrollableFrame(history_window)
        history_frame.pack(fill="both", expand=True, padx=10, pady=10)

        records = salary_queries.get_salary_records_by_lecturer_pk_id(lecturer_id)
        if records:
            for record in records:
                frame = ctk.CTkFrame(history_frame, fg_color="transparent")
                frame.pack(fill="x", pady=2, padx=5)
                info_text = (
                    f"➡️ Receipt: {record['receipt_number']} | Date: {record['payment_date']} | Amount: Le {record['amount']:,.2f} | "
                    f"Status: {record['status']} | Notes: {record['notes'] if record['notes'] else 'N/A'}"
                )
                ctk.CTkLabel(frame, text=info_text, justify="left").pack(side="left", fill="x", expand=True)
                
                # Bind right-click for context menu
                frame.bind("<Button-3>", lambda event, r=record, li=lecturer_info_dict: self.show_salary_record_context_menu(event, r, li))
                ctk.CTkLabel(frame, text=info_text, justify="left").bind("<Button-3>", lambda event, r=record, li=lecturer_info_dict: self.show_salary_record_context_menu(event, r, li))
        else:
            ctk.CTkLabel(history_frame, text=_("No salary records found for this lecturer.")).pack(pady=20)

        close_button = ctk.CTkButton(history_window, text=_("❌ Close"), command=history_window.destroy, fg_color="firebrick", hover_color="indianred")
        close_button.pack(pady=10)

    def copy_to_clipboard(self, text):
        self.parent_frame.clipboard_clear()
        self.parent_frame.clipboard_append(text)
        messagebox.showinfo(_("Copied"), _(f"'{text}' copied to clipboard."))

    def copy_salary_record_details(self, salary_record, lecturer_info):
        try:
            full_lecturer_info = lecturer_queries.get_lecturer_by_pk_id(lecturer_info['lecturer_id'])
            if not full_lecturer_info:
                messagebox.showerror(_("Error"), _("Could not retrieve full lecturer details."))
                return

            details = f"""
{_("Salary Receipt Details")}
-----------------------------------
{_("Lecturer Name")}: {full_lecturer_info.get('full_name', 'N/A')}
{_("Lecturer ID")}: {full_lecturer_info.get('lecturer_id', 'N/A')}
{_("Department")}: {full_lecturer_info.get('department', 'N/A')}

{_("Receipt Number")}: {salary_record.get('receipt_number', 'N/A')}
{_("Payment Date")}: {salary_record.get('payment_date', 'N/A')}
{_("Amount")}: Le {salary_record.get('amount', 0):,.2f}
{_("Status")}: {salary_record.get('status', 'N/A')}
{_("Notes")}: {salary_record.get('notes', 'N/A')}
-----------------------------------
            """
            self.copy_to_clipboard(details.strip())
        except Exception as e:
            messagebox.showerror(_("Error"), _(f"Failed to copy details: {str(e)}"))

    def copy_whatsapp_message(self):
        try:
            # 1. Get lecturer details
            lecturer_full_name = self.entries['lecturer_var'].get()
            if lecturer_full_name == _("Select Lecturer"):
                messagebox.showerror(_("Error"), _("Please select a lecturer to generate a message for."))
                return
            lecturer_id = self.lecturer_map.get(lecturer_full_name)
            if not lecturer_id:
                messagebox.showerror(_("Error"), _("Invalid lecturer selected."))
                return

            # 2. Get salary details from current form
            amount_str = self.entries['amount_entry'].get()
            payment_date_str = self.entries['payment_date_entry'].get()
            receipt_number = self.entries['receipt_number_entry'].get()
            status = self.entries['status_var'].get()
            notes = self.entries['notes_textbox'].get("1.0", "end-1c")

            if not amount_str or not payment_date_str or not receipt_number:
                messagebox.showerror(_("Error"), _("Please fill in Amount, Payment Date, and Receipt Number to generate the message."))
                return

            try:
                amount = float(amount_str)
            except ValueError:
                messagebox.showerror(_("Error"), _("Amount must be a number."))
                return

            payment_date = self.validate_date(payment_date_str)
            if not payment_date:
                messagebox.showerror(_("Error"), _("Please enter a valid payment date (YYYY-MM-DD)."))
                return

            # Create dummy salary_record and lecturer_info dictionaries for generate_appreciation_message
            salary_record = {
                'amount': amount,
                'payment_date': payment_date,
                'receipt_number': receipt_number,
                'status': status,
                'notes': notes
            }
            lecturer_info = {
                'lecturer_id': lecturer_id
            }

            # 3. Call generate_appreciation_message
            _, message_body, _ = self.generate_appreciation_message(salary_record, lecturer_info)

            if message_body:
                # 4. Copy to clipboard
                self.copy_to_clipboard(message_body)
                messagebox.showinfo(_("WhatsApp Message Copied"), _("The appreciation message has been copied to your clipboard, ready to be pasted into WhatsApp."))
            else:
                messagebox.showerror(_("Error"), _("Could not generate appreciation message."))

        except Exception as e:
            messagebox.showerror(_("Error"), _(f"Failed to copy WhatsApp message: {str(e)}"))

    def copy_lecturer_details(self, lecturer_info):
        try:
            details = f"""
{_("Lecturer Details")}
-----------------------------------
{_("Lecturer Name")}: {lecturer_info.get('full_name', 'N/A')}
{_("Lecturer ID")}: {lecturer_info.get('lecturer_id', 'N/A')}
{_("Department")}: {lecturer_info.get('department', 'N/A')}
{_("Last Paid Date")}: {lecturer_info.get('last_paid_date', 'N/A')}
{_("Last Paid Amount")}: {lecturer_info.get('last_paid_amount', 'N/A')}
{_("Pending Payments")}: {lecturer_info.get('pending_payments_count', 'N/A')}
-----------------------------------
            """
            self.copy_to_clipboard(details.strip())
        except Exception as e:
            messagebox.showerror(_("Error"), _(f"Failed to copy lecturer details: {str(e)}"))

    def show_salary_record_context_menu(self, event, record, lecturer_info_dict):
        context_menu = Menu(self.parent_frame, tearoff=0)
        context_menu.add_command(label=_("📝 Edit"), command=lambda: self.load_salary_record_for_edit(record))
        context_menu.add_command(label=_("🗑️ Delete"), command=lambda: self.delete_salary_record(record['id']))
        context_menu.add_separator()
        context_menu.add_command(label=_("📋 Copy Details"), command=lambda: self.copy_salary_record_details(record, lecturer_info_dict))
        context_menu.add_command(label=_("📄 Generate PDF"), command=lambda: self.generate_salary_pdf(record, lecturer_info_dict))
        context_menu.add_command(label=_("📧 Email Receipt"), command=lambda: self.email_salary_receipt(record, lecturer_info_dict))
        context_menu.post(event.x_root, event.y_root)

    def generate_appreciation_message(self, salary_record, lecturer_info):
        # Use get_lecturer_by_pk_id since lecturer_info['lecturer_id'] is now an integer ID
        full_lecturer_info = lecturer_queries.get_lecturer_by_pk_id(lecturer_info['lecturer_id'])
        if not full_lecturer_info:
            return None, "Lecturer details not found.", None # Added None for email

        message_body = _(f"""
Dear {full_lecturer_info.get('full_name', 'Lecturer')},

We would like to express our sincere appreciation for your hard work and dedication at EASI.

Your recent salary payment of Le {salary_record.get('amount', 0):,.2f} (Receipt: {salary_record.get('receipt_number', 'N/A')}) has been processed successfully on {salary_record.get('payment_date', 'N/A')}.

Thank you for being a valuable member of our team!

Best regards,
EASI Management
""")
        subject = _(f"Appreciation from EASI - Salary Payment ({salary_record.get('receipt_number', 'N/A')})")
        
        return subject, message_body, full_lecturer_info.get('email')

    def generate_salary_pdf(self, salary_record, lecturer_info):
        try:
            # Prepare lecturer_info with necessary details for the PDF
            full_lecturer_info = lecturer_queries.get_lecturer_by_pk_id(lecturer_info['lecturer_id']) # Use the correct function (get_lecturer_by_pk_id)
            if not full_lecturer_info:
                messagebox.showerror(_("Error"), _("Could not retrieve full lecturer details."))
                return

            file_path = filedialog.asksaveasfilename(
                defaultextension=".pdf",
                filetypes=[(_("PDF files"), "*.pdf")],
                initialfile=f"SalaryReceipt_{salary_record.get('receipt_number', 'NoReceipt')}_{full_lecturer_info.get('lecturer_id', 'NoID')}.pdf"
            )

            if file_path:
                pdf_path = pdf_generator.generate_salary_receipt_pdf(
                    salary_record, 
                    full_lecturer_info, 
                    output_path=os.path.dirname(file_path) # Pass directory
                )
                if pdf_path:
                    messagebox.showinfo(_("Success"), _(f"PDF receipt generated and saved to:\n{pdf_path}"))
                else:
                    messagebox.showerror(_("Error"), _("Failed to generate PDF receipt."))
        except Exception as e:
            messagebox.showerror(_("Error"), _(f"An error occurred while generating PDF: {str(e)}"))

    def email_salary_receipt(self, salary_record, lecturer_info):
        try:
            # Prepare lecturer_info with necessary details for the PDF and email
            full_lecturer_info = lecturer_queries.get_lecturer_by_pk_id(lecturer_info['lecturer_id'])
            if not full_lecturer_info:
                messagebox.showerror(_("Error"), _("Could not retrieve full lecturer details."))
                return
            
            lecturer_email = full_lecturer_info.get('email')
            if not lecturer_email:
                messagebox.showerror(_("Error"), _("Lecturer has no email address configured."))
                return

            temp_dir = None
            try:
                # Create a temporary directory for PDF generation
                temp_dir = tempfile.mkdtemp()
                temp_pdf_path = pdf_generator.generate_salary_receipt_pdf(salary_record, full_lecturer_info, output_path=temp_dir)
                
                if temp_pdf_path:
                    subject = _(f"Salary Receipt - {salary_record.get('receipt_number', 'N/A')}")
                    body = _(f"""
Dear {full_lecturer_info.get('full_name', 'Lecturer')},

Please find attached your salary receipt for the payment made on {salary_record.get('payment_date', 'N/A')}.

Receipt Number: {salary_record.get('receipt_number', 'N/A')}
Amount: Le {salary_record.get('amount', 0):,.2f}
Status: {salary_record.get('status', 'N/A')}
Notes: {salary_record.get('notes', 'N/A')}

If you have any questions, please contact the administration.

Best regards,
EASI Management
""")
                    
                    success, message = email_sender.send_email(lecturer_email, subject, body, attachments=[temp_pdf_path])
                    
                    if success:
                        messagebox.showinfo(_("Success"), _(f"Salary receipt email sent successfully to {lecturer_email}!"))
                    else:
                        messagebox.showerror(_("Error"), _(f"Failed to send email: {message}"))
                else:
                    messagebox.showerror(_("Error"), _("Failed to generate PDF for email attachment."))

            finally:
                # Clean up the temporary directory
                if temp_dir and os.path.exists(temp_dir):
                    shutil.rmtree(temp_dir)

        except Exception as e:
            messagebox.showerror(_("Error"), _(f"An error occurred while emailing PDF: {str(e)}"))

    def load_salary_record_for_edit(self, record):
        self.clear_form()
        self.current_salary_id = record['id']
        
        # Set lecturer dropdown
        lecturer_name = lecturer_queries.get_lecturer_full_name_by_id(record['lecturer_id'])
        if lecturer_name:
            self.entries['lecturer_var'].set(lecturer_name)
        
        self.entries['amount_entry'].insert(0, str(record['amount']))
        self.entries['payment_date_entry'].delete(0, 'end')
        self.entries['payment_date_entry'].insert(0, str(record['payment_date']))
        self.entries['receipt_number_entry'].delete(0, 'end')
        self.entries['receipt_number_entry'].insert(0, record['receipt_number'] if record['receipt_number'] else '')
        self.entries['status_var'].set(record['status'])
        self.entries['notes_textbox'].delete("1.0", "end")
        if record['notes']:
            self.entries['notes_textbox'].insert("1.0", record['notes'])

    def export_salary_data(self):
        try:
            # Fetch detailed salary records, not just summaries
            all_salary_records = []
            lecturers = lecturer_queries.get_all_lecturers() # Get all lecturers to iterate through their salaries
            
            for lecturer in lecturers:
                records = salary_queries.get_salary_records_by_lecturer_id(lecturer['lecturer_id'])
                for record in records:
                    all_salary_records.append({
                        _("Lecturer ID"): lecturer['lecturer_id'],
                        _("Lecturer Name"): lecturer['full_name'],
                        _("Department"): lecturer['department'],
                        _("Amount"): record['amount'],
                        _("Payment Date"): record['payment_date'],
                        _("Status"): record['status'],
                        _("Receipt Number"): record['receipt_number'],
                        _("Notes"): record['notes']
                    })

            df = pd.DataFrame(all_salary_records)
            
            file_path = filedialog.asksaveasfilename(
                defaultextension=".xlsx",
                filetypes=[(_("Excel files"), "*.xlsx"), (_("All files"), "*.* אמ")])
            
            if file_path:
                df.to_excel(file_path, index=False)
                messagebox.showinfo(_("Success"), _("Salary data exported successfully!"))
        except Exception as e:
            messagebox.showerror(_("Error"), _(f"Failed to export salary data: {str(e)}"))
