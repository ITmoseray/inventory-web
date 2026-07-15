import customtkinter as ctk
from db.user_queries import get_pending_users, approve_user, disapprove_user, delete_user
from tkinter import messagebox
from ui.tooltip import Tooltip
from utils.i18n import get_translator

_ = get_translator()

class AdminApprovalWindow(ctk.CTkToplevel):
    def __init__(self, master=None):
        super().__init__(master)
        self.title(_("User Approvals"))
        self.geometry("450x400") # Increased height to accommodate new buttons
        self.transient(master)  # Make it appear on top of the master window
        self.grab_set()  # Make it modal

        self.pending_users = []
        self.selected_user_id = None

        self.create_widgets()
        self.load_pending_users()

    def create_widgets(self):
        self.label = ctk.CTkLabel(self, text=_("⏳ Pending Users for Approval:"))
        self.label.pack(pady=10)

        self.user_listbox = ctk.CTkComboBox(self, values=[], command=self.on_user_select)
        self.user_listbox.pack(pady=5, padx=20, fill="x")
        self.user_listbox.set(_("Select a user"))

        self.approve_button = ctk.CTkButton(self, text=_("✅ Approve Selected User"), command=self.approve_selected_user_action, fg_color="forestgreen", hover_color="seagreen")
        self.approve_button.pack(pady=5)
        Tooltip(self.approve_button, _("Grant the selected user access to the system"))
        self.approve_button.configure(state="disabled")

        self.disapprove_button = ctk.CTkButton(self, text=_("🚫 Disapprove Selected User"), command=self.disapprove_selected_user_action, fg_color="orange", hover_color="darkorange")
        self.disapprove_button.pack(pady=5)
        Tooltip(self.disapprove_button, _("Deny the selected user access (can be approved later)"))
        self.disapprove_button.configure(state="disabled")

        self.delete_button = ctk.CTkButton(self, text=_("🗑️ Delete Selected User"), command=self.delete_selected_user_action, fg_color="firebrick", hover_color="indianred")
        self.delete_button.pack(pady=5)
        Tooltip(self.delete_button, _("Permanently delete the selected user registration"))
        self.delete_button.configure(state="disabled")

        self.refresh_button = ctk.CTkButton(self, text=_("🔄 Refresh List"), command=self.load_pending_users, fg_color="gray", hover_color="dimgray")
        self.refresh_button.pack(pady=10)
        Tooltip(self.refresh_button, _("Reload the list of pending users"))

    def set_action_buttons_state(self, state):
        self.approve_button.configure(state=state)
        self.disapprove_button.configure(state=state)
        self.delete_button.configure(state=state)

    def load_pending_users(self):
        self.pending_users = get_pending_users()
        if self.pending_users:
            user_display_names = [f"{user['username']} (ID: {user['id']})" for user in self.pending_users]
            self.user_listbox.configure(values=user_display_names)
            self.user_listbox.set(_("Select a user"))
            self.set_action_buttons_state("disabled")
        else:
            self.user_listbox.configure(values=[_("No pending users")])
            self.user_listbox.set(_("No pending users"))
            self.set_action_buttons_state("disabled")
        self.selected_user_id = None

    def on_user_select(self, selection):
        if "No pending users" in selection or "Select a user" in selection:
            self.selected_user_id = None
            self.set_action_buttons_state("disabled")
        else:
            try:
                user_id_str = selection.split("(ID: ")[1].split(")")[0]
                self.selected_user_id = int(user_id_str)
                self.set_action_buttons_state("normal")
            except (IndexError, ValueError) as e:
                print(f"Error parsing user ID from selection: {selection} - {e}")
                self.selected_user_id = None
                self.set_action_buttons_state("disabled")

    def approve_selected_user_action(self):
        if self.selected_user_id:
            try:
                approve_user(self.selected_user_id)
                messagebox.showinfo(_("Success"), _(f"User ID {self.selected_user_id} approved successfully!"))
                self.load_pending_users()
            except Exception as e:
                messagebox.showerror(_("Error"), _(f"Failed to approve user: {e}"))
        else:
            messagebox.showwarning(_("Warning"), _("Please select a user to approve."))

    def disapprove_selected_user_action(self):
        if self.selected_user_id:
            if messagebox.askyesno(_("Confirm Disapproval"), _(f"Are you sure you want to disapprove User ID {self.selected_user_id}?")):
                try:
                    disapprove_user(self.selected_user_id)
                    messagebox.showinfo(_("Success"), _(f"User ID {self.selected_user_id} disapproved successfully!"))
                    self.load_pending_users()
                except Exception as e:
                    messagebox.showerror(_("Error"), _(f"Failed to disapprove user: {e}"))
        else:
            messagebox.showwarning(_("Warning"), _("Please select a user to disapprove."))

    def delete_selected_user_action(self):
        if self.selected_user_id:
            if messagebox.askyesno(_("Confirm Deletion"), _(f"Are you sure you want to DELETE User ID {self.selected_user_id}? This action cannot be undone.")):
                try:
                    delete_user(self.selected_user_id)
                    messagebox.showinfo(_("Success"), _(f"User ID {self.selected_user_id} deleted successfully!"))
                    self.load_pending_users()
                except Exception as e:
                    messagebox.showerror(_("Error"), _(f"Failed to delete user: {e}"))
        else:
            messagebox.showwarning(_("Warning"), _("Please select a user to delete."))

    def close_window(self):
        self.grab_release()
        self.destroy()

# Example usage (for testing purposes, if run directly)
if __name__ == "__main__":
    app = ctk.CTk()
    app.geometry("500x400")
    app.title(_("Main App"))

    def open_admin_approval():
        admin_window = AdminApprovalWindow(app)
        admin_window.wait_window()

    open_button = ctk.CTkButton(app, text=_("Open Admin Approval"), command=open_admin_approval)
    open_button.pack(pady=20)

    app.mainloop()