import customtkinter as ctk
from tkinter import messagebox, Menu, filedialog
from datetime import datetime
from decimal import Decimal, InvalidOperation
import pandas as pd
from fpdf import FPDF
from ui.tooltip import Tooltip
from utils.i18n import get_translator
from utils.mixins import UndoRedoEntryMixin
import os

from db import form_queries # Import form_queries for database operations

_ = get_translator()

class GraduationPaymentsWindow:
    def __init__(self, parent_frame, db):
        self.parent_frame = parent_frame
        self.db = db
        self.current_payment_id = None
        self.students = []
        self.student_map = {}
        self.row_colors = ["#2b2b2b", "#212121"]

        # Fixed values for graduation payments
        self.FORM_TYPE = "Graduation Fee"
        self.GRADUATION_FEE = Decimal('500.00')

    def show(self):
        for widget in self.parent_frame.winfo_children():
            widget.destroy()

        container = ctk.CTkFrame(self.parent_frame)
        container.pack(fill="both", expand=True, padx=10, pady=10)

        title = ctk.CTkLabel(container, text=_("🎓 Graduation Payment"),
                           font=ctk.CTkFont(size=24, weight="bold"))
        title.pack(pady=10)

        self.load_students()

        form_wrapper_frame = ctk.CTkFrame(container)
        form_wrapper_frame.pack(side="top", fill="both", padx=5, pady=5)

        self.create_payment_form(form_wrapper_frame)

        list_wrapper_frame = ctk.CTkFrame(container)
        list_wrapper_frame.pack(side="bottom", fill="both", expand=True, padx=5, pady=5)

        self.create_payment_list(list_wrapper_frame)

        self.load_payments()

    def load_students(self):
        try:
            query = """
                SELECT DISTINCT s.id, s.student_id, s.first_name, s.last_name
                FROM students s
            """
            students_data = self.db.fetch_all(query)
            print("Fetched students for graduation:", students_data)  # Debugging line
            self.students = [f"{s['student_id']} - {s['last_name']}, {s['first_name']}" for s in students_data]
            self.student_map = {f"{s['student_id']} - {s['last_name']}, {s['first_name']}": s['id'] for s in students_data}
        except Exception as e:
            messagebox.showerror(_("Error"), _(f"Failed to load students: {str(e)}"))

    def create_payment_form(self, parent):
        form_title = ctk.CTkLabel(parent, text=_("📝 Graduation Payment Details"),
                                font=ctk.CTkFont(size=18, weight="bold"))
        form_title.pack(pady=10)

        fields = [
            (_("Student"), "student_var"),
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
                                         values=self.students)
                combobox.pack(side="left", fill="x", expand=True, padx=5)
            elif field_name == _("Status"):
                self.entries[attr_name] = ctk.StringVar()
                combobox = ctk.CTkComboBox(frame, variable=self.entries[attr_name],
                                             values=[_("Paid"), _("Pending"), _("Waived")])
                combobox.pack(side="left", fill="x", expand=True, padx=5)
            elif field_name == _("Amount (Le)"):
                entry = UndoRedoEntryMixin(frame)
                entry.insert(0, f"{self.GRADUATION_FEE:.2f}")
                entry.pack(side="left", fill="x", expand=True, padx=5)
                self.entries[attr_name] = entry
                Tooltip(entry, _(f"Fixed fee for {self.FORM_TYPE}"))
            else:
                entry = UndoRedoEntryMixin(frame)
                if field_name == _("Payment Date"):
                    entry.insert(0, datetime.now().strftime("%Y-%m-%d"))
                entry.pack(side="left", fill="x", expand=True, padx=5)
                self.entries[attr_name] = entry

        # Buttons
        button_frame = ctk.CTkFrame(parent)
        button_frame.pack(pady=20)

        buttons_info = [
            (_("➕ Add"), self.add_payment, _("Add a new graduation fee payment record"), "forestgreen", "seagreen"),
            (_("📝 Update"), self.update_payment, _("Update the selected graduation fee payment record"), "royalblue", "cornflowerblue"),
            (_("🧹 Clear"), self.clear_form, _("Clear all fields in the form"), "gray", "dimgray"),
        ]

        for text, command, tooltip_text, fg_color, hover_color in buttons_info:
            button = ctk.CTkButton(button_frame, text=text, command=command, fg_color=fg_color, hover_color=hover_color)
            button.pack(side="left", padx=5)
            Tooltip(button, tooltip_text)
            
        test_button = ctk.CTkButton(button_frame, text="Test DB", command=self.test_db_connection)
        test_button.pack(side="left", padx=10)

    def test_db_connection(self):
        try:
            students = self.db.fetch_all("SELECT * FROM students")
            messagebox.showinfo("DB Test", f"Found {len(students)} students.\n\n{students}")
        except Exception as e:
            messagebox.showerror("DB Test Error", f"Failed to fetch students: {e}")

    def create_payment_list(self, parent):
        self.payments_frame = ctk.CTkScrollableFrame(parent)
        self.payments_frame.pack(fill="both", expand=True, padx=10, pady=10)

    def add_payment(self):
        try:
            student_display_name = self.entries['student_var'].get()
            amount_str = self.entries['amount_entry'].get()
            payment_method_str = self.entries['method_entry'].get()

            if not all([student_display_name != _("Select Student"),
                       amount_str,
                       self.entries['date_entry'].get(),
                       payment_method_str]):
                messagebox.showerror(_("Error"), _("Please fill all required fields"))
                return
            
            try:
                amount_decimal = Decimal(amount_str)
            except InvalidOperation:
                messagebox.showerror(_("Error"), _("Invalid amount. Please enter a valid number."))
                return

            student_internal_id = self.student_map[student_display_name]

            receipt_number = f"GRAD-{datetime.now().strftime('%Y%m%d')}-{len(form_queries.get_all_form_payments()) + 1:04d}"

            form_queries.add_form_payment(
                student_id=student_internal_id,
                form_type=self.FORM_TYPE,
                amount=amount_decimal,
                payment_date=self.entries['date_entry'].get(),
                receipt_number=receipt_number,
                status=self.entries['status_var'].get(),
                payment_method=payment_method_str
            )

            messagebox.showinfo(_("Success"), _("Graduation payment added successfully!"))
            self.clear_form()
            self.load_payments()
        except Exception as e:
            messagebox.showerror(_("Error"), _(f"Failed to add graduation payment: {str(e)}"))

    def update_payment(self):
        if not self.current_payment_id:
            messagebox.showerror(_("Error"), _("Please select a graduation payment to update"))
            return

        try:
            student_display_name = self.entries['student_var'].get()
            amount_str = self.entries['amount_entry'].get()
            payment_method_str = self.entries['method_entry'].get()

            try:
                amount_decimal = Decimal(amount_str)
            except InvalidOperation:
                messagebox.showerror(_("Error"), _("Invalid amount. Please enter a valid number."))
                return

            student_internal_id = self.student_map[student_display_name]
            
            current_payment = form_queries.get_form_payment_by_id(self.current_payment_id)
            if not current_payment:
                messagebox.showerror(_("Error"), _("Could not find the original payment record to update."))
                return
            receipt_number = current_payment['receipt_number']


            form_queries.update_form_payment(
                payment_id=self.current_payment_id,
                student_id=student_internal_id,
                form_type=self.FORM_TYPE,
                amount=amount_decimal,
                payment_date=self.entries['date_entry'].get(),
                receipt_number=receipt_number,
                status=self.entries['status_var'].get(),
                payment_method=payment_method_str
            )

            messagebox.showinfo(_("Success"), _("Graduation payment updated successfully!"))
            self.clear_form()
            self.load_payments()
        except Exception as e:
            messagebox.showerror(_("Error"), _(f"Failed to update graduation payment: {str(e)}"))

    def delete_payment(self, payment_id):
        if messagebox.askyesno(_("Confirm"), _("Are you sure you want to delete this graduation payment?")):
            try:
                form_queries.delete_form_payment(payment_id)
                messagebox.showinfo(_("Success"), _("Graduation payment deleted successfully!"))
                self.load_payments()
            except Exception as e:
                messagebox.showerror(_("Error"), _(f"Failed to delete graduation payment: {str(e)}"))

    def clear_form(self):
        for name, entry in self.entries.items():
            if isinstance(entry, ctk.CTkEntry):
                entry.delete(0, 'end')
                if name == 'date_entry':
                    entry.insert(0, datetime.now().strftime("%Y-%m-%d"))
                elif name == 'amount_entry':
                    entry.insert(0, f"{self.GRADUATION_FEE:.2f}")
            elif isinstance(entry, ctk.StringVar):
                if name == 'student_var':
                    entry.set(_("Select Student"))
                elif name == 'status_var':
                    entry.set(_("Paid"))
        
        self.current_payment_id = None

    def load_payments(self):
        for widget in self.payments_frame.winfo_children():
            widget.destroy()

        try:
            payments = form_queries.get_all_form_payments()
            
            # Filter for graduation payments
            graduation_payments = [p for p in payments if p['form_type'] == self.FORM_TYPE]

            # Calculate total paid per student for graduation fee (should only be one payment per student)
            total_paid_per_student = {}
            for payment in graduation_payments:
                student_key = payment['student_id']
                if student_key not in total_paid_per_student:
                    total_paid_per_student[student_key] = Decimal(0)
                try:
                    total_paid_per_student[student_key] += Decimal(payment['amount'])
                except (InvalidOperation, TypeError):
                    pass

            for i, payment in enumerate(graduation_payments):
                bg_color = self.row_colors[i % 2]
                frame = ctk.CTkFrame(self.payments_frame, fg_color=bg_color, corner_radius=5)
                frame.pack(fill="x", padx=5, pady=5)

                hover_color = "#3a3a3a"
                frame.bind("<Enter>", lambda event, f=frame: f.configure(fg_color=hover_color))
                frame.bind("<Leave>", lambda event, f=frame, original_color=bg_color: f.configure(fg_color=original_color))
                
                total_expected_fee = self.GRADUATION_FEE
                current_student_total_paid = total_paid_per_student.get(payment['student_id'], Decimal(0))
                balance = total_expected_fee - current_student_total_paid
                display_amount = Decimal(payment.get('amount', '0.00'))

                info_text_raw = (f"{payment['receipt_number']} - "
                            f"{payment['last_name']}, {payment['first_name']} - "
                            f"Amount: Le {display_amount:,.2f} - "
                            f"Paid: Le {current_student_total_paid:,.2f} / {total_expected_fee:,.2f} - "
                            f"Balance: Le {balance:,.2f} - "
                            f"Status: {payment['status']} - "
                            f"Method: {payment.get('payment_method') or _('N/A')}")
                label = ctk.CTkLabel(frame, text=_(info_text_raw))
                label.pack(side="left", fill="x", expand=True, padx=10, pady=5)
                
                label.bind("<Enter>", lambda event, f=frame: f.configure(fg_color="#3a3a3a"))
                label.bind("<Leave>", lambda event, f=frame: f.configure(fg_color="transparent"))

                frame.bind("<Double-Button-1>", lambda event, p=payment: self.view_payment_details(p))
                label.bind("<Double-Button-1>", lambda event, p=payment: self.view_payment_details(p))
                
                frame.bind("<Button-3>", lambda event, p=payment: self.show_context_menu(event, p))
                label.bind("<Button-3>", lambda event, p=payment: self.show_context_menu(event, p))

        except Exception as e:
            messagebox.showerror(_("Error"), _(f"Failed to load graduation payments: {str(e)}"))

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

        student_display_name = f"{payment['student_unique_id']} - {payment['last_name']}, {payment['first_name']}"
        self.entries['student_var'].set(student_display_name)
        
        self.entries['amount_entry'].delete(0, 'end')
        amount_decimal = Decimal(payment.get('amount', '0.00'))
        self.entries['amount_entry'].insert(0, f"{amount_decimal:.2f}")
        
        self.entries['date_entry'].delete(0, 'end')
        self.entries['date_entry'].insert(0, payment['payment_date'])
        
        self.entries['method_entry'].delete(0, 'end')
        self.entries['method_entry'].insert(0, payment.get('payment_method') or "")
        
        self.entries['status_var'].set(payment['status'])

    def view_payment_details(self, payment):
        detail_window = ctk.CTkToplevel(self.parent_frame)
        detail_window.title(_(f"Details: Graduation Payment by {payment['first_name']} {payment['last_name']}"))
        detail_window.geometry("800x700")

        detail_window.transient(self.parent_frame.winfo_toplevel())
        detail_window.lift()
        detail_window.focus_force()
        detail_window.grab_set()

        main_display_frame = ctk.CTkFrame(detail_window)
        main_display_frame.pack(fill="both", expand=True, padx=20, pady=20)

        tabview = ctk.CTkTabview(main_display_frame)
        tabview.pack(fill="both", expand=True, pady=10)

        # Tab 1: Payment Details
        payment_details_tab = tabview.add(_("🧾 Payment Details"))
        payment_details_scroll_frame = ctk.CTkScrollableFrame(payment_details_tab)
        payment_details_scroll_frame.pack(fill="both", expand=True, padx=5, pady=5)

        total_paid_query = "SELECT SUM(amount) as total FROM form_payments WHERE student_id = %s AND form_type = %s"
        total_paid_result = self.db.fetch_one(total_paid_query, (payment['student_id'], self.FORM_TYPE))
        
        total_paid = Decimal(total_paid_result['total']) if total_paid_result and total_paid_result['total'] is not None else Decimal(0)
        total_expected_fee = self.GRADUATION_FEE
        balance = total_expected_fee - total_paid
        payment_amount = Decimal(payment.get('amount', '0.00'))

        details_to_show = {
            _("Receipt Number"): payment['receipt_number'],
            _("Student ID"): payment['student_unique_id'],
            _("Student Name"): f"{payment['first_name']} {payment['last_name']}",
            _("Form Type"): payment['form_type'],
            _("Amount"): _(f"Le {payment_amount:,.2f}"),
            _("Payment Date"): payment['payment_date'],
            _("Payment Method"): payment.get('payment_method') or _("N/A"),
            _("Status"): payment['status'],
            _("Total Expected Fee"): _(f"Le {total_expected_fee:,.2f}"),
            _("Total Paid for Graduation"): _(f"Le {total_paid:,.2f}"),
            _("Balance"): _(f"Le {balance:,.2f}")
        }

        for key, value in details_to_show.items():
            frame = ctk.CTkFrame(payment_details_scroll_frame, fg_color="transparent")
            frame.pack(fill="x", pady=2, padx=5)
            ctk.CTkLabel(frame, text=_(f"➡️ {key}:"), font=ctk.CTkFont(weight="bold")).pack(side="left", anchor="w", padx=5)
            ctk.CTkLabel(frame, text=str(value)).pack(side="left", anchor="w", padx=5)

        # Tab 2: Student Info (re-use student query)
        student_info_tab = tabview.add(_("🧑‍🎓 Student Info"))
        student_info_scroll_frame = ctk.CTkScrollableFrame(student_info_tab)
        student_info_scroll_frame.pack(fill="both", expand=True, padx=5, pady=5)

        student_query = """
        SELECT id, student_id, first_name, last_name, gender, date_of_birth, address, phone, email, photo_path, created_at, status
        FROM students
        WHERE id = %s
        """
        student_data = self.db.fetch_one(student_query, (payment['student_id'],))

        if student_data:
            student_details_to_show = {
                _("Student ID"): student_data['student_id'],
                _("Name"): f"{student_data['first_name']} {student_data['last_name']}",
                _("Gender"): student_data['gender'],
                _("Date of Birth"): student_data['date_of_birth'],
                _("Address"): student_data['address'],
                _("Phone"): student_data['phone'],
                _("Email"): student_data['email'],
                _("Status"): student_data['status']
            }
            for key, value in student_details_to_show.items():
                frame = ctk.CTkFrame(student_info_scroll_frame, fg_color="transparent")
                frame.pack(fill="x", pady=2, padx=5)
                ctk.CTkLabel(frame, text=_(f"{key}:"), font=ctk.CTkFont(weight="bold")).pack(side="left", anchor="w", padx=5)
                ctk.CTkLabel(frame, text=str(value)).pack(side="left", anchor="w", padx=5)
        else:
            ctk.CTkLabel(student_info_scroll_frame, text=_("Student details not found.")).pack(pady=10)

        # Tab 3: Other Form Payments by Student
        other_form_payments_tab = tabview.add(_("💸 Other Form Payments"))
        other_form_payments_scroll_frame = ctk.CTkScrollableFrame(other_form_payments_tab)
        other_form_payments_scroll_frame.pack(fill="both", expand=True, padx=5, pady=5)

        other_payments_query = """
        SELECT fp.receipt_number, fp.payment_date, fp.amount, fp.status, fp.form_type, fp.payment_method
        FROM form_payments fp
        WHERE fp.student_id = %s AND fp.id != %s
        ORDER BY fp.payment_date DESC
        """
        other_student_form_payments = self.db.fetch_all(other_payments_query, (payment['student_id'], payment['id']))

        if other_student_form_payments:
            for op_data in other_student_form_payments:
                op_amount = Decimal(op_data.get('amount', '0.00'))
                op_info = _(f"Receipt: {op_data['receipt_number']} | Date: {op_data['payment_date']} | "
                           f"Amount: Le {op_amount:,.2f} | Status: {op_data['status']} | Form Type: {op_data['form_type']} | Method: {op_data.get('payment_method') or _('N/A')}")
                ctk.CTkLabel(other_form_payments_scroll_frame, text=op_info, wraplength=400, justify="left").pack(fill="x", pady=2, padx=5)
        else:
            ctk.CTkLabel(other_form_payments_scroll_frame, text=_("No other form payments found for this student.")).pack(pady=10)

        close_button = ctk.CTkButton(detail_window, text=_("Close"), command=detail_window.destroy)
        close_button.pack(pady=10)

    def generate_receipt(self):
        messagebox.showinfo(_("Info"), _("Receipt generation for Graduation Payments is not yet implemented."))
        pass

    def send_balance_reminders(self):
        messagebox.showinfo(_("Info"), _("Balance reminders for Graduation Payments is not yet implemented."))
        pass