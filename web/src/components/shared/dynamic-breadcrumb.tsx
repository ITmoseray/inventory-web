"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function DynamicBreadcrumb() {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter((segment) => segment !== "");

  if (pathname === "/" || pathname === "/dashboard") {
    return null;
  }

  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList className="gap-2">
        <BreadcrumbItem>
          <BreadcrumbLink
            render={
              <Link href="/dashboard" className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors">
                <Home className="h-3.5 w-3.5" />
                <span className="text-[10px] font-black uppercase tracking-widest">Home</span>
              </Link>
            }
          />
        </BreadcrumbItem>
        
        {pathSegments.map((segment, index) => {
          const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
          const isLast = index === pathSegments.length - 1;
          const label = segment.replace(/-/g, " ");

          return (
            <React.Fragment key={href}>
              <BreadcrumbSeparator>
                <ChevronRight className="h-3 w-3 text-slate-300" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">
                    {label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    render={
                      <Link href={href} className="text-[10px] font-black uppercase tracking-widest hover:text-indigo-600 transition-colors">
                        {label}
                      </Link>
                    }
                  />
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
