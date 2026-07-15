import customtkinter as ctk
from tkinter import messagebox, Menu
from datetime import datetime
from decimal import Decimal, InvalidOperation
from db import petty_cash_queries as pcq
from ui.tooltip import Tooltip
from ui.petty_cash_add_transaction import PettyCashAddTransactionWindow
from utils.i18n import get_translator
from utils.mixins import UndoRedoEntryMixin

_ = get_translator()

class PettyCashWindow(ctk.CTkFrame):
    def __init__(self, parent_frame, db, user):
        super().__init__(parent_frame)
        self.parent_frame = parent_frame
        self.db = db
        self.user = user
        self.current_transaction_id = None
        self.row_colors = ["#2b2b2b", "#212121"]

    def show(self):
        self.pack(fill="both", expand=True)
        self.create_widgets()
        self.load_transactions()

    def create_widgets(self):
        # Title
        title = ctk.CTkLabel(self, text=_("💰 Petty Cash Management"),
                           font=ctk.CTkFont(size=24, weight="bold"))
        title.pack(pady=10)
        
        # Add New Transaction Button
        add_new_transaction_button = ctk.CTkButton(self, text=_("➕ Add New Transaction"), 
                                                   command=self._open_add_transaction_window,
                                                   fg_color="green", hover_color="darkgreen")
        add_new_transaction_button.pack(pady=5)
        Tooltip(add_new_transaction_button, _("Open a new window to add a single petty cash transaction."))

        # Balance Display
        self.balance_summary_frame = ctk.CTkFrame(self, fg_color="gray14")
        self.balance_summary_frame.pack(fill="x", padx=20, pady=10)
        self.balance_summary_frame.grid_columnconfigure((0, 1, 2), weight=1)

        self.total_income_label = ctk.CTkLabel(self.balance_summary_frame, text=_("Total Income: ..."),
                                                font=ctk.CTkFont(size=16, weight="bold"), text_color="green")
        self.total_income_label.grid(row=0, column=0, padx=10, pady=5)

        self.total_expenses_label = ctk.CTkLabel(self.balance_summary_frame, text=_("Total Expenses: ..."),
                                                  font=ctk.CTkFont(size=16, weight="bold"), text_color="red")
        self.total_expenses_label.grid(row=0, column=1, padx=10, pady=5)
        
        self.balance_label = ctk.CTkLabel(self.balance_summary_frame, text=_("Current Balance: ..."),
                                          font=ctk.CTkFont(size=18, weight="bold"))
        self.balance_label.grid(row=0, column=2, padx=10, pady=5)

        # Form for new transactions
        form_wrapper_frame = ctk.CTkFrame(self)
        form_wrapper_frame.pack(side="top", fill="x", padx=5, pady=5)
        self.create_transaction_form(form_wrapper_frame)

        # List of transactions
        list_wrapper_frame = ctk.CTkFrame(self)
        list_wrapper_frame.pack(side="bottom", fill="both", expand=True, padx=5, pady=5)
        self.create_transaction_list(list_wrapper_frame)

    def create_transaction_form(self, parent):
        form_title = ctk.CTkLabel(parent, text=_("New Transaction"),
                                font=ctk.CTkFont(size=18, weight="bold"))
        form_title.pack(pady=10)

        fields_info = [
            (_("Description"), "description_entry", "entry"),
            (_("Amount (Le)"), "amount_entry", "entry"),
            (_("Transaction Type"), "type_var", "combobox"),
            (_("Authorized By"), "authorized_by_entry", "entry"),
        ]

        self.entries = {}
        for field_name, attr_name, widget_type in fields_info:
            frame = ctk.CTkFrame(parent)
            frame.pack(fill="x", padx=20, pady=5)

            label = ctk.CTkLabel(frame, text=field_name + ":", width=150, anchor="w")
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
        
        # Action Buttons
        button_frame = ctk.CTkFrame(parent)
        button_frame.pack(pady=20)
        
        add_income_button = ctk.CTkButton(button_frame, text=_("Add Income"), command=self.add_income_transaction, fg_color="green")
        add_income_button.pack(side="left", padx=10)
        Tooltip(add_income_button, _("Add funds to the petty cash (e.g., top-up)."))

        add_expense_button = ctk.CTkButton(button_frame, text=_("Add Expense"), command=self.add_expense_transaction, fg_color="red")
        add_expense_button.pack(side="left", padx=10)
        Tooltip(add_expense_button, _("Record an expense paid from petty cash."))

        update_button = ctk.CTkButton(button_frame, text=_("Update Transaction"), command=self.update_transaction, fg_color="royalblue")
        update_button.pack(side="left", padx=10)
        Tooltip(update_button, _("Update the selected transaction."))
        
        clear_button = ctk.CTkButton(button_frame, text=_("Clear"), command=self.clear_form, fg_color="gray")
        clear_button.pack(side="left", padx=10)
        Tooltip(clear_button, _("Clear the form fields."))

    def create_transaction_list(self, parent):
        list_title = ctk.CTkLabel(parent, text=_("Transaction History"),
                                 font=ctk.CTkFont(size=18, weight="bold"))
        list_title.pack(pady=10)

        self.transactions_frame = ctk.CTkScrollableFrame(parent)
        self.transactions_frame.pack(fill="both", expand=True, padx=10, pady=10)

    def add_income_transaction(self):
        self._add_transaction(trans_type="Income")

    def add_expense_transaction(self):
        self._add_transaction(trans_type="Expense")

    def _add_transaction(self, trans_type: str):
        try:
            description = self.entries['description_entry'].get()
            amount_str = self.entries['amount_entry'].get()
            authorized_by = self.entries['authorized_by_entry'].get()
            trans_date = datetime.now().strftime("%Y-%m-%d")

            # Ensure all required fields are present
            if not all([description, amount_str, authorized_by]):
                messagebox.showerror(_("Error"), _("Description, Amount, and Authorized By are required."))
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
                transaction_type=trans_type, # This is provided by the function argument
                authorized_by=authorized_by
            )

            if success:
                messagebox.showinfo(_("Success"), _(f"{trans_type} transaction added successfully!"))
                self.clear_form()
                self.load_transactions()
            else:
                messagebox.showerror(_("Database Error"), _("Failed to add transaction to the database. Check logs for details.")) # Added hint to check logs

        except Exception as e:
            messagebox.showerror(_("Error"), _(f"Failed to add transaction: {str(e)}"))
    
    def update_transaction(self):
        if not self.current_transaction_id:
            messagebox.showerror(_("Error"), _("Please select a transaction to update by right-clicking it and selecting 'Edit' first."))
            return
            
        try:
            description = self.entries['description_entry'].get()
            amount_str = self.entries['amount_entry'].get()
            trans_type = self.entries['type_var'].get()
            authorized_by = self.entries['authorized_by_entry'].get()
            
            # NOTE: For simplicity, we are using the current date for updates.
            # A more complex implementation might involve a date entry widget.
            trans_date = datetime.now().strftime("%Y-%m-%d")

            if not all([description, amount_str, trans_type]):
                messagebox.showerror(_("Error"), _("Description, Amount, and Type are required."))
                return

            try:
                amount_decimal = Decimal(amount_str)
            except InvalidOperation:
                messagebox.showerror(_("Error"), _("Invalid amount. Please enter a valid number."))
                return
                
            if amount_decimal <= 0:
                messagebox.showerror(_("Error"), _("Amount must be a positive number."))
                return

            success = pcq.update_petty_cash_transaction(
                transaction_id=self.current_transaction_id,
                transaction_date=trans_date,
                description=description,
                amount=amount_decimal,
                transaction_type=trans_type,
                authorized_by=authorized_by
            )

            if success:
                messagebox.showinfo(_("Success"), _("Transaction updated successfully!"))
                self.clear_form()
                self.load_transactions()
            else:
                messagebox.showerror(_("Database Error"), _("Failed to update transaction."))

        except Exception as e:
            messagebox.showerror(_("Error"), _(f"Failed to update transaction: {str(e)}"))

    def delete_transaction(self, transaction_id):
        if messagebox.askyesno(_("Confirm Deletion"), _("Are you sure you want to delete this transaction? This action cannot be undone.")):
            try:
                success = pcq.delete_petty_cash_transaction(transaction_id)
                if success:
                    messagebox.showinfo(_("Success"), _("Transaction deleted successfully!"))
                    self.load_transactions()
                else:
                    messagebox.showerror(_("Database Error"), _("Failed to delete the transaction."))
            except Exception as e:
                messagebox.showerror(_("Error"), _(f"Failed to delete transaction: {str(e)}"))


    def clear_form(self):
        self.current_transaction_id = None
        self.entries['description_entry'].delete(0, ctk.END)
        self.entries['amount_entry'].delete(0, ctk.END)
        self.entries['type_var'].set(_("Expense"))
        self.entries['authorized_by_entry'].delete(0, ctk.END)
        self.entries['authorized_by_entry'].insert(0, self.user.get('username', ''))
        # Check if widget exists before setting focus
        if self.entries['description_entry'].winfo_exists():
            self.entries['description_entry'].focus()

    def load_transaction_for_edit(self, transaction):
        """Loads a transaction's data into the form for editing."""
        self.clear_form()
        self.current_transaction_id = transaction['id']

        self.entries['description_entry'].insert(0, transaction.get('description', ''))
        self.entries['amount_entry'].insert(0, str(transaction.get('amount', '0.00')))
        self.entries['type_var'].set(transaction.get('transaction_type', 'Expense'))
        self.entries['authorized_by_entry'].delete(0, ctk.END)
        self.entries['authorized_by_entry'].insert(0, transaction.get('authorized_by', ''))
        
    def load_transactions(self):
        # Update balance summary
        try:
            total_income = pcq.get_total_income()
            total_expenses = pcq.get_total_expenses()
            balance = total_income - total_expenses

            self.total_income_label.configure(text=_(f"Total Income: Le {total_income:,.2f}"))
            self.total_expenses_label.configure(text=_(f"Total Expenses: Le {total_expenses:,.2f}"))
            self.balance_label.configure(text=_(f"Current Balance: Le {balance:,.2f}"))

            if balance < 0:
                self.balance_label.configure(text_color="red")
            else:
                # Use a color that is visible in the theme
                self.balance_label.configure(text_color=ctk.ThemeManager.theme["CTkLabel"]["text_color"])

        except Exception as e:
            self.balance_label.configure(text=_("Current Balance: Error"))
            print(f"Error loading petty cash balance: {e}")

        # Update transaction list
        for widget in self.transactions_frame.winfo_children():
            widget.destroy()

        try:
            transactions = pcq.get_all_petty_cash_transactions()
            for i, trans in enumerate(transactions):
                bg_color = self.row_colors[i % 2]
                frame = ctk.CTkFrame(self.transactions_frame, fg_color=bg_color, corner_radius=5)
                frame.pack(fill="x", padx=5, pady=5)

                amount = Decimal(trans.get('amount', '0.00'))
                trans_type = trans.get('transaction_type')
                
                amount_color = "red" if trans_type == 'Expense' else "green"
                amount_prefix = "-" if trans_type == 'Expense' else "+"
                
                info_text = (f"{trans.get('transaction_date')} - {trans.get('description')} "
                             f"({_(trans_type)}) | {trans.get('authorized_by') or _('N/A')}")
                
                amount_text = f"{amount_prefix} Le {amount:,.2f}"

                info_label = ctk.CTkLabel(frame, text=info_text, anchor="w")
                info_label.pack(side="left", fill="x", expand=True, padx=10, pady=5)

                amount_label = ctk.CTkLabel(frame, text=amount_text, text_color=amount_color, font=ctk.CTkFont(weight="bold"))
                amount_label.pack(side="right", padx=10)
                
                # Right-click context menu
                frame.bind("<Button-3>", lambda event, t=trans: self.show_context_menu(event, t))
                info_label.bind("<Button-3>", lambda event, t=trans: self.show_context_menu(event, t))
                amount_label.bind("<Button-3>", lambda event, t=trans: self.show_context_menu(event, t))

        except Exception as e:
            messagebox.showerror(_("Error"), _(f"Failed to load transactions: {str(e)}"))
            
    def show_context_menu(self, event, transaction):
        context_menu = Menu(self, tearoff=0)
        context_menu.add_command(label=_("Edit"), command=lambda: self.load_transaction_for_edit(transaction))
        context_menu.add_separator()
        context_menu.add_command(label=_("Delete Transaction"), command=lambda: self.delete_transaction(transaction['id']))
        context_menu.tk_popup(event.x_root, event.y_root)

    def _open_add_transaction_window(self):
        """Opens a new top-level window for adding a single petty cash transaction."""
        add_trans_window = PettyCashAddTransactionWindow(
            self.parent_frame, # Master window is the frame where PettyCashWindow itself is placed
            self.db,
            self.user,
            on_transaction_added=self.load_transactions # Callback to refresh list
        )
        add_trans_window.grab_set() # Make it modal
        add_trans_window.wait_window() # Wait for it to close
