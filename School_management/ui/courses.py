import customtkinter as ctk
from tkinter import messagebox, Menu
import pandas as pd
from ui.tooltip import Tooltip
from utils.i18n import get_translator
from utils.mixins import UndoRedoEntryMixin, UndoRedoTextboxMixin # Import the mixins
from db import lecturer_queries # Import lecturer queries
from ui.timetable import TimetableWindow # Import Timetable window

_ = get_translator()

class CoursesWindow:
    def __init__(self, parent_frame, db, user=None):
        self.parent_frame = parent_frame
        self.db = db
        self.user = user
        self.current_course_id = None
        self.lecturers = [] # List to store lecturer names for dropdown
        self.lecturer_map = {} # Dictionary to map lecturer name to lecturer_id

    def show(self):
        # Clear parent frame
        for widget in self.parent_frame.winfo_children():
            widget.destroy()

        # Create main container
        container = ctk.CTkFrame(self.parent_frame)
        container.pack(fill="both", expand=True, padx=10, pady=10)

        # Title
        title = ctk.CTkLabel(container, text=_("📚 Course Management"), 
                           font=ctk.CTkFont(size=24, weight="bold"))
        title.pack(pady=10)

        # Load lecturers (do this before creating the form)
        self.load_lecturers()

        # Create a frame for the form at the top
        form_wrapper_frame = ctk.CTkFrame(container)
        form_wrapper_frame.pack(side="top", fill="both", padx=5, pady=5) # No expand here for the form

        # Create the form inside its wrapper frame
        self.create_course_form(form_wrapper_frame) 

        # Create a frame for the course list at the bottom, expanding to fill remaining space
        list_wrapper_frame = ctk.CTkFrame(container)
        list_wrapper_frame.pack(side="bottom", fill="both", expand=True, padx=5, pady=5) # Expand here for the list

        # Create course list inside its wrapper frame
        self.create_course_list(list_wrapper_frame) 

        # Load courses
        self.load_courses()

    def create_course_form(self, parent):
        # Form title
        form_title = ctk.CTkLabel(parent, text=_("📝 Course Details"), 
                                font=ctk.CTkFont(size=18, weight="bold"))
        form_title.pack(pady=10)

        # Form fields
        fields = [
            (_("Course Name"), "course_name_entry"),
            (_("Course Code"), "course_code_entry"), # New field
            (_("Description"), "description_entry"),
            (_("Duration (Months)"), "duration_entry"),
            (_("Fee (Le)"), "fee_entry")
        ]

        self.entries = {}
        for field_name, attr_name in fields:
            frame = ctk.CTkFrame(parent)
            frame.pack(fill="x", padx=20, pady=5)

            label = ctk.CTkLabel(frame, text=f"➡️ {field_name}:", width=150)
            label.pack(side="left", padx=5)

            if field_name == _("Description"):
                entry = UndoRedoTextboxMixin(frame, height=100) # Use the Textbox mixin
                entry.pack(side="left", fill="x", expand=True, padx=5)
            else:
                entry = UndoRedoEntryMixin(frame) # Use the Entry mixin
                entry.pack(side="left", fill="x", expand=True, padx=5)
            
            self.entries[attr_name] = entry

        # Lecturer dropdown
        lecturer_frame = ctk.CTkFrame(parent)
        lecturer_frame.pack(fill="x", padx=20, pady=5)
        lecturer_label = ctk.CTkLabel(lecturer_frame, text=_("➡️ Assigned Lecturer:"), width=150)
        lecturer_label.pack(side="left", padx=5)
        self.entries['lecturer_var'] = ctk.StringVar(value=_("Select Lecturer"))
        lecturer_combobox = ctk.CTkComboBox(lecturer_frame,
                                            variable=self.entries['lecturer_var'],
                                            values=[_("Select Lecturer")] + self.lecturers)
        lecturer_combobox.pack(side="left", fill="x", expand=True, padx=5)

        # Buttons
        button_frame = ctk.CTkFrame(parent)
        button_frame.pack(pady=20)

        buttons_info = [
            (_("➕ Add"), self.add_course, _("Add a new course record"), "forestgreen", "seagreen"),
            (_("📝 Update"), self.update_course, _("Update the selected course's record"), "royalblue", "cornflowerblue"),
            (_("🧹 Clear"), self.clear_form, _("Clear all fields in the form"), "gray", "dimgray")
        ]

        for text, command, tooltip_text, fg_color, hover_color in buttons_info:
            button = ctk.CTkButton(button_frame, text=text, command=command, fg_color=fg_color, hover_color=hover_color)
            button.pack(side="left", padx=5)
            Tooltip(button, tooltip_text)

    def create_course_list(self, parent):
        # Courses list
        self.courses_frame = ctk.CTkScrollableFrame(parent)
        self.courses_frame.pack(fill="both", expand=True, padx=10, pady=10)

    def add_course(self):
        try:
            # Validate form
            if not all([self.entries['course_name_entry'].get(),
                       self.entries['course_code_entry'].get(),
                       self.entries['duration_entry'].get(),
                       self.entries['fee_entry'].get()]):
                messagebox.showerror(_("Error"), _("Please fill all required fields"))
                return

            # Insert course using named parameters
            query = """
            INSERT INTO courses (course_name, course_code, description, duration, fee, lecturer_id)
            VALUES (:name, :code, :desc, :dur, :fee, :lect_id)
            """
            params = {
                "name": self.entries['course_name_entry'].get(),
                "code": self.entries['course_code_entry'].get(),
                "desc": self.entries['description_entry'].get("1.0", "end-1c"),
                "dur": self.entries['duration_entry'].get(),
                "fee": float(self.entries['fee_entry'].get()),
                "lect_id": self.lecturer_map.get(self.entries['lecturer_var'].get()) if self.entries['lecturer_var'].get() != _("Select Lecturer") else None
            }
            self.db.execute(query, params)

            messagebox.showinfo(_("Success"), _("Course added successfully!"))
            self.clear_form()
            self.load_courses()
        except Exception as e:
            messagebox.showerror(_("Error"), _(f"Failed to add course: {str(e)}"))

    def update_course(self):
        if not self.current_course_id:
            messagebox.showerror(_("Error"), _("Please select a course to update"))
            return

        try:
            query = """
            UPDATE courses 
            SET course_name = :name, course_code = :code, description = :desc, 
                duration = :dur, fee = :fee, lecturer_id = :lect_id, updated_at = CURRENT_TIMESTAMP
            WHERE id = :cid
            """
            params = {
                "name": self.entries['course_name_entry'].get(),
                "code": self.entries['course_code_entry'].get(),
                "desc": self.entries['description_entry'].get("1.0", "end-1c"),
                "dur": self.entries['duration_entry'].get(),
                "fee": float(self.entries['fee_entry'].get()),
                "lect_id": self.lecturer_map.get(self.entries['lecturer_var'].get()) if self.entries['lecturer_var'].get() != _("Select Lecturer") else None,
                "cid": self.current_course_id
            }
            self.db.execute(query, params)

            messagebox.showinfo(_("Success"), _("Course updated successfully!"))
            self.clear_form()
            self.load_courses()
        except Exception as e:
            messagebox.showerror(_("Error"), _(f"Failed to update course: {str(e)}"))

    def delete_course(self, course_id):
        if messagebox.askyesno(_("Confirm"), _("Are you sure you want to delete this course?")):
            try:
                query = "DELETE FROM courses WHERE id = :cid"
                self.db.execute(query, {"cid": course_id})
                messagebox.showinfo(_("Success"), _("Course deleted successfully!"))
                self.load_courses()
            except Exception as e:
                messagebox.showerror(_("Error"), _(f"Failed to delete course: {str(e)}"))

    def clear_form(self):
        for entry in self.entries.values():
            if isinstance(entry, ctk.CTkEntry):
                entry.delete(0, 'end')
            elif isinstance(entry, ctk.CTkTextbox):
                entry.delete("1.0", "end")
        
        self.current_course_id = None
        self.entries['lecturer_var'].set(_("Select Lecturer"))

    def load_courses(self):
        # Clear existing courses
        for widget in self.courses_frame.winfo_children():
            widget.destroy()

        try:
            query = """
            SELECT id, course_name, course_code, description, duration, fee, created_at,
                   lecturer_id
            FROM courses
            ORDER BY course_name
            """
            courses = self.db.fetch_all(query)

            for course in courses:
                frame = ctk.CTkFrame(self.courses_frame, fg_color="transparent")
                frame.pack(fill="x", padx=5, pady=5)

                # Hover effect
                frame.bind("<Enter>", lambda event, f=frame: f.configure(fg_color="#3a3a3a"))
                frame.bind("<Leave>", lambda event, f=frame: f.configure(fg_color="transparent"))

                # Course info
                info_text = f"{course['course_name']} ({course['course_code']}) - {course['duration']} months - Le {course['fee']:,.2f}"
                if course['lecturer_id']:
                    lecturer_name = lecturer_queries.get_lecturer_full_name_by_id(course['lecturer_id'])
                    if lecturer_name:
                        info_text += f" ({lecturer_name})"
                label = ctk.CTkLabel(frame, text=info_text)
                label.pack(side="left", fill="x", expand=True, padx=10, pady=5)

                # Bind events to the label as well
                label.bind("<Enter>", lambda event, f=frame: f.configure(fg_color="#3a3a3a"))
                label.bind("<Leave>", lambda event, f=frame: f.configure(fg_color="transparent"))
                
                # Double-click to view details
                frame.bind("<Double-Button-1>", lambda event, c=course: self.view_course_details(c))
                label.bind("<Double-Button-1>", lambda event, c=course: self.view_course_details(c))

                # Right-click context menu
                frame.bind("<Button-3>", lambda event, c=course: self.show_context_menu(event, c))
                label.bind("<Button-3>", lambda event, c=course: self.show_context_menu(event, c))

        except Exception as e:
            messagebox.showerror(_("Error"), _(f"Failed to load courses: {str(e)}"))

    def load_lecturers(self):
        try:
            lecturers = lecturer_queries.get_all_lecturers_for_dropdown()
            self.lecturers = [l['full_name'] for l in lecturers]
            self.lecturer_map = {l['full_name']: l['lecturer_id'] for l in lecturers}
        except Exception as e:
            messagebox.showerror(_("Error"), _(f"Failed to load lecturers: {str(e)}"))

    def show_context_menu(self, event, course):
        context_menu = Menu(self.courses_frame, tearoff=0)
        context_menu.add_command(label=_("Edit"), command=lambda: self.load_course(course))
        context_menu.add_command(label=_("Manage Timetable"), command=lambda: self._manage_timetable(course))
        context_menu.add_separator()
        context_menu.add_command(label=_("Delete"), command=lambda: self.delete_course(course['id']))
        context_menu.post(event.x_root, event.y_root)

    def _manage_timetable(self, course):
        timetable_win = TimetableWindow(self.parent_frame, self.db, course['id'], course['course_name'])
        timetable_win.show()

    def view_course_details(self, course):
        detail_window = ctk.CTkToplevel(self.parent_frame)
        detail_window.title(_(f"Details: {course['course_name']}"))
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

        # Tab 1: Course Details
        course_details_tab = tabview.add(_("📖 Course Details"))
        course_details_scroll_frame = ctk.CTkScrollableFrame(course_details_tab)
        course_details_scroll_frame.pack(fill="both", expand=True, padx=5, pady=5)

        # Fetch full description
        query = "SELECT description, lecturer_id FROM courses WHERE id = :cid"
        result = self.db.fetch_one(query, {"cid": course['id']})
        description = result['description'] if result else _("No description available.")
        lecturer_id = result['lecturer_id'] if result else None

        assigned_lecturer_name = _("Not Assigned")
        if lecturer_id:
            lecturer_name_from_db = lecturer_queries.get_lecturer_full_name_by_id(lecturer_id)
            if lecturer_name_from_db:
                assigned_lecturer_name = lecturer_name_from_db

        details_to_show = {
            _("Course Name"): course['course_name'],
            _("Course Code"): course['course_code'],
            _("Assigned Lecturer"): assigned_lecturer_name, # Display assigned lecturer
            _("Duration"): _(f"{course['duration']} months"),
            _("Fee"): _(f"Le {course['fee']:,.2f}"),
            _("Description"): description
        }

        for key, value in details_to_show.items():
            frame = ctk.CTkFrame(course_details_scroll_frame, fg_color="transparent")
            frame.pack(fill="x", pady=2, padx=5)
            ctk.CTkLabel(frame, text=_(f"➡️ {key}:"), font=ctk.CTkFont(weight="bold")).pack(side="left", anchor="w", padx=5)
            
            if key == _("Description"):
                desc_label = ctk.CTkLabel(frame, text=str(value), wraplength=350, justify="left")
                desc_label.pack(side="left", anchor="w", padx=5)
            else:
                ctk.CTkLabel(frame, text=str(value)).pack(side="left", anchor="w", padx=5)

        # Tab 2: Enrolled Students
        enrolled_students_tab = tabview.add(_("🧑‍🎓 Enrolled Students"))
        enrolled_students_scroll_frame = ctk.CTkScrollableFrame(enrolled_students_tab)
        enrolled_students_scroll_frame.pack(fill="both", expand=True, padx=5, pady=5)

        enrolled_students_query = """
        SELECT s.student_id, s.first_name, s.last_name, s.status AS student_status, sc.enrollment_date, sc.status AS enrollment_status
        FROM student_courses sc
        JOIN students s ON sc.student_id = s.id
        WHERE sc.course_id = :cid
        ORDER BY sc.enrollment_date DESC
        """
        enrolled_students = self.db.fetch_all(enrolled_students_query, {"cid": course['id']})

        if enrolled_students:
            for student_data in enrolled_students:
                student_info = _(f"➡️ ID: {student_data['student_id']} | Name: {student_data['first_name']} {student_data['last_name']} | "
                                f"Status: {student_data['student_status']} | Enrolled: {student_data['enrollment_date']} | "
                                f"Enrollment Status: {student_data['enrollment_status']}")
                ctk.CTkLabel(enrolled_students_scroll_frame, text=student_info, wraplength=400, justify="left").pack(fill="x", pady=2, padx=5)
        else:
            ctk.CTkLabel(enrolled_students_scroll_frame, text=_("No students currently enrolled in this course.")).pack(pady=10)


        close_button = ctk.CTkButton(detail_window, text=_("❌ Close"), command=detail_window.destroy, fg_color="firebrick", hover_color="indianred")
        close_button.pack(pady=10)

    def load_course(self, course):
        self.current_course_id = course['id']
        
        # Clear form first
        self.entries['course_name_entry'].delete(0, 'end')
        self.entries['course_code_entry'].delete(0, 'end') # New line
        self.entries['description_entry'].delete("1.0", "end")
        self.entries['duration_entry'].delete(0, 'end')
        self.entries['fee_entry'].delete(0, 'end')
        
        # Set new values
        self.entries['course_name_entry'].insert(0, course['course_name'])
        self.entries['course_code_entry'].insert(0, course['course_code']) # New line
        
        # Load description
        query = "SELECT description FROM courses WHERE id = :cid"
        result = self.db.fetch_one(query, {"cid": course['id']})
        if result and result['description']:
            self.entries['description_entry'].insert("1.0", result['description'])
        
        self.entries['duration_entry'].insert(0, str(course['duration']))
        self.entries['fee_entry'].insert(0, f"{course['fee']:.2f}")

        # Load assigned lecturer
        if course['lecturer_id']:
            lecturer_name = lecturer_queries.get_lecturer_full_name_by_id(course['lecturer_id'])
            if lecturer_name:
                self.entries['lecturer_var'].set(lecturer_name)
            else:
                self.entries['lecturer_var'].set(_("Select Lecturer"))
        else:
            self.entries['lecturer_var'].set(_("Select Lecturer"))