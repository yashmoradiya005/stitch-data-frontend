"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCompany } from "@/context/CompanyContext";
import { Company } from "@/lib/company";

export function BusinessSwitcher() {
  const { companies, currentCompany, setCurrentCompany } = useCompany();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const switchTo = (company: Company) => {
    setCurrentCompany(company);
    setOpen(false);
  };

  if (!currentCompany) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition text-sm font-medium text-gray-700 max-w-[200px]"
      >
        <span className="w-6 h-6 rounded-md bg-blue-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
          {currentCompany.name.charAt(0).toUpperCase()}
        </span>
        <span className="truncate">{currentCompany.name}</span>
        <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-100 z-50 py-1">
          <p className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Your Businesses
          </p>

          {companies.map((company) => (
            <button
              key={company.id}
              onClick={() => switchTo(company)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition text-left ${company.id === currentCompany.id ? "bg-blue-50" : ""}`}
            >
              <span className="w-8 h-8 rounded-md bg-blue-900 text-white flex items-center justify-center text-sm font-bold shrink-0">
                {company.name.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{company.name}</p>
                <p className="text-xs text-gray-400">{company.machineCount} machine{company.machineCount !== 1 ? "s" : ""}</p>
              </div>
              {company.id === currentCompany.id && (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-blue-900 ml-auto shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}

          <div className="border-t border-gray-100 mt-1 pt-1">
            <button
              onClick={() => { setOpen(false); router.push("/setup"); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition text-left text-blue-900"
            >
              <span className="w-8 h-8 rounded-md border-2 border-dashed border-blue-300 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </span>
              <span className="text-sm font-medium">Add new business</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
