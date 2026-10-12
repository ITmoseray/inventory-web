"use client";

import {
  useState,
  useEffect,
  useRef,
  useMemo,
  ChangeEvent,
  FormEvent,
  ReactNode,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { registerBusiness, checkUserExists } from "@/lib/actions/auth";
import { getSystemSettings } from "@/lib/actions/system-settings";
import { uploadBusinessLogo } from "@/lib/actions/upload";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Lock, ShieldCheck, ArrowLeft } from "lucide-react";
import "./register.css";

export type PlanTier = "BASIC" | "STANDARD" | "ENTERPRISE";

export type PlanDefinition = {
  id: PlanTier;
  name: string;
  monthly: number;
  annual: number;
  savings: number;
  popular?: boolean;
  description: string;
  features: string[];
};

type FormData = {
  // Step 1: Business Profile
  businessName: string;
  legalName: string;
  businessType: string; // SHOP, SUPERMARKET, PHARMACY, CLINIC, HOSPITAL, RESTAURANT, BAR, SCHOOL, OFFICE
  institutionType: string;
  category: string;
  registrationNumber: string;
  taxId: string;
  website: string;
  teamSize: string;
  businessPhone: string;
  businessEmail: string;
  address: string;
  city: string;
  region: string;

  // Step 2: Owner Account
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  password: string;
  confirmPassword: string;

  // Referral tracking
  referralSource: string;
  customReferralSource: string;
  referralCode: string;
  affiliateRef: string;
  affiliateClickId: string;

  // Step 3: Workspace & Subscription
  workspace: "inventory" | "totals";
  billing: "monthly" | "annual";
  planTier: PlanTier;
  currency: string;
  timezone: string;
};

type FieldName = keyof FormData;
type Errors = Partial<Record<FieldName, string>>;

const initialForm: FormData = {
  businessName: "",
  legalName: "",
  businessType: "SHOP",
  institutionType: "",
  category: "Sole Proprietorship",
  registrationNumber: "",
  taxId: "",
  website: "",
  teamSize: "2–5 employees",
  businessPhone: "",
  businessEmail: "",
  address: "",
  city: "Freetown",
  region: "Western Area Urban (Freetown)",
  ownerName: "",
  ownerEmail: "",
  ownerPhone: "",
  password: "",
  confirmPassword: "",
  referralSource: "",
  customReferralSource: "",
  referralCode: "",
  affiliateRef: "",
  affiliateClickId: "",
  workspace: "inventory",
  billing: "annual",
  planTier: "STANDARD",
  currency: "SLL",
  timezone: "Africa/Freetown",
};

const steps = [
  {
    title: "Business Profile",
    subtitle: "Your company details",
    icon: "building",
  },
  { title: "Owner Account", subtitle: "Set up your access", icon: "user" },
  {
    title: "Workspace Setup",
    subtitle: "Choose how you work",
    icon: "sliders",
  },
  { title: "Review & Create", subtitle: "Confirm and launch", icon: "check" },
];

// Backend-supported business types in Prisma enum BusinessType
const BUSINESS_TYPES = [
  {
    id: "SHOP",
    label: "Retail Shop & Store",
    desc: "Inventory catalog, barcodes, POS register checkout",
  },
  {
    id: "SUPERMARKET",
    label: "Supermarket & Wholesale",
    desc: "Bulk stock, fast cashiering, multiple sales registers",
  },
  {
    id: "PHARMACY",
    label: "Pharmacy & Healthcare Retail",
    desc: "Batch numbers, expiry tracking, controlled medications",
  },
  {
    id: "CLINIC",
    label: "Clinic & Medical Center",
    desc: "Patients, triage, lab requests, prescriptions & billing",
  },
  {
    id: "HOSPITAL",
    label: "Hospital & Medical Complex",
    desc: "Admissions, wards, multi-department, lab & pharmacy",
  },
  {
    id: "RESTAURANT",
    label: "Restaurant & Eatery",
    desc: "Tables, dining, kitchen tickets, menu categories",
  },
  {
    id: "BAR",
    label: "Bar, Lounge & Club",
    desc: "Open bar tabs, bottle inventory, quick beverage sales",
  },
  {
    id: "SCHOOL",
    label: "School & Academic Institution",
    desc: "Students, terms, tuition fee payments, hostel & report cards",
  },
  {
    id: "OFFICE",
    label: "Corporate Office & Services",
    desc: "Staff attendance, client CRM, invoicing & expense tracking",
  },
];

const INSTITUTION_TYPES = [
  "Nursery & Kindergarten",
  "Primary / Elementary School",
  "Junior Secondary School (JSS)",
  "Senior Secondary School (SSS)",
  "College / University",
  "Vocational & Technical Institute",
];

const LEGAL_STRUCTURES = [
  "Sole Proprietorship",
  "Partnership",
  "Limited Liability Company (LLC)",
  "Corporation (Ltd / PLC)",
  "Non-profit Organisation / NGO",
  "Other Enterprise Structure",
];

const TEAM_SIZES = [
  "Just me (Solo operator)",
  "2–5 employees",
  "6–20 employees",
  "21–50 employees",
  "51+ employees",
];

const REGIONS = [
  "Western Area Urban (Freetown)",
  "Western Area Rural",
  "Eastern Province",
  "Northern Province",
  "North Western Province",
  "Southern Province",
];

const REFERRAL_OPTIONS = [
  { value: "Google Search", label: "Google / Search Engine" },
  { value: "LinkedIn", label: "LinkedIn Post or Advertisement" },
  { value: "Social Media", label: "Facebook / Instagram / TikTok" },
  { value: "Colleague / Friend", label: "Colleague, Friend, or Partner Referral" },
  { value: "Tech Event / Seminar", label: "Tech Event, Seminar, or Industry Expo" },
  { value: "YouTube / Video Demo", label: "YouTube / Online Video Demo" },
  { value: "News / Article / Blog", label: "News Article, Tech Blog, or Press" },
  { value: "Billboard / Print", label: "Billboard, Flyer, or Print Media" },
  { value: "Other", label: "Other Source" },
];

/**
 * Adapts plans specifically for each business type so each business gets its own
 * specialized plans with all corresponding features included on that tier.
 */
export function getPlansForBusinessType(businessType: string): PlanDefinition[] {
  switch (businessType) {
    case "PHARMACY":
      return [
        {
          id: "BASIC",
          name: "Pharmacy Starter",
          monthly: 60,
          annual: 600,
          savings: 120,
          description: "For community dispensaries & single-store pharmacies",
          features: [
            "1 dispensary location & 1 cashier account",
            "Up to 500 drug items with dosage units",
            "Batch number & expiry date tracking",
            "Point-of-Sale (POS) counter dispensing",
            "Standard pharmacy sales receipts",
          ],
        },
        {
          id: "STANDARD",
          name: "Growth Pharmacy",
          monthly: 150,
          annual: 1500,
          savings: 300,
          popular: true,
          description: "For busy retail pharmacies & chemist shops",
          features: [
            "Up to 3 pharmacy branches & 5 staff accounts",
            "Up to 5,000 pharmaceutical items",
            "Automated near-expiry alerts & stock quarantine",
            "Supplier price lists & restock orders",
            "Controlled drug register & tax compliance reports",
          ],
        },
        {
          id: "ENTERPRISE",
          name: "Pharmacy Enterprise",
          monthly: 300,
          annual: 3000,
          savings: 600,
          description: "For pharmacy chains, wholesale distributors & institutional suppliers",
          features: [
            "Unlimited pharmacy branches & staff accounts",
            "Unlimited pharmaceutical items & formulations",
            "Inter-branch drug transfers & batch tracking",
            "Institutional client accounts & hospital billing",
            "Comprehensive pharmaceutical audit trail & P&L",
          ],
        },
      ];

    case "CLINIC":
      return [
        {
          id: "BASIC",
          name: "Clinic Starter",
          monthly: 60,
          annual: 600,
          savings: 120,
          description: "For private outpatient clinics & medical practices",
          features: [
            "1 consultation room & 1 clinical practitioner",
            "Patient registry & digital triage queue",
            "Clinical consultation notes & vital signs",
            "Consultation fee billing & patient receipts",
            "Daily patient attendance & revenue summary",
          ],
        },
        {
          id: "STANDARD",
          name: "Growth Clinic",
          monthly: 150,
          annual: 1500,
          savings: 300,
          popular: true,
          description: "For multi-practitioner polyclinics & specialist health centers",
          features: [
            "Up to 3 consultation suites & 5 clinical staff",
            "Integrated dispensary & prescription routing",
            "Laboratory test orders & diagnostic results entry",
            "Patient appointment calendar & follow-ups",
            "Clinical revenue breakdown & medical audit reports",
          ],
        },
        {
          id: "ENTERPRISE",
          name: "Medical Center Pro",
          monthly: 300,
          annual: 3000,
          savings: 600,
          description: "For multi-specialty clinics & medical complexes",
          features: [
            "Unlimited clinical suites, doctors & nurses",
            "Day-patient bed observation & procedure tracking",
            "Comprehensive lab diagnostics & imaging records",
            "Corporate medical retainers & insurance claims",
            "Complete healthcare operations ledger & P&L",
          ],
        },
      ];

    case "HOSPITAL":
      return [
        {
          id: "BASIC",
          name: "Hospital Starter",
          monthly: 60,
          annual: 600,
          savings: 120,
          description: "For cottage hospitals & emergency health posts",
          features: [
            "OPD patient registry & triage assessment",
            "Up to 2 ward rooms & bed registry",
            "Doctor consultation records & prescriptions",
            "Cashier treatment billing & patient receipts",
            "Daily admission log & OPD summary",
          ],
        },
        {
          id: "STANDARD",
          name: "Hospital Growth",
          monthly: 150,
          annual: 1500,
          savings: 300,
          popular: true,
          description: "For community hospitals & district health centers",
          features: [
            "Up to 3 clinical departments & 10 inpatient beds",
            "Inpatient admission, ward transfers & discharge",
            "Hospital pharmacy dispensing & surgical supplies",
            "Diagnostic lab test management & reports",
            "Departmental revenue & consumable inventory",
          ],
        },
        {
          id: "ENTERPRISE",
          name: "Hospital Enterprise",
          monthly: 300,
          annual: 3000,
          savings: 600,
          description: "For referral hospitals & multi-ward medical complexes",
          features: [
            "Unlimited wards, beds & hospital staff accounts",
            "Full surgical, ICU & emergency room logs",
            "Consolidated multi-department billing & insurance",
            "Central medical warehouse & ward stock requisitions",
            "Complete institutional financial ledger & audit",
          ],
        },
      ];

    case "RESTAURANT":
      return [
        {
          id: "BASIC",
          name: "Restaurant Starter",
          monthly: 60,
          annual: 600,
          savings: 120,
          description: "For cafes, fast food spots & casual eateries",
          features: [
            "1 cashier station & up to 10 dining tables",
            "Menu catalog with categories & price modifiers",
            "Dine-in table orders & takeaway orders",
            "Printed kitchen order tickets (KOT)",
            "End-of-shift cash drawer balancing",
          ],
        },
        {
          id: "STANDARD",
          name: "Growth Restaurant",
          monthly: 150,
          annual: 1500,
          savings: 300,
          popular: true,
          description: "For full-service dining restaurants & food lounges",
          features: [
            "Up to 3 dining sections & 5 staff logins",
            "Live Kitchen Order Display (KOD) routing",
            "Table transfers, split bills & service charges",
            "Recipe raw ingredient stock depletion",
            "Detailed food cost analysis & shift variance reports",
          ],
        },
        {
          id: "ENTERPRISE",
          name: "Hospitality Enterprise",
          monthly: 300,
          annual: 3000,
          savings: 600,
          description: "For multi-branch restaurants, franchises & culinary groups",
          features: [
            "Unlimited restaurant branches, bars & staff accounts",
            "Central commissary & bulk food supply transfers",
            "VIP guest profiles, reservations & loyalty perks",
            "Multi-unit gross profit & food wastage tracking",
            "Consolidated hospitality group financial ledger",
          ],
        },
      ];

    case "BAR":
      return [
        {
          id: "BASIC",
          name: "Bar Starter",
          monthly: 60,
          annual: 600,
          savings: 120,
          description: "For neighborhood bars, pub counters & drink kiosks",
          features: [
            "1 bar register & 1 bartender account",
            "Beverage menu with bottles, cans & tot measures",
            "Rapid counter checkout & mobile money",
            "Bottle stock counts & low-stock alerts",
            "Daily drinks sales & cash handover summary",
          ],
        },
        {
          id: "STANDARD",
          name: "Lounge Growth",
          monthly: 150,
          annual: 1500,
          savings: 300,
          popular: true,
          description: "For cocktail lounges, sports bars & night venues",
          features: [
            "Up to 3 bar stations & 5 bartenders/waitstaff",
            "Customer open tabs & table bottle service",
            "Drink variants, mixes & liquor wastage logging",
            "Shift-by-shift bartender cash & stock balancing",
            "Peak-hour revenue reports & beverage margin analysis",
          ],
        },
        {
          id: "ENTERPRISE",
          name: "Nightlife Enterprise",
          monthly: 300,
          annual: 3000,
          savings: 600,
          description: "For multi-bar clubs, hotel lounges & event venues",
          features: [
            "Unlimited bar stations, VIP areas & event venues",
            "VIP bottle locker management & guest credits",
            "Multi-venue inventory transfer & loss prevention",
            "Live promoter & event revenue tracking",
            "Consolidated nightlife group profit & loss",
          ],
        },
      ];

    case "SCHOOL":
      return [
        {
          id: "BASIC",
          name: "School Starter",
          monthly: 60,
          annual: 600,
          savings: 120,
          description: "For nurseries, primary schools & local academies",
          features: [
            "Single campus & up to 100 enrolled students",
            "Student admission register & profile records",
            "Tuition fee collection & printed receipts",
            "Daily class attendance recording",
            "Termly fee collection & arrears summary",
          ],
        },
        {
          id: "STANDARD",
          name: "Academy Growth",
          monthly: 150,
          annual: 1500,
          savings: 300,
          popular: true,
          description: "For junior & senior secondary schools & modern academies",
          features: [
            "Single campus & up to 500 enrolled students",
            "Automated termly fee billing & installment tracking",
            "Subject grading, exam marks & term report cards",
            "Parent communication notices (SMS / email)",
            "Teacher attendance & basic payroll logging",
          ],
        },
        {
          id: "ENTERPRISE",
          name: "Institution Enterprise",
          monthly: 300,
          annual: 3000,
          savings: 600,
          description: "For large colleges, multi-campus schools & universities",
          features: [
            "Unlimited campuses & unlimited students",
            "Full hostel / dorm allocation & dining management",
            "School library catalog & book checkout system",
            "Complete staff HR, attendance & payroll disbursements",
            "Institutional financial ledger, fee reconciliation & audit",
          ],
        },
      ];

    case "OFFICE":
      return [
        {
          id: "BASIC",
          name: "Office Starter",
          monthly: 60,
          annual: 600,
          savings: 120,
          description: "For startups, consultancies & small professional offices",
          features: [
            "1 admin account & office workspace",
            "Client directory & contact CRM",
            "Professional client invoice & quotation generation",
            "Daily office expense & receipt logging",
            "Monthly cashflow & revenue summary",
          ],
        },
        {
          id: "STANDARD",
          name: "Corporate Growth",
          monthly: 150,
          annual: 1500,
          savings: 300,
          popular: true,
          description: "For expanding agencies, law firms & service companies",
          features: [
            "Up to 5 employee logins & role permissions",
            "Employee clock-in/out attendance tracking",
            "Monthly payroll calculations & payslips",
            "Project & service milestone invoicing",
            "Advanced expense tagging & departmental budgets",
          ],
        },
        {
          id: "ENTERPRISE",
          name: "Enterprise Office",
          monthly: 300,
          annual: 3000,
          savings: 600,
          description: "For corporate headquarters, conglomerates & multi-division firms",
          features: [
            "Unlimited divisions, departments & staff accounts",
            "Full HR management, leave requests & payroll",
            "Multi-currency transactions & bank reconciliations",
            "Role-based granular permissions & security audit logs",
            "Executive dynamic profit & loss and balance sheet",
          ],
        },
      ];

    default: // SHOP & SUPERMARKET
      return [
        {
          id: "BASIC",
          name: "Shop Starter",
          monthly: 60,
          annual: 600,
          savings: 120,
          description: "For small shops & solo retail stores starting out",
          features: [
            "1 business location & staff account",
            "Up to 500 catalog items",
            "Point-of-Sale (POS) register checkout",
            "Core inventory stock management",
            "Sales recording & customer receipts",
          ],
        },
        {
          id: "STANDARD",
          name: "Growth Business",
          monthly: 150,
          annual: 1500,
          savings: 300,
          popular: true,
          description: "For growing retail businesses & supermarkets",
          features: [
            "Up to 3 branch locations & 5 staff accounts",
            "Up to 5,000 catalog items",
            "Supplier purchase orders & receivables",
            "Low-stock smart alerts & barcode scanning",
            "Sales, inventory & gross profit reports",
          ],
        },
        {
          id: "ENTERPRISE",
          name: "Scale Pro",
          monthly: 300,
          annual: 3000,
          savings: 600,
          description: "For established operations requiring full control",
          features: [
            "Unlimited branch locations & staff accounts",
            "Unlimited catalog items",
            "Customer CRM & debt credit management",
            "Dynamic profit & loss and multi-branch reports",
            "Priority support & multi-branch synchronization",
          ],
        },
      ];
  }
}

function Icon({
  name,
  size = 20,
  strokeWidth = 1.8,
}: {
  name: string;
  size?: number;
  strokeWidth?: number;
}) {
  const paths: Record<string, ReactNode> = {
    box: (
      <>
        <path d="m21 8-9 5-9-5" />
        <path d="m3 8 9-5 9 5v8l-9 5-9-5Z" />
        <path d="M12 13v8" />
      </>
    ),
    building: (
      <>
        <path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
        <path d="M16 8h2a2 2 0 0 1 2 2v11M8 7h4M8 11h4M8 15h4M2 21h20" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
      </>
    ),
    sliders: (
      <>
        <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
        <circle cx="16" cy="7" r="2" />
        <circle cx="8" cy="17" r="2" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    arrow: <path d="m9 18 6-6-6-6" />,
    back: <path d="m15 18-6-6 6-6" />,
    upload: (
      <>
        <path d="M12 16V4M7 9l5-5 5 5" />
        <path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
      </>
    ),
    eye: (
      <>
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
        <circle cx="12" cy="12" r="2.5" />
      </>
    ),
    eyeOff: (
      <>
        <path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 4.2A10 10 0 0 1 12 4c6.5 0 10 8 10 8a18 18 0 0 1-2.1 3.2M6.6 6.6C3.5 8.5 2 12 2 12s3.5 8 10 8a9.7 9.7 0 0 0 4-.8" />
      </>
    ),
    store: (
      <>
        <path d="M4 10v10h16V10M3 4h18l-2 6a3 3 0 0 1-5 0 3 3 0 0 1-4 0 3 3 0 0 1-5 0Z" />
        <path d="M9 20v-5h6v5" />
      </>
    ),
    lightning: <path d="m13 2-9 12h7l-1 8 9-12h-7Z" />,
    shield: (
      <>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    sparkles: (
      <>
        <path d="m12 3 1.2 3.3L16.5 8l-3.3 1.3L12 13l-1.2-3.7L7.5 8l3.3-1.7ZM19 14l.7 2.1L22 17l-2.3.9L19 20l-.7-2.1L16 17l2.3-.9Z" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
    >
      {paths[name]}
    </svg>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
  type = "text",
  autoComplete,
  children,
}: {
  label: string;
  name: FieldName;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  error?: string;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  children?: ReactNode;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children ?? (
        <input
          aria-invalid={Boolean(error)}
          autoComplete={autoComplete}
          name={name}
          onChange={onChange}
          placeholder={placeholder}
          type={type}
          value={value}
        />
      )}
      {error && <small className="error">{error}</small>}
    </label>
  );
}

function ReviewCard({
  title,
  icon,
  onEdit,
  children,
}: {
  title: string;
  icon: string;
  onEdit: () => void;
  children: ReactNode;
}) {
  return (
    <article className="review-card">
      <header>
        <span>
          <Icon name={icon} size={18} />
        </span>
        <h2>{title}</h2>
        <button onClick={onEdit} type="button">
          Edit
        </button>
      </header>
      <div className="review-body">{children}</div>
    </article>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<Errors>({});
  const [logoUrl, setLogoUrl] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoName, setLogoName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [existingUserEmail, setExistingUserEmail] = useState("");
  const [registrationOpen, setRegistrationOpen] = useState<boolean | null>(null);

  const fileInput = useRef<HTMLInputElement>(null);

  // Read affiliate attribution from URL and cookies
  useEffect(() => {
    try {
      const refParam = searchParams.get("ref");
      let ref = refParam || "";
      let clickId = "";

      const refMatch = document.cookie.match(new RegExp("(^| )pa_ref=([^;]+)"));
      if (!ref && refMatch) {
        ref = refMatch[2];
      }

      const clickMatch = document.cookie.match(new RegExp("(^| )pa_click_id=([^;]+)"));
      if (clickMatch) {
        clickId = clickMatch[2];
      }

      if (ref || clickId) {
        setForm((prev) => ({
          ...prev,
          referralCode: ref || prev.referralCode,
          affiliateRef: ref || prev.affiliateRef,
          affiliateClickId: clickId || prev.affiliateClickId,
        }));
      }
    } catch {
      // Ignore in non-browser context
    }
  }, [searchParams]);

  // Check system registration status
  useEffect(() => {
    getSystemSettings()
      .then((settings) => {
        setRegistrationOpen(settings.registrationOpen);
      })
      .catch((err) => {
        console.error("Failed to load registration status:", err);
        setRegistrationOpen(true);
      });
  }, []);

  // Revoke object URL on unmount
  useEffect(() => {
    return () => {
      if (logoUrl && logoUrl.startsWith("blob:")) {
        URL.revokeObjectURL(logoUrl);
      }
    };
  }, [logoUrl]);

  // Dynamic plans adapted specifically to the chosen business type
  const currentPlans = useMemo(
    () => getPlansForBusinessType(form.businessType),
    [form.businessType]
  );

  const selectedPlan = useMemo(
    () => currentPlans.find((plan) => plan.id === form.planTier) ?? currentPlans[1],
    [currentPlans, form.planTier]
  );

  const selectedBusinessTypeObj = useMemo(
    () => BUSINESS_TYPES.find((b) => b.id === form.businessType) ?? BUSINESS_TYPES[0],
    [form.businessType]
  );

  const updateField = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    if (errors[name as FieldName]) {
      setErrors((previous) => ({ ...previous, [name]: undefined }));
    }
  };

  const handleLogo = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Logo file must be less than 5 MB");
      return;
    }

    if (logoUrl && logoUrl.startsWith("blob:")) {
      URL.revokeObjectURL(logoUrl);
    }

    const localUrl = URL.createObjectURL(file);
    setLogoFile(file);
    setLogoUrl(localUrl);
    setLogoName(file.name);
  };

  const validateStep = (step: number) => {
    const nextErrors: Errors = {};
    const required = (key: FieldName, message: string) => {
      if (!String(form[key]).trim()) nextErrors[key] = message;
    };
    const validEmail = (email: string) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (step === 0) {
      required("businessName", "Enter your business trading name");
      required("businessType", "Select your business type");
      if (form.businessType === "SCHOOL") {
        required("institutionType", "Select an institution level for your school");
      }
      required("category", "Select a business legal structure");
      required("teamSize", "Select your team size");
      required("businessPhone", "Enter a contact phone number");
      required("businessEmail", "Enter a business email");
      required("address", "Enter your business physical address");
      required("city", "Enter your city");
      required("region", "Select a region / province");

      if (form.businessEmail && !validEmail(form.businessEmail)) {
        nextErrors.businessEmail = "Enter a valid email address";
      }
    }

    if (step === 1) {
      required("ownerName", "Enter your full name");
      required("ownerEmail", "Enter your email address");
      required("ownerPhone", "Enter your phone number");
      required("password", "Create an account password");
      required("confirmPassword", "Confirm your password");

      if (form.ownerEmail && !validEmail(form.ownerEmail)) {
        nextErrors.ownerEmail = "Enter a valid email address";
      }
      if (form.password && form.password.length < 8) {
        nextErrors.password = "Use at least 8 characters";
      }
      if (form.confirmPassword && form.password !== form.confirmPassword) {
        nextErrors.confirmPassword = "Passwords do not match";
      }
    }

    if (step === 2) {
      if (!form.workspace) {
        nextErrors.workspace = "Select a workspace workflow mode";
      }
      if (!form.planTier) {
        nextErrors.planTier = "Select a subscription plan";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const nextStep = () => {
    if (!validateStep(currentStep)) return;
    setCurrentStep((step) => Math.min(step + 1, 3));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const previousStep = () => {
    setErrors({});
    setCurrentStep((step) => Math.max(step - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToStep = (step: number) => {
    if (step < currentStep) {
      setErrors({});
      setCurrentStep(step);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!validateStep(0) || !validateStep(1) || !validateStep(2)) {
      toast.error("Please complete all required fields.");
      return;
    }

    if (!agreedToTerms) {
      toast.error("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setLoading(true);

    try {
      // 1. Check if user already exists
      const exists = await checkUserExists(form.ownerEmail.trim());
      if (exists) {
        setExistingUserEmail(form.ownerEmail.trim());
        setShowLinkDialog(true);
        setLoading(false);
        return;
      }

      // 2. Upload logo to Cloudinary if file was selected
      let uploadedLogoUrl = "";
      if (logoFile) {
        try {
          const uploadData = new FormData();
          uploadData.append("file", logoFile);
          uploadedLogoUrl = await uploadBusinessLogo(uploadData);
        } catch (uploadErr) {
          console.warn("Logo upload failed, proceeding with registration:", uploadErr);
        }
      }

      // 3. Register Business in database with selected plan
      const payload = {
        businessName: form.businessName.trim(),
        legalName: form.legalName.trim() || undefined,
        businessType: form.businessType,
        institutionType: form.businessType === "SCHOOL" ? form.institutionType : undefined,
        category: form.category,
        registrationNumber: form.registrationNumber.trim() || undefined,
        taxId: form.taxId.trim() || undefined,
        website: form.website.trim() || undefined,
        teamSize: form.teamSize,
        phone: form.businessPhone.trim(),
        businessPhone: form.businessPhone.trim(),
        businessEmail: form.businessEmail.trim(),
        email: form.ownerEmail.trim(), // User login email
        ownerName: form.ownerName.trim(),
        ownerPhone: form.ownerPhone.trim(),
        password: form.password,
        address: `${form.address.trim()}, ${form.city.trim()}, ${form.region}`,
        currency: form.currency || "SLL",
        timezone: form.timezone || "Africa/Freetown",
        referralSource: form.referralSource || undefined,
        customReferralSource: form.customReferralSource || undefined,
        referralCode: form.referralCode || undefined,
        affiliateRef: form.affiliateRef || undefined,
        affiliateClickId: form.affiliateClickId || undefined,
        businessManagementMode: form.workspace === "inventory" ? "FULL_INVENTORY" : "SIMPLE_SALES_PROFIT",
        plan: selectedPlan.id, // "BASIC", "STANDARD", or "ENTERPRISE"
        billing: form.billing, // "monthly" or "annual"
        requestedBillingPeriod: form.billing,
        logoUrl: uploadedLogoUrl || undefined,
      };

      const result: any = await registerBusiness(payload);

      if (result?.error) {
        toast.error(result.error);
        setLoading(false);
        return;
      }

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      toast.success("Workspace provisioned and activated successfully! Check your email to verify.", {
        duration: 15000,
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to create workspace. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Registration closed screen
  if (registrationOpen === false) {
    return (
      <div className="register-page">
        <main className="success-page">
          <div className="ambient ambient-one" />
          <div className="ambient ambient-two" />
          <section className="success-card">
            <div className="success-mark" style={{ background: "#d97706" }}>
              <Lock className="w-8 h-8 text-white" />
            </div>
            <p className="eyebrow" style={{ color: "#fbbf24" }}>Invite-Only Mode</p>
            <h1>Registration Closed</h1>
            <p>
              New store registrations are currently closed. Please contact the system administrator to obtain an access invitation.
            </p>
            <div className="flex flex-col gap-3 mt-6">
              <a
                href="mailto:protechassist36@gmail.com?subject=Enterprise%20Inventory%20OS%20Access%20Request"
                className="primary-button"
                style={{ textDecoration: "none" }}
              >
                Request Invite Link
                <Icon name="arrow" size={18} />
              </a>
              <Link
                href="/login"
                className="back-button"
                style={{ justifyContent: "center", color: "#aebbd0", textDecoration: "none" }}
              >
                Sign In to Existing Account
              </Link>
            </div>
          </section>
        </main>
      </div>
    );
  }

  // Registration success screen
  if (submitted) {
    return (
      <div className="register-page">
        <main className="success-page">
          <div className="ambient ambient-one" />
          <div className="ambient ambient-two" />
          <section className="success-card">
            <div className="success-mark">
              <Icon name="check" size={36} strokeWidth={2.4} />
            </div>
            <p className="eyebrow">Workspace activated</p>
            <h1>Welcome to ProTech Assist</h1>
            <p>
              <strong>{form.businessName}</strong> is ready to go. Your{" "}
              {selectedPlan.name} workspace has been provisioned with all {selectedPlan.name} features active.
            </p>
            <div className="success-details">
              <span>Workspace</span>
              <strong>
                {form.workspace === "inventory"
                  ? "Full Inventory & POS"
                  : "Fast Totals"}
              </strong>
              <span>Business Type</span>
              <strong>{selectedBusinessTypeObj.label}</strong>
              <span>Billing Plan</span>
              <strong>
                {selectedPlan.name} · {form.billing === "annual" ? "Annual" : "Monthly"}
              </strong>
              <span>Administrator</span>
              <strong>{form.ownerEmail}</strong>
            </div>

            <button
              className="primary-button"
              onClick={() => router.push(`/login?email=${encodeURIComponent(form.ownerEmail)}`)}
              type="button"
            >
              Sign In to Your Workspace
              <Icon name="arrow" size={18} />
            </button>
            <small>A verification email has been sent to {form.ownerEmail}.</small>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="register-page">
      <div className="app-shell">
        {/* DESKTOP SIDEBAR */}
        <aside className="sidebar">
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <Link href="/" className="brand" style={{ textDecoration: "none" }}>
                <span className="brand-mark brand-logo">
                  <img src="/enterprise-os-logo.png" alt="ProTech Assist" />
                </span>
                <span>
                  <strong>ProTech Assist</strong>
                  <small>Enterprise Inventory OS</small>
                </span>
              </Link>
            </div>

            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                color: "#94a3b8",
                fontSize: "12px",
                fontWeight: 600,
                textDecoration: "none",
                padding: "6px 12px",
                borderRadius: "8px",
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                marginBottom: "24px",
                transition: "all 0.2s ease",
              }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>

            <div className="sidebar-intro">
              <p className="eyebrow">Business registration</p>
              <h2>Build your workspace</h2>
              <p>
                Just a few details, then you’re ready to take control of your inventory, sales, and operations.
              </p>
            </div>

            <nav className="step-nav" aria-label="Registration steps">
              {steps.map((step, index) => {
                const isActive = currentStep === index;
                const isComplete = currentStep > index;
                return (
                  <button
                    className={`step-link ${isActive ? "active" : ""} ${
                      isComplete ? "complete" : ""
                    }`}
                    disabled={index > currentStep}
                    key={step.title}
                    onClick={() => goToStep(index)}
                    type="button"
                  >
                    <span className="step-icon">
                      <Icon name={isComplete ? "check" : step.icon} size={18} />
                    </span>
                    <span className="step-copy">
                      <small>Step {index + 1}</small>
                      <strong>{step.title}</strong>
                    </span>
                    {isActive && <span className="active-dot" />}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="sidebar-trust">
            <Icon name="shield" size={19} />
            <div>
              <strong>Your data stays protected</strong>
              <span>Secure multi-tenant cloud</span>
            </div>
          </div>
        </aside>

        {/* MOBILE HEADER */}
        <div className="mobile-header">
          <Link href="/" className="brand" style={{ textDecoration: "none" }}>
            <span className="brand-mark brand-logo">
              <img src="/enterprise-os-logo.png" alt="ProTech Assist" />
            </span>
            <span>
              <strong>ProTech Assist</strong>
              <small>Enterprise Inventory OS</small>
            </span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                color: "#64748b",
                fontSize: "12px",
                fontWeight: 600,
                textDecoration: "none",
                padding: "5px 10px",
                borderRadius: "7px",
                border: "1px solid #e2e8f0",
                background: "#ffffff",
              }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <span className="mobile-step">Step {currentStep + 1} of 4</span>
          </div>
        </div>

        {/* MAIN FORM PANEL */}
        <main className="main-panel">
          <div className="mobile-progress" aria-hidden="true">
            {steps.map((step, index) => (
              <span
                className={index <= currentStep ? "filled" : ""}
                key={step.title}
              />
            ))}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              maxWidth: "900px",
              margin: "0 auto 16px",
              padding: "0 4px",
            }}
          >
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                color: "#64748b",
                fontSize: "13px",
                fontWeight: 600,
                textDecoration: "none",
                padding: "6px 14px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                background: "#ffffff",
                boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                transition: "all 0.15s ease",
              }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
              <span style={{ color: "#64748b" }}>Already registered?</span>
              <Link
                href="/login"
                style={{
                  fontWeight: 700,
                  color: "#2563eb",
                  textDecoration: "none",
                }}
              >
                Sign in →
              </Link>
            </div>
          </div>

          <form className="form-card" onSubmit={handleSubmit} noValidate>
            {/* STEP 1: BUSINESS PROFILE */}
            {currentStep === 0 && (
              <section className="form-section business-profile-section">
                <header className="form-heading">
                  <span className="section-number">01</span>
                  <div>
                    <p className="eyebrow">Create your business identity</p>
                    <h1>Build your company profile</h1>
                    <p>
                      Set up the verified business information used across your workspace, receipts, reports, and customer documents.
                    </p>
                  </div>
                </header>

                <div className="profile-banner">
                  <div className="profile-banner-copy">
                    <span className="profile-product-logo">
                      <img src="/enterprise-os-logo.png" alt="Enterprise OS" />
                    </span>
                    <div>
                      <span className="profile-kicker">Enterprise-ready profile</span>
                      <strong>Present your business professionally</strong>
                      <p>
                        Your profile becomes the trusted identity used throughout Enterprise OS.
                      </p>
                    </div>
                  </div>
                  <span className="secure-badge">
                    <Icon name="shield" size={15} />
                    Secure setup
                  </span>
                </div>

                <div className="profile-subsection">
                  <div className="subsection-heading">
                    <span>
                      <Icon name="building" size={18} />
                    </span>
                    <div>
                      <h2>Company identity</h2>
                      <p>Your public and legal business information.</p>
                    </div>
                    <small>Required fields</small>
                  </div>

                  <div className="identity-layout">
                    {/* Logo Uploader */}
                    <div className="logo-uploader">
                      <button
                        className={`logo-preview ${logoUrl ? "has-logo" : ""}`}
                        onClick={() => fileInput.current?.click()}
                        type="button"
                      >
                        {logoUrl ? (
                          <img alt="Business logo preview" src={logoUrl} />
                        ) : (
                          <>
                            <Icon name="upload" size={24} />
                            <span>Add logo</span>
                          </>
                        )}
                      </button>
                      <strong>Business logo</strong>
                      <p>PNG, JPG or SVG · 5 MB max</p>
                      <button
                        className="text-button"
                        onClick={() => fileInput.current?.click()}
                        type="button"
                      >
                        {logoName ? "Replace image" : "Choose image"}
                      </button>
                      {logoName && (
                        <small className="file-name">{logoName}</small>
                      )}
                      <input
                        accept="image/png,image/jpeg,image/svg+xml"
                        className="hidden-input"
                        onChange={handleLogo}
                        ref={fileInput}
                        type="file"
                      />
                    </div>

                    {/* Identity Fields */}
                    <div className="field-grid identity-fields">
                      <Field
                        error={errors.businessName}
                        label="Trading name *"
                        name="businessName"
                        onChange={updateField}
                        placeholder="e.g. Salone Supply Co."
                        value={form.businessName}
                      />
                      <Field
                        label="Legal business name"
                        name="legalName"
                        onChange={updateField}
                        placeholder="Registered company name (optional)"
                        value={form.legalName}
                      />

                      {/* Business Type Dropdown (Backend-supported) */}
                      <Field
                        error={errors.businessType}
                        label="Business type *"
                        name="businessType"
                        onChange={updateField}
                        value={form.businessType}
                      >
                        <select
                          aria-invalid={Boolean(errors.businessType)}
                          name="businessType"
                          onChange={updateField}
                          value={form.businessType}
                        >
                          {BUSINESS_TYPES.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.label}
                            </option>
                          ))}
                        </select>
                      </Field>

                      {/* Conditional School Institution Level */}
                      {form.businessType === "SCHOOL" && (
                        <Field
                          error={errors.institutionType}
                          label="Institution Level *"
                          name="institutionType"
                          onChange={updateField}
                          value={form.institutionType}
                        >
                          <select
                            aria-invalid={Boolean(errors.institutionType)}
                            name="institutionType"
                            onChange={updateField}
                            value={form.institutionType}
                          >
                            <option value="">Select institution level</option>
                            {INSTITUTION_TYPES.map((level) => (
                              <option key={level} value={level}>
                                {level}
                              </option>
                            ))}
                          </select>
                        </Field>
                      )}

                      {/* Legal Structure / Category */}
                      <Field
                        error={errors.category}
                        label="Legal structure *"
                        name="category"
                        onChange={updateField}
                        value={form.category}
                      >
                        <select
                          aria-invalid={Boolean(errors.category)}
                          name="category"
                          onChange={updateField}
                          value={form.category}
                        >
                          {LEGAL_STRUCTURES.map((structure) => (
                            <option key={structure} value={structure}>
                              {structure}
                            </option>
                          ))}
                        </select>
                      </Field>

                      <Field
                        label="Registration number"
                        name="registrationNumber"
                        onChange={updateField}
                        placeholder="e.g. SL-2025-001234 (optional)"
                        value={form.registrationNumber}
                      />
                      <Field
                        label="Tax identification number (TIN)"
                        name="taxId"
                        onChange={updateField}
                        placeholder="e.g. 10023456-7 (optional)"
                        value={form.taxId}
                      />
                    </div>
                  </div>
                </div>

                <div className="profile-subsection">
                  <div className="subsection-heading">
                    <span>
                      <Icon name="mail" size={18} />
                    </span>
                    <div>
                      <h2>Contact & operations</h2>
                      <p>How customers and your team identify this business.</p>
                    </div>
                  </div>

                  <div className="field-grid">
                    <Field
                      autoComplete="tel"
                      error={errors.businessPhone}
                      label="Business phone *"
                      name="businessPhone"
                      onChange={updateField}
                      placeholder="+232 76 000 000"
                      type="tel"
                      value={form.businessPhone}
                    />
                    <Field
                      autoComplete="email"
                      error={errors.businessEmail}
                      label="Business email *"
                      name="businessEmail"
                      onChange={updateField}
                      placeholder="hello@business.com"
                      type="email"
                      value={form.businessEmail}
                    />
                    <Field
                      label="Company website"
                      name="website"
                      onChange={updateField}
                      placeholder="https://yourbusiness.com (optional)"
                      type="url"
                      value={form.website}
                    />
                    <Field
                      error={errors.teamSize}
                      label="Team size *"
                      name="teamSize"
                      onChange={updateField}
                      value={form.teamSize}
                    >
                      <select
                        aria-invalid={Boolean(errors.teamSize)}
                        name="teamSize"
                        onChange={updateField}
                        value={form.teamSize}
                      >
                        {TEAM_SIZES.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <div className="field-wide">
                      <Field
                        autoComplete="street-address"
                        error={errors.address}
                        label="Primary business address *"
                        name="address"
                        onChange={updateField}
                        placeholder="24 Siaka Stevens Street, Freetown"
                        value={form.address}
                      />
                    </div>
                    <Field
                      autoComplete="address-level2"
                      error={errors.city}
                      label="City *"
                      name="city"
                      onChange={updateField}
                      placeholder="Freetown"
                      value={form.city}
                    />
                    <Field
                      error={errors.region}
                      label="Region / Province *"
                      name="region"
                      onChange={updateField}
                      value={form.region}
                    >
                      <select
                        aria-invalid={Boolean(errors.region)}
                        name="region"
                        onChange={updateField}
                        value={form.region}
                      >
                        {REGIONS.map((region) => (
                          <option key={region} value={region}>
                            {region}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                </div>
              </section>
            )}

            {/* STEP 2: OWNER ACCOUNT */}
            {currentStep === 1 && (
              <section className="form-section">
                <header className="form-heading">
                  <span className="section-number">02</span>
                  <div>
                    <p className="eyebrow">Your administrator access</p>
                    <h1>Create the owner account</h1>
                    <p>
                      Use these credentials to sign in and securely manage your new workspace.
                    </p>
                  </div>
                </header>

                <div className="account-note">
                  <span>
                    <Icon name="shield" size={20} />
                  </span>
                  <div>
                    <strong>You’ll be the workspace owner</strong>
                    <p>
                      You will have master admin permissions and can invite team members and set branch roles later.
                    </p>
                  </div>
                </div>

                <div className="field-grid">
                  <div className="field-wide">
                    <Field
                      autoComplete="name"
                      error={errors.ownerName}
                      label="Full name *"
                      name="ownerName"
                      onChange={updateField}
                      placeholder="e.g. Alpha Sesay"
                      value={form.ownerName}
                    />
                  </div>
                  <Field
                    autoComplete="email"
                    error={errors.ownerEmail}
                    label="Email address (Login) *"
                    name="ownerEmail"
                    onChange={updateField}
                    placeholder="you@example.com"
                    type="email"
                    value={form.ownerEmail}
                  />
                  <Field
                    autoComplete="tel"
                    error={errors.ownerPhone}
                    label="Phone number *"
                    name="ownerPhone"
                    onChange={updateField}
                    placeholder="+232 76 000 000"
                    type="tel"
                    value={form.ownerPhone}
                  />

                  {/* Password with visibility toggle */}
                  <label className="field">
                    <span>Password *</span>
                    <div className="password-field">
                      <input
                        aria-invalid={Boolean(errors.password)}
                        autoComplete="new-password"
                        name="password"
                        onChange={updateField}
                        placeholder="Minimum 8 characters"
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                      />
                      <button
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        onClick={() => setShowPassword((visible) => !visible)}
                        type="button"
                      >
                        <Icon name={showPassword ? "eyeOff" : "eye"} size={18} />
                      </button>
                    </div>
                    {errors.password && (
                      <small className="error">{errors.password}</small>
                    )}
                  </label>

                  {/* Confirm Password */}
                  <label className="field">
                    <span>Confirm password *</span>
                    <div className="password-field">
                      <input
                        aria-invalid={Boolean(errors.confirmPassword)}
                        autoComplete="new-password"
                        name="confirmPassword"
                        onChange={updateField}
                        placeholder="Repeat your password"
                        type={showConfirm ? "text" : "password"}
                        value={form.confirmPassword}
                      />
                      <button
                        aria-label={showConfirm ? "Hide password" : "Show password"}
                        onClick={() => setShowConfirm((visible) => !visible)}
                        type="button"
                      >
                        <Icon name={showConfirm ? "eyeOff" : "eye"} size={18} />
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <small className="error">{errors.confirmPassword}</small>
                    )}
                  </label>

                  {/* Referral Source Dropdown */}
                  <Field
                    label="How did you hear about us?"
                    name="referralSource"
                    onChange={updateField}
                    value={form.referralSource}
                  >
                    <select
                      name="referralSource"
                      onChange={updateField}
                      value={form.referralSource}
                    >
                      <option value="">Select source (optional)</option>
                      {REFERRAL_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </Field>

                  {/* Referral Code (optional) */}
                  <Field
                    label="Referral code"
                    name="referralCode"
                    onChange={updateField}
                    placeholder="e.g. PA-AFF-0012 or PRO-8X4K"
                    value={form.referralCode}
                  />

                  {/* Custom referral details if Other selected */}
                  {form.referralSource === "Other" && (
                    <div className="field-wide">
                      <Field
                        label="Specify referral details"
                        name="customReferralSource"
                        onChange={updateField}
                        placeholder="Tell us where you heard about ProTech Assist"
                        value={form.customReferralSource}
                      />
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* STEP 3: WORKSPACE SETUP & SUBSCRIPTION */}
            {currentStep === 2 && (
              <section className="form-section workspace-section">
                <header className="form-heading">
                  <span className="section-number">03</span>
                  <div>
                    <p className="eyebrow">Shape your experience</p>
                    <h1>Set up your workspace</h1>
                    <p>
                      Choose your preferred operational workflow and a plan tailored for your {selectedBusinessTypeObj.label.toLowerCase()}.
                    </p>
                  </div>
                </header>

                <div className="choice-heading">
                  <h2>How do you want to work?</h2>
                  <p>You can switch workspace modes anytime inside settings.</p>
                </div>
                <div className="workspace-grid">
                  <button
                    className={`workspace-card ${
                      form.workspace === "inventory" ? "selected" : ""
                    }`}
                    onClick={() =>
                      setForm((previous) => ({
                        ...previous,
                        workspace: "inventory",
                      }))
                    }
                    type="button"
                  >
                    <span className="workspace-icon">
                      <Icon name="store" size={25} />
                    </span>
                    <span>
                      <strong>Full Operations &amp; POS</strong>
                      <small>
                        Track stock, barcodes, live sales, suppliers, and departmental reports in one place.
                      </small>
                    </span>
                    <span className="radio">
                      <i />
                    </span>
                    <em>Recommended</em>
                  </button>
                  <button
                    className={`workspace-card ${
                      form.workspace === "totals" ? "selected" : ""
                    }`}
                    onClick={() =>
                      setForm((previous) => ({
                        ...previous,
                        workspace: "totals",
                      }))
                    }
                    type="button"
                  >
                    <span className="workspace-icon">
                      <Icon name="lightning" size={25} />
                    </span>
                    <span>
                      <strong>Fast Totals</strong>
                      <small>
                        Record daily sales totals and cashflow quickly without cataloguing individual items.
                      </small>
                    </span>
                    <span className="radio">
                      <i />
                    </span>
                  </button>
                </div>

                <div className="plan-heading">
                  <div className="choice-heading">
                    <h2>Choose your plan</h2>
                    <p>
                      All prices in Sierra Leonean Leone (NLe). Full feature access included immediately on activation.
                    </p>
                  </div>
                  <div className="billing-toggle">
                    <button
                      className={form.billing === "monthly" ? "active" : ""}
                      onClick={() =>
                        setForm((previous) => ({
                          ...previous,
                          billing: "monthly",
                        }))
                      }
                      type="button"
                    >
                      Monthly
                    </button>
                    <button
                      className={form.billing === "annual" ? "active" : ""}
                      onClick={() =>
                        setForm((previous) => ({
                          ...previous,
                          billing: "annual",
                        }))
                      }
                      type="button"
                    >
                      Annual
                      <span>2 months free</span>
                    </button>
                  </div>
                </div>

                <div className="plan-grid">
                  {currentPlans.map((plan) => {
                    const selected = form.planTier === plan.id;
                    const amount =
                      form.billing === "monthly" ? plan.monthly : plan.annual;
                    return (
                      <button
                        className={`plan-card ${selected ? "selected" : ""} ${
                          plan.popular ? "popular" : ""
                        }`}
                        key={plan.id}
                        onClick={() =>
                          setForm((previous) => ({
                            ...previous,
                            planTier: plan.id,
                          }))
                        }
                        type="button"
                      >
                        {plan.popular && (
                          <span className="popular-label">Most popular</span>
                        )}
                        <span className="plan-top">
                          <strong>{plan.name}</strong>
                          <span className="radio">
                            <i />
                          </span>
                        </span>
                        <small>{plan.description}</small>
                        <span className="price">
                          <sup>NLe</sup>
                          <b>{amount.toLocaleString()}</b>
                          <em>/{form.billing === "monthly" ? "mo" : "yr"}</em>
                        </span>
                        {form.billing === "annual" ? (
                          <span className="saving">
                            Save NLe {plan.savings.toLocaleString()} (2 months free)
                          </span>
                        ) : (
                          <span className="saving" style={{ visibility: "hidden" }}>-</span>
                        )}
                        <ul>
                          {plan.features.map((feature) => (
                            <li key={feature}>
                              <Icon name="check" size={14} strokeWidth={2.2} />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* STEP 4: REVIEW & CREATE */}
            {currentStep === 3 && (
              <section className="form-section">
                <header className="form-heading">
                  <span className="section-number">04</span>
                  <div>
                    <p className="eyebrow">One final check</p>
                    <h1>Review &amp; create</h1>
                    <p>
                      Confirm your business and account details below. You can navigate back to make any edits.
                    </p>
                  </div>
                </header>

                <div className="review-grid">
                  <ReviewCard
                    icon="building"
                    onEdit={() => goToStep(0)}
                    title="Business profile"
                  >
                    <div className="business-review">
                      <div className="review-logo">
                        {logoUrl ? (
                          <img alt="" src={logoUrl} />
                        ) : (
                          <Icon name="building" size={22} />
                        )}
                      </div>
                      <div>
                        <strong>{form.businessName || "Unnamed Business"}</strong>
                        <span>
                          {selectedBusinessTypeObj.label} · {form.category}
                        </span>
                      </div>
                    </div>
                    <dl>
                      {form.legalName && (
                        <div>
                          <dt>Legal name</dt>
                          <dd>{form.legalName}</dd>
                        </div>
                      )}
                      {form.institutionType && (
                        <div>
                          <dt>Institution Level</dt>
                          <dd>{form.institutionType}</dd>
                        </div>
                      )}
                      <div>
                        <dt>Team size</dt>
                        <dd>{form.teamSize}</dd>
                      </div>
                      <div>
                        <dt>Email</dt>
                        <dd>{form.businessEmail}</dd>
                      </div>
                      <div>
                        <dt>Phone</dt>
                        <dd>{form.businessPhone}</dd>
                      </div>
                      {form.registrationNumber && (
                        <div>
                          <dt>Registration</dt>
                          <dd>{form.registrationNumber}</dd>
                        </div>
                      )}
                      {form.website && (
                        <div>
                          <dt>Website</dt>
                          <dd>{form.website}</dd>
                        </div>
                      )}
                      <div className="full">
                        <dt>Address</dt>
                        <dd>
                          {form.address}, {form.city}, {form.region}
                        </dd>
                      </div>
                    </dl>
                  </ReviewCard>

                  <ReviewCard
                    icon="user"
                    onEdit={() => goToStep(1)}
                    title="Owner account"
                  >
                    <dl>
                      <div>
                        <dt>Full name</dt>
                        <dd>{form.ownerName}</dd>
                      </div>
                      <div>
                        <dt>Phone</dt>
                        <dd>{form.ownerPhone}</dd>
                      </div>
                      <div className="full">
                        <dt>Email (Sign In)</dt>
                        <dd>{form.ownerEmail}</dd>
                      </div>
                      {form.referralCode && (
                        <div>
                          <dt>Referral Code</dt>
                          <dd>{form.referralCode}</dd>
                        </div>
                      )}
                    </dl>
                  </ReviewCard>

                  <ReviewCard
                    icon="sliders"
                    onEdit={() => goToStep(2)}
                    title="Workspace &amp; billing"
                  >
                    <div className="review-plan">
                      <span className="workspace-icon">
                        <Icon name="sparkles" size={22} />
                      </span>
                      <div>
                        <strong>
                          {form.workspace === "inventory"
                            ? "Full Operations & POS"
                            : "Fast Totals"}
                        </strong>
                        <span>
                          {selectedPlan.name} ·{" "}
                          {form.billing === "annual"
                            ? "Annual billing (2 months free)"
                            : "Monthly billing"}
                        </span>
                      </div>
                      <div className="review-price">
                        <strong>
                          NLe{" "}
                          {(form.billing === "annual"
                            ? selectedPlan.annual
                            : selectedPlan.monthly
                          ).toLocaleString()}
                        </strong>
                        <span>
                          /{form.billing === "annual" ? "year" : "month"}
                        </span>
                      </div>
                    </div>
                  </ReviewCard>
                </div>

                <div className="terms-note">
                  <Icon name="shield" size={20} />
                  <p>
                    By creating your workspace, you agree to ProTech Assist’s{" "}
                    <Link href="/terms" target="_blank">Terms of Service</Link> and{" "}
                    <Link href="/privacy" target="_blank">Privacy Policy</Link>. All plan features are activated immediately upon account creation.
                  </p>
                </div>

                <div style={{ marginTop: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <input
                    id="terms-check"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    style={{ width: "18px", height: "18px", accentColor: "#2563eb", cursor: "pointer" }}
                    type="checkbox"
                  />
                  <label htmlFor="terms-check" style={{ fontSize: "12px", color: "#33425d", cursor: "pointer" }}>
                    I agree to the Terms of Service and Privacy Policy.
                  </label>
                </div>
              </section>
            )}

            {/* FOOTER ACTIONS */}
            <footer className="form-actions">
              <div>
                {currentStep > 0 ? (
                  <button
                    className="back-button"
                    onClick={previousStep}
                    type="button"
                  >
                    <Icon name="back" size={18} />
                    Back
                  </button>
                ) : (
                  <Link
                    href="/"
                    className="back-button"
                    style={{ textDecoration: "none" }}
                  >
                    <Icon name="back" size={18} />
                    Back to Home
                  </Link>
                )}
              </div>
              <div className="step-caption">
                <span>{steps[currentStep].title}</span>
                <small>{currentStep + 1} of 4</small>
              </div>
              {currentStep < 3 ? (
                <button
                  className="primary-button"
                  onClick={nextStep}
                  type="button"
                >
                  Continue
                  <Icon name="arrow" size={18} />
                </button>
              ) : (
                <button
                  className="primary-button"
                  disabled={loading}
                  type="submit"
                >
                  {loading ? (
                    <>
                      <span>Provisioning...</span>
                    </>
                  ) : (
                    <>
                      Create workspace
                      <Icon name="arrow" size={18} />
                    </>
                  )}
                </button>
              )}
            </footer>
          </form>

          {/* SINGLE SIGN-ON ALTERNATIVE */}
          <div style={{ maxWidth: "900px", margin: "24px auto 0", textAlign: "center" }}>
            <div style={{ position: "relative", marginBottom: "16px" }}>
              <div style={{ height: "1px", background: "#e2e8f0" }} />
              <span
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  background: "#f7f9fc",
                  padding: "0 12px",
                  fontSize: "10px",
                  fontWeight: 800,
                  color: "#94a3b8",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                or register with Google Workspace
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                if (!form.businessName.trim() || !form.businessPhone.trim() || !form.address.trim()) {
                  toast.error("Please fill your Company Name, Phone, and Address in Step 1 before Google sign-up.");
                  goToStep(0);
                  return;
                }
                document.cookie = `registrationData=${encodeURIComponent(JSON.stringify(form))}; path=/; max-age=3600`;
                signIn("google", { callbackUrl: "/dashboard" });
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 20px",
                borderRadius: "10px",
                border: "1px solid #dce2eb",
                background: "white",
                color: "#1e293b",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              <Image
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                width={16}
                height={16}
              />
              Continue with Google Workspace
            </button>
          </div>

          <p className="support-line">
            Need help?{" "}
            <a href="mailto:support@protechassist.com">
              Talk to our support team
            </a>
          </p>
        </main>
      </div>

      {/* ACCOUNT ALREADY EXISTS MODAL */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent className="sm:max-w-[480px] bg-white rounded-2xl border border-slate-200 p-6 text-slate-900 shadow-2xl">
          <DialogHeader className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <DialogTitle className="text-xl font-bold">
              Account Already Exists
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600 leading-relaxed">
              An account already exists for <strong className="text-slate-900">{existingUserEmail}</strong>.
              <br /><br />
              Would you like to sign in to your existing account now?
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2 pt-4">
            <button
              onClick={() => router.push(`/login?email=${encodeURIComponent(existingUserEmail)}&link=true`)}
              className="primary-button"
              type="button"
            >
              Continue to Sign In
            </button>
            <button
              onClick={() => setShowLinkDialog(false)}
              className="back-button"
              style={{ justifyContent: "center" }}
              type="button"
            >
              Cancel
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
