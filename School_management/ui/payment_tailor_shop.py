import customtkinter as ctk
from tkinter import messagebox, Menu, filedialog
from datetime import datetime
import pandas as pd
import os
from db import tailor_shop_queries
from db.database import DatabaseManager
from ui.tooltip import Tooltip
from utils.i18n import get_translator
from utils.mixins import UndoRedoEntryMixin
from decimal import Decimal, InvalidOperation
from utils.pdf_generator import generate_tailoring_receipt_pdf

_ = get_translator()

class TailorShopDetailWindow(ctk.CTkToplevel):
    def __init__(self, master, payment_details, db):
        super().__init__(master)
        self.title(_("Tailoring Fee Details"))
        self.geometry("700x600")
        self.transient(master)
        self.grab_set()

        self.payment_details = payment_details
        self.db = db
        self.create_widgets()

    def create_widgets(self):
        main_display_frame = ctk.CTkFrame(self)
        main_display_frame.pack(fill="both", expand=True, padx=20, pady=20)

        tabview = ctk.CTkTabview(main_display_frame)
        tabview.pack(fill="both", expand=True, pady=10)

        # Tab 1: Payment Details
        payment_tab = tabview.add(_("🧾 Payment Info"))
        payment_scroll = ctk.CTkScrollableFrame(payment_tab)
        payment_scroll.pack(fill="both", expand=True, padx=5, pady=5)

        info_labels = [
            (_("Receipt Number"), self.payment_details['receipt_number']),
            (_("Student ID"), self.payment_details['student_unique_id']),
            (_("Student Name"), f"{self.payment_details['first_name']} {self.payment_details['last_name']}"),
            (_("Fee Period"), self.payment_details['item_type']),
            (_("Amount"), f"Le {self.payment_details['amount']:,.2f}"),
            (_("Payment Date"), self.payment_details['payment_date']),
            (_("Status"), self.payment_details['status']),
            (_("Recorded At"), self.payment_details['created_at'].strftime("%Y-%m-%d %H:%M:%S") if self.payment_details.get('created_at') else "N/A")
        ]

        for label_text, value_text in info_labels:
            frame = ctk.CTkFrame(payment_scroll, fg_color="transparent")
            frame.pack(fill="x", pady=2)
            ctk.CTkLabel(frame, text=f"➡️ {label_text}:", width=150, anchor="w", font=ctk.CTkFont(weight="bold")).pack(side="left", padx=5)
            ctk.CTkLabel(frame, text=str(value_text), anchor="w").pack(side="left", fill="x", expand=True, padx=5)

        # Tab 2: Payment History
        history_tab = tabview.add(_("⏳ Student History"))
        history_scroll = ctk.CTkScrollableFrame(history_tab)
        history_scroll.pack(fill="both", expand=True, padx=5, pady=5)

        history = tailor_shop_queries.get_tailor_payments_by_student_id(self.payment_details['student_id'])
        if history:
            for p in history:
                p_info = f"Receipt: {p['receipt_number']} | Period: {p['item_type']} | Amount: Le {p['amount']:,.2f} | Date: {p['payment_date']}"
                ctk.CTkLabel(history_scroll, text=p_info, wraplength=500, justify="left").pack(fill="x", pady=2, padx=5)
        else:
            ctk.CTkLabel(history_scroll, text=_("No other tailoring fee records found.")).pack(pady=10)

        close_button = ctk.CTkButton(self, text=_("Close"), command=self.destroy, fg_color="firebrick", hover_color="indianred")
        close_button.pack(pady=10)

class TailorShopWindow(ctk.CTkFrame):
    def __init__(self, parent_frame, db):
        super().__init__(parent_frame)
        self.parent_frame = parent_frame
        self.db = db
        self.students = []
        self.student_map = {}
        self.current_payment_id = None
        self.student_combobox_widget = None
        self.row_colors = ["#2b2b2b", "#212121"]

    def show(self):
        for widget in self.parent_frame.winfo_children():
            widget.destroy()
        
        self.pack(fill="both", expand=True)
        self.create_widgets()
        self.load_students()
        self.load_payments()

    def create_widgets(self):
        container = ctk.CTkFrame(self)
        container.pack(fill="both", expand=True, padx=10, pady=10)

        title = ctk.CTkLabel(container, text=_("🧵 Tailoring Fee Management"),
                           font=ctk.CTkFont(size=24, weight="bold"))
        title.pack(pady=10)

        # Form Section
        form_wrapper = ctk.CTkFrame(container)
        form_wrapper.pack(side="top", fill="x", padx=5, pady=5)
        self.create_form_entry_section(form_wrapper)

        # Search and Filter Section
        search_frame = ctk.CTkFrame(container, fg_color="transparent")
        search_frame.pack(fill="x", padx=10, pady=5)
        
        ctk.CTkLabel(search_frame, text=_("🔍 Search (Receipt/Name):")).pack(side="left", padx=5)
        self.search_entry = ctk.CTkEntry(search_frame, placeholder_text=_("Type to search..."))
        self.search_entry.pack(side="left", fill="x", expand=True, padx=5)
        self.search_entry.bind("<KeyRelease>", lambda e: self.load_payments())

        # List Section
        list_wrapper = ctk.CTkFrame(container)
        list_wrapper.pack(side="bottom", fill="both", expand=True, padx=5, pady=5)
        
        total_frame = ctk.CTkFrame(list_wrapper, fg_color="gray14")
        total_frame.pack(fill="x", padx=10, pady=(10, 0))
        self.total_label = ctk.CTkLabel(total_frame, text=_("Total Fees Collected: ..."),
                                                     font=ctk.CTkFont(size=18, weight="bold"))
        self.total_label.pack(pady=5)

        self.payments_frame = ctk.CTkScrollableFrame(list_wrapper)
        self.payments_frame.pack(fill="both", expand=True, padx=10, pady=10)

    def load_students(self):
        try:
            query = "SELECT id, student_id, first_name, last_name FROM students"
            students_data = self.db.fetch_all(query)
            self.students = [f"{s['student_id']} - {s['last_name']}, {s['first_name']}" for s in students_data]
            self.student_map = {f"{s['student_id']} - {s['last_name']}, {s['first_name']}": s['id'] for s in students_data}
            
            self.student_combobox_widget.configure(values=self.students)
            if self.students:
                self.entries['student_var'].set(self.students[0])
            else:
                self.entries['student_var'].set(_("No Students Available"))
        except Exception as e:
            messagebox.showerror(_("Error"), _(f"Failed to load students: {str(e)}"))

    def create_form_entry_section(self, parent):
        form_title = ctk.CTkLabel(parent, text=_("📝 Record Monthly Fee"), 
                                font=ctk.CTkFont(size=18, weight="bold"))
        form_title.pack(pady=10)

        months = [_("January"), _("February"), _("March"), _("April"), _("May"), _("June"), 
                  _("July"), _("August"), _("September"), _("October"), _("November"), _("December")]
        years = [str(y) for y in range(datetime.now().year - 2, datetime.now().year + 5)]
        
        current_month = months[datetime.now().month - 1]
        current_year = str(datetime.now().year)

        fields_info = [
            (_("Student"), "student_var", "combobox", []),
            (_("Month"), "month_var", "combobox", months),
            (_("Year"), "year_var", "combobox", years),
            (_("Amount (Le)"), "amount_entry", "entry", []),
            (_("Payment Date"), "payment_date_entry", "entry", []),
            (_("Status"), "status_var", "combobox", [_("Paid"), _("Pending"), _("Waived")]),
        ]

        self.entries = {}
        for field_name, attr_name, widget_type, options in fields_info:
            frame = ctk.CTkFrame(parent)
            frame.pack(fill="x", padx=20, pady=2)

            label = ctk.CTkLabel(frame, text=f"➡️ {field_name}:", width=150, anchor="w")
            label.pack(side="left", padx=5)

            if widget_type == "combobox":
                default_val = options[0] if options else ""
                if attr_name == "month_var": default_val = current_month
                if attr_name == "year_var": default_val = current_year
                
                self.entries[attr_name] = ctk.StringVar(value=default_val)
                combobox = ctk.CTkComboBox(frame, variable=self.entries[attr_name], values=options)
                if attr_name == "student_var":
                    self.student_combobox_widget = combobox
                combobox.pack(side="left", fill="x", expand=True, padx=5)
            else:
                entry_widget = UndoRedoEntryMixin(frame)
                if attr_name == "payment_date_entry":
                    entry_widget.insert(0, datetime.now().strftime("%Y-%m-%d"))
                
                entry_widget.pack(side="left", fill="x", expand=True, padx=5)
                self.entries[attr_name] = entry_widget

        button_frame = ctk.CTkFrame(parent)
        button_frame.pack(pady=15)

        buttons_info = [
            (_("➕ Add"), self.add_payment_action, _("Record a new monthly fee"), "forestgreen", "seagreen"),
            (_("📝 Update"), self.update_payment_action, _("Update the selected record"), "royalblue", "cornflowerblue"),
            (_("🧹 Clear"), self.clear_form, _("Clear all fields"), "gray", "dimgray"),
            (_("🧾 Receipt"), self.generate_receipt, _("Generate PDF receipt"), "purple", "darkorchid"),
        ]

        for text, command, tooltip_text, fg_color, hover_color in buttons_info:
            button = ctk.CTkButton(button_frame, text=text, command=command, fg_color=fg_color, hover_color=hover_color)
            button.pack(side="left", padx=5)
            Tooltip(button, tooltip_text)

    def add_payment_action(self):
        try:
            student_display_name = self.entries['student_var'].get()
            student_id = self.student_map.get(student_display_name)
            if not student_id:
                messagebox.showerror(_("Error"), _("Please select a student."))
                return

            month = self.entries['month_var'].get()
            year = self.entries['year_var'].get()
            item_type = f"{month} {year}"
            measurement = "Monthly Fee"
            amount = self.entries['amount_entry'].get()
            payment_date = self.entries['payment_date_entry'].get()
            receipt_number = f"TF-{datetime.now().strftime('%Y%m%d%H%M%S')}"
            status = self.entries['status_var'].get()

            if not all([month, year, amount, payment_date]):
                messagebox.showerror(_("Error"), _("Please fill all required fields."))
                return

            try:
                amount_decimal = Decimal(amount)
            except InvalidOperation:
                messagebox.showerror(_("Error"), _("Invalid amount format."))
                return
            
            tailor_shop_queries.add_tailor_payment(
                student_id, item_type, measurement, amount_decimal, payment_date, status, receipt_number
            )
            messagebox.showinfo(_("Success"), _("Fee record added successfully!"))
            self.clear_form()
            self.load_payments()
        except Exception as e:
            messagebox.showerror(_("Error"), _(f"Failed to add record: {str(e)}"))

    def update_payment_action(self):
        if not self.current_payment_id:
            messagebox.showerror(_("Error"), _("Please select a record to update."))
            return

        try:
            student_display_name = self.entries['student_var'].get()
            student_id = self.student_map.get(student_display_name)
            month = self.entries['month_var'].get()
            year = self.entries['year_var'].get()
            item_type = f"{month} {year}"
            amount = self.entries['amount_entry'].get()
            payment_date = self.entries['payment_date_entry'].get()
            status = self.entries['status_var'].get()

            try:
                amount_decimal = Decimal(amount)
            except InvalidOperation:
                messagebox.showerror(_("Error"), _("Invalid amount format."))
                return

            # Keep existing receipt number
            current_p = tailor_shop_queries.get_tailor_payment_by_id(self.current_payment_id)
            receipt_number = current_p['receipt_number']

            tailor_shop_queries.update_tailor_payment(
                self.current_payment_id, student_id, item_type, "Monthly Fee", amount_decimal, 
                payment_date, receipt_number, status
            )
            messagebox.showinfo(_("Success"), _("Record updated successfully!"))
            self.clear_form()
            self.load_payments()
        except Exception as e:
            messagebox.showerror(_("Error"), _(f"Failed to update record: {str(e)}"))

    def delete_payment_action(self, payment_id):
        if messagebox.askyesno(_("Confirm"), _("Are you sure you want to delete this record?")):
            try:
                tailor_shop_queries.delete_tailor_payment(payment_id)
                messagebox.showinfo(_("Success"), _("Record deleted successfully!"))
                self.load_payments()
            except Exception as e:
                messagebox.showerror(_("Error"), _(f"Failed to delete record: {str(e)}"))

    def clear_form(self):
        self.current_payment_id = None
        if self.students:
            self.entries['student_var'].set(self.students[0])
        
        self.entries['month_var'].set(_(datetime.now().strftime("%B")))
        self.entries['year_var'].set(str(datetime.now().year))
        self.entries['amount_entry'].delete(0, ctk.END)
        self.entries['payment_date_entry'].delete(0, ctk.END)
        self.entries['payment_date_entry'].insert(0, datetime.now().strftime("%Y-%m-%d"))
        self.entries['status_var'].set(_("Paid"))

    def load_payments(self):
        search_term = self.search_entry.get().lower()
        
        try:
            total = tailor_shop_queries.get_total_tailor_payments()
            self.total_label.configure(text=_(f"Total Fees Collected: Le {total:,.2f}"))
        except Exception:
            self.total_label.configure(text=_("Total Fees Collected: Error"))

        for widget in self.payments_frame.winfo_children():
            widget.destroy()

        try:
            payments = tailor_shop_queries.get_all_tailor_payments()
            filtered_payments = [
                p for p in payments 
                if search_term in p['receipt_number'].lower() or 
                   search_term in p['first_name'].lower() or 
                   search_term in p['last_name'].lower()
            ]

            for i, payment in enumerate(filtered_payments):
                bg_color = self.row_colors[i % 2]
                frame = ctk.CTkFrame(self.payments_frame, fg_color=bg_color, corner_radius=5)
                frame.pack(fill="x", padx=5, pady=2)

                hover_color = "#3a3a3a"
                frame.bind("<Enter>", lambda event, f=frame: f.configure(fg_color=hover_color))
                frame.bind("<Leave>", lambda event, f=frame, original_color=bg_color: f.configure(fg_color=original_color))

                info_text = (f"{payment['receipt_number']} | "
                            f"{payment['last_name']}, {payment['first_name']} | "
                            f"{payment['item_type']} | "
                            f"Le {payment['amount']:,.2f} | "
                            f"{payment['status']}")
                
                label = ctk.CTkLabel(frame, text=info_text, anchor="w")
                label.pack(side="left", fill="x", expand=True, padx=10, pady=5)
                
                label.bind("<Double-Button-1>", lambda event, p=payment: self.show_details(p))
                label.bind("<Button-3>", lambda event, p=payment: self.show_context_menu(event, p))

        except Exception as e:
            messagebox.showerror(_("Error"), _(f"Failed to load records: {str(e)}"))

    def show_details(self, payment):
        details_window = TailorShopDetailWindow(self, payment, self.db)
        details_window.grab_set()

    def show_context_menu(self, event, payment):
        menu = Menu(self, tearoff=0)
        menu.add_command(label=_("Edit"), command=lambda: self.load_payment_for_edit(payment))
        menu.add_command(label=_("Generate Receipt"), command=lambda: self.generate_receipt(payment))
        menu.add_command(label=_("Delete"), command=lambda: self.delete_payment_action(payment['id']))
        menu.tk_popup(event.x_root, event.y_root)

    def load_payment_for_edit(self, payment):
        self.current_payment_id = payment['id']
        
        student_display_name = f"{payment['student_unique_id']} - {payment['last_name']}, {payment['first_name']}"
        if student_display_name in self.students:
            self.entries['student_var'].set(student_display_name)

        parts = payment['item_type'].split(" ")
        if len(parts) == 2:
            self.entries['month_var'].set(parts[0])
            self.entries['year_var'].set(parts[1])

        self.entries['amount_entry'].delete(0, ctk.END)
        self.entries['amount_entry'].insert(0, f"{payment['amount']:.2f}")
        self.entries['payment_date_entry'].delete(0, ctk.END)
        self.entries['payment_date_entry'].insert(0, payment['payment_date'])
        self.entries['status_var'].set(payment['status'])

    def generate_receipt(self, payment=None):
        target_payment = payment
        if not target_payment:
            if not self.current_payment_id:
                messagebox.showerror(_("Error"), _("Please select a record or click Add first."))
                return
            target_payment = tailor_shop_queries.get_tailor_payment_by_id(self.current_payment_id)

        try:
            file_path = filedialog.asksaveasfilename(
                defaultextension=".pdf",
                filetypes=[(_("PDF files"), "*.pdf")],
                initialfile=f"TailoringReceipt_{target_payment['receipt_number']}.pdf"
            )
            
            if not file_path: return

            student_details = {
                'student_id': target_payment['student_unique_id'],
                'first_name': target_payment['first_name'],
                'last_name': target_payment['last_name'],
            }

            pdf_path = generate_tailoring_receipt_pdf(
                target_payment, 
                student_details, 
                target_payment['item_type'],
                output_path=os.path.dirname(file_path)
            )

            if pdf_path:
                messagebox.showinfo(_("Success"), _(f"Receipt saved to:\n{pdf_path}"))
            else:
                messagebox.showerror(_("Error"), _("Failed to generate PDF."))
        except Exception as e:
            messagebox.showerror(_("Error"), _(f"Failed to generate receipt: {str(e)}"))
