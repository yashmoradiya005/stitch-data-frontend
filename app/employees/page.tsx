"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { useCompany } from "@/context/CompanyContext";
import { AppLayout } from "@/components/AppLayout";
import {
  createEmployee, updateEmployee, deleteEmployee,
  getEmployees, toBase64, Employee,
} from "@/lib/employee";

// ─── Avatar ──────────────────────────────────────────────────────────────────

function Avatar({ employee, size = "md" }: { employee: Employee; size?: "sm" | "md" | "lg" }) {
  const sz = { sm: "w-9 h-9 text-sm", md: "w-12 h-12 text-base", lg: "w-20 h-20 text-2xl" };
  if (employee.imageData) {
    return <img src={employee.imageData} alt={employee.name} className={`${sz[size]} rounded-full object-cover shrink-0`} />;
  }
  return (
    <div className={`${sz[size]} rounded-full bg-blue-900 text-white flex items-center justify-center font-bold shrink-0`}>
      {employee.name.charAt(0).toUpperCase()}
    </div>
  );
}

// ─── Drawer (add + edit) ─────────────────────────────────────────────────────

function EmployeeDrawer({
  companyId,
  employee,
  onClose,
  onSaved,
  onUpdated,
}: {
  companyId: string;
  employee?: Employee;
  onClose: () => void;
  onSaved?: (emp: Employee) => void;
  onUpdated?: (emp: Employee) => void;
}) {
  const isEdit = !!employee;
  const [name, setName] = useState(employee?.name ?? "");
  const [phone, setPhone] = useState(employee?.phone ?? "");
  const [imagePreview, setImagePreview] = useState<string | null>(employee?.imageData ?? null);
  const [imageData, setImageData] = useState<string | null | undefined>(employee?.imageData ?? undefined);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const joinedDate = isEdit
    ? new Date(employee.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setError("Image must be under 2 MB."); return; }
    const b64 = await toBase64(file);
    setImagePreview(b64);
    setImageData(b64);
    setError("");
  };

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Employee name is required."); return; }

    setLoading(true);
    try {
      if (isEdit) {
        const updated = await updateEmployee(employee.id, name, phone, imageData);
        onUpdated?.(updated);
      } else {
        const created = await createEmployee(companyId, name, phone, imageData ?? undefined);
        onSaved?.(created);
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${isEdit ? "update" : "add"} employee.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{isEdit ? "Edit Employee" : "Add Employee"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Photo */}
          <div className="flex flex-col items-center gap-3">
            <div
              onClick={() => fileRef.current?.click()}
              className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 hover:border-blue-400 flex items-center justify-center cursor-pointer overflow-hidden transition group"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center text-gray-300 group-hover:text-blue-400 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-xs mt-1">Photo</span>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
            {imagePreview && (
              <button type="button" onClick={() => { setImagePreview(null); setImageData(null); }}
                className="text-xs text-gray-400 hover:text-red-500 transition">
                Remove photo
              </button>
            )}
            <p className="text-xs text-gray-400">Click to upload · Max 2 MB</p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name <span className="text-red-500">*</span></label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Priya Sharma"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition"
              disabled={loading} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 98765 43210"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition"
              disabled={loading} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Joined</label>
            <input type="text" value={joinedDate} disabled
              className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-400 outline-none cursor-not-allowed" />
            {!isEdit && <p className="text-xs text-gray-400 mt-1">Set automatically to today.</p>}
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button type="button" onClick={onClose} disabled={loading}
            className="flex-1 py-2 border border-gray-300 text-gray-600 rounded-lg hover:border-gray-400 transition text-sm font-medium">
            Cancel
          </button>
          <button onClick={handleSubmit as any} disabled={loading}
            className="flex-1 py-2 bg-blue-900 hover:bg-blue-800 disabled:bg-gray-300 text-white rounded-lg transition text-sm font-medium">
            {loading ? (isEdit ? "Saving..." : "Adding...") : (isEdit ? "Save Changes" : "Add Employee")}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Delete confirmation modal ────────────────────────────────────────────────

function DeleteModal({ employee, onCancel, onConfirm, loading }: {
  employee: Employee;
  onCancel: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onCancel} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Delete Employee</h3>
              <p className="text-sm text-gray-400">This action cannot be undone.</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            Are you sure you want to delete <span className="font-semibold text-gray-800">{employee.name}</span>?
          </p>
          <div className="flex gap-3">
            <button onClick={onCancel} disabled={loading}
              className="flex-1 py-2 border border-gray-300 text-gray-600 rounded-lg hover:border-gray-400 transition text-sm font-medium">
              Cancel
            </button>
            <button onClick={onConfirm} disabled={loading}
              className="flex-1 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white rounded-lg transition text-sm font-medium">
              {loading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function sortByName(list: Employee[]) {
  return [...list].sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
}

export default function EmployeesPage() {
  const router = useRouter();
  const { currentCompany } = useCompany();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Employee | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) { router.push("/login"); return; }
  }, [router]);

  useEffect(() => {
    if (!currentCompany) return;
    setLoading(true);
    getEmployees(currentCompany.id)
      .then((data) => setEmployees(sortByName(data)))
      .catch(() => setEmployees([]))
      .finally(() => setLoading(false));
  }, [currentCompany]);

  const handleSaved = (emp: Employee) => setEmployees((prev) => sortByName([...prev, emp]));

  const handleUpdated = (emp: Employee) =>
    setEmployees((prev) => sortByName(prev.map((e) => (e.id === emp.id ? emp : e))));

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteEmployee(deleteTarget.id);
      setEmployees((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      // keep modal open so user sees it failed
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {currentCompany?.name} · {employees.length} employee{employees.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => { setEditTarget(null); setDrawerOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg transition text-sm font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Employee
          </button>
        </div>

        {/* List */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-50">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
                <div className="w-12 h-12 rounded-full bg-gray-100 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : employees.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 flex flex-col items-center text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-gray-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-gray-500 font-medium">No employees yet</p>
            <p className="text-gray-400 text-sm mt-1 mb-5">Add your first team member to get started.</p>
            <button onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg transition text-sm font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Employee
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-50">
            {employees.map((emp) => (
              <div key={emp.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition group">
                <Avatar employee={emp} size="md" />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{emp.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{emp.phone ?? "No phone"}</p>
                </div>

                <div className="text-right shrink-0 mr-3">
                  <p className="text-xs text-gray-400">Joined</p>
                  <p className="text-xs font-medium text-gray-600">
                    {new Date(emp.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>

                {/* Action buttons — visible on hover */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                  <button
                    onClick={() => { setEditTarget(emp); setDrawerOpen(true); }}
                    title="Edit employee"
                    className="p-2 rounded-lg text-gray-400 hover:text-blue-900 hover:bg-blue-50 transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setDeleteTarget(emp)}
                    title="Delete employee"
                    className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit drawer */}
      {drawerOpen && currentCompany && (
        <EmployeeDrawer
          companyId={currentCompany.id}
          employee={editTarget ?? undefined}
          onClose={() => { setDrawerOpen(false); setEditTarget(null); }}
          onSaved={handleSaved}
          onUpdated={handleUpdated}
        />
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <DeleteModal
          employee={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          loading={deleteLoading}
        />
      )}
    </AppLayout>
  );
}
