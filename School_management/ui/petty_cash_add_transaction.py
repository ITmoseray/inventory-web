import customtkinter as ctk
from tkinter import messagebox
from datetime import datetime
from decimal import Decimal, InvalidOperation
from db import petty_cash_queries as pcq
from ui.tooltip import Tooltip
from utils.i18n import get_translator
from utils.mixins import UndoRedoEntryMixin

_ = get_translator()

class PettyCashAddTransactionWindow(ctk.CTkToplevel):
    def __init__(self, master, db, user, on_transaction_added=None):
        super().__init__(master)
        self.title(_("Add Petty Cash Transaction"))
        self.geometry("500x400")
        self.transient(master) # Make it transient to the main petty cash window
        self.grab_set() # Make it modal

        self.db = db
        self.user = user
        self.on_transaction_added = on_transaction_added # Callback function

        self.create_widgets()

    def create_widgets(self):
        form_title = ctk.CTkLabel(self, text=_("New Petty Cash Transaction"),
                                font=ctk.CTkFont(size=20, weight="bold"))
        form_title.pack(pady=10)

        fields_info = [
            (_("Description"), "description_entry", "entry"),
            (_("Amount (Le)"), "amount_entry", "entry"),
            (_("Transaction Type"), "type_var", "combobox"),
            (_("Authorized By"), "authorized_by_entry", "entry"),
        ]

        self.entries = {}
        for field_name, attr_name, widget_type in fields_info:
            frame = ctk.CTkFrame(self, fg_color="transparent")
            frame.pack(fill="x", padx=20, pady=5)

            label = ctk.CTkLabel(frame, text=field_name + ":", width=120, anchor="w")
            label.pack(side="left", padx=5)

            if widget_type == "combobox":
                self.entries[attr_name] = ctk.StringVar(value=_("Expense"))
                combobox = ctk.CTkComboBox(frame, variable=self.entries[attr_name], values=[_("Expense"), _("Income")])
                combobox.pack(side="left", fill="x", expand=True, padx=5)
            else:
                entry_widget = UndoRedoEntryMixin(frame)
                if attr_name == "authorized_by_entry":
                    entry_widget.insert(0, self.user.get('username', ''))
                entry_widget.pack(side="left", fill="x", expand=True, padx=5)
                self.entries[attr_name] = entry_widget
        
        button_frame = ctk.CTkFrame(self, fg_color="transparent")
        button_frame.pack(pady=20)

        add_button = ctk.CTkButton(button_frame, text=_("Add Transaction"), command=self.add_transaction)
        add_button.pack(side="left", padx=10)
        Tooltip(add_button, _("Add the new petty cash transaction."))

        cancel_button = ctk.CTkButton(button_frame, text=_("Cancel"), command=self.destroy, fg_color="gray")
        cancel_button.pack(side="left", padx=10)
        Tooltip(cancel_button, _("Cancel and close this window."))

    def add_transaction(self):
        try:
            description = self.entries['description_entry'].get()
            amount_str = self.entries['amount_entry'].get()
            trans_type = self.entries['type_var'].get()
            authorized_by = self.entries['authorized_by_entry'].get()
            trans_date = datetime.now().strftime("%Y-%m-%d")

            if not all([description, amount_str]):
                messagebox.showerror(_("Error"), _("Description and Amount are required."))
                return

            try:
                amount_decimal = Decimal(amount_str)
            except InvalidOperation:
                messagebox.showerror(_("Error"), _("Invalid amount. Please enter a valid number."))
                return

            if amount_decimal <= 0:
                messagebox.showerror(_("Error"), _("Amount must be a positive number."))
                return

            success = pcq.add_petty_cash_transaction(
                transaction_date=trans_date,
                description=description,
                amount=amount_decimal,
                transaction_type=trans_type,
                authorized_by=authorized_by
            )

            if success:
                messagebox.showinfo(_("Success"), _(f"{trans_type} transaction added successfully!"))
                if self.on_transaction_added:
                    self.on_transaction_added() # Call the callback to refresh the main window
                self.destroy() # Close the add transaction window
            else:
                messagebox.showerror(_("Database Error"), _("Failed to add transaction to the database."))

        except Exception as e:
            messagebox.showerror(_("Error"), _(f"Failed to add transaction: {str(e)}"))