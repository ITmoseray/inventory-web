import customtkinter as ctk
from tkinter import messagebox, filedialog
from db.database import DatabaseManager
import os
from datetime import datetime
from utils.i18n import get_translator
from utils.mixins import UndoRedoEntryMixin # Import the mixin

_ = get_translator()

class BackupRestoreWindow(ctk.CTkToplevel):
    def __init__(self, master):
        super().__init__(master)
        self.db_manager = DatabaseManager()
        self.title(_("Database Backup and Restore"))
        self.geometry("500x400")
        self.transient(master) # Make sure it stays on top of the master window
        self.grab_set() # Grab all events until this window is destroyed

        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(0, weight=1)

        main_frame = ctk.CTkFrame(self)
        main_frame.grid(row=0, column=0, padx=20, pady=20, sticky="nsew")
        main_frame.grid_columnconfigure(0, weight=1)

        # Backup Section
        backup_frame = ctk.CTkFrame(main_frame)
        backup_frame.pack(pady=10, padx=10, fill="x")
        ctk.CTkLabel(backup_frame, text=_("💾 Database Backup"), font=ctk.CTkFont(size=16, weight="bold")).pack(pady=5)

        self.backup_path_entry = UndoRedoEntryMixin(backup_frame, placeholder_text=_("Select backup file path..."), width=300)
        self.backup_path_entry.pack(side="left", padx=5, pady=5, expand=True, fill="x")
        self.backup_path_entry.insert(0, os.path.join(os.path.expanduser("~"), f"sms_backup_{datetime.now().strftime('%Y%m%d%H%M%S')}.sql"))

        ctk.CTkButton(backup_frame, text=_("📁 Browse"), command=self._browse_backup_path, fg_color="gray", hover_color="dimgray").pack(side="left", padx=5, pady=5)
        ctk.CTkButton(backup_frame, text=_("🚀 Backup Now"), command=self._perform_backup, fg_color="forestgreen", hover_color="seagreen").pack(side="left", padx=5, pady=5)

        # Restore Section
        restore_frame = ctk.CTkFrame(main_frame)
        restore_frame.pack(pady=10, padx=10, fill="x")
        ctk.CTkLabel(restore_frame, text=_("♻️ Database Restore"), font=ctk.CTkFont(size=16, weight="bold")).pack(pady=5)

        self.restore_path_entry = UndoRedoEntryMixin(restore_frame, placeholder_text=_("Select restore file path..."), width=300)
        self.restore_path_entry.pack(side="left", padx=5, pady=5, expand=True, fill="x")

        ctk.CTkButton(restore_frame, text=_("📂 Browse"), command=self._browse_restore_path, fg_color="gray", hover_color="dimgray").pack(side="left", padx=5, pady=5)
        ctk.CTkButton(restore_frame, text=_("✅ Restore"), command=self._perform_restore, fg_color="firebrick", hover_color="indianred").pack(side="left", padx=5, pady=5)
    
    def _browse_backup_path(self):
        file_path = filedialog.asksaveasfilename(
            defaultextension=".sql",
            filetypes=[(_("SQL files"), "*.sql"), (_("All files"), "*.*")],
            initialfile=f"sms_backup_{datetime.now().strftime('%Y%m%d%H%M%S')}.sql"
        )
        if file_path:
            self.backup_path_entry.delete(0, ctk.END)
            self.backup_path_entry.insert(0, file_path)

    def _perform_backup(self):
        print("Attempting to perform backup...")
        path = self.backup_path_entry.get()
        print(f"Backup path from entry: {path}")
        if not path:
            messagebox.showwarning(_("Backup"), _("Please specify a backup file path."))
            print("Backup failed: No path specified.")
            return

        if self.db_manager.backup_database(path):
            messagebox.showinfo(_("Backup"), _("Database backup successful!"))
            print("Backup process reported success.")
        else:
            messagebox.showerror(_("Backup"), _("Database backup failed. Check console for details."))
            print("Backup process reported failure.")

    def _browse_restore_path(self):
        file_path = filedialog.askopenfilename(
            defaultextension=".sql",
            filetypes=[(_("SQL files"), "*.sql"), (_("All files"), "*.*")]
        )
        if file_path:
            self.restore_path_entry.delete(0, ctk.END)
            self.restore_path_entry.insert(0, file_path)

    def _perform_restore(self):
        path = self.restore_path_entry.get()
        if not path:
            messagebox.showwarning(_("Restore"), _("Please specify a restore file path."))
            return

        if not os.path.exists(path):
            messagebox.showerror(_("Restore"), _("Backup file not found at the specified path."))
            return

        if not messagebox.askyesno(_("Confirm Restore"), _("WARNING: Restoring the database will overwrite all existing data. Are you sure you want to proceed?")):
            return

        if self.db_manager.restore_database(path):
            messagebox.showinfo(_("Restore"), _("Database restore successful! Please restart the application for changes to take full effect."))
        else:
            messagebox.showerror(_("Restore"), _("Database restore failed. Check console for details."))
