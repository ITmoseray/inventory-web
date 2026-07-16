import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getIndustryColor(type: string | undefined) {
  switch (type) {
    case "BAR":
      return {
        primary: "bg-indigo-600",
        secondary: "bg-indigo-50",
        accent: "bg-violet-500",
        text: "text-indigo-600",
        border: "border-indigo-100",
        gradient: "from-indigo-600 via-violet-600 to-purple-600",
        gradientSoft: "from-indigo-50/50 via-violet-50/50 to-purple-50/50",
        glow: "shadow-indigo-500/20",
        ring: "ring-indigo-500/10"
      };
    case "RESTAURANT":
      return {
        primary: "bg-rose-600",
        secondary: "bg-rose-50",
        accent: "bg-orange-500",
        text: "text-rose-600",
        border: "border-rose-100",
        gradient: "from-rose-600 via-pink-600 to-orange-600",
        gradientSoft: "from-rose-50/50 via-pink-50/50 to-orange-50/50",
        glow: "shadow-rose-500/20",
        ring: "ring-rose-500/10"
      };
    case "PHARMACY":
      return {
        primary: "bg-emerald-600",
        secondary: "bg-emerald-50",
        accent: "bg-teal-500",
        text: "text-emerald-600",
        border: "border-emerald-100",
        gradient: "from-emerald-600 via-teal-600 to-cyan-600",
        gradientSoft: "from-emerald-50/50 via-teal-50/50 to-cyan-50/50",
        glow: "shadow-emerald-500/20",
        ring: "ring-emerald-500/10"
      };
    default:
      return {
        primary: "bg-blue-600",
        secondary: "bg-blue-50",
        accent: "bg-cyan-500",
        text: "text-blue-600",
        border: "border-blue-100",
        gradient: "from-blue-600 via-sky-600 to-indigo-600",
        gradientSoft: "from-blue-50/50 via-sky-50/50 to-indigo-50/50",
        glow: "shadow-blue-500/20",
        ring: "ring-blue-500/10"
      };
  }
}

export const africanCountries = [
  { name: "Algeria", code: "dz" },
  { name: "Angola", code: "ao" },
  { name: "Benin", code: "bj" },
  { name: "Botswana", code: "bw" },
  { name: "Burkina Faso", code: "bf" },
  { name: "Burundi", code: "bi" },
  { name: "Cabo Verde", code: "cv" },
  { name: "Cameroon", code: "cm" },
  { name: "CAR", code: "cf" },
  { name: "Chad", code: "td" },
  { name: "Comoros", code: "km" },
  { name: "Congo", code: "cg" },
  { name: "DR Congo", code: "cd" },
  { name: "Djibouti", code: "dj" },
  { name: "Egypt", code: "eg" },
  { name: "Equatorial Guinea", code: "gq" },
  { name: "Eritrea", code: "er" },
  { name: "Eswatini", code: "sz" },
  { name: "Ethiopia", code: "et" },
  { name: "Gabon", code: "ga" },
  { name: "Gambia", code: "gm" },
  { name: "Ghana", code: "gh" },
  { name: "Guinea", code: "gn" },
  { name: "Guinea-Bissau", code: "gw" },
  { name: "Ivory Coast", code: "ci" },
  { name: "Kenya", code: "ke" },
  { name: "Lesotho", code: "ls" },
  { name: "Liberia", code: "lr" },
  { name: "Libya", code: "ly" },
  { name: "Madagascar", code: "mg" },
  { name: "Malawi", code: "mw" },
  { name: "Mali", code: "ml" },
  { name: "Mauritania", code: "mr" },
  { name: "Mauritius", code: "mu" },
  { name: "Morocco", code: "ma" },
  { name: "Mozambique", code: "mz" },
  { name: "Namibia", code: "na" },
  { name: "Niger", code: "ne" },
  { name: "Nigeria", code: "ng" },
  { name: "Rwanda", code: "rw" },
  { name: "Sao Tome", code: "st" },
  { name: "Senegal", code: "sn" },
  { name: "Seychelles", code: "sc" },
  { name: "Sierra Leone", code: "sl" },
  { name: "Somalia", code: "so" },
  { name: "South Africa", code: "za" },
  { name: "South Sudan", code: "ss" },
  { name: "Sudan", code: "sd" },
  { name: "Tanzania", code: "tz" },
  { name: "Togo", code: "tg" },
  { name: "Tunisia", code: "tn" },
  { name: "Uganda", code: "ug" },
  { name: "Zambia", code: "zm" },
  { name: "Zimbabwe", code: "zw" },
];

export const getCurrencyConfig = (code?: string) => {
  switch (code?.toLowerCase()) {
    case 'sl': return { symbol: 'NLe', rate: 1, name: 'Sierra Leonean Leone' };
    case 'ng': return { symbol: '₦', rate: 65, name: 'Nigerian Naira' };
    case 'gh': return { symbol: 'GH₵', rate: 0.65, name: 'Ghanaian Cedi' };
    case 'za': return { symbol: 'R', rate: 0.85, name: 'South African Rand' };
    case 'ke': return { symbol: 'KSh', rate: 6, name: 'Kenyan Shilling' };
    case 'lr': return { symbol: 'L$', rate: 9, name: 'Liberian Dollar' };
    case 'gm': return { symbol: 'D', rate: 3, name: 'Gambian Dalasi' };
    case 'gn': return { symbol: 'FG', rate: 400, name: 'Guinean Franc' };
    default: return { symbol: '$', rate: 0.045, name: 'US Dollar' };
  }
};
