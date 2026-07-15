import customtkinter as ctk
from tkinter import messagebox
from plugins.base_plugin import BasePlugin

class MyFirstPlugin(BasePlugin):
    def __init__(self):
        super().__init__()
        self.app_instance = None

    def initialize(self, app_instance):
        self.app_instance = app_instance
        print("MyFirstPlugin initialized!")

    def get_name(self):
        return "My First Plugin"

    def get_menu_items(self):
        return [
            ("👋 Say Hello", self._say_hello),
            ("📝 Show Info", self._show_info)
        ]

    def _say_hello(self):
        messagebox.showinfo(self.get_name(), "Hello from My First Plugin!")

    def _show_info(self):
        if self.app_instance:
            messagebox.showinfo(self.get_name(), f"App Title: {self.app_instance.window.title()}\nUser: {self.app_instance.user['username']}")
        else:
            messagebox.showinfo(self.get_name(), "Application instance not available.")
