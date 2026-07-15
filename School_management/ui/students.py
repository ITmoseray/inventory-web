import customtkinter as ctk
from tkinter import messagebox, filedialog, Menu
import pandas as pd
from datetime import datetime
import os
from PIL import Image
import random
import string
import requests # Import requests to download images from URL
import io # Import io to handle image data
import cloudinary
import cloudinary.uploader
from ui.tooltip import Tooltip
from utils.i18n import get_translator
from utils.mixins import UndoRedoEntryMixin # Import the mixin
from db import lecturer_queries # Import lecturer queries
from db import student_queries # NEW: Import student_queries
from db import tailor_shop_queries # NEW: Import tailor_shop_queries
from db.student_queries import DuplicateStudentIdError # NEW: Import DuplicateStudentIdError
import config # Import config for Cloudinary credentials

_ = get_translator()

# Configure Cloudinary
cloudinary.config(
    cloud_name=config.CLOUDINARY_CLOUD_NAME,
    api_key=config.CLOUDINARY_API_KEY,
    api_secret=config.CLOUDINARY_API_SECRET
)

class StudentsWindow:
    def __init__(self, parent_frame, db, user=None, initial_source='online'):
        self.parent_frame = parent_frame
        self.db = db
        self.user = user
        self.initial_source = initial_source
        self.current_student_id = None
        self.photo_path = None
        self.courses = []
        self.course_map = {}
        self.lecturers = [] # List to store lecturer names for dropdown
        self.lecturer_map = {} # Dictionary to map lecturer name to lecturer_id
        self.course_id = None
        self.row_colors = ["#2b2b2b", "#212121"] # Darker and slightly lighter shades
        self.tooltips = [] # List to store Tooltip instances
        self.main_container = None # Store the main container frame

    def show(self):
        # Cancel any active tooltips before destroying widgets
        for tooltip in self.tooltips:
            tooltip.hide()
        self.tooltips = []

        # Destroy existing main container if it exists
        if self.main_container and self.main_container.winfo_exists():
            self.main_container.destroy()

        # Create main container
        container = ctk.CTkFrame(self.parent_frame)
        container.pack(fill="both", expand=True, padx=10, pady=10)
        self.main_container = container # Store reference to the main container

        # Title
        title = ctk.CTkLabel(container, text=_("🧑‍🎓 Student Management"), 
                           font=ctk.CTkFont(size=24, weight="bold"))
        title.pack(pady=10)
        
        # Load courses
        self.load_courses()

        # Load lecturers
        self.load_lecturers()

        # Create two columns
        columns_frame = ctk.CTkFrame(columns_frame)
        columns_frame.pack(fill="both", expand=True)

        # Left column - Form
        left_frame = ctk.CTkFrame(columns_frame)
        left_frame.pack(side="left", fill="both", expand=True, padx=5)

        # Right column - List
        right_frame = ctk.CTkFrame(columns_frame)
        right_frame.pack(side="right", fill="both", expand=True, padx=5)

        # Create form
        self.create_student_form(left_frame)

        # Create student list
        self.create_student_list(right_frame)

        # Load students
        self.load_students()

    def load_courses(self):
        try:
            query = "SELECT id, course_name, course_code FROM courses"
            courses = self.db.fetch_all(query)
            self.courses = [course['course_name'] for course in courses]
            self.course_map = {course['course_name']: course['id'] for course in courses} # Map to course.id (INT)
        except Exception as e:
            messagebox.showerror(_("Error"), _(f"Failed to load courses: {str(e)}"))

    def load_lecturers(self):
        """Load lecturers from the database and populate the dropdown."""
        try:
            # Fetch all lecturers from DB
            # Ensure lecturer_queries.get_all_lecturers returns objects with 'name' and 'id' attributes
            lecturers = lecturer_queries.get_all_lecturers() # Assuming this returns a list of objects/dicts
            self.lecturer_map = {lecturer['full_name']: lecturer['lecturer_id'] for lecturer in lecturers}

            # Populate dropdown
            lecturer_names = ["Select Lecturer"] + list(self.lecturer_map.keys())
            self.entries['lecturer_var'].configure(values=lecturer_names)

            # Default selection
            self.entries['lecturer_var'].set("Select Lecturer")

            print(f"DEBUG: Loaded lecturers: {self.lecturer_map}")

        except Exception as e:
            print(f"ERROR: Failed to load lecturers: {e}")
            self.entries['lecturer_var'].configure(values=["Select Lecturer"])
            self.entries['lecturer_var'].set("Select Lecturer")

    def create_student_form(self, parent):
        # Form title
        form_title = ctk.CTkLabel(parent, text=_("📝 Student Details"), 
                                font=ctk.CTkFont(size=18, weight="bold"))
        form_title.pack(pady=10)

        # Photo
        self.photo_label = ctk.CTkLabel(parent, text=_("No Photo"), width=150, height=150)
        self.photo_label.pack(pady=10)

        photo_btn = ctk.CTkButton(parent, text=_("📸 Upload Photo"), command=self.upload_photo, fg_color="gray", hover_color="dimgray")
        photo_btn.pack(pady=5)
        self.tooltips.append(Tooltip(photo_btn, _("Upload a photo for the student (JPG, PNG)")))

        # Form fields
        fields = [
            (_("Student ID"), "student_id_entry"),
            (_("First Name"), "first_name_entry"),
            (_("Last Name"), "last_name_entry"),
            (_("Date of Birth"), "dob_entry"),
            (_("Gender"), "gender_var"),
            (_("Phone"), "phone_entry"),
            (_("Email"), "email_entry"),
            (_("Address"), "address_entry"),
            (_("Status"), "status_var"),
            (_("App Source"), "application_source_var")
        ]

        self.entries = {}
        for field_name, attr_name in fields:
            frame = ctk.CTkFrame(parent)
            frame.pack(fill="x", padx=20, pady=5)

            label = ctk.CTkLabel(frame, text=f"➡️ {field_name}:", width=100)
            label.pack(side="left", padx=5)

            if field_name == _("Student ID"):
                entry = ctk.CTkEntry(frame) # Create a CTkEntry directly
                generated_id = student_queries.generate_unique_student_id() # NEW: Use the DB's ID generator
                entry.insert(0, generated_id)
                entry.configure(state="readonly")
                entry.pack(side="left", fill="x", expand=True, padx=5)
                self.entries[attr_name] = entry
            elif field_name == _("Gender"):
                self.entries[attr_name] = ctk.StringVar(value=_("Male"))
                gender_frame = ctk.CTkFrame(frame)
                gender_frame.pack(side="left", fill="x", expand=True)
                ctk.CTkRadioButton(gender_frame, text=_("Male"),
                                 variable=self.entries[attr_name],
                                 value="Male").pack(side="left", padx=5)
                ctk.CTkRadioButton(gender_frame, text=_("Female"),
                                 variable=self.entries[attr_name],
                                 value="Female").pack(side="left", padx=5)
            elif field_name == _("Status"):
                self.entries[attr_name] = ctk.StringVar(value=_("Active"))
                status_combobox = ctk.CTkComboBox(frame,
                                                  variable=self.entries[attr_name],
                                                  values=[_("Active"), _("Not Active")])
                status_combobox.pack(side="left", fill="x", expand=True, padx=5)
            elif field_name == _("App Source"):
                self.entries[attr_name] = ctk.StringVar(value=self.initial_source)
                source_combobox = ctk.CTkComboBox(frame,
                                                  variable=self.entries[attr_name],
                                                  values=[_("online"), _("manual")])
                source_combobox.pack(side="left", fill="x", expand=True, padx=5)
            else:
                entry = UndoRedoEntryMixin(frame) # Use the mixin
                if field_name == _("Date of Birth"):
                    entry.insert(0, _("YYYY-MM-DD"))  # Set default text instead of placeholder
                entry.pack(side="left", fill="x", expand=True, padx=5)
                self.entries[attr_name] = entry
        
        # Course dropdown 1
        frame1 = ctk.CTkFrame(parent)
        frame1.pack(fill="x", padx=20, pady=5)
        label1 = ctk.CTkLabel(frame1, text=_("➡️ Course 1:"), width=100)
        label1.pack(side="left", padx=5)
        self.entries['course_var1'] = ctk.StringVar(value=_("Select Course"))
        course_menu1 = ctk.CTkComboBox(frame1,
                                    variable=self.entries['course_var1'],
                                    values=self.courses)
        course_menu1.pack(side="left", fill="x", expand=True, padx=5)

        # Course dropdown 2
        frame2 = ctk.CTkFrame(parent)
        frame2.pack(fill="x", padx=20, pady=5)
        label2 = ctk.CTkLabel(frame2, text=_("➡️ Course 2:"), width=100)
        label2.pack(side="left", padx=5)
        self.entries['course_var2'] = ctk.StringVar(value=_("Select Course"))
        course_menu2 = ctk.CTkComboBox(frame2,
                                    variable=self.entries['course_var2'],
                                    values=[_("Select Course")] + self.courses) # Allow "Select Course" for optional second course
        course_menu2.pack(side="left", fill="x", expand=True, padx=5)

        # Lecturer dropdown
        lecturer_frame = ctk.CTkFrame(parent)
        lecturer_frame.pack(fill="x", padx=20, pady=5)
        lecturer_label = ctk.CTkLabel(lecturer_frame, text=_("➡️ Assigned Lecturer:"), width=100)
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
            (_("➕ Add"), self.add_student, _("Add a new student record"), "forestgreen", "seagreen"),
            (_("📝 Update"), self.update_student, _("Update the selected student's record"), "royalblue", "cornflowerblue"),
            (_("🧹 Clear"), self.clear_form, _("Clear all fields in the form"), "gray", "dimgray"),
            (_("📤 Export"), self.export_students, _("Export all student data to an Excel file"), "goldenrod", "darkgoldenrod")
        ]

        for text, command, tooltip_text, fg_color, hover_color in buttons_info:
            button = ctk.CTkButton(button_frame, text=text, command=command, fg_color=fg_color, hover_color=hover_color)
            button.pack(side="left", padx=5)
            self.tooltips.append(Tooltip(button, tooltip_text))

    def create_student_list(self, parent):
        # Advanced Search and Filter frame
        filter_frame = ctk.CTkFrame(parent)
        filter_frame.pack(fill="x", padx=10, pady=10)
        filter_frame.grid_columnconfigure((0, 1, 2, 3), weight=1)

        ctk.CTkLabel(filter_frame, text=_("Advanced Search & Filter"), font=ctk.CTkFont(size=16, weight="bold")).grid(row=0, column=0, columnspan=4, pady=10)

        # Row 1: Name and Course
        self.filter_name_entry = UndoRedoEntryMixin(filter_frame, placeholder_text=_("Filter by Name/ID..."))
        self.filter_name_entry.grid(row=1, column=0, padx=5, pady=5, sticky="ew")

        course_options = [_("All Courses")] + self.courses
        self.filter_course_var = ctk.StringVar(value=_("All Courses"))
        self.filter_course_combobox = ctk.CTkComboBox(filter_frame, variable=self.filter_course_var, values=course_options)
        self.filter_course_combobox.grid(row=1, column=1, padx=5, pady=5, sticky="ew")

        # Row 2: Gender and Payment Status
        gender_options = [_("All Genders"), _("Male"), _("Female"), _("Other")]
        self.filter_gender_var = ctk.StringVar(value=_("All Genders"))
        self.filter_gender_combobox = ctk.CTkComboBox(filter_frame, variable=self.filter_gender_var, values=gender_options)
        self.filter_gender_combobox.grid(row=1, column=2, padx=5, pady=5, sticky="ew")
        
        payment_status_options = [_("All Statuses"), _("Paid"), _("Partial"), _("Pending")]
        self.filter_payment_status_var = ctk.StringVar(value=_("All Statuses"))
        self.filter_payment_status_combobox = ctk.CTkComboBox(filter_frame, variable=self.filter_payment_status_var, values=payment_status_options)
        self.filter_payment_status_combobox.grid(row=1, column=3, padx=5, pady=5, sticky="ew")

        # Row 3: Age Range
        self.filter_min_age_entry = UndoRedoEntryMixin(filter_frame, placeholder_text=_("Min Age"))
        self.filter_min_age_entry.grid(row=2, column=0, padx=5, pady=5, sticky="ew")

        self.filter_max_age_entry = UndoRedoEntryMixin(filter_frame, placeholder_text=_("Max Age"))
        self.filter_max_age_entry.grid(row=2, column=1, padx=5, pady=5, sticky="ew")

        # Row 4: Action Buttons
        filter_button = ctk.CTkButton(filter_frame, text=_("🔍 Filter"), command=self.filter_students, fg_color="teal", hover_color="darkcyan")
        filter_button.grid(row=3, column=0, columnspan=2, padx=5, pady=10)
        self.tooltips.append(Tooltip(filter_button, _("Apply the selected filters to the student list")))

        clear_button = ctk.CTkButton(filter_frame, text=_("🧹 Clear Filters"), command=self.clear_filters, fg_color="gray", hover_color="dimgray")
        clear_button.grid(row=3, column=2, columnspan=2, padx=5, pady=10)
        self.tooltips.append(Tooltip(clear_button, _("Reset all filters and reload all students")))

        # Students list
        self.students_frame = ctk.CTkScrollableFrame(parent)
        self.students_frame.pack(fill="both", expand=True, padx=10, pady=10)

    def validate_date(self, date_string):
        """Validate date string and return proper format"""
        try:
            # Try to parse the date
            date_obj = datetime.strptime(date_string, "%Y-%m-%d")
            # Return in proper format
            return date_obj.strftime("%Y-%m-%d")
        except ValueError:
            # If parsing fails, return None
            return None



    def _load_image_from_path_or_url(self, path, size=(150, 150)):
        """Loads an image from a local path or a URL and returns a CTkImage object."""
        try:
            if not path:
                return None
            
            if path.startswith("http"):
                # Load from URL
                response = requests.get(path, timeout=10)
                image = Image.open(io.BytesIO(response.content))
            else:
                # Load from local path
                if os.path.exists(path):
                    image = Image.open(path)
                else:
                    return None
            
            image = image.resize(size, Image.Resampling.LANCZOS)
            return ctk.CTkImage(light_image=image, dark_image=image, size=size)
        except Exception as e:
            print(f"Error loading image from {path}: {e}")
            return None

    def upload_photo(self):
        file_path = filedialog.askopenfilename(
            filetypes=[("Image files", "*.png *.jpg *.jpeg *.gif")]
        )
        if file_path:
            try:
                # Upload to Cloudinary
                student_id = self.entries['student_id_entry'].get()
                upload_result = cloudinary.uploader.upload(
                    file_path, 
                    folder="students", 
                    public_id=student_id,
                    overwrite=True
                )
                
                # Use the secure URL from Cloudinary
                self.photo_path = upload_result.get('secure_url')
                
                # Display photo using helper
                photo = self._load_image_from_path_or_url(self.photo_path)
                if photo:
                    self.photo_label.configure(image=photo, text="")
                    self.photo_label.image = photo # Keep reference
                else:
                    self.photo_label.configure(image=None, text=_("Failed to Load"))

            except Exception as e:
                messagebox.showerror("Error", f"Failed to upload photo: {str(e)}")

    def add_student(self):
        print("DEBUG: ui/students.py - add_student method entered.")
        try:
            # Validate form
            if not all([self.entries['first_name_entry'].get(),
                       self.entries['last_name_entry'].get(),
                       self.entries['dob_entry'].get(),
                       self.entries['phone_entry'].get(),
                       self.entries['address_entry'].get()]):
                messagebox.showerror(_("Error"), _("Please fill all required fields"))
                return

            # Validate date
            date_string = self.entries['dob_entry'].get()
            if date_string == _("YYYY-MM-DD"):
                messagebox.showerror(_("Error"), _("Please enter a valid date in YYYY-MM-DD format"))
                return
                
            validated_date = self.validate_date(date_string)
            if not validated_date:
                messagebox.showerror(_("Error"), _("Please enter a valid date in YYYY-MM-DD format"))
                return

            student_id = self.entries['student_id_entry'].get()
            first_name = self.entries['first_name_entry'].get()
            last_name = self.entries['last_name_entry'].get()
            gender = self.entries['gender_var'].get()
            phone = self.entries['phone_entry'].get()
            email = self.entries['email_entry'].get()
            address = self.entries['address_entry'].get()
            status = self.entries['status_var'].get()
            application_source = self.entries['application_source_var'].get()
            
            # Get lecturer_id from dropdown selection
            lecturer_name = self.entries['lecturer_var'].get()
            lecturer_id = self.lecturer_map.get(lecturer_name)

            if not lecturer_id:
                messagebox.showerror(_("Error"), _("Please select a valid lecturer before adding a student."))
                return

            print(f"DEBUG: Adding student with lecturer_id={lecturer_id}")  # Debug line

            # Convert course names to course IDs
            course_name1 = self.entries['course_var1'].get()
            course_id1 = self.course_map.get(course_name1) if course_name1 != _("Select Course") else None

            course_name2 = self.entries['course_var2'].get()
            course_id2 = self.course_map.get(course_name2) if course_name2 != _("Select Course") and course_name2 != course_name1 else None


            # Call the centralized add_student function
            student_db_id = student_queries.add_student(
                student_id,
                first_name,
                last_name,
                gender,
                validated_date, # Use validated_date
                email,
                phone,
                self.photo_path,
                address,
                status,
                lecturer_id,   # <- This is now guaranteed valid
                course_id1,
                course_id2,
                performed_by=self.user['id'] if self.user else None,
                application_source=application_source
            )

            print(f"DEBUG: Student added with DB id: {student_db_id}")

            if student_db_id:
                # Create enrollments for both courses
                if course_id1:
                    student_queries.enroll_student_in_course(student_db_id, course_id1)

                if course_id2:
                    student_queries.enroll_student_in_course(student_db_id, course_id2)

                messagebox.showinfo(_("Success"), _("Student added and enrolled successfully!"))
                self.clear_form()
                self.load_students()
            else:
                print("DEBUG: add_student - student_db_id was None, generic error path.")
                messagebox.showerror(_("Error"), _("Failed to add student due to an unknown database error."))

        except DuplicateStudentIdError as e: # Handle specific duplicate ID error
            print(f"DEBUG: add_student - DuplicateStudentIdError: {e}")
            messagebox.showerror(_("Error"), _(str(e)))
        except DuplicateStudentEmailError as e: # NEW: Handle specific duplicate Email error
            print(f"DEBUG: add_student - DuplicateStudentEmailError: {e}")
            messagebox.showerror(_("Error"), _(str(e)))
        except Exception as e:
            print(f"DEBUG: add_student - General Exception: {e}")
            messagebox.showerror(_("Error"), _(f"Failed to add student: {str(e)}"))

    def update_student(self):
        if not self.current_student_id:
            messagebox.showerror(_("Error"), _("Please select a student to update"))
            return

        try:
            # Validate date
            date_string = self.entries['dob_entry'].get()
            if date_string == _("YYYY-MM-DD"):
                messagebox.showerror(_("Error"), _("Please enter a valid date in YYYY-MM-DD format"))
                return
                
            validated_date = self.validate_date(date_string)
            if not validated_date:
                messagebox.showerror(_("Error"), _("Please enter a valid date in YYYY-MM-DD format"))
                return

            student_id_str = self.entries['student_id_entry'].get()

            # Using student_queries.update_student
            student_queries.update_student(
                original_student_id=student_id_str, # Assuming the original ID is the current student_id_str
                student_id=student_id_str, # For simplicity, not allowing ID change from UI directly
                first_name=self.entries['first_name_entry'].get(),
                last_name=self.entries['last_name_entry'].get(),
                gender=self.entries['gender_var'].get(),
                date_of_birth=validated_date,
                email=self.entries['email_entry'].get(),
                phone=self.entries['phone_entry'].get(),
                photo_path=self.photo_path if self.photo_path else None,
                address=self.entries['address_entry'].get(),
                status=self.entries['status_var'].get(),
                lecturer_id=self.lecturer_map.get(self.entries['lecturer_var'].get()) if self.entries['lecturer_var'].get() != _("Select Lecturer") else None,
                performed_by=self.user['id'] if self.user else None
            )
            
            # Update course enrollments using student_queries.update_student_enrollments
            new_course_ids = []
            course_name1 = self.entries['course_var1'].get()
            if course_name1 != _("Select Course"):
                new_course_ids.append(self.course_map[course_name1])
            course_name2 = self.entries['course_var2'].get()
            if course_name2 != _("Select Course") and course_name2 != course_name1:
                new_course_ids.append(self.course_map[course_name2])
            
            student_queries.update_student_enrollments(self.current_student_id, new_course_ids)

            messagebox.showinfo(_("Success"), _("Student updated successfully!"))
            self.clear_form()
            self.load_students()
        except Exception as e:
            messagebox.showerror(_("Error"), _(f"Failed to update student: {str(e)}"))

    def deactivate_student(self, student_id):
        if messagebox.askyesno(_("Confirm"), _("Are you sure you want to deactivate this student? This will set their status to 'Inactive' but preserve their records.")):
            try:
                student_queries.deactivate_student(student_id)
                messagebox.showinfo(_("Success"), _("Student deactivated successfully!"))
                self.load_students()
            except Exception as e:
                messagebox.showerror(_("Error"), _(f"Failed to deactivate student: {str(e)}"))

    def delete_student_permanently(self, student_id):
        if messagebox.askyesno(_("CONFIRM PERMANENT DELETION"), 
                               _("WARNING: Are you absolutely sure you want to PERMANENTLY DELETE this student?\n\nThis action cannot be undone and will remove all associated records (enrollments, payments, attendance).\n\nContinue?")):
            try:
                if student_queries.delete_student(student_id, performed_by=self.user['id'] if self.user else None):
                    messagebox.showinfo(_("Success"), _("Student permanently deleted successfully!"))
                    self.load_students()
                else:
                    messagebox.showerror(_("Error"), _("Failed to permanently delete student."))
            except Exception as e:
                messagebox.showerror(_("Error"), _(f"Failed to permanently delete student: {str(e)}"))

    def view_student_details(self, student):
        detail_window = ctk.CTkToplevel(self.parent_frame)
        detail_window.title(_(f"Details: {student['first_name']} {student['last_name']}"))
        detail_window.geometry("800x700") # Increased size for more content

        # Ensure the window appears on top
        detail_window.transient(self.parent_frame.winfo_toplevel())
        detail_window.lift()
        detail_window.focus_force()
        detail_window.grab_set()

        # Main frame for photo and tabs
        main_display_frame = ctk.CTkFrame(detail_window)
        main_display_frame.pack(fill="both", expand=True, padx=20, pady=20)

        # Display photo using helper
        photo = self._load_image_from_path_or_url(student['photo_path'])
        if photo:
            photo_label = ctk.CTkLabel(main_display_frame, image=photo, text="")
            photo_label.image = photo # Keep a reference
            photo_label.pack(pady=10)
        else:
            ctk.CTkLabel(main_display_frame, text=_("No Photo Available"), width=150, height=150).pack(pady=10)

        # Tabview for details
        tabview = ctk.CTkTabview(main_display_frame)
        tabview.pack(fill="both", expand=True, pady=10)

        # Tab 1: Personal Details
        personal_details_tab = tabview.add(_("👤 Personal Details"))
        personal_details_scroll_frame = ctk.CTkScrollableFrame(personal_details_tab)
        personal_details_scroll_frame.pack(fill="both", expand=True, padx=5, pady=5)

        # Get all enrolled courses
        enrolled_courses_names = student_queries.get_student_enrollments(student['id'])
        current_courses_display = ", ".join(enrolled_courses_names) if enrolled_courses_names else _("Not Enrolled")

        # Get assigned lecturer name
        assigned_lecturer_name = _("Not Assigned")
        if student['lecturer_id']:
            lecturer_name_from_db = lecturer_queries.get_lecturer_full_name_by_id(student['lecturer_id'])
            if lecturer_name_from_db:
                assigned_lecturer_name = lecturer_name_from_db
        
        # Display details
        details_to_show = {
            _("Student ID"): student['student_id'],
            _("First Name"): student['first_name'],
            _("Last Name"): student['last_name'],
            _("Assigned Lecturer"): assigned_lecturer_name, # Display assigned lecturer
            _("Enrolled Courses"): current_courses_display, # Display all enrolled courses
            _("Gender"): student['gender'],
            _("Date of Birth"): student['date_of_birth'],
            _("Phone"): student['phone'],
            _("Email"): student['email'],
            _("Address"): student['address'],
            _("Status"): student['status'],
            _("App Source"): student.get('application_source', 'online'),
            _("Created At"): student['created_at']
        }
        for key, value in details_to_show.items():
            frame = ctk.CTkFrame(personal_details_scroll_frame, fg_color="#1F262E")
            frame.pack(fill="x", pady=2, padx=5)
            ctk.CTkLabel(frame, text=_(f"➡️ {key}:"), font=ctk.CTkFont(weight="bold"), text_color="#FFFFFF").pack(side="left", anchor="w", padx=5)
            ctk.CTkLabel(frame, text=str(value), text_color="#FFFFFF").pack(side="left", anchor="w", padx=5)

        # Calculate and display Attendance Rate
        attendance_query = "SELECT status FROM attendance WHERE student_id = %s"
        attendance_records = self.db.fetch_all(attendance_query, (student['id'],))

        total_attendance_days = len(attendance_records)
        present_days = sum(1 for record in attendance_records if record['status'] == 'Present')

        attendance_rate = 0
        if total_attendance_days > 0:
            attendance_rate = (present_days / total_attendance_days) * 100

        attendance_frame = ctk.CTkFrame(personal_details_scroll_frame, fg_color="#1F262E")
        attendance_frame.pack(fill="x", pady=2, padx=5)
        ctk.CTkLabel(attendance_frame, text=_("➡️ Attendance Rate:"), font=ctk.CTkFont(weight="bold"), text_color="#FFFFFF").pack(side="left", anchor="w", padx=5)
        ctk.CTkLabel(attendance_frame, text=f"{attendance_rate:.2f}%", text_color="#FFFFFF").pack(side="left", anchor="w", padx=5)

        # Tab 2: Enrolled Courses
        courses_tab = tabview.add(_("📚 Courses"))
        courses_scroll_frame = ctk.CTkScrollableFrame(courses_tab)
        courses_scroll_frame.pack(fill="both", expand=True, padx=5, pady=5)

        courses_query = """
        SELECT sc.enrollment_date, sc.status AS enrollment_status, c.course_name, c.duration, c.fee
        FROM student_courses sc
        JOIN courses c ON sc.course_id = c.id
        WHERE sc.student_id = %s
        ORDER BY sc.enrollment_date DESC
        """
        student_courses = self.db.fetch_all(courses_query, (student['id'],))

        if student_courses:
            for course_data in student_courses:
                course_info = _(f"➡️ Course: {course_data['course_name']} | Enrolled: {course_data['enrollment_date']} | Status: {course_data['enrollment_status']} | Duration: {course_data['duration']} months | Fee: Le {course_data['fee']:,.2f}")
                ctk.CTkLabel(courses_scroll_frame, text=course_info, wraplength=400, justify="left").pack(fill="x", pady=2, padx=5)
        else:
            ctk.CTkLabel(courses_scroll_frame, text=_("No courses enrolled.")).pack(pady=10)

        # Tab 3: Payment History
        payments_tab = tabview.add(_("💰 Payments"))
        payments_scroll_frame = ctk.CTkScrollableFrame(payments_tab)
        payments_scroll_frame.pack(fill="both", expand=True, padx=5, pady=5)

        payments_query = """
        SELECT p.receipt_number, p.payment_date, p.amount, p.payment_method, p.status, c.course_name
        FROM payments p
        JOIN courses c ON p.course_id = c.id
        WHERE p.student_id = %s
        ORDER BY p.payment_date DESC
        """
        student_payments = self.db.fetch_all(payments_query, (student['id'],))

        if student_payments:
            for payment_data in student_payments:
                payment_info = _(f"➡️ Receipt: {payment_data['receipt_number']} | Date: {payment_data['payment_date']} | "
                                f"Amount: Le {payment_data['amount']:,.2f} | Method: {payment_data['payment_method']} | "
                                f"Status: {payment_data['status']} | Course: {payment_data['course_name']}")
                ctk.CTkLabel(payments_scroll_frame, text=payment_info, wraplength=400, justify="left").pack(fill="x", pady=2, padx=5)
        else:
            ctk.CTkLabel(payments_scroll_frame, text=_("No payment history found.")).pack(pady=10)

        # Tab 4: Tailoring Fees
        tailoring_tab = tabview.add(_("🧵 Tailoring Fees"))
        tailoring_scroll_frame = ctk.CTkScrollableFrame(tailoring_tab)
        tailoring_scroll_frame.pack(fill="both", expand=True, padx=5, pady=5)

        student_tailoring_payments = tailor_shop_queries.get_tailor_payments_by_student_id(student['id'])

        if student_tailoring_payments:
            for tp in student_tailoring_payments:
                tp_info = _(f"➡️ Receipt: {tp['receipt_number']} | Date: {tp['payment_date']} | "
                           f"Item: {tp['item_type']} | Amount: Le {tp['amount']:,.2f} | Status: {tp['status']}")
                ctk.CTkLabel(tailoring_scroll_frame, text=tp_info, wraplength=400, justify="left").pack(fill="x", pady=2, padx=5)
        else:
            ctk.CTkLabel(tailoring_scroll_frame, text=_("No tailoring fee records found.")).pack(pady=10)

        close_button = ctk.CTkButton(detail_window, text=_("❌ Close"), command=detail_window.destroy, fg_color="firebrick", hover_color="indianred")
        close_button.pack(fill="x", pady=10)

    def clear_form(self):
        for name, entry in self.entries.items():
            if isinstance(entry, ctk.CTkEntry):
                entry.delete(0, 'end')
                if 'dob' in name:
                    entry.insert(0, _("YYYY-MM-DD"))
            elif isinstance(entry, ctk.StringVar):
                if 'gender' in name:
                    entry.set(_("Male"))
                elif 'course_var1' == name or 'course_var2' == name:
                    entry.set(_("Select Course"))
                elif 'status' in name:
                    entry.set(_("Active"))
                elif 'lecturer_var' == name:
                    entry.set(_("Select Lecturer"))
        
        # Generate a new student ID for the cleared form
        new_student_id = student_queries.generate_unique_student_id() # NEW: Use the DB's ID generator
        self.entries['student_id_entry'].configure(state="normal") # Enable editing temporarily
        self.entries['student_id_entry'].delete(0, 'end')
        self.entries['student_id_entry'].insert(0, new_student_id)
        self.entries['student_id_entry'].configure(state="readonly") # Set back to read-only

        self.current_student_id = None
        self.photo_path = None
        # Fix for _tkinter.TclError: image "pyimage..." doesn't exist
        self.photo_label.configure(image=None) # First clear the image
        self.photo_label.image = None # Then clear the reference
        self.photo_label.configure(text=_("No Photo")) # Set the text
        self.course_id = None

    def load_students(self):
        # Clear existing students
        for widget in self.students_frame.winfo_children():
            widget.destroy()

        try:
            query = """
            SELECT s.id, s.student_id, s.first_name, s.last_name, s.gender, s.date_of_birth, 
                   s.phone, s.email, s.address, s.photo_path, s.created_at, s.status,
                   s.lecturer_id, s.application_source, l.full_name AS lecturer_name
            FROM students s
            LEFT JOIN lecturers l ON s.lecturer_id = l.lecturer_id
            ORDER BY s.last_name, s.first_name
            """
            students = self.db.fetch_all(query)

            for i, student in enumerate(students):
                bg_color = self.row_colors[i % 2]
                frame = ctk.CTkFrame(self.students_frame, fg_color=bg_color, corner_radius=5)
                frame.pack(fill="x", padx=5, pady=5)

                # Hover effect
                hover_color = "#3a3a3a" # Consistent hover color
                frame.bind("<Enter>", lambda event, f=frame: f.configure(fg_color=hover_color))
                frame.bind("<Leave>", lambda event, f=frame, original_color=bg_color: f.configure(fg_color=original_color))

                # Student info
                info_text = f"{student['student_id']} - {student['last_name']}, {student['first_name']}"
                label = ctk.CTkLabel(frame, text=info_text)
                label.pack(side="left", fill="x", expand=True, padx=10, pady=5)
                
                # Bind events to the label as well for better UX
                label.bind("<Enter>", lambda event, f=frame: f.configure(fg_color="#3a3a3a"))
                label.bind("<Leave>", lambda event, f=frame: f.configure(fg_color="transparent"))

                # Double-click to view details
                frame.bind("<Double-Button-1>", lambda event, s=student: self.view_student_details(s))
                label.bind("<Double-Button-1>", lambda event, s=student: self.view_student_details(s))

                # Right-click context menu
                frame.bind("<Button-3>", lambda event, s=student: self.show_context_menu(event, s))
                label.bind("<Button-3>", lambda event, s=student: self.show_context_menu(event, s))
        except Exception as e:
            messagebox.showerror("Error", f"Failed to load students: {str(e)}")

    def copy_to_clipboard(self, text):
        self.parent_frame.clipboard_clear()
        self.parent_frame.clipboard_append(text)
        messagebox.showinfo(_("Copied"), _(f"'{text}' copied to clipboard."))

    def show_context_menu(self, event, student):
        context_menu = Menu(self.students_frame, tearoff=0)
        context_menu.add_command(label=_("View profile"), command=lambda: self.view_student_details(student))
        context_menu.add_command(label=_("Copy ID"), command=lambda: self.copy_to_clipboard(student['student_id']))
        context_menu.add_separator()
        context_menu.add_command(label=_("Edit"), command=lambda: self.load_student(student))
        context_menu.add_command(label=_("Deactivate"), command=lambda: self.deactivate_student(student['student_id']))
        context_menu.add_command(label=_("Delete Permanently"), command=lambda: self.delete_student_permanently(student['student_id']))
        context_menu.post(event.x_root, event.y_root)

    def load_student(self, student):
        self.clear_form()
        self.current_student_id = student['id']
        self.entries['student_id_entry'].delete(0, 'end')
        self.entries['student_id_entry'].insert(0, student['student_id'])
        self.entries['first_name_entry'].delete(0, 'end')
        self.entries['first_name_entry'].insert(0, student['first_name'])
        self.entries['last_name_entry'].delete(0, 'end')
        self.entries['last_name_entry'].insert(0, student['last_name'])
        self.entries['gender_var'].set(student['gender'])
        self.entries['phone_entry'].delete(0, 'end')
        self.entries['phone_entry'].insert(0, student['phone'])
        self.entries['email_entry'].delete(0, 'end')
        self.entries['email_entry'].insert(0, student['email'] or '')
        self.entries['dob_entry'].delete(0, 'end')
        self.entries['dob_entry'].insert(0, student['date_of_birth'])
        self.entries['address_entry'].delete(0, 'end')
        self.entries['address_entry'].insert(0, student['address'])
        self.entries['status_var'].set(student['status'])
        self.entries['application_source_var'].set(student.get('application_source', 'online'))

        # Load assigned lecturer
        if student['lecturer_id']:
            lecturer_name = lecturer_queries.get_lecturer_full_name_by_id(student['lecturer_id'])
            if lecturer_name:
                self.entries['lecturer_var'].set(lecturer_name)
            else:
                self.entries['lecturer_var'].set(_("Select Lecturer"))
        else:
            self.entries['lecturer_var'].set(_("Select Lecturer"))

        # Load photo using helper
        self.photo_path = student['photo_path']
        photo = self._load_image_from_path_or_url(self.photo_path)
        if photo:
            self.photo_label.configure(image=photo, text="")
            self.photo_label.image = photo # Keep reference
        else:
            self.photo_label.configure(image=None, text=_("No Photo"))

        # Load enrolled courses
        try:
            # Using student_queries.get_student_enrollments which returns a list of course_ids
            enrolled_course_ids = student_queries.get_student_enrollments(student['id'])
            
            # Assuming you want to display the course names
            enrolled_course_names = []
            for course_id in enrolled_course_ids:
                # You'll need a way to get course name from ID, maybe a new query or reuse existing
                course = self.db.fetch_one("SELECT course_name FROM courses WHERE id = %s", (course_id,))
                if course:
                    enrolled_course_names.append(course['course_name'])

            if enrolled_course_names and len(enrolled_course_names) > 0:
                self.entries['course_var1'].set(enrolled_course_names[0])
            else:
                self.entries['course_var1'].set(_("Select Course"))

            if enrolled_course_names and len(enrolled_course_names) > 1:
                self.entries['course_var2'].set(enrolled_course_names[1])
            else:
                self.entries['course_var2'].set(_("Select Course"))

        except Exception as e:
            messagebox.showerror(_("Error"), _(f"Failed to load student's course: {str(e)}"))
            self.entries['course_var1'].set(_("Select Course"))
            self.entries['course_var2'].set(_("Select Course"))

    def clear_filters(self):
        """Resets all filter widgets to their default values."""
        self.filter_name_entry.delete(0, 'end')
        self.filter_course_var.set("All Courses")
        self.filter_gender_var.set("All Genders")
        self.filter_payment_status_var.set("All Statuses")
        self.filter_min_age_entry.delete(0, 'end')
        self.filter_max_age_entry.delete(0, 'end')
        self.load_students() # Reload all students

    def filter_students(self):
        # Base query
        query = """
            SELECT DISTINCT s.id, s.student_id, s.first_name, s.last_name, s.gender, s.date_of_birth, s.phone, s.email, s.address, s.photo_path, s.created_at, s.status,
                            s.lecturer_id, s.application_source, l.full_name AS lecturer_name
            FROM students s
            LEFT JOIN enrollments e ON s.id = e.student_id
            LEFT JOIN courses c ON e.course_id = c.id
            LEFT JOIN payments p ON s.id = p.student_id
            LEFT JOIN lecturers l ON s.lecturer_id = l.lecturer_id
        """
        conditions = []
        params = []

        # Collect filter values
        name = self.filter_name_entry.get()
        course = self.filter_course_var.get()
        gender = self.filter_gender_var.get()
        payment_status = self.filter_payment_status_var.get()
        min_age = self.filter_min_age_entry.get()
        max_age = self.filter_max_age_entry.get()

        # Build conditions
        if name:
            conditions.append("(s.first_name LIKE %s OR s.last_name LIKE %s OR s.student_id LIKE %s)")
            param = f"%{name}%"
            params.extend([param, param, param])
        if course != "All Courses":
            conditions.append("c.course_name = %s")
            params.append(course)
        if gender != "All Genders":
            conditions.append("s.gender = %s")
            params.append(gender)
        if payment_status != "All Statuses":
            conditions.append("p.status = %s")
            params.append(payment_status)
        if min_age:
            conditions.append("TIMESTAMPDIFF(YEAR, s.date_of_birth, CURDATE()) >= %s")
            params.append(int(min_age))
        if max_age:
            conditions.append("TIMESTAMPDIFF(YEAR, s.date_of_birth, CURDATE()) <= %s")
            params.append(int(max_age))

        # Append conditions to query
        if conditions:
            query += " WHERE " + " AND ".join(conditions)

        query += " GROUP BY s.id ORDER BY s.last_name, s.first_name"

        try:
            students = self.db.fetch_all(query, tuple(params))
            
            # Clear and reload student list
            for widget in self.students_frame.winfo_children():
                widget.destroy()
            
            if not students:
                ctk.CTkLabel(self.students_frame, text=_("No students match the selected criteria.")).pack(pady=20)
                return

            for i, student in enumerate(students):
                bg_color = self.row_colors[i % 2]
                frame = ctk.CTkFrame(self.students_frame, fg_color=bg_color, corner_radius=5)
                frame.pack(fill="x", padx=5, pady=5)

                # Hover effect
                hover_color = "#3a3a3a" # Consistent hover color
                frame.bind("<Enter>", lambda event, f=frame: f.configure(fg_color=hover_color))
                frame.bind("<Leave>", lambda event, f=frame, original_color=bg_color: f.configure(fg_color=original_color))
                info_text = f"{student['student_id']} - {student['last_name']}, {student['first_name']}"
                label = ctk.CTkLabel(frame, text=info_text)
                label.pack(side="left", fill="x", expand=True, padx=10, pady=5)
                label.bind("<Enter>", lambda event, f=frame: f.configure(fg_color="#3a3a3a"))
                label.bind("<Leave>", lambda event, f=frame: f.configure(fg_color="transparent"))
                frame.bind("<Double-Button-1>", lambda event, s=student: self.view_student_details(s))
                label.bind("<Double-Button-1>", lambda event, s=student: self.view_student_details(s))
                frame.bind("<Button-3>", lambda event, s=student: self.show_context_menu(event, s))
                label.bind("<Button-3>", lambda event, s=student: self.show_context_menu(event, s))

        except Exception as e:
            messagebox.showerror(_("Filter Error"), _(f"An error occurred while filtering students: {str(e)}"))

    def export_students(self):
        try:
            query = """
            SELECT student_id, first_name, last_name, gender, date_of_birth,
                   phone, email, address, created_at, status
            FROM students
            ORDER BY last_name, first_name
            """
            students = self.db.fetch_all(query)
            
            df = pd.DataFrame(students)
            
            # Ask for save location
            file_path = filedialog.asksaveasfilename(
                defaultextension=".xlsx",
                filetypes=[(_("Excel files"), "*.xlsx"), (_("All files"), "*.*")]
            )
            
            if file_path:
                df.to_excel(file_path, index=False)
                messagebox.showinfo(_("Success"), _("Students exported successfully!"))
        except Exception as e:
            messagebox.showerror(_("Error"), _(f"Failed to export students: {str(e)}"))