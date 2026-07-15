import customtkinter as ctk
from tkinter import messagebox, Menu
from datetime import datetime, date
import pandas as pd
from ui.tooltip import Tooltip
from utils.i18n import get_translator
from utils.mixins import UndoRedoEntryMixin # Import the mixin
from tkcalendar import Calendar

_ = get_translator()

class AttendanceWindow:
    def __init__(self, parent_frame, db, user=None):
        self.parent_frame = parent_frame
        self.db = db
        self.user = user
        self.student_map = {}
        self.student_internal_id_map = {} # To store internal student IDs
        self.student_combobox_widget = None # Reference to the student combobox
        self.course_combobox_widget = None # Reference to the course combobox

    def _get_student_enrolled_courses(self, student_internal_id):
        """Fetches all courses a specific student is enrolled in."""
        query = """
        SELECT c.id, c.course_name
        FROM student_courses sc
        JOIN courses c ON sc.course_id = c.id
        WHERE sc.student_id = %s AND sc.status = 'Active'
        ORDER BY c.course_name
        """
        return self.db.fetch_all(query, (student_internal_id,))

    def show(self):
        # Clear parent frame
        for widget in self.parent_frame.winfo_children():
            widget.destroy()

        # Create main container for the entire Attendance module
        container = ctk.CTkFrame(self.parent_frame, corner_radius=10)
        container.pack(fill="both", expand=True, padx=10, pady=10)

        # Create a frame for the filter section (top part)
        filter_section_frame = ctk.CTkFrame(container, fg_color="transparent")
        filter_section_frame.pack(side="top", fill="x", padx=10, pady=10)
        filter_section_frame.grid_columnconfigure(0, weight=1) # Date
        filter_section_frame.grid_columnconfigure(1, weight=1) # Course
        filter_section_frame.grid_columnconfigure(2, weight=0) # View Records
        filter_section_frame.grid_columnconfigure(3, weight=0) # Mark Attendance
        
        # Date Selection
        date_frame = ctk.CTkFrame(filter_section_frame, fg_color="transparent")
        date_frame.grid(row=0, column=0, padx=(0, 10), pady=5, sticky="ew")
        date_frame.grid_columnconfigure(1, weight=1)

        ctk.CTkLabel(date_frame, text=_("Date:"), font=ctk.CTkFont(size=14)).grid(row=0, column=0, sticky="w", padx=(0, 5))
        self.date_entry_var = ctk.StringVar(value=date.today().strftime("%Y-%m-%d"))
        self.date_button = ctk.CTkButton(date_frame, textvariable=self.date_entry_var, command=self._open_calendar)
        self.date_button.grid(row=0, column=1, sticky="ew", padx=(0, 10))

        # Course Combobox
        course_frame = ctk.CTkFrame(filter_section_frame, fg_color="transparent")
        course_frame.grid(row=0, column=1, padx=(0, 10), pady=5, sticky="ew")
        course_frame.grid_columnconfigure(1, weight=1)

        ctk.CTkLabel(course_frame, text=_("Course:"), font=ctk.CTkFont(size=14)).grid(row=0, column=0, sticky="w", padx=(0, 5))
        self.course_filter_var = ctk.StringVar(value=_("All"))
        self.course_filter_combobox = ctk.CTkComboBox(course_frame, variable=self.course_filter_var,
                                                      values=[_("All")], command=self._on_course_filter_select)
        self.course_filter_combobox.grid(row=0, column=1, sticky="ew", padx=(0, 10))
        self._load_all_courses_for_filter() # Load courses

        # Buttons
        view_records_button = ctk.CTkButton(filter_section_frame, text=_("📋 View Records"), command=self._display_attendance_view, fg_color="royalblue", hover_color="cornflowerblue")
        view_records_button.grid(row=0, column=2, pady=5, padx=(0,10), sticky="e")
        
        mark_attendance_button = ctk.CTkButton(filter_section_frame, text=_("✍️ Mark Attendance"), command=self._open_mark_attendance_window, fg_color="seagreen", hover_color="mediumseagreen")
        mark_attendance_button.grid(row=0, column=3, pady=5, padx=(0,10), sticky="e")


        # Create a frame for displaying records (bottom part)
        self.records_display_frame = ctk.CTkFrame(container, fg_color="transparent", corner_radius=10)
        self.records_display_frame.pack(side="bottom", fill="both", expand=True, padx=10, pady=10)
        self.records_display_frame.grid_rowconfigure(0, weight=1) # For centering content
        self.records_display_frame.grid_rowconfigure(1, weight=0)
        self.records_display_frame.grid_rowconfigure(2, weight=0)
        self.records_display_frame.grid_rowconfigure(3, weight=0)
        self.records_display_frame.grid_rowconfigure(4, weight=1) # For centering content
        self.records_display_frame.grid_columnconfigure(0, weight=1)

        # Background color for the initial message section
        self.records_display_frame.configure(fg_color=("white", "gray15")) # Main background color

        # Initial Informational Message
        ctk.CTkLabel(self.records_display_frame, text=_("📊 Attendance Tracking System"),
                           font=ctk.CTkFont(size=28, weight="bold")).grid(row=1, column=0, pady=(50, 10))

        ctk.CTkLabel(self.records_display_frame, text=_("Use Mark Attendance to record student presence."),
                           font=ctk.CTkFont(size=16)).grid(row=2, column=0, pady=(0, 5))

        ctk.CTkLabel(self.records_display_frame, text=_("View records by selecting date and course filters"),
                           font=ctk.CTkFont(size=16)).grid(row=3, column=0, pady=(0, 5))

    def _load_all_courses_for_filter(self):
        """Loads all available course names into the course filter combobox."""
        try:
            query = "SELECT id, course_name FROM courses ORDER BY course_name"
            courses_data = self.db.fetch_all(query)
            course_names = [_("All")] + [c['course_name'] for c in courses_data]
            self.course_filter_combobox.configure(values=course_names)
        except Exception as e:
            messagebox.showerror(_("Error"), _(f"Failed to load courses for filter: {str(e)}"))

    def _open_calendar(self):
        """Opens a calendar widget in a new window to select a date."""
        top = ctk.CTkToplevel(self.parent_frame)
        top.title(_("Select Date"))
        top.transient(self.parent_frame.winfo_toplevel())
        top.grab_set()

        cal = Calendar(top, selectmode='day',
                       date_pattern='yyyy-mm-dd',
                       font="Arial 12")
        cal.pack(padx=10, pady=10)

        def set_date():
            self.date_entry_var.set(cal.get_date())
            top.destroy()

        ctk.CTkButton(top, text=_("Set Date"), command=set_date).pack(pady=5)

    def _on_course_filter_select(self, selection):
        """Callback when a course filter is selected (placeholder for future filtering)."""
        print(f"Course filter selected: {selection}")
        self._display_attendance_view() # Refresh the attendance view with the new filter

    def _open_mark_attendance_window(self):
        """Opens a new window for marking attendance."""
        mark_window = ctk.CTkToplevel(self.parent_frame)
        mark_window.title(_("Mark Student Attendance"))
        mark_window.geometry("800x700") # Increased size
        mark_window.transient(self.parent_frame.winfo_toplevel())
        mark_window.grab_set()

        form_frame = ctk.CTkFrame(mark_window)
        form_frame.pack(fill="both", expand=True, padx=10, pady=10)
        self.create_attendance_form_for_window(form_frame, mark_window)

    def create_attendance_form_for_window(self, parent_frame, top_level_window):
        # Store references for later use in other methods
        self.mark_attendance_window_parent_frame = parent_frame
        self.mark_attendance_top_level_window = top_level_window
        self.student_attendance_vars = {} # To store student attendance status variables

        form_title = ctk.CTkLabel(parent_frame, text=_("Mark Attendance"), 
                                font=ctk.CTkFont(size=18, weight="bold"))
        form_title.pack(pady=10)

        # Top section for Course and Date Selection
        top_controls_frame = ctk.CTkFrame(parent_frame, fg_color="transparent")
        top_controls_frame.pack(fill="x", padx=20, pady=5)
        top_controls_frame.grid_columnconfigure(1, weight=1) # Course Combobox expands
        top_controls_frame.grid_columnconfigure(3, weight=1) # Date Combobox expands

        # Course Selection
        ctk.CTkLabel(top_controls_frame, text=_("Course:"), width=100).grid(row=0, column=0, sticky="w", padx=(0,5))
        self.mark_course_var = ctk.StringVar()
        self.mark_course_combobox = ctk.CTkComboBox(top_controls_frame, variable=self.mark_course_var,
                                                     values=[], state="readonly", width=200)
        self.mark_course_combobox.grid(row=0, column=1, sticky="ew", padx=(0, 20))
        self._load_all_courses_for_mark_attendance() # Load courses for marking

        # Date Selection
        ctk.CTkLabel(top_controls_frame, text=_("Date:"), width=100).grid(row=0, column=2, sticky="w", padx=(0,5))
        self.mark_date_var = ctk.StringVar(value=date.today().strftime("%Y-%m-%d"))
        self.mark_date_button = ctk.CTkButton(top_controls_frame, textvariable=self.mark_date_var, command=self._open_calendar_for_mark_attendance)
        self.mark_date_button.grid(row=0, column=3, sticky="ew", padx=(0, 5))

        # Load Students Button
        load_students_button = ctk.CTkButton(parent_frame, text=_("➕ Load Students"), command=self._load_students_for_attendance, fg_color="skyblue", hover_color="deepskyblue")
        load_students_button.pack(pady=10)

        # Frame to display students for attendance marking
        self.students_display_frame = ctk.CTkScrollableFrame(parent_frame)
        self.students_display_frame.pack(fill="both", expand=True, padx=20, pady=10)

        # Bottom buttons
        button_frame = ctk.CTkFrame(parent_frame, fg_color="transparent")
        button_frame.pack(pady=10)

        save_button = ctk.CTkButton(button_frame, text=_("💾 Save Attendance"), command=self._save_attendance_records, fg_color="forestgreen", hover_color="seagreen")
        save_button.pack(side="left", padx=5)

        close_button = ctk.CTkButton(button_frame, text=_("❌ Close"), command=top_level_window.destroy, fg_color="firebrick", hover_color="indianred")
        close_button.pack(side="left", padx=5)
    
    def _open_calendar_for_mark_attendance(self):
        """Opens a calendar widget in a new window to select a date for marking attendance."""
        top = ctk.CTkToplevel(self.mark_attendance_top_level_window)
        top.title(_("Select Date"))
        top.transient(self.mark_attendance_top_level_window)
        top.grab_set()

        cal = Calendar(top, selectmode='day',
                       date_pattern='yyyy-mm-dd',
                       font="Arial 12")
        cal.pack(padx=10, pady=10)

        def set_date():
            self.mark_date_var.set(cal.get_date())
            top.destroy()

        ctk.CTkButton(top, text=_("Set Date"), command=set_date).pack(pady=5)

    def _load_all_courses_for_mark_attendance(self):
        """Loads all available course names and their IDs into the mark attendance course combobox."""
        try:
            query = "SELECT id, course_name FROM courses ORDER BY course_name"
            courses_data = self.db.fetch_all(query)
            course_names_with_ids = [f"{c['id']} - {c['course_name']}" for c in courses_data]
            self.mark_course_combobox.configure(values=course_names_with_ids)
            if course_names_with_ids:
                self.mark_course_var.set(course_names_with_ids[0])
            else:
                self.mark_course_var.set(_("No Courses Available"))
        except Exception as e:
            messagebox.showerror(_("Error"), _(f"Failed to load courses for marking attendance: {str(e)}"))

    def _load_students_for_attendance(self):
        """Loads students for the selected course and displays them for attendance marking."""
        for widget in self.students_display_frame.winfo_children():
            widget.destroy() # Clear previous student list

        selected_course_display = self.mark_course_var.get()
        if selected_course_display == _("No Courses Available") or not selected_course_display:
            messagebox.showwarning(_("Warning"), _("Please select a valid course first."))
            return
        
        course_id = int(selected_course_display.split(" - ")[0])
        self.student_attendance_vars.clear() # Clear previous attendance vars
        self.student_arrival_time_vars = {} # Clear previous arrival time vars

        try:
            query = """
            SELECT s.id, s.student_id, s.first_name, s.last_name
            FROM students s
            JOIN student_courses sc ON s.id = sc.student_id
            WHERE sc.course_id = %s AND sc.status = 'Active'
            ORDER BY s.last_name, s.first_name
            """
            students_data = self.db.fetch_all(query, (course_id,))

            if not students_data:
                ctk.CTkLabel(self.students_display_frame, text=_("No active students found for this course.")).pack(pady=20)
                return

            # Display header for the student list
            header_frame = ctk.CTkFrame(self.students_display_frame, fg_color="transparent")
            header_frame.pack(fill="x", pady=(0, 5))
            ctk.CTkLabel(header_frame, text=_("Student Name"), font=ctk.CTkFont(weight="bold"), width=300, anchor="w").pack(side="left", padx=5)
            ctk.CTkLabel(header_frame, text=_("Status"), font=ctk.CTkFont(weight="bold"), width=300).pack(side="left")
            ctk.CTkLabel(header_frame, text=_("Arrival Time (for Late)"), font=ctk.CTkFont(weight="bold")).pack(side="left", padx=10)

            for student in students_data:
                student_row_frame = ctk.CTkFrame(self.students_display_frame, fg_color="transparent", border_width=1, corner_radius=5)
                student_row_frame.pack(fill="x", pady=2, padx=5)

                student_name = f"{student['last_name']}, {student['first_name']} ({student['student_id']})"
                ctk.CTkLabel(student_row_frame, text=student_name, width=300, anchor="w").pack(side="left", padx=5)

                status_var = ctk.StringVar(value="Present")
                self.student_attendance_vars[student['id']] = status_var

                status_options_frame = ctk.CTkFrame(student_row_frame, fg_color="transparent")
                status_options_frame.pack(side="left", padx=5)

                ctk.CTkRadioButton(status_options_frame, text=_("Present"), variable=status_var, value="Present").pack(side="left", padx=2)
                ctk.CTkRadioButton(status_options_frame, text=_("Absent"), variable=status_var, value="Absent").pack(side="left", padx=2)
                ctk.CTkRadioButton(status_options_frame, text=_("Late"), variable=status_var, value="Late").pack(side="left", padx=2)
                ctk.CTkRadioButton(status_options_frame, text=_("Excused"), variable=status_var, value="Excused").pack(side="left", padx=2)

                arrival_time_var = ctk.StringVar(value=datetime.now().strftime("%H:%M"))
                self.student_arrival_time_vars[student['id']] = arrival_time_var
                
                arrival_entry = ctk.CTkEntry(student_row_frame, textvariable=arrival_time_var, width=80, placeholder_text="HH:MM")
                arrival_entry.pack(side="left", padx=20)
            
        except Exception as e:
            messagebox.showerror(_("Error"), _(f"Failed to load students: {str(e)}"))

    def _save_attendance_records(self):
        """Saves the marked attendance records to the database."""
        selected_course_display = self.mark_course_var.get()
        selected_date = self.mark_date_var.get()

        if selected_course_display == _("No Courses Available") or not selected_course_display:
            messagebox.showwarning(_("Warning"), _("Please select a valid course."))
            return
        if not selected_date:
            messagebox.showwarning(_("Warning"), _("Please select a date."))
            return
        if not self.student_attendance_vars:
            messagebox.showwarning(_("Warning"), _("No students loaded to save attendance for."))
            return
        
        course_id = int(selected_course_display.split(" - ")[0])
        marked_by = self.user['username'] if self.user else "System"

        try:
            for student_internal_id, status_var in self.student_attendance_vars.items():
                status = status_var.get()
                arrival_time = self.student_arrival_time_vars[student_internal_id].get() if status == "Late" else None

                # Basic validation for time format if it's Late
                if status == "Late" and arrival_time:
                    try:
                        datetime.strptime(arrival_time, "%H:%M")
                    except ValueError:
                        arrival_time = datetime.now().strftime("%H:%M") # Default to current if invalid

                # Check if attendance already exists for this student, course, and date
                check_query = """
                SELECT id FROM attendance
                WHERE student_id = %s AND course_id = %s AND date = %s
                """
                existing_record = self.db.fetch_one(check_query, (student_internal_id, course_id, selected_date))

                if existing_record:
                    # Update existing record
                    update_query = """
                    UPDATE attendance
                    SET status = %s, arrival_time = %s, marked_by = %s, updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                    """
                    self.db.execute(update_query, (status, arrival_time, marked_by, existing_record['id']))
                else:
                    # Insert new record
                    insert_query = """
                    INSERT INTO attendance (student_id, course_id, date, status, arrival_time, marked_by)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    """
                    self.db.execute(insert_query, (student_internal_id, course_id, selected_date, status, arrival_time, marked_by))
            
            messagebox.showinfo(_("Success"), _("Attendance records saved successfully!"))
            self.mark_attendance_top_level_window.destroy() # Close the window after saving

        except Exception as e:
            messagebox.showerror(_("Error"), _(f"Failed to save attendance records: {str(e)}"))

    def _display_attendance_view(self):
        """Displays the attendance records, summary, and table directly in the main frame."""
        for widget in self.records_display_frame.winfo_children():
            widget.destroy()
        
        # Heading
        selected_date = self.date_entry_var.get()
        ctk.CTkLabel(self.records_display_frame, text=_(f"Attendance Records - {selected_date}"),
                           font=ctk.CTkFont(size=24, weight="bold")).pack(pady=(20, 10))
    
        # Fetch attendance data
        date_filter_val = self.date_entry_var.get()
        course_filter_val = self.course_filter_var.get()
    
        query = """
        SELECT a.status, a.arrival_time, s.first_name, s.last_name, c.course_name
        FROM attendance a
        JOIN students s ON a.student_id = s.id
        JOIN courses c ON a.course_id = c.id
        """
        params = []
        conditions = []
    
        if date_filter_val:
            conditions.append("a.date = %s")
            params.append(date_filter_val)
        
        # Only add course filter if it's not "All"
        if course_filter_val != _("All"):
            conditions.append("c.course_name = %s")
            params.append(course_filter_val)
    
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
        
        query += " ORDER BY c.course_name, s.last_name, s.first_name"
    
        attendance_records = self.db.fetch_all(query, tuple(params))
        
        # Summary Statistics
        total_students_count = len(attendance_records)
        present_count = sum(1 for record in attendance_records if record['status'] == 'Present')
        late_count = sum(1 for record in attendance_records if record['status'] == 'Late')
        absent_count = sum(1 for record in attendance_records if record['status'] == 'Absent')
        excused_count = sum(1 for record in attendance_records if record['status'] == 'Excused')

        summary_frame = ctk.CTkFrame(self.records_display_frame, fg_color="transparent")
        summary_frame.pack(pady=10)
        
        ctk.CTkLabel(summary_frame, text=_(f"🧑‍🎓 Total: {total_students_count}"), font=ctk.CTkFont(size=14)).pack(side="left", padx=10)
        ctk.CTkLabel(summary_frame, text=_(f"✅ Present: {present_count}"), font=ctk.CTkFont(size=14), text_color="green").pack(side="left", padx=10)
        ctk.CTkLabel(summary_frame, text=_(f"🕒 Late: {late_count}"), font=ctk.CTkFont(size=14), text_color="orange").pack(side="left", padx=10)
        ctk.CTkLabel(summary_frame, text=_(f"❌ Absent: {absent_count}"), font=ctk.CTkFont(size=14), text_color="red").pack(side="left", padx=10)
        ctk.CTkLabel(summary_frame, text=_(f"🙏 Excused: {excused_count}"), font=ctk.CTkFont(size=14), text_color="gray").pack(side="left", padx=10)

        # Attendance Table
        if attendance_records:
            table_container = ctk.CTkScrollableFrame(self.records_display_frame)
            table_container.pack(fill="both", expand=True, padx=20, pady=10)

            headers = [_("Student Name"), _("Course"), _("Status"), _("Arrival Time")]
            for i, header in enumerate(headers):
                ctk.CTkLabel(table_container, text=header, font=ctk.CTkFont(weight="bold")).grid(row=0, column=i, padx=10, pady=5, sticky="w")
            
            for r, record in enumerate(attendance_records):
                row = r + 1
                status_color = "green" if record['status'] == "Present" else "orange" if record['status'] == "Late" else "red" if record['status'] == "Absent" else "gray"
                
                ctk.CTkLabel(table_container, text=f"{record['last_name']}, {record['first_name']}").grid(row=row, column=0, padx=10, pady=2, sticky="w")
                ctk.CTkLabel(table_container, text=record['course_name']).grid(row=row, column=1, padx=10, pady=2, sticky="w")

                status_display_frame = ctk.CTkFrame(table_container, fg_color=status_color, corner_radius=5)
                status_display_frame.grid(row=row, column=2, padx=10, pady=2, sticky="ew")
                ctk.CTkLabel(status_display_frame, text=record['status'], text_color="white").pack(padx=5, pady=2)

                arrival_time_str = record['arrival_time'].strftime("%H:%M") if record['arrival_time'] else "---"
                ctk.CTkLabel(table_container, text=arrival_time_str).grid(row=row, column=3, padx=10, pady=2, sticky="w")
        else:
            ctk.CTkLabel(self.records_display_frame, text=_("No attendance records found for the selected date and course."),
                               font=ctk.CTkFont(size=16)).pack(pady=20)




    def load_all_students_for_combobox(self):
        # This method is no longer used directly by the main show() or its sub-windows.
        # Its functionality has been moved to _load_all_students_for_combobox_for_window.
        pass

    def on_student_select(self, selection):
        # This method is no longer used directly by the main show() or its sub-windows.
        # Its functionality has been moved to _on_student_select_for_window.
        pass

    def mark_attendance(self):
        # This method is now replaced by _mark_attendance_from_window and is no longer directly used.
        pass

    def load_attendance(self):
        # This method is now replaced by _filter_attendance_for_window and is no longer directly used.
        pass

    def create_attendance_form(self, parent):
        # This method is now replaced by create_attendance_form_for_window.
        pass

    def create_attendance_list(self, parent):
        # This method is now replaced by create_attendance_list_for_window.
        pass

    def filter_attendance(self):
        # This method is now replaced by _filter_attendance_for_window.
        pass

    def export_attendance(self):
        try:
            query = """
            SELECT a.date, c.course_name, s.student_id as student_id_str, s.first_name, s.last_name, 
                   a.status
            FROM attendance a
            JOIN students s ON a.student_id = s.id
            JOIN courses c ON a.course_id = c.id
            ORDER BY a.date DESC, c.course_name, s.last_name, s.first_name
            """
            attendance = self.db.fetch_all(query)
            
            df = pd.DataFrame(attendance)
            
            from tkinter import filedialog
            file_path = filedialog.asksaveasfilename(
                defaultextension=".xlsx",
                filetypes=[(_("Excel files"), "*.xlsx"), (_("All files"), "*.*")]
            )
            
            if file_path:
                df.to_excel(file_path, index=False)
                messagebox.showinfo(_("Success"), _("Attendance exported successfully!"))
        except Exception as e:
            messagebox.showerror(_("Error"), _(f"Failed to export attendance: {str(e)}"))
    def view_attendance_details(self, record):
        detail_window = ctk.CTkToplevel(self.parent_frame)
        detail_window.title(_(f"Details: Attendance for {record['first_name']} {record['last_name']}"))
        detail_window.geometry("900x800") # Increased size for more content

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

        # Tab 1: Attendance Record
        attendance_tab = tabview.add(_("Attendance Record"))
        attendance_scroll_frame = ctk.CTkScrollableFrame(attendance_tab)
        attendance_scroll_frame.pack(fill="both", expand=True, padx=5, pady=5)

        details_to_show = {
            _("Date"): record['date'],
            _("Course Name"): record['course_name'],
            _("Student Name"): f"{record['first_name']} {record['last_name']}",
            _("Status"): record['status']
        }
        for key, value in details_to_show.items():
            frame = ctk.CTkFrame(attendance_scroll_frame, fg_color="transparent")
            frame.pack(fill="x", pady=2, padx=5)
            ctk.CTkLabel(frame, text=_(f"➡️ {key}:"), font=ctk.CTkFont(weight="bold")).pack(side="left", anchor="w", padx=5)
            ctk.CTkLabel(frame, text=str(value)).pack(side="left", anchor="w", padx=5)

        # Tab 2: Student Info
        student_info_tab = tabview.add(_("Student Info"))
        student_info_scroll_frame = ctk.CTkScrollableFrame(student_info_tab)
        student_info_scroll_frame.pack(fill="both", expand=True, padx=5, pady=5)

        # Fetch full student details
        student_query = """
        SELECT id, student_id, first_name, last_name, gender, date_of_birth, address, phone, email, photo_path, created_at, status
        FROM students
        WHERE id = %s -- Use internal student ID for lookup
        """
        student_data = self.db.fetch_one(student_query, (record['student_id'],)) # record['student_id'] is the internal ID from attendance table

        if student_data:
            # Get current course for student
            course_for_student_query = """
            SELECT c.course_name
            FROM student_courses sc
            JOIN courses c ON sc.course_id = c.id
            WHERE sc.student_id = %s
            ORDER BY sc.enrollment_date DESC
            LIMIT 1
            """
            current_course_result = self.db.fetch_one(course_for_student_query, (student_data['id'],))
            current_student_course = current_course_result['course_name'] if current_course_result else _("Not Enrolled")

            student_details_to_show = {
                _("Student ID"): student_data['student_id'],
                _("Name"): f"{student_data['first_name']} {student_data['last_name']}",
                _("Gender"): student_data['gender'],
                _("Date of Birth"): student_data['date_of_birth'],
                _("Address"): student_data['address'],
                _("Phone"): student_data['phone'],
                _("Email"): student_data['email'],
                _("Status"): student_data['status'],
                _("Current Course"): current_student_course
            }
            for key, value in student_details_to_show.items():
                frame = ctk.CTkFrame(student_info_scroll_frame, fg_color="transparent")
                frame.pack(fill="x", pady=2, padx=5)
                ctk.CTkLabel(frame, text=_(f"➡️ {key}:"), font=ctk.CTkFont(weight="bold")).pack(side="left", anchor="w", padx=5)
                ctk.CTkLabel(frame, text=str(value)).pack(side="left", anchor="w", padx=5)
        else:
            ctk.CTkLabel(student_info_scroll_frame, text=_("Student details not found.")).pack(pady=10)

        # Tab 3: Course Info
        course_info_tab = tabview.add(_("Course Info"))
        course_info_scroll_frame = ctk.CTkScrollableFrame(course_info_tab)
        course_info_scroll_frame.pack(fill="both", expand=True, padx=5, pady=5)

        course_query = "SELECT course_name, course_code, description, duration, fee FROM courses WHERE id = %s"
        course_data = self.db.fetch_one(course_query, (record['course_id'],))

        if course_data:
            details_to_show_course = {
                _("Course Name"): course_data['course_name'],
                _("Course Code"): course_data['course_code'],
                _("Duration"): _(f"{course_data['duration']} months"),
                _("Fee"): _(f"Le {course_data['fee']:,.2f}"),
                _("Description"): course_data['description']
            }
            for key, value in details_to_show_course.items():
                frame = ctk.CTkFrame(course_info_scroll_frame, fg_color="transparent")
                frame.pack(fill="x", pady=2, padx=5)
                ctk.CTkLabel(frame, text=_(f"➡️ {key}:"), font=ctk.CTkFont(weight="bold")).pack(side="left", anchor="w", padx=5)
                if key == _("Description"):
                    ctk.CTkLabel(frame, text=str(value), wraplength=400, justify="left").pack(side="left", anchor="w", padx=5)
                else:
                    ctk.CTkLabel(frame, text=str(value)).pack(side="left", anchor="w", padx=5)
        else:
            ctk.CTkLabel(course_info_scroll_frame, text=_("Course details not found.")).pack(pady=10)


        # Tab 4: Other Student Attendance
        other_student_attendance_tab = tabview.add(_("Other Student Attendance"))
        other_student_attendance_scroll_frame = ctk.CTkScrollableFrame(other_student_attendance_tab)
        other_student_attendance_scroll_frame.pack(fill="both", expand=True, padx=5, pady=5)

        other_sa_query = """
        SELECT a.date, a.status, c.course_name
        FROM attendance a
        JOIN courses c ON a.course_id = c.id
        WHERE a.student_id = %s AND a.id != %s
        ORDER BY a.date DESC
        """
        other_student_attendance = self.db.fetch_all(other_sa_query, (record['student_id'], record['id']))

        if other_student_attendance:
            for sa_record in other_student_attendance:
                sa_info = _(f"➡️ Date: {sa_record['date']} | Course: {sa_record['course_name']} | Status: {sa_record['status']}")
                ctk.CTkLabel(other_student_attendance_scroll_frame, text=sa_info, wraplength=400, justify="left").pack(fill="x", pady=2, padx=5)
        else:
            ctk.CTkLabel(other_student_attendance_scroll_frame, text=_("No other attendance records for this student.")).pack(pady=10)

        # Tab 5: Other Course Attendance
        other_course_attendance_tab = tabview.add(_("Other Course Attendance"))
        other_course_attendance_scroll_frame = ctk.CTkScrollableFrame(other_course_attendance_tab)
        other_course_attendance_scroll_frame.pack(fill="both", expand=True, padx=5, pady=5)

        other_ca_query = """
        SELECT a.date, a.status, s.first_name, s.last_name
        FROM attendance a
        JOIN students s ON a.student_id = s.id -- Corrected: Join on students.id
        JOIN courses c ON a.course_id = c.id
        WHERE a.course_id = %s AND a.id != %s
        ORDER BY a.date DESC, s.last_name, s.first_name
        """
        other_course_attendance = self.db.fetch_all(other_ca_query, (record['course_id'], record['id']))

        if other_course_attendance:
            for ca_record in other_course_attendance:
                ca_info = _(f"➡️ Date: {ca_record['date']} | Student: {ca_record['first_name']} {ca_record['last_name']} | Status: {ca_record['status']}")
                ctk.CTkLabel(other_course_attendance_scroll_frame, text=ca_info, wraplength=400, justify="left").pack(fill="x", pady=2, padx=5)
        else:
            ctk.CTkLabel(other_course_attendance_scroll_frame, text=_("No other attendance records for this course.")).pack(pady=10)


        close_button = ctk.CTkButton(detail_window, text=_("Close"), command=detail_window.destroy)
        close_button.pack(pady=10)

    def show_context_menu(self, event, record):
        context_menu = Menu(self.attendance_frame, tearoff=0)
        context_menu.add_command(label=_("View Details"), command=lambda: self.view_attendance_details(record))
        context_menu.add_separator()
        context_menu.add_command(label=_("Delete"), command=lambda: self.delete_attendance(record['id']))
        context_menu.post(event.x_root, event.y_root)

    def delete_attendance(self, attendance_id):
        if messagebox.askyesno(_("Confirm"), _("Are you sure you want to delete this attendance record?")):
            try:
                query = "DELETE FROM attendance WHERE id = %s"
                self.db.execute(query, (attendance_id,))
                messagebox.showinfo(_("Success"), _("Attendance record deleted successfully!"))
                self.load_attendance()
            except Exception as e:
                messagebox.showerror(_("Error"), _(f"Failed to delete attendance: {str(e)}"))

    def filter_attendance(self):
        filter_date = self.filter_date.get()
        if not filter_date:
            self.load_attendance()
            return

        try:
            query = """
            SELECT a.*, s.first_name, s.last_name, s.student_id, c.course_name
            FROM attendance a
            JOIN students s ON a.student_id = s.id
            JOIN courses c ON a.course_id = c.id
            WHERE a.date = %s
            ORDER BY c.course_name, s.last_name, s.first_name
            """
            attendance = self.db.fetch_all(query, (filter_date,))

            # Clear and reload
            for widget in self.attendance_frame.winfo_children():
                widget.destroy()

            for record in attendance:
                frame = ctk.CTkFrame(self.attendance_frame)
                frame.pack(fill="x", padx=5, pady=5)

                info_text = (f"{record['date']} - "
                            f"{record['course_name']} - "
                            f"{record['last_name']}, {record['first_name']} - "
                            f"{record['status']}")
                label = ctk.CTkLabel(frame, text=info_text)
                label.pack(side="left", padx=10, pady=5)

                # Double-click to view details
                frame.bind("<Double-Button-1>", lambda event, r=record: self.view_attendance_details(r))
                label.bind("<Double-Button-1>", lambda event, r=record: self.view_attendance_details(r))

                # Right-click context menu
                frame.bind("<Button-3>", lambda event, r=record: self.show_context_menu(event, r))
                label.bind("<Button-3>", lambda event, r=record: self.show_context_menu(event, r))

        except Exception as e:
            messagebox.showerror(_("Error"), _(f"Failed to filter attendance: {str(e)}"))
