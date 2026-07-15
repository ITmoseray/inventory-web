from fpdf import FPDF
import customtkinter as ctk
from tkinter import messagebox, Menu, filedialog
from datetime import datetime
from db.form_queries import (
    add_form_payment, get_all_form_payments, get_form_payment_by_id,
    update_form_payment, delete_form_payment
)
from db.database import DatabaseManager
from db import petty_cash_queries as pcq
from ui.tooltip import Tooltip
from ui.petty_cash import PettyCashWindow
from utils.i18n import get_translator
from utils.mixins import UndoRedoEntryMixin # Import the mixin
from utils.pdf_generator import generate_form_receipt_pdf
import os # Import os for path checking

_ = get_translator()

class FormPaymentDetailWindow(ctk.CTkToplevel):
    def __init__(self, master, payment_details, db):
        super().__init__(master)
        self.title(_("Form Payment Details"))
        self.geometry("800x700") # Increased size for more content
        self.transient(master)
        self.grab_set()

        self.payment_details = payment_details
        self.db = db # Store the db instance
        self.create_widgets()

    def create_widgets(self):
        # Main frame for tabview
        main_display_frame = ctk.CTkFrame(self)
        main_display_frame.pack(fill="both", expand=True, padx=20, pady=20)

        # Tabview for details
        tabview = ctk.CTkTabview(main_display_frame)
        tabview.pack(fill="both", expand=True, pady=10)

        # Tab 1: Form Payment Details
        form_payment_tab = tabview.add(_("Form Payment Details"))
        form_payment_scroll_frame = ctk.CTkScrollableFrame(form_payment_tab)
        form_payment_scroll_frame.pack(fill="both", expand=True, padx=5, pady=5)

        info_labels = [
            (_("Receipt Number:"), self.payment_details['receipt_number']),
            (_("Student ID:"), self.payment_details['student_unique_id']),
            (_("Student Name:"), f"{self.payment_details['first_name']} {self.payment_details['last_name']}"),
            (_("Form Type:"), self.payment_details['form_type']),
            (_("Amount (Le):"), f"Le {self.payment_details['amount']:,.2f}"),
            (_("Payment Date:"), self.payment_details['payment_date']),
            (_("Payment Method:"), self.payment_details.get('payment_method') or _("N/A")),
            (_("Status:"), self.payment_details['status']),
            (_("Created At:"), self.payment_details['created_at'].strftime("%Y-%m-%d %H:%M:%S") if 'created_at' in self.payment_details and self.payment_details['created_at'] else "N/A")
        ]

        for label_text, value_text in info_labels:
            frame = ctk.CTkFrame(form_payment_scroll_frame, fg_color="transparent")
            frame.pack(fill="x", pady=2)

            label = ctk.CTkLabel(frame, text=label_text, width=120, anchor="w", font=ctk.CTkFont(weight="bold"))
            label.pack(side="left", padx=5)

            value = ctk.CTkLabel(frame, text=str(value_text), anchor="w")
            value.pack(side="left", fill="x", expand=True, padx=5)

        # Tab 2: Student Info
        student_info_tab = tabview.add(_("Student Info"))
        student_info_scroll_frame = ctk.CTkScrollableFrame(student_info_tab)
        student_info_scroll_frame.pack(fill="both", expand=True, padx=5, pady=5)

        # Fetch full student details using student_unique_id (which is student_id in students table)
        student_query = """
        SELECT id, student_id, first_name, last_name, gender, date_of_birth, address, phone, email, photo_path, created_at, status
        FROM students
        WHERE student_id = %s
        """
        student_data = self.db.fetch_one(student_query, (self.payment_details['student_unique_id'],))

        if student_data:
            # Get current course for student
            course_query = """
            SELECT c.course_name
            FROM enrollments e
            JOIN courses c ON e.course_id = c.id
            WHERE e.student_id = %s
            ORDER BY e.enrollment_date DESC
            LIMIT 1
            """
            current_course_result = self.db.fetch_one(course_query, (student_data['id'],))
            current_student_course = current_course_result['course_name'] if current_course_result else _("Not Enrolled")

            student_details_to_show = {
                _("Student ID"): student_data['student_id'],
                _("Name"): f"{student_data['first_name']} {student_data['last_name']}",
                _("Gender"): student_data['gender'],
                _("Date of Birth"): student_data['date_of_birth'],
                _("Address"): student_data['address'],
                _("Phone"): student_data['phone'],
                _("Email"): student_data['email'],
                _("Status"): student_data['status'],
                _("Current Course"): current_student_course
            }
            for key, value in student_details_to_show.items():
                frame = ctk.CTkFrame(student_info_scroll_frame, fg_color="transparent")
                frame.pack(fill="x", pady=2, padx=5)
                ctk.CTkLabel(frame, text=_("{key}:"), font=ctk.CTkFont(weight="bold")).pack(side="left", anchor="w", padx=5)
                ctk.CTkLabel(frame, text=str(value)).pack(side="left", anchor="w", padx=5)
        else:
            ctk.CTkLabel(student_info_scroll_frame, text=_("Student details not found.")).pack(pady=10)

        # Tab 3: Other Form Payments by Student
        other_form_payments_tab = tabview.add(_("Other Form Payments"))
        other_form_payments_scroll_frame = ctk.CTkScrollableFrame(other_form_payments_tab)
        other_form_payments_scroll_frame.pack(fill="both", expand=True, padx=5, pady=5)

        other_form_payments_query = """
        SELECT fp.receipt_number, fp.payment_date, fp.amount, fp.status, fp.form_type
        FROM form_payments fp
        WHERE fp.student_id = %s AND fp.id != %s
        ORDER BY fp.payment_date DESC
        """
        # Need student's internal ID (from students table) for the foreign key, not student_unique_id
        # The form_payments table's student_id references students.id (INT)
        # So we need to fetch student_data's id if available
        student_internal_id_for_query = student_data['id'] if student_data else None

        if student_internal_id_for_query:
            other_fp_data = self.db.fetch_all(other_form_payments_query, (student_internal_id_for_query, self.payment_details['id']))
            if other_fp_data:
                for fp_item in other_fp_data:
                    fp_info = _(f"Receipt: {fp_item['receipt_number']} | Date: {fp_item['payment_date']} | "
                               f"Amount: Le {fp_item['amount']:,.2f} | Status: {fp_item['status']} | Form Type: {fp_item['form_type']}")
                    ctk.CTkLabel(other_form_payments_scroll_frame, text=fp_info, wraplength=400, justify="left").pack(fill="x", pady=2, padx=5)
            else:
                ctk.CTkLabel(other_form_payments_scroll_frame, text=_("No other form payments found for this student.")).pack(pady=10)
        else:
            ctk.CTkLabel(other_form_payments_scroll_frame, text=_("Cannot retrieve other form payments without student ID.")).pack(pady=10)


        close_button = ctk.CTkButton(self, text=_("Close"), command=self.destroy)
        close_button.pack(pady=10)

class FormPaymentWindow(ctk.CTkFrame):
    def __init__(self, parent_frame, db, user):
        super().__init__(parent_frame) # Initialize the CTkFrame base class
        self.parent_frame = parent_frame
        self.db = db # Use the passed db instance
        self.user = user
        self.students = []
        self.student_map = {}
        self.current_form_payment_id = None
        self.student_combobox_widget = None # Initialize to None
        self.row_colors = ["#2b2b2b", "#212121"] # Darker and slightly lighter shades

    def show(self):
        self.pack(fill="both", expand=True) # Pack the FormPaymentWindow (which is now a CTkFrame) into its parent
        self.create_widgets()
        self.load_students() # Call after create_widgets
        self.load_form_payments() # Call after create_widgets

    def create_widgets(self):
        # Title
        title = ctk.CTkLabel(self, text=_("📝 Form Purchase Management"),
                           font=ctk.CTkFont(size=24, weight="bold"))
        title.pack(pady=10)

        # Total Amount Display
        total_frame = ctk.CTkFrame(self, fg_color="gray14")
        total_frame.pack(fill="x", padx=20, pady=10)
        self.total_form_payments_label = ctk.CTkLabel(total_frame, text=_("Total Form Payments: ..."),
                                                     font=ctk.CTkFont(size=18, weight="bold"))
        self.total_form_payments_label.pack(pady=5)

        # Create a frame for the form entry section at the top
        form_wrapper_frame = ctk.CTkFrame(self)
        form_wrapper_frame.pack(side="top", fill="both", padx=5, pady=5) # No expand here for the form

        # Create the form entry section inside its wrapper frame
        self.create_form_entry_section(form_wrapper_frame)

        # Create a frame for the form payment list section at the bottom, expanding to fill remaining space
        list_wrapper_frame = ctk.CTkFrame(self)
        list_wrapper_frame.pack(side="bottom", fill="both", expand=True, padx=5, pady=5) # Expand here for the list

        # Create form payment list section inside its wrapper frame
        self.create_form_payment_list_section(list_wrapper_frame)

    def load_students(self):
        try:
            query = "SELECT id, student_id, first_name, last_name FROM students"
            students_data = self.db.fetch_all(query)
            self.students = [f"{s['student_id']} - {s['last_name']}, {s['first_name']}" for s in students_data]
            # Map student_display_name to actual id for foreign key
            self.student_map = {f"{s['student_id']} - {s['last_name']}, {s['first_name']}": s['id'] for s in students_data}
            
            # Update combobox values
            self.student_combobox_widget.configure(values=self.students)
            if self.students:
                self.entries['student_var'].set(self.students[0])
            else:
                self.entries['student_var'].set(_("No Students Available"))
        except Exception as e:
            messagebox.showerror(_("Error"), _(f"Failed to load students: {str(e)}"))

    def create_form_entry_section(self, parent):
        form_title = ctk.CTkLabel(parent, text=_("Form Purchase Details"), 
                                font=ctk.CTkFont(size=18, weight="bold"))
        form_title.pack(pady=10)

        fields_info = [
            (_("Student"), "student_var", "combobox", []),
            (_("Form Type"), "form_type_var", "combobox", [_("Application"), _("Registration"), _("Exam"), _("Other")]),
            (_("Amount (Le)"), "amount_entry", "entry", []),
            (_("Payment Date"), "payment_date_entry", "entry", []),
            (_("Payment Method"), "payment_method_var", "combobox", [_("Cash"), _("Bank Transfer"), _("Mobile Money")]),
            (_("Receipt Number"), "receipt_number_entry", "entry", []),
            (_("Status"), "status_var", "combobox", [_("Paid"), _("Pending"), _("Waived")]),
        ]

        self.entries = {}
        for field_name, attr_name, widget_type, options in fields_info:
            frame = ctk.CTkFrame(parent)
            frame.pack(fill="x", padx=20, pady=5)

            label = ctk.CTkLabel(frame, text=field_name + ":", width=150, anchor="w")
            label.pack(side="left", padx=5)

            if widget_type == "combobox":
                self.entries[attr_name] = ctk.StringVar(value=options[0] if options else "")
                combobox = ctk.CTkComboBox(frame, variable=self.entries[attr_name], values=options)
                if attr_name == "student_var":
                    self.student_combobox_widget = combobox # Store reference to the actual combobox widget
                combobox.pack(side="left", fill="x", expand=True, padx=5)
            else: # entry
                entry_widget = UndoRedoEntryMixin(frame) # Use the mixin
                if attr_name == "payment_date_entry":
                    entry_widget.insert(0, datetime.now().strftime("%Y-%m-%d"))
                elif attr_name == "receipt_number_entry":
                     # Generate a dummy receipt number for new entries, can be overwritten
                    entry_widget.insert(0, f"FP-{datetime.now().strftime('%Y%m%d%H%M%S')}")
                entry_widget.pack(side="left", fill="x", expand=True, padx=5)
                self.entries[attr_name] = entry_widget
        
        # Add "Amount to Petty Cash" entry
        petty_cash_frame = ctk.CTkFrame(parent)
        petty_cash_frame.pack(fill="x", padx=20, pady=5)
        
        petty_cash_label = ctk.CTkLabel(petty_cash_frame, text=_("Amount to Petty Cash (Le):"), width=150)
        petty_cash_label.pack(side="left", padx=5)

        self.entries['petty_cash_transfer_amount_entry'] = UndoRedoEntryMixin(petty_cash_frame)
        self.entries['petty_cash_transfer_amount_entry'].pack(side="left", fill="x", expand=True, padx=5)
        Tooltip(self.entries['petty_cash_transfer_amount_entry'], _("Optional: Enter an amount to transfer to petty cash from this payment."))

        # Action Buttons
        button_frame = ctk.CTkFrame(parent)
        button_frame.pack(pady=20)

        buttons_info = [
            (_("Add"), self.add_form_payment_action, _("Add a new form purchase record")),
            (_("Update"), self.update_form_payment_action, _("Update the selected form purchase record")),
            (_("Clear"), self.clear_form, _("Clear all fields in the form")),
            (_("Generate Receipt"), self.generate_receipt, _("Generate a PDF receipt for the selected form purchase"))
        ]

        for text, command, tooltip_text in buttons_info:
            button = ctk.CTkButton(button_frame, text=text, command=command)
            button.pack(side="left", padx=5)
            Tooltip(button, tooltip_text)
            
        # New button for Petty Cash
        manage_petty_cash_button = ctk.CTkButton(button_frame, text=_("Manage Petty Cash"), command=self._open_petty_cash_window, fg_color="gray")
        manage_petty_cash_button.pack(side="left", padx=5)
        Tooltip(manage_petty_cash_button, _("Open a new window to manage petty cash transactions."))

    def create_form_payment_list_section(self, parent):
        list_title = ctk.CTkLabel(parent, text=_("Recent Form Purchases"), 
                                 font=ctk.CTkFont(size=18, weight="bold"))
        list_title.pack(pady=10)

        self.form_payments_frame = ctk.CTkScrollableFrame(parent)
        self.form_payments_frame.pack(fill="both", expand=True, padx=10, pady=10)

    def add_form_payment_action(self):
        try:
            student_display_name = self.entries['student_var'].get()
            student_id = self.student_map.get(student_display_name)
            if not student_id:
                messagebox.showerror(_("Error"), _("Please select a valid student."))
                return

            form_type = self.entries['form_type_var'].get()
            amount = self.entries['amount_entry'].get()
            payment_date = self.entries['payment_date_entry'].get()
            payment_method = self.entries['payment_method_var'].get()
            receipt_number = self.entries['receipt_number_entry'].get()
            status = self.entries['status_var'].get()
            petty_cash_transfer_str = self.entries['petty_cash_transfer_amount_entry'].get()

            if not all([form_type, amount, payment_date, receipt_number, status, payment_method]):
                messagebox.showerror(_("Error"), _("Please fill all required fields."))
                return

            from decimal import Decimal, InvalidOperation
            try:
                amount_decimal = Decimal(amount)
            except InvalidOperation:
                messagebox.showerror(_("Error"), _("Invalid amount format."))
                return
            
            add_form_payment(student_id, form_type, amount_decimal, payment_date, receipt_number, status, payment_method)
            
            # Retrieve the ID of the newly inserted form payment
            new_form_payment_id = self.db.fetch_one("SELECT LAST_INSERT_ID() as id")['id']

            messagebox.showinfo(_("Success"), _("Form purchase added successfully!"))

            # Handle petty cash transfer if an amount is entered
            if petty_cash_transfer_str:
                try:
                    transfer_amount = Decimal(petty_cash_transfer_str)
                    if transfer_amount > 0:
                        if transfer_amount > amount_decimal:
                            messagebox.showwarning(_("Petty Cash Warning"), _("Transfer amount cannot be greater than the payment amount. Petty cash was not updated."))
                        else:
                            description = f"Transfer from form payment: {student_display_name} - {form_type}. Receipt: {receipt_number}"
                            pcq.add_petty_cash_transaction(
                                transaction_date=payment_date,
                                description=description,
                                amount=transfer_amount,
                                transaction_type='Income',
                                authorized_by="System",
                                source_payment_id=None, # Explicitly set to None
                                source_form_payment_id=new_form_payment_id # Pass the new form payment ID
                            )
                            messagebox.showinfo(_("Petty Cash"), _(f"Amount of Le {transfer_amount:,.2f} transferred to Petty Cash."))
                except Exception as e:
                    messagebox.showerror(_("Petty Cash Error"), _(f"Invalid amount for petty cash transfer: {e}"))

            self.clear_form()
            self.load_form_payments()
        except Exception as e:
            messagebox.showerror(_("Error"), _(f"Failed to add form purchase: {str(e)}"))

    def update_form_payment_action(self):
        if not self.current_form_payment_id:
            messagebox.showerror(_("Error"), _("Please select a form payment to update."))
            return

        try:
            student_display_name = self.entries['student_var'].get()
            student_id = self.student_map.get(student_display_name)
            if not student_id:
                messagebox.showerror(_("Error"), _("Please select a valid student."))
                return

            form_type = self.entries['form_type_var'].get()
            amount = self.entries['amount_entry'].get()
            payment_date = self.entries['payment_date_entry'].get()
            payment_method = self.entries['payment_method_var'].get()
            receipt_number = self.entries['receipt_number_entry'].get()
            status = self.entries['status_var'].get()

            if not all([form_type, amount, payment_date, receipt_number, status, payment_method]):
                messagebox.showerror(_("Error"), _("Please fill all required fields."))
                return
            
            from decimal import Decimal, InvalidOperation
            try:
                amount_decimal = Decimal(amount)
            except InvalidOperation:
                messagebox.showerror(_("Error"), _("Invalid amount format."))
                return

            update_form_payment(
                self.current_form_payment_id, student_id, form_type, amount_decimal, 
                payment_date, receipt_number, status, payment_method
            )
            messagebox.showinfo(_("Success"), _("Form purchase updated successfully!"))
            self.clear_form()
            self.load_form_payments()
        except Exception as e:
            messagebox.showerror(_("Error"), _(f"Failed to update form purchase: {str(e)}"))

    def delete_form_payment_action(self, payment_id):
        if messagebox.askyesno(_("Confirm Deletion"), _("Are you sure you want to delete this form purchase record?")):
            try:
                delete_form_payment(payment_id)
                messagebox.showinfo(_("Success"), _("Form purchase deleted successfully!"))
                self.load_form_payments()
            except Exception as e:
                messagebox.showerror(_("Error"), _(f"Failed to delete form purchase: {str(e)}"))

    def clear_form(self):
        self.current_form_payment_id = None
        if self.students:
            self.entries['student_var'].set(self.students[0])
        else:
            self.entries['student_var'].set(_("No Students Available"))
        self.entries['form_type_var'].set(_("Application"))
        self.entries['amount_entry'].delete(0, ctk.END)
        self.entries['payment_date_entry'].delete(0, ctk.END)
        self.entries['payment_date_entry'].insert(0, datetime.now().strftime("%Y-%m-%d"))
        self.entries['payment_method_var'].set(_("Cash"))
        self.entries['receipt_number_entry'].delete(0, ctk.END)
        self.entries['receipt_number_entry'].insert(0, f"FP-{datetime.now().strftime('%Y%m%d%H%M%S')}")
        self.entries['status_var'].set(_("Paid"))
        self.entries['petty_cash_transfer_amount_entry'].delete(0, ctk.END)


    def load_form_payments(self):
        # Update total
        try:
            from db.form_queries import get_total_form_payments
            total = get_total_form_payments()
            self.total_form_payments_label.configure(text=_(f"Total Form Payments: Le {total:,.2f}"))
        except Exception as e:
            self.total_form_payments_label.configure(text=_("Total Form Payments: Error"))
            print(f"Error loading total form payments: {e}")

        for widget in self.form_payments_frame.winfo_children():
            widget.destroy()

        try:
            form_payments = get_all_form_payments()
            for i, payment in enumerate(form_payments):
                bg_color = self.row_colors[i % 2]
                frame = ctk.CTkFrame(self.form_payments_frame, fg_color=bg_color, corner_radius=5)
                frame.pack(fill="x", padx=5, pady=5)

                hover_color = "#3a3a3a" # Consistent hover color
                frame.bind("<Enter>", lambda event, f=frame: f.configure(fg_color=hover_color))
                frame.bind("<Leave>", lambda event, f=frame, original_color=bg_color: f.configure(fg_color=original_color))

                info_text = (_(f"Receipt: {payment['receipt_number']} | "
                            f"Student: {payment['last_name']}, {payment['first_name']} ({payment['student_unique_id']}) | "
                            f"Form: {payment['form_type']} | "
                            f"Amount: Le {payment['amount']:,.2f} | "
                            f"Status: {payment['status']}"))
                label = ctk.CTkLabel(frame, text=info_text, anchor="w")
                label.pack(side="left", fill="x", expand=True, padx=10, pady=5)

                label.bind("<Enter>", lambda event, f=frame: f.configure(fg_color="#3a3a3a"))
                label.bind("<Leave>", lambda event, f=frame: f.configure(fg_color="transparent"))
                
                frame.bind("<Double-Button-1>", lambda event, p=payment: self.show_form_payment_details(p))
                label.bind("<Double-Button-1>", lambda event, p=payment: self.show_form_payment_details(p))
                
                frame.bind("<Button-3>", lambda event, p=payment: self.show_context_menu(event, p))
                label.bind("<Button-3>", lambda event, p=payment: self.show_context_menu(event, p))

        except Exception as e:
            messagebox.showerror(_("Error"), _(f"Failed to load form purchases: {str(e)}"))

    def show_form_payment_details(self, payment):
        details_window = FormPaymentDetailWindow(self, payment, self.db)
        details_window.grab_set() # Make it modal
        details_window.wait_window() # Wait for it to close

    def show_context_menu(self, event, payment):
        self.context_menu = Menu(self, tearoff=0) # Make 'self' (FormPaymentWindow) the master of the menu
        self.context_menu.add_command(label=_("Edit"), command=lambda: self.load_form_payment_for_edit(payment))
        self.context_menu.add_command(label=_("Delete"), command=lambda: self.delete_form_payment_action(payment['id']))
        self.context_menu.tk_popup(event.x_root, event.y_root) # Use standard tk_popup method

    def load_form_payment_for_edit(self, payment):
        self.current_form_payment_id = payment['id']
        
        student_display_name = f"{payment['student_unique_id']} - {payment['last_name']}, {payment['first_name']}"
        if student_display_name in self.students:
            self.entries['student_var'].set(student_display_name)
        else:
            self.entries['student_var'].set(_("Student Not Found")) # Fallback if student details changed or deleted

        self.entries['form_type_var'].set(payment['form_type'])
        self.entries['amount_entry'].delete(0, ctk.END)
        self.entries['amount_entry'].insert(0, f"{payment['amount']:.2f}")
        self.entries['payment_date_entry'].delete(0, ctk.END)
        self.entries['payment_date_entry'].insert(0, payment['payment_date'])
        self.entries['payment_method_var'].set(payment.get('payment_method') or "")
        self.entries['receipt_number_entry'].delete(0, ctk.END)
        self.entries['receipt_number_entry'].insert(0, payment['receipt_number'])
        self.entries['status_var'].set(payment['status'])

    def generate_receipt(self):
        if not self.current_form_payment_id:
            messagebox.showerror(_("Error"), _("Please select a form payment to generate receipt."))
            return
        
        try:
            payment = get_form_payment_by_id(self.current_form_payment_id)
            if not payment:
                messagebox.showerror(_("Error"), _("Selected payment not found."))
                return

            # Ask for save location
            file_path = filedialog.asksaveasfilename(
                defaultextension=".pdf",
                filetypes=[(_("PDF files"), "*.pdf")],
                initialfile=f"Receipt_{payment['receipt_number']}.pdf"
            )
            
            if not file_path: # User cancelled save dialog
                return

            # Fetch full student details using student_id (from students table)
            student_details_query = """
            SELECT id, student_id, first_name, last_name
            FROM students
            WHERE id = %s
            """
            student_full_details = self.db.fetch_one(student_details_query, (payment['student_id'],))

            if student_full_details:
                generated_pdf_path = generate_form_receipt_pdf(
                    payment, 
                    student_full_details, 
                    output_path=os.path.dirname(file_path) # Pass the directory of the selected file
                )
                if generated_pdf_path:
                    messagebox.showinfo(_("Success"), _(f"Receipt generated successfully as PDF:\n{generated_pdf_path}"))
                else:
                    messagebox.showerror(_("Error"), _("Failed to generate PDF receipt."))
            else:
                messagebox.showerror(_("Error"), _("Student details not found for receipt generation."))

        except Exception as e:
            messagebox.showerror(_("Error"), _(f"Failed to generate receipt: {str(e)}"))

    def _open_petty_cash_window(self):
        """Opens a new top-level window for Petty Cash Management."""
        petty_cash_top_level = ctk.CTkToplevel(self)
        petty_cash_top_level.title(_("Petty Cash Management"))
        petty_cash_top_level.geometry("1000x700")
        # Make it transient to the main window (dashboard) if self.parent_frame is a module frame,
        # or to the app root if self.parent_frame is the app itself.
        # Assuming parent_frame is the module_content_frame from dashboard.
        if hasattr(self.parent_frame, 'master'):
            petty_cash_top_level.transient(self.parent_frame.master) 
        else:
            petty_cash_top_level.transient(self.master) # Fallback
        petty_cash_top_level.grab_set() # Make it modal

        petty_cash_window = PettyCashWindow(petty_cash_top_level, self.db, self.user)
        petty_cash_window.show()


# For testing purposes
# if __name__ == "__main__":
#     app = ctk.CTk()
#     app.geometry("500x400")
#     app.title("Main App")

#     def open_form_payment_window():
#         form_window = FormPaymentWindow(app)
#         form_window.wait_window()

#     open_button = ctk.CTkButton(app, text="Open Form Payment", command=open_form_payment_window)
#     open_button.pack(pady=20)

#     app.mainloop()