"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";
import { useCompany } from "@/context/CompanyContext";
import { useUser } from "@/context/UserContext";
import { useTheme } from "@/context/ThemeContext";
import { t } from "@/lib/i18n";
import apiClient from "@/lib/api";
import * as I from "@/components/sd/Icons";
import Switch from "@/components/sd/Switch";
import Modal from "@/components/sd/Modal";

// ─── Forgot Password Modal ─────────────────────────────────────────────────────

function ForgotPasswordModal({ onClose, lang }: { onClose: () => void; lang: "en" | "gu" }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) { setError("Please enter your email address."); return; }
    setLoading(true);
    try {
      await apiClient.post("/api/auth/forgot-password", { email: email.trim() });
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open onClose={onClose} maxW={360}>
      <div className="sheet__head" style={{ borderBottom: "1px solid var(--line)" }}>
        <div>
          <h3 className="display" style={{ fontSize: 20, color: "var(--hi)" }}>Reset Password</h3>
          <p style={{ fontSize: 12, color: "var(--mid)", marginTop: 3 }}>We'll send instructions to your email</p>
        </div>
        <button className="icon-btn" onClick={onClose} style={{ background: "var(--s2)" }}><I.close w={18} /></button>
      </div>
      <div style={{ padding: 16 }}>
        {sent ? (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ width: 56, height: 56, margin: "0 auto 14px", borderRadius: 18, display: "grid", placeItems: "center", background: "var(--violet-soft)", color: "var(--violet)" }}>
              <I.check w={26} />
            </div>
            <p style={{ fontSize: 15, fontWeight: 700, color: "var(--hi)", marginBottom: 8 }}>Check your inbox</p>
            <p className="muted" style={{ fontSize: 13 }}>If an account exists for <strong>{email}</strong>, you'll receive reset instructions shortly.</p>
            <button className="btn btn--primary" style={{ marginTop: 20 }} onClick={onClose}>Done</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {error && <div style={{ padding: "10px 12px", background: "rgba(239,68,68,.1)", borderRadius: 10, fontSize: 12.5, color: "var(--danger)" }}>{error}</div>}
            <div className="field">
              <label className="label">Email Address</label>
              <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required disabled={loading} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" className="btn btn--ghost" onClick={onClose} disabled={loading}>Cancel</button>
              <button type="submit" className="btn btn--primary" disabled={loading}>{loading ? "Sending…" : "Send Link"}</button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}

// ─── Login Form ────────────────────────────────────────────────────────────────

export function LoginForm() {
  const router = useRouter();
  const { refreshCompanies } = useCompany();
  const { setUser } = useUser();
  const { lang } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { user } = await login({ email, password, rememberMe });
      setUser(user);
      await refreshCompanies();
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen" style={{ minHeight: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "40px 22px 60px" }}>
      {/* Brand */}
      <div style={{ textAlign: "center", marginBottom: 34 }}>
        <div style={{ width: 60, height: 60, borderRadius: 20, margin: "0 auto 18px", display: "grid", placeItems: "center",
          background: "linear-gradient(140deg, var(--violet-2), #2a1f6b)", boxShadow: "var(--glow-violet), inset 0 1px 1px rgba(255,255,255,.25)", color: "#fff" }}>
          <I.spool w={30} />
        </div>
        <h1 className="display" style={{ fontSize: 38, color: "var(--hi)" }}>
          Stitch<span className="italic c-violet">Desk</span>
        </h1>
        <p className="muted" style={{ fontSize: 13, marginTop: 6 }}>{t("tagline", lang)}</p>
      </div>

      {/* Card */}
      <div className="card" style={{ padding: 22 }}>
        <h2 className="display" style={{ fontSize: 25, color: "var(--hi)" }}>{t("welcomeBack", lang)}</h2>
        <p className="muted" style={{ fontSize: 12.5, marginTop: 3, marginBottom: 22 }}>{t("signInToContinue", lang)}</p>

        {error && (
          <div style={{ padding: "10px 12px", marginBottom: 14, background: "rgba(239,68,68,.1)", borderRadius: 10, fontSize: 12.5, color: "var(--danger)" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          <div className="field">
            <label className="label">{t("emailAddress", lang)}</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} required placeholder="you@example.com" />
          </div>

          <div className="field">
            <label className="label">{t("password", lang)}</label>
            <div style={{ position: "relative" }}>
              <input className="input" style={{ paddingRight: 46 }} type={showPassword ? "text" : "password"}
                value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} required placeholder="••••••••" />
              <button type="button" onClick={() => setShowPassword((v) => !v)}
                style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", width: 34, height: 34, display: "grid", placeItems: "center", color: "var(--low)" }}>
                {showPassword ? <I.eyeOff w={18} /> : <I.eye w={18} />}
              </button>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "4px 0 20px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <Switch on={rememberMe} onClick={() => setRememberMe((v) => !v)} />
              <span style={{ fontSize: 12.5, fontWeight: 600, color: rememberMe ? "var(--violet)" : "var(--mid)" }}>{t("rememberMe", lang)}</span>
            </label>
            <button type="button" className="link" onClick={() => setForgotOpen(true)}>{t("forgot", lang)}</button>
          </div>

          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? "Signing in…" : <>{t("signIn", lang)} <I.chevRight w={16} /></>}
          </button>
        </form>
      </div>

      <a href="/signup">
        <button className="btn btn--ghost" style={{ marginTop: 12 }}>
          <span className="muted">{t("noAccount", lang)}</span> <span className="c-violet">{t("createOne", lang)}</span>
        </button>
      </a>

      <p className="dim" style={{ textAlign: "center", fontSize: 11, marginTop: 22 }}>© 2026 StitchDesk</p>

      {forgotOpen && <ForgotPasswordModal onClose={() => setForgotOpen(false)} lang={lang} />}
    </div>
  );
}
