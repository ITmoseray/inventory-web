import { LayoutDashboard, Users, BookOpen, CreditCard, Wallet, Settings, Activity, GraduationCap, Building2, Calendar, Mail } from "lucide-react";

export const getSchoolSidebarConfig = (institutionType?: string | null) => {
  const isNursing = institutionType === 'NURSING_MEDICAL';
  const isUniversity = institutionType === 'UNIVERSITY_COLLEGE';
  const isTraining = institutionType === 'TRAINING_INSTITUTE';

  const academicLabel = isUniversity ? "Faculties & Programs" : 
                        isNursing ? "Cohorts & Rotations" : 
                        isTraining ? "Training Modules" : 
                        "Academics";

  const coursesTitle = isUniversity ? "Courses & Semesters" : 
                       isNursing ? "Clinical Rotations" : 
                       isTraining ? "Training Modules" : 
                       "Courses & Classes";

  const coursesIcon = isNursing ? Activity : 
                      isUniversity ? Building2 : 
                      isTraining ? GraduationCap : 
                      BookOpen;

  return [
    { 
      label: "Institution Hub", 
      items: [
        { title: "Overview", url: "/dashboard/school", icon: LayoutDashboard, permission: "menu:overview" }
      ] 
    },
    { 
      label: academicLabel, 
      items: [
        { title: "Students / Trainees", url: "/dashboard/school/students", icon: Users, permission: "menu:overview" },
        { title: coursesTitle, url: "/dashboard/school/courses", icon: coursesIcon, permission: "menu:overview" },
        { title: "Academic Records", url: "/dashboard/school/academics", icon: GraduationCap, permission: "menu:overview" },
        { title: "Daily Attendance", url: "/dashboard/school/attendance", icon: Calendar, permission: "menu:overview" }
      ] 
    },
    { 
      label: "Facilities & Assets", 
      items: [
        { title: "Library Catalog", url: "/dashboard/school/library", icon: BookOpen, permission: "menu:overview" },
        { title: "Hostel & Rooms", url: "/dashboard/school/hostel", icon: Building2, permission: "menu:overview" }
      ] 
    },
    { 
      label: "Connectivity", 
      items: [
        { title: "Broadcasts & Alerts", url: "/dashboard/school/communications", icon: Mail, permission: "menu:overview" }
      ] 
    },
    { 
      label: "Staff & Financials", 
      items: [
        { title: "Staff Directory", url: "/dashboard/school/staff", icon: Users, permission: "menu:overview" },
        { title: "Payments & Fees", url: "/dashboard/school/payments", icon: CreditCard, permission: "menu:overview" },
        { title: "Staff Payroll", url: "/dashboard/school/payroll", icon: Wallet, permission: "menu:overview" }
      ] 
    },
    { 
      label: "Settings", 
      items: [
        { title: "Business Settings", url: "/dashboard/system/settings", icon: Settings, permission: "menu:system:settings" }
      ] 
    }
  ];
};
