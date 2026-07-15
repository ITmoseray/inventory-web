import customtkinter as ctk
from tkinter import messagebox, Menu, filedialog
from datetime import datetime
import pandas as pd
from fpdf import FPDF
from decimal import Decimal
from db import petty_cash_queries as pcq
from ui.tooltip import Tooltip
from ui.audit_trail import AuditTrailWindow
from utils.i18n import get_translator
from utils.mixins import UndoRedoEntryMixin # Import the mixin
from utils import email_sender # Import email sender
from utils.pdf_generator import generate_payment_receipt_pdf # Import the PDF generator
import os # Import os for path checking

_ = get_translator()

class PaymentsWindow:
    def __init__(self, parent_frame, db, user=None):
        self.parent_frame = parent_frame
        self.db = db
        self.user = user
        self.current_payment_id = None
        self.students = []
        self.student_map = {}
        self.course_combobox_widget = None # Store reference to the Course combobox
        self.row_colors = ["#2b2b2b", "#212121"] # Darker and slightly lighter shades

    def _get_student_enrolled_courses(self, student_internal_id):
        """Fetches all courses a specific student is enrolled in."""
        query = """
        SELECT c.id, c.course_name
        FROM student_courses sc
        JOIN courses c ON sc.course_id = c.id
        WHERE sc.student_id = %s AND sc.status = 'Active'
        ORDER BY c.course_name
        """
        return self.db.fetch_all(query, (student_internal_id,))

    def show(self):
        # Clear parent frame
        for widget in self.parent_frame.winfo_children():
            widget.destroy()

        # Create main container
        container = ctk.CTkFrame(self.parent_frame)
        container.pack(fill="both", expand=True, padx=10, pady=10)

        # Title
        title = ctk.CTkLabel(container, text=_("💵 Payment Management"), 
                           font=ctk.CTkFont(size=24, weight="bold"))
        title.pack(pady=10)

        # Load students
        self.load_students()

        # Create a frame for the form at the top
        form_wrapper_frame = ctk.CTkFrame(container)
        form_wrapper_frame.pack(side="top", fill="both", padx=5, pady=5) # No expand here for the form

        # Create the form inside its wrapper frame
        self.create_payment_form(form_wrapper_frame) 

        # Create a frame for the payment list at the bottom, expanding to fill remaining space
        list_wrapper_frame = ctk.CTkFrame(container)
        list_wrapper_frame.pack(side="bottom", fill="both", expand=True, padx=5, pady=5) # Expand here for the list

        # Create payment list inside its wrapper frame
        self.create_payment_list(list_wrapper_frame) 

        # Load payments
        self.load_payments()

    def load_students(self):
        try:
            query = "SELECT id, student_id, first_name, last_name FROM students"
            students_data = self.db.fetch_all(query)
            self.students = [f"{s['student_id']} - {s['last_name']}, {s['first_name']}" for s in students_data]
            self.student_map = {f"{s['student_id']} - {s['last_name']}, {s['first_name']}": s['id'] for s in students_data}
            
            if self.course_combobox_widget: # If the combobox has already been created
                self.course_combobox_widget.configure(values=[_("Select Student First")])
                self.entries['course_var'].set(_("Select Student First"))

        except Exception as e:
            messagebox.showerror(_("Error"), _(f"Failed to load students: {str(e)}"))

    def on_student_select(self, selection):
        """Callback when a student is selected in the combobox."""
        if selection == _("Select Student") or not selection:
            self.course_combobox_widget.configure(values=[])
            self.entries['course_var'].set("")
            return
        
        student_internal_id = self.student_map.get(selection)
        if student_internal_id:
            enrolled_courses = self._get_student_enrolled_courses(student_internal_id)
            course_display_names = [f"{c['id']} - {c['course_name']}" for c in enrolled_courses]
            if course_display_names:
                self.course_combobox_widget.configure(values=course_display_names)
                self.entries['course_var'].set(course_display_names[0])
            else:
                self.course_combobox_widget.configure(values=[_("No Enrolled Courses")])
                self.entries['course_var'].set(_("No Enrolled Courses"))
        else:
            self.course_combobox_widget.configure(values=[])
            self.entries['course_var'].set("")

    def create_payment_form(self, parent):
        # Form title
        form_title = ctk.CTkLabel(parent, text=_("📝 Payment Details"), 
                                font=ctk.CTkFont(size=18, weight="bold"))
        form_title.pack(pady=10)

        # Form fields
        fields = [
            (_("Student"), "student_var"),
            (_("Course"), "course_var"),
            (_("Amount (Le)"), "amount_entry"),
            (_("Payment Date"), "date_entry"),
            (_("Payment Method"), "method_entry"),
            (_("Status"), "status_var")
        ]

        self.entries = {}
        for field_name, attr_name in fields:
            frame = ctk.CTkFrame(parent)
            frame.pack(fill="x", padx=20, pady=5)

            label = ctk.CTkLabel(frame, text=f"➡️ {field_name}:", width=150)
            label.pack(side="left", padx=5)

            if field_name == _("Student"):
                self.entries[attr_name] = ctk.StringVar(value=_("Select Student"))
                combobox = ctk.CTkComboBox(frame, variable=self.entries[attr_name],
                                         values=self.students,
                                         command=self.on_student_select) # Bind student selection
                combobox.pack(side="left", fill="x", expand=True, padx=5)
            elif field_name == _("Course"):
                self.entries[attr_name] = ctk.StringVar(value=_("Select Student First"))
                self.course_combobox_widget = ctk.CTkComboBox(frame, variable=self.entries[attr_name], 
                                                              values=[_("Select Student First")]) # Initial empty state
                self.course_combobox_widget.pack(side="left", fill="x", expand=True, padx=5)
            elif field_name == _("Status"):
                self.entries[attr_name] = ctk.StringVar() # Initialize the StringVar
                combobox = ctk.CTkComboBox(frame, variable=self.entries[attr_name], 
                                             values=[_("Paid"), _("Partial"), _("Pending")])
                combobox.pack(side="left", fill="x", expand=True, padx=5)
            else:
                entry = UndoRedoEntryMixin(frame) # Use the mixin
                if field_name == _("Payment Date"):
                    entry.insert(0, datetime.now().strftime("%Y-%m-%d"))
                entry.pack(side="left", fill="x", expand=True, padx=5)
                self.entries[attr_name] = entry

        # Add "Amount to Petty Cash" entry
        petty_cash_frame = ctk.CTkFrame(parent)
        petty_cash_frame.pack(fill="x", padx=20, pady=5)
        
        petty_cash_label = ctk.CTkLabel(petty_cash_frame, text=_("Amount to Petty Cash (Le):"), width=150)
        petty_cash_label.pack(side="left", padx=5)

        self.entries['petty_cash_transfer_amount_entry'] = UndoRedoEntryMixin(petty_cash_frame)
        self.entries['petty_cash_transfer_amount_entry'].pack(side="left", fill="x", expand=True, padx=5)
        Tooltip(self.entries['petty_cash_transfer_amount_entry'], _("Optional: Enter an amount to transfer to petty cash from this payment."))
        
        # Buttons
        button_frame = ctk.CTkFrame(parent)
        button_frame.pack(pady=20)

        buttons_info = [
            (_("➕ Add"), self.add_payment, _("Add a new payment record"), "forestgreen", "seagreen"),
            (_("📝 Update"), self.update_payment, _("Update the selected payment record"), "royalblue", "cornflowerblue"),
            (_("🧹 Clear"), self.clear_form, _("Clear all fields in the form"), "gray", "dimgray"),
            (_("🧾 Generate Receipt"), self.generate_receipt, _("Generate a PDF receipt for the selected payment"), "purple", "darkorchid"),
            (_("📧 Send Reminders"), self.send_balance_reminders, _("Send payment reminders to students with outstanding balances"), "red", "darkred"),
            (_("🛡️ Audit Trail"), self.show_audit_trail, _("View payment audit trail"), "orange", "darkorange")
        ]

        for text, command, tooltip_text, fg_color, hover_color in buttons_info:
            button = ctk.CTkButton(button_frame, text=text, command=command, fg_color=fg_color, hover_color=hover_color)
            button.pack(side="left", padx=5)
            Tooltip(button, tooltip_text)

    def create_payment_list(self, parent):
        # Total Amount Display
        total_frame = ctk.CTkFrame(parent, fg_color="gray14")
        total_frame.pack(fill="x", padx=10, pady=(0, 10))
        self.total_payments_label = ctk.CTkLabel(total_frame, text=_("Total Payments: ..."),
                                                   font=ctk.CTkFont(size=18, weight="bold"))
        self.total_payments_label.pack(pady=5)
        
        # Payments list
        self.payments_frame = ctk.CTkScrollableFrame(parent)
        self.payments_frame.pack(fill="both", expand=True, padx=10, pady=10)

    def _get_total_payments(self) -> Decimal:
        """Calculates the total amount of all course payments, subtracting amounts transferred to petty cash."""
        total_payments_query = "SELECT COALESCE(SUM(amount), 0) AS total_payments FROM payments"
        total_petty_cash_from_payments_query = """
            SELECT COALESCE(SUM(pc.amount), 0) AS total_petty_cash_from_payments
            FROM petty_cash pc
            WHERE pc.source_payment_id IS NOT NULL AND pc.transaction_type = 'Income'
        """
        try:
            total_payments_result = self.db.fetch_one(total_payments_query)
            total_payments = Decimal(total_payments_result['total_payments'])

            total_petty_cash_from_payments_result = self.db.fetch_one(total_petty_cash_from_payments_query)
            total_petty_cash_from_payments = Decimal(total_petty_cash_from_payments_result['total_petty_cash_from_payments'])
            
            # Subtract petty cash amounts originating from payments
            final_total = total_payments - total_petty_cash_from_payments
            
            return final_total
        except Exception as e:
            print(f"Error getting total payments: {e}")
            return Decimal('0.00')

    def add_payment(self):
        try:
            student_display_name = self.entries['student_var'].get()
            course_text = self.entries['course_var'].get()
            amount_str = self.entries['amount_entry'].get()
            petty_cash_transfer_str = self.entries['petty_cash_transfer_amount_entry'].get()

            if not all([student_display_name != _("Select Student"),
                       course_text != _("Select Student First") and course_text != _("No Enrolled Courses"), 
                       amount_str, self.entries['date_entry'].get()]):
                messagebox.showerror(_("Error"), _("Please fill all required fields"))
                return

            student_id = self.student_map[student_display_name] # This is already the internal INT student_id
            course_id = int(course_text.split(" - ")[0]) # This is already the internal INT course_id
            
            try:
                amount_decimal = Decimal(amount_str)
            except Exception:
                messagebox.showerror(_("Error"), _("Invalid payment amount format."))
                return

            receipt_number = f"RCPT-{datetime.now().strftime('%Y%m%d%H%M%S')}"

            # Pass INT student_id and INT course_id to add_payment
            new_payment_id = payment_queries.add_payment(
                student_id=student_id,
                course_id=course_id,
                amount=amount_decimal,
                payment_date=self.entries['date_entry'].get(),
                status=self.entries['status_var'].get(),
                payment_method=self.entries['method_entry'].get(),
                receipt_number=receipt_number,
                performed_by=self.user['id'] if self.user else None
            )
            if new_payment_id:
                messagebox.showinfo(_("Success"), _("Payment added successfully!"))

                # Handle petty cash transfer if an amount is entered
                if petty_cash_transfer_str:
                    try:
                        transfer_amount = Decimal(petty_cash_transfer_str)
                        if transfer_amount > 0:
                            if transfer_amount > amount_decimal:
                                messagebox.showwarning(_("Petty Cash Warning"), _("Transfer amount cannot be greater than the payment amount. Petty cash was not updated."))
                            else:
                                description = f"Transfer from {student_display_name} for course {course_text.split(' - ')[1]}. Receipt: {receipt_number}"
                                pcq.add_petty_cash_transaction(
                                    transaction_date=self.entries['date_entry'].get(),
                                    description=description,
                                    amount=transfer_amount,
                                    transaction_type='Income',
                                    authorized_by="System",
                                    source_payment_id=new_payment_id, # Pass the new payment ID
                                    source_form_payment_id=None # Explicitly set to None
                                )
                                messagebox.showinfo(_("Petty Cash"), _(f"Amount of Le {transfer_amount:,.2f} transferred to Petty Cash."))
                    except Exception as e:
                        messagebox.showerror(_("Petty Cash Error"), _(f"Invalid amount for petty cash transfer: {e}"))
            else:
                messagebox.showerror(_("Error"), _("Failed to add payment due to database error."))

            self.clear_form()
            self.load_payments()
        except Exception as e:
            messagebox.showerror(_("Error"), _(f"Failed to add payment: {str(e)}"))
    def update_payment(self):
        # Note: Updating petty cash on payment update is complex.
        # It would require voiding the old transfer and creating a new one,
        # or finding and updating the original petty cash transaction.
        # For now, we only handle transfers on initial payment creation.
        if not self.current_payment_id:
            messagebox.showerror(_("Error"), _("Please select a payment to update"))
            return

        try:
            student_display_name = self.entries['student_var'].get()
            student_id = self.student_map[student_display_name] # This is already the internal INT student_id
            course_id = int(self.entries['course_var'].get().split(" - ")[0]) # This is already the internal INT course_id
            
            try:
                amount_decimal = Decimal(self.entries['amount_entry'].get())
            except Exception:
                messagebox.showerror(_("Error"), _("Invalid amount format."))
                return

            print(f"DEBUG: update_payment - current_payment_id: {self.current_payment_id}")
            print(f"DEBUG: update_payment - student_id: {student_id}")
            print(f"DEBUG: update_payment - course_id: {course_id}")
            print(f"DEBUG: update_payment - amount_decimal: {amount_decimal}")
            print(f"DEBUG: update_payment - payment_date: {self.entries['date_entry'].get()}")
            print(f"DEBUG: update_payment - payment_method: {self.entries['method_entry'].get()}")
            print(f"DEBUG: update_payment - status: {self.entries['status_var'].get()}")

            # Pass INT student_id and INT course_id to update_payment
            payment_queries.update_payment(
                payment_id=self.current_payment_id, 
                student_id=student_id, 
                course_id=course_id, 
                amount=amount_decimal, 
                payment_date=self.entries['date_entry'].get(), 
                status=self.entries['status_var'].get(), 
                payment_method=self.entries['method_entry'].get(), 
                receipt_number=self.db.fetch_one("SELECT receipt_number FROM payments WHERE id = %s", (self.current_payment_id,))['receipt_number'], # Retrieve existing receipt_number
                performed_by=self.user['id'] if self.user else None
            )

            messagebox.showinfo(_("Success"), _("Payment updated successfully!"))
            self.clear_form()
            self.load_payments()
        except Exception as e:
            messagebox.showerror(_("Error"), _(f"Failed to update payment: {str(e)}"))
    def delete_payment(self, payment_id):
        if messagebox.askyesno(_("Confirm"), _("Are you sure you want to delete this payment?")):
            try:
                if payment_queries.delete_payment(payment_id, performed_by=self.user['id'] if self.user else None):
                    messagebox.showinfo(_("Success"), _("Payment deleted successfully!"))
                    self.load_payments()
                else:
                    messagebox.showerror(_("Error"), _("Failed to delete payment."))
            except Exception as e:
                messagebox.showerror(_("Error"), _(f"Failed to delete payment: {str(e)}"))

    def clear_form(self):
        for name, entry in self.entries.items():
            if hasattr(entry, 'delete'): # Covers CTkEntry and UndoRedoEntryMixin
                entry.delete(0, 'end')
                if name == 'date_entry':
                    entry.insert(0, datetime.now().strftime("%Y-%m-%d"))
            elif isinstance(entry, ctk.StringVar):
                if name == 'student_var':
                    entry.set(_("Select Student"))
                    self.on_student_select(_("Select Student"))
                else:
                    entry.set("")
        
        self.current_payment_id = None

    def show_audit_trail(self):
        """Open payment audit trail window"""
        audit_window = AuditTrailWindow(self.parent_frame.winfo_toplevel())
        audit_window.wait_window()

    def load_payments(self):
        # Update total
        try:
            total = self._get_total_payments()
            self.total_payments_label.configure(text=_(f"Total Payments: Le {total:,.2f}"))
        except Exception as e:
            self.total_payments_label.configure(text=_("Total Payments: Error"))
            print(f"Error updating total payments label: {e}") # Added specific error logging

        # Clear existing payments
        for widget in self.payments_frame.winfo_children():
            widget.destroy()

        try:
            query = """
            SELECT p.*, s.first_name, s.last_name, c.course_name, c.fee
            FROM payments p
            JOIN students s ON p.student_id = s.id
            JOIN courses c ON p.course_id = c.id
            ORDER BY p.payment_date DESC
            """
            payments = self.db.fetch_all(query)
            
            # Dictionary to keep track of total paid per student per course
            total_paid_per_course = {}

            # First pass to calculate total paid for each student-course pair
            for payment in payments:
                key = (payment['student_id'], payment['course_id'])
                if key not in total_paid_per_course:
                    total_paid_per_course[key] = 0
                total_paid_per_course[key] += payment['amount']

            # Second pass to display with balance
            for i, payment in enumerate(payments):
                bg_color = self.row_colors[i % 2]
                frame = ctk.CTkFrame(self.payments_frame, fg_color=bg_color, corner_radius=5)
                frame.pack(fill="x", padx=5, pady=5)

                # Hover effect
                hover_color = "#3a3a3a" # Consistent hover color
                frame.bind("<Enter>", lambda event, f=frame: f.configure(fg_color=hover_color))
                frame.bind("<Leave>", lambda event, f=frame, original_color=bg_color: f.configure(fg_color=original_color))
                
                key = (payment['student_id'], payment['course_id'])
                balance = payment['fee'] - total_paid_per_course[key]

                # Payment info
                receipt_display = payment['receipt_number'] if payment['receipt_number'] else _("N/A")
                info_text_raw = (f"{receipt_display} - "
                            f"{payment['last_name']}, {payment['first_name']} - "
                            f"{payment['course_name']} - "
                            f"Le {payment['amount']:,.2f} - "
                            f"{payment['status']} - "
                            f"Balance: Le {balance:,.2f}")
                label = ctk.CTkLabel(frame, text=_(info_text_raw))
                label.pack(side="left", fill="x", expand=True, padx=10, pady=5)
                
                # Bind events to the label as well for better UX
                label.bind("<Enter>", lambda event, f=frame: f.configure(fg_color="#3a3a3a"))
                label.bind("<Leave>", lambda event, f=frame: f.configure(fg_color="transparent"))

                # Double-click to view details
                frame.bind("<Double-Button-1>", lambda event, p=payment: self.view_payment_details(p))
                label.bind("<Double-Button-1>", lambda event, p=payment: self.view_payment_details(p))
                
                # Right-click context menu
                frame.bind("<Button-3>", lambda event, p=payment: self.show_context_menu(event, p))
                label.bind("<Button-3>", lambda event, p=payment: self.show_context_menu(event, p))

        except Exception as e:
            messagebox.showerror(_("Error"), _(f"Failed to load payments: {str(e)}"))

    def copy_to_clipboard(self, text):
        self.parent_frame.clipboard_clear()
        self.parent_frame.clipboard_append(text)
        messagebox.showinfo(_("Copied"), _(f"'{text}' copied to clipboard."))

    def show_context_menu(self, event, payment):
        context_menu = Menu(self.payments_frame, tearoff=0)
        context_menu.add_command(label=_("View Details"), command=lambda: self.view_payment_details(payment))
        context_menu.add_command(label=_("Copy Receipt Number"), command=lambda: self.copy_to_clipboard(payment['receipt_number']))
        context_menu.add_separator()
        context_menu.add_command(label=_("Edit"), command=lambda: self.load_payment(payment))
        context_menu.add_command(label=_("Delete"), command=lambda: self.delete_payment(payment['id']))
        context_menu.post(event.x_root, event.y_root)

    def load_payment(self, payment):
        self.current_payment_id = payment['id']

        # Fetch the student's unique string ID from the students table
        student_unique_id_query = "SELECT student_id FROM students WHERE id = %s"
        student_unique_id_result = self.db.fetch_one(student_unique_id_query, (payment['student_id'],))
        
        student_unique_str_id = student_unique_id_result['student_id'] if student_unique_id_result else str(payment['student_id']) # Fallback to internal ID string if unique ID not found

        # Construct student display name using the unique string ID
        student_display_name = f"{student_unique_str_id} - {payment['last_name']}, {payment['first_name']}"
        
        self.entries['student_var'].set(student_display_name)
        self.on_student_select(student_display_name) # Populate course combobox based on student
        self.entries['course_var'].set(f"{payment['course_id']} - {payment['course_name']}")
        self.entries['amount_entry'].delete(0, 'end')
        self.entries['amount_entry'].insert(0, f"{payment['amount']:.2f}")
        self.entries['date_entry'].delete(0, 'end')
        self.entries['date_entry'].insert(0, payment['payment_date'])
        self.entries['method_entry'].delete(0, 'end')
        self.entries['method_entry'].insert(0, payment['payment_method'] or "")
        self.entries['status_var'].set(payment['status'])

    def view_payment_details(self, payment):
        detail_window = ctk.CTkToplevel(self.parent_frame)
        detail_window.title(_(f"Details: Payment by {payment['first_name']} {payment['last_name']}"))
        detail_window.geometry("800x700") # Increased size for more content

        # Ensure the window appears on top
        detail_window.transient(self.parent_frame.winfo_toplevel())
        detail_window.lift()
        detail_window.focus_force()
        detail_window.grab_set()

        # Main frame for tabview
        main_display_frame = ctk.CTkFrame(detail_window)
        main_display_frame.pack(fill="both", expand=True, padx=20, pady=20)

        # Tabview for details
        tabview = ctk.CTkTabview(main_display_frame)
        tabview.pack(fill="both", expand=True, pady=10)

        # Tab 1: Payment Details
        payment_details_tab = tabview.add(_("🧾 Payment Details"))
        payment_details_scroll_frame = ctk.CTkScrollableFrame(payment_details_tab)
        payment_details_scroll_frame.pack(fill="both", expand=True, padx=5, pady=5)

        # Calculate balance
        total_paid_query = "SELECT SUM(amount) as total FROM payments WHERE student_id = %s AND course_id = %s"
        total_paid_result = self.db.fetch_one(total_paid_query, (payment['student_id'], payment['course_id']))
        total_paid = total_paid_result['total'] if total_paid_result['total'] else 0
        balance = payment['fee'] - total_paid

        details_to_show = {
            _("Receipt Number"): payment['receipt_number'] if payment['receipt_number'] else _("N/A"),
            _("Student ID"): payment['student_id'],
            _("Student Name"): f"{payment['first_name']} {payment['last_name']}",
            _("Course Name"): payment['course_name'],
            _("Amount"): _(f"Le {payment['amount']:,.2f}"),
            _("Payment Date"): payment['payment_date'],
            _("Payment Method"): payment['payment_method'],
            _("Status"): payment['status'],
            _("Balance"): _(f"Le {balance:,.2f}")
        }

        for key, value in details_to_show.items():
            frame = ctk.CTkFrame(payment_details_scroll_frame, fg_color="transparent")
            frame.pack(fill="x", pady=2, padx=5)
            ctk.CTkLabel(frame, text=_(f"➡️ {key}:"), font=ctk.CTkFont(weight="bold")).pack(side="left", anchor="w", padx=5)
            ctk.CTkLabel(frame, text=str(value)).pack(side="left", anchor="w", padx=5)

        # Tab 2: Student Info
        student_info_tab = tabview.add(_("🧑‍🎓 Student Info"))
        student_info_scroll_frame = ctk.CTkScrollableFrame(student_info_tab)
        student_info_scroll_frame.pack(fill="both", expand=True, padx=5, pady=5)

        # Fetch full student details using student_id
        student_query = """
        SELECT id, student_id, first_name, last_name, gender, date_of_birth, address, phone, email, photo_path, created_at, status
        FROM students
        WHERE student_id = %s
        """
        student_data = self.db.fetch_one(student_query, (payment['student_id'],))

        if student_data:
            # Get current course for student
            course_query = """
            SELECT c.course_name
            FROM student_courses sc
            JOIN courses c ON sc.course_id = c.id
            WHERE sc.student_id = %s
            ORDER BY sc.enrollment_date DESC
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
                ctk.CTkLabel(frame, text=_(f"{key}:"), font=ctk.CTkFont(weight="bold")).pack(side="left", anchor="w", padx=5)
                ctk.CTkLabel(frame, text=str(value)).pack(side="left", anchor="w", padx=5)
        else:
            ctk.CTkLabel(student_info_scroll_frame, text=_("Student details not found.")).pack(pady=10)

        # Tab 3: Other Payments by Student
        other_payments_tab = tabview.add(_("💸 Other Payments"))
        other_payments_scroll_frame = ctk.CTkScrollableFrame(other_payments_tab)
        other_payments_scroll_frame.pack(fill="both", expand=True, padx=5, pady=5)

        other_payments_query = """
        SELECT p.receipt_number, p.payment_date, p.amount, p.status, c.course_name, c.fee
        FROM payments p
        JOIN courses c ON p.course_id = c.id
        WHERE p.student_id = %s AND p.id != %s
        ORDER BY p.payment_date DESC
        """
        other_student_payments = self.db.fetch_all(other_payments_query, (payment['student_id'], payment['id']))

        if other_student_payments:
            for op_data in other_student_payments:
                total_paid_query = "SELECT SUM(amount) as total FROM payments WHERE student_id = %s AND course_id = %s"
                total_paid_result = self.db.fetch_one(total_paid_query, (payment['student_id'], op_data['course_id']))
                total_paid = total_paid_result['total'] if total_paid_result['total'] else 0
                balance = op_data['fee'] - total_paid
                op_info = _(f"Receipt: {op_data['receipt_number']} | Date: {op_data['payment_date']} | "
                           f"Amount: Le {op_data['amount']:,.2f} | Status: {op_data['status']} | Course: {op_data['course_name']} | Balance: Le {balance:,.2f}")
                ctk.CTkLabel(other_payments_scroll_frame, text=op_info, wraplength=400, justify="left").pack(fill="x", pady=2, padx=5)
        else:
            ctk.CTkLabel(other_payments_scroll_frame, text=_("No other payments found for this student.")).pack(pady=10)

        close_button = ctk.CTkButton(detail_window, text=_("Close"), command=detail_window.destroy)
        close_button.pack(pady=10)

    def send_balance_reminders(self):
        _ = get_translator()
        try:
            # 1. Get all students with an outstanding balance
            query = """
            SELECT s.id as student_id, s.first_name, s.last_name, s.phone,
                   c.id as course_id, c.course_name, c.fee,
                   (SELECT SUM(p.amount) FROM payments p WHERE p.student_id = s.id AND p.course_id = c.id) as total_paid
            FROM students s
            JOIN student_courses sc ON s.id = sc.student_id
            JOIN courses c ON sc.course_id = c.id
            WHERE sc.status = 'Active'
            GROUP BY s.id, c.id
            HAVING total_paid < c.fee OR total_paid IS NULL
            """
            students_with_balance = self.db.fetch_all(query)

            if not students_with_balance:
                messagebox.showinfo(_("No Balances"), _("No students with outstanding balances found."))
                return

            # 2. Create a new window to display messages
            reminder_window = ctk.CTkToplevel(self.parent_frame)
            reminder_window.title(_("Student Reminder Messages"))
            reminder_window.geometry("800x600")
            reminder_window.transient(self.parent_frame)
            reminder_window.lift()
            reminder_window.focus_force()
            reminder_window.grab_set()

            scrollable_frame = ctk.CTkScrollableFrame(reminder_window)
            scrollable_frame.pack(fill="both", expand=True, padx=10, pady=10)

            # 3. Iterate and create message widgets
            for student in students_with_balance:
                balance = student['fee'] - (student['total_paid'] or 0)
                
                student_message = _(f"""
Dear {student['first_name']} {student['last_name']},

This is a friendly reminder from the Empowernment Academy of Skills and Innovation (EASI) regarding your outstanding balance for the course '{student['course_name']}'.

Course Fee: Le {student['fee']:,.2f}
Amount Paid: Le {(student['total_paid'] or 0):,.2f}
Outstanding Balance: Le {balance:,.2f}

Please make a payment at your earliest convenience to clear your balance.

If you have any questions or believe you have received this message in error, please contact our administration.

Thank you,
EASI Management
""")
                
                message_frame = ctk.CTkFrame(scrollable_frame, fg_color="gray20", corner_radius=10)
                message_frame.pack(fill="x", padx=10, pady=10)

                message_textbox = ctk.CTkTextbox(message_frame, height=200)
                message_textbox.pack(fill="x", expand=True, padx=5, pady=5)
                message_textbox.insert("1.0", student_message)
                message_textbox.configure(state="disabled") # Make it read-only

                copy_button = ctk.CTkButton(message_frame, text=_("Copy Message"), 
                                            command=lambda msg=student_message: self.copy_to_clipboard(msg))
                copy_button.pack(pady=5)

            close_button = ctk.CTkButton(reminder_window, text=_("Close"), command=reminder_window.destroy)
            close_button.pack(pady=10)

        except Exception as e:
            messagebox.showerror(_("Error"), _(f"Failed to generate reminder messages: {str(e)}"))

    def generate_receipt(self):
        if not self.current_payment_id:
            messagebox.showerror(_("Error"), _("Please select a payment to generate receipt"))
            return

        try:
            query = """
            SELECT p.*, s.first_name, s.last_name, s.address, s.phone,
                   c.course_name, c.fee
            FROM payments p
            JOIN students s ON p.student_id = s.id
            JOIN courses c ON p.course_id = c.id
            WHERE p.id = %s
            """
            payment = self.db.fetch_one(query, (self.current_payment_id,))

            if payment:
                # Ask for save location
                file_path = filedialog.asksaveasfilename(
                    defaultextension=".pdf",
                    filetypes=[(_("PDF files"), "*.pdf")],
                    initialfile=f"Payment_Receipt_{payment['receipt_number']}.pdf"
                )
                
                if not file_path: # User cancelled save dialog
                    return

                # Get student details for the receipt
                student_details_query = """
                SELECT id, student_id, first_name, last_name, email, phone
                FROM students
                WHERE id = %s
                """
                student_details = self.db.fetch_one(student_details_query, (payment['student_id'],))

                if student_details:
                    generated_pdf_path = generate_payment_receipt_pdf(
                        payment, 
                        student_details, 
                        payment['course_name'], 
                        output_path=os.path.dirname(file_path) # Pass the directory of the selected file
                    )
                    if generated_pdf_path:
                        messagebox.showinfo(_("Success"), _(f"Receipt generated successfully as PDF:\n{generated_pdf_path}"))
                    else:
                        messagebox.showerror(_("Error"), _("Failed to generate PDF receipt."))
                else:
                    messagebox.showerror(_("Error"), _("Student details not found for receipt generation."))
            else:
                messagebox.showerror(_("Error"), _("Payment record not found."))
        except Exception as e:
            messagebox.showerror(_("Error"), _(f"Failed to generate receipt: {str(e)}"))