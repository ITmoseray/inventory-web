import customtkinter
from tkinter import Menu
from utils.i18n import get_translator

_ = get_translator()

class UndoRedoEntryMixin(customtkinter.CTkEntry):
    def __init__(self, master=None, **kwargs):
        super().__init__(master, **kwargs)
        self.undo_stack = [""]  # Stores previous states of the text
        self.redo_stack = []    # Stores undone states for reapplication
        self._current_text = "" # To track changes more accurately

        # Bind key events to capture changes and trigger undo/redo
        self.bind("<KeyRelease>", self._on_key_release)
        self.bind("<Control-z>", self._undo_action)
        self.bind("<Control-y>", self._redo_action)
        self.bind("<Control-Z>", self._undo_action) # For some systems/keyboards
        self.bind("<Control-Y>", self._redo_action) # For some systems/keyboards
        self.bind("<<Undo>>", self._undo_action) # For context menu
        self.bind("<<Redo>>", self._redo_action) # For context menu

        self._setup_context_menu()

    def _on_key_release(self, event=None):
        current_text = self.get()
        if current_text != self._current_text:
            # Only add to undo stack if the text has actually changed
            if not self.undo_stack or self.undo_stack[-1] != self._current_text:
                self.undo_stack.append(self._current_text)
            self._current_text = current_text
            self.redo_stack.clear() # Clear redo stack on new input

    def _undo_action(self, event=None):
        if self.undo_stack:
            # Save current state to redo stack before undoing
            if self._current_text != self.undo_stack[-1]: # Avoid adding duplicate if no new input
                self.redo_stack.append(self._current_text)
            
            # Pop the last state from undo stack and set it
            previous_text = self.undo_stack.pop()
            self.delete(0, customtkinter.END)
            self.insert(0, previous_text)
            self._current_text = previous_text # Update current_text tracker
        return "break" # Prevent default Ctrl+Z behavior

    def _redo_action(self, event=None):
        if self.redo_stack:
            # Save current state to undo stack before redoing
            self.undo_stack.append(self._current_text)
            
            # Pop the last state from redo stack and set it
            next_text = self.redo_stack.pop()
            self.delete(0, customtkinter.END)
            self.insert(0, next_text)
            self._current_text = next_text # Update current_text tracker
        return "break" # Prevent default Ctrl+Y behavior

    def _setup_context_menu(self):
        context_menu = Menu(self, tearoff=0)
        context_menu.add_command(label=_("Undo"), command=lambda: self.event_generate("<<Undo>>"))
        context_menu.add_command(label=_("Redo"), command=lambda: self.event_generate("<<Redo>>"))
        context_menu.add_separator()
        context_menu.add_command(label=_("Cut"), command=lambda: self.event_generate("<<Cut>>"))
        context_menu.add_command(label=_("Copy"), command=lambda: self.event_generate("<<Copy>>"))
        context_menu.add_command(label=_("Paste"), command=lambda: self.event_generate("<<Paste>>"))
        
        self.bind("<Button-3>", lambda event: context_menu.post(event.x_root, event.y_root))

class UndoRedoTextboxMixin(customtkinter.CTkTextbox):
    def __init__(self, master=None, **kwargs):
        super().__init__(master, undo=True, **kwargs) # Enable native undo for Textbox
        self._setup_context_menu()

    def _setup_context_menu(self):
        context_menu = Menu(self, tearoff=0)
        context_menu.add_command(label=_("Undo"), command=lambda: self.edit_undo())
        context_menu.add_command(label=_("Redo"), command=lambda: self.edit_redo())
        context_menu.add_separator()
        context_menu.add_command(label=_("Cut"), command=lambda: self.event_generate("<<Cut>>"))
        context_menu.add_command(label=_("Copy"), command=lambda: self.event_generate("<<Copy>>"))
        context_menu.add_command(label=_("Paste"), command=lambda: self.event_generate("<<Paste>>"))
        
        self.bind("<Button-3>", lambda event: context_menu.post(event.x_root, event.y_root))
