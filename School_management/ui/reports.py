import customtkinter as ctk
from tkinter import messagebox, filedialog, Menu
import pandas as pd
from datetime import datetime
from ui.tooltip import Tooltip
from db import report_queries
import calendar
from utils.i18n import get_translator
from utils.mixins import UndoRedoEntryMixin
from matplotlib.figure import Figure
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
import matplotlib.pyplot as plt
import numpy as np

_ = get_translator()

class ReportsWindow:
    def __init__(self, parent_frame, db, user=None):
        self.parent_frame = parent_frame
        self.db = db
        self.user = user

    def show(self):
        for widget in self.parent_frame.winfo_children():
            widget.destroy()

        self.tab_view = ctk.CTkTabview(self.parent_frame)
        self.tab_view.pack(fill="both", expand=True, padx=10, pady=10)

        self.tab_view.add(_("Data Reports"))
        self.tab_view.add(_("📊 Visual Analytics"))

        self._create_data_reports_tab(self.tab_view.tab(_("Data Reports")))
        self._create_visual_analytics_tab(self.tab_view.tab(_("📊 Visual Analytics")))

    def _create_data_reports_tab(self, parent):
        container = ctk.CTkScrollableFrame(parent)
        container.pack(fill="both", expand=True)

        ctk.CTkLabel(container, text=_("📄 Data Reports & Exports"), font=ctk.CTkFont(size=20, weight="bold")).pack(pady=10)

        reports_frame = ctk.CTkFrame(container)
        reports_frame.pack(fill="x", padx=20, pady=10)

        buttons_info = [
            (_("🧑‍🎓 Student Enrollment"), self.generate_student_enrollment_report, "mediumblue"),
            (_("📊 Payment Summary"), self.generate_payment_summary_report, "darkgreen"),
            (_("✅ Course Attendance"), self.generate_attendance_report, "teal"),
            (_("📚 Course Popularity"), self.generate_course_popularity_report, "purple")
        ]

        for text, command, color in buttons_info:
            btn = ctk.CTkButton(reports_frame, text=text, command=command, fg_color=color)
            btn.pack(side="left", padx=10, pady=10, expand=True)

        # Result Display Area
        self.result_frame = ctk.CTkFrame(container)
        self.result_frame.pack(fill="both", expand=True, padx=20, pady=10)
        
        self.result_label = ctk.CTkLabel(self.result_frame, text=_("Select a report to generate and view data here."))
        self.result_label.pack(pady=20)

    def _create_visual_analytics_tab(self, parent):
        container = ctk.CTkScrollableFrame(parent)
        container.pack(fill="both", expand=True)

        ctk.CTkLabel(container, text=_("📊 Professional Analytics"), font=ctk.CTkFont(size=20, weight="bold")).pack(pady=10)

        charts_container = ctk.CTkFrame(container, fg_color="transparent")
        charts_container.pack(fill="both", expand=True, padx=10)

        # Revenue Trend Chart
        self._add_chart(charts_container, _("Monthly Revenue Trend (Le)"), self._get_revenue_data(), "line")
        
        # Attendance Heatmap-style bar
        self._add_chart(charts_container, _("Attendance by Course (%)"), self._get_attendance_data(), "bar")

    def _add_chart(self, parent, title, data, chart_type):
        frame = ctk.CTkFrame(parent, fg_color="gray15")
        frame.pack(fill="x", pady=10, padx=5)

        ctk.CTkLabel(frame, text=title, font=ctk.CTkFont(size=14, weight="bold")).pack(pady=5)

        if not data:
            ctk.CTkLabel(frame, text=_("No data available for this chart.")).pack(pady=10)
            return

        fig = Figure(figsize=(8, 4), dpi=100, facecolor="#1e1e1e")
        ax = fig.add_subplot(111)
        ax.set_facecolor("#1e1e1e")
        ax.tick_params(colors='white')
        for spine in ax.spines.values(): spine.set_color('white')

        labels = list(data.keys())
        values = list(data.values())

        if chart_type == "line":
            ax.plot(labels, values, marker='o', color='#4CAF50', linewidth=2)
            ax.fill_between(labels, values, color='#4CAF50', alpha=0.2)
        else:
            ax.bar(labels, values, color='#2196F3')

        fig.tight_layout()
        canvas = FigureCanvasTkAgg(fig, master=frame)
        canvas.draw()
        canvas.get_tk_widget().pack(fill="both", expand=True, padx=10, pady=5)

    def _get_revenue_data(self):
        try:
            query = "SELECT DATE_FORMAT(payment_date, '%Y-%m') as month, SUM(amount) as total FROM payments GROUP BY month ORDER BY month DESC LIMIT 6"
            results = self.db.fetch_all(query)
            return {r['month']: float(r['total']) for r in reversed(results)}
        except: return {}

    def _get_attendance_data(self):
        try:
            query = """
                SELECT c.course_name, 
                (SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) * 100.0 / COUNT(a.id)) as rate 
                FROM courses c 
                JOIN attendance a ON c.id = a.course_id 
                GROUP BY c.course_name
            """
            results = self.db.fetch_all(query)
            return {r['course_name']: float(r['rate']) for r in results}
        except: return {}

    # Existing methods adapted for the new UI
    def generate_student_enrollment_report(self):
        data = report_queries.get_student_enrollment_report()
        self._display_report_data(data, _("Student Enrollment"))

    def generate_payment_summary_report(self):
        data = report_queries.get_payment_summary_report()
        self._display_report_data(data, _("Payment Summary"))

    def generate_attendance_report(self):
        data = self.db.fetch_all("SELECT s.first_name, s.last_name, c.course_name, a.date, a.status FROM attendance a JOIN students s ON a.student_id = s.id JOIN courses c ON a.course_id = c.id ORDER BY a.date DESC")
        self._display_report_data(data, _("Course Attendance"))

    def generate_course_popularity_report(self):
        data = report_queries.get_course_enrollment_distribution()
        self._display_report_data(data, _("Course Popularity"))

    def _display_report_data(self, data, title):
        for widget in self.result_frame.winfo_children():
            widget.destroy()

        if not data:
            self.result_label = ctk.CTkLabel(self.result_frame, text=_("No data found for this report."))
            self.result_label.pack(pady=20)
            return

        df = pd.DataFrame(data)
        
        # Display small preview table
        preview_text = ctk.CTkTextbox(self.result_frame, height=200)
        preview_text.pack(fill="x", padx=10, pady=10)
        preview_text.insert("1.0", df.to_string(index=False))
        preview_text.configure(state="disabled")

        # Export Button
        export_btn = ctk.CTkButton(self.result_frame, text=_("💾 Export to Excel"), 
                                  command=lambda: self.export_to_excel(df, title))
        export_btn.pack(pady=10)

    def export_to_excel(self, df, title):
        filepath = filedialog.asksaveasfilename(defaultextension=".xlsx", 
                                               filetypes=[("Excel files", "*.xlsx")],
                                               initialfile=f"{title}_{datetime.now().strftime('%Y%m%d')}.xlsx")
        if filepath:
            df.to_excel(filepath, index=False)
            messagebox.showinfo(_("Success"), _(f"Report exported to {filepath}"))
