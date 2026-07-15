import customtkinter as ctk
from tkinter import messagebox
from datetime import datetime
from decimal import Decimal, InvalidOperation
from db import petty_cash_queries as pcq
from ui.tooltip import Tooltip
from utils.i18n import get_translator
from utils.mixins import UndoRedoEntryMixin

_ = get_translator()

class PettyCashIncomeWindow(ctk.CTkToplevel):
    def __init__(self, master, db, user, parent_load_transactions_callback=None):
        super().__init__(master)
        self.title(_("Add Petty Cash Income"))
        self.geometry("400x350")
        self.transient(master)
        self.grab_set() # Make modal
        self.lift()
        self.focus_force()

        self.db = db
        self.user = user
        self.parent_load_transactions_callback = parent_load_transactions_callback

        self.create_widgets()

    def create_widgets(self):
        title = ctk.CTkLabel(self, text=_("💰 Add Petty Cash Income"),
                           font=ctk.CTkFont(size=20, weight="bold"))
        title.pack(pady=10)

        # Form fields
        fields_info = [
            (_("Amount (Le)"), "amount_entry"),
            (_("Description"), "description_entry"),
            (_("Authorized By"), "authorized_by_entry"),
        ]

        self.entries = {}
        for field_name, attr_name in fields_info:
            frame = ctk.CTkFrame(self, fg_color="transparent")
            frame.pack(fill="x", padx=20, pady=5)

            label = ctk.CTkLabel(frame, text=field_name + ":", width=120, anchor="w")
            label.pack(side="left", padx=5)

            entry_widget = UndoRedoEntryMixin(frame)
            if attr_name == "authorized_by_entry":
                entry_widget.insert(0, self.user.get('username', ''))
            entry_widget.pack(side="left", fill="x", expand=True, padx=5)
            self.entries[attr_name] = entry_widget
        
        # Action Buttons
        button_frame = ctk.CTkFrame(self, fg_color="transparent")
        button_frame.pack(pady=20)
        
        add_button = ctk.CTkButton(button_frame, text=_("Add Income"), command=self.add_income, fg_color="green")
        add_button.pack(side="left", padx=10)
        Tooltip(add_button, _("Add income to the petty cash fund."))

        cancel_button = ctk.CTkButton(button_frame, text=_("Cancel"), command=self.destroy, fg_color="gray")
        cancel_button.pack(side="left", padx=10)
        Tooltip(cancel_button, _("Cancel and close this window."))

    def add_income(self):
        try:
            amount_str = self.entries['amount_entry'].get()
            description = self.entries['description_entry'].get()
            authorized_by = self.entries['authorized_by_entry'].get()
            trans_date = datetime.now().strftime("%Y-%m-%d")

            if not all([amount_str, description]):
                messagebox.showerror(_("Error"), _("Amount and Description are required."))
                return

            try:
                amount_decimal = Decimal(amount_str)
            except InvalidOperation:
                messagebox.showerror(_("Error"), _("Invalid amount. Please enter a valid number."))
                return
                
            if amount_decimal <= 0:
                messagebox.showerror(_("Error"), _("Amount must be a positive number for income."))
                return

            success = pcq.add_petty_cash_transaction(
                transaction_date=trans_date,
                description=description,
                amount=amount_decimal,
                transaction_type='Income',
                authorized_by=authorized_by
            )

            if success:
                messagebox.showinfo(_("Success"), _("Income added successfully to Petty Cash!"))
                if self.parent_load_transactions_callback:
                    self.parent_load_transactions_callback() # Refresh parent's transaction list
                self.destroy()
            else:
                messagebox.showerror(_("Database Error"), _("Failed to add income transaction to the database."))

        except Exception as e:
            messagebox.showerror(_("Error"), _(f"Failed to add income: {str(e)}"))
