"use client";

import { useState } from "react";
import { ArrowLeft, Key, Mail, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function ForgotPasswordForm() {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send verification code");
      } else {
        setMessage("Verification code sent to your email.");
        setStep(2);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to reset password");
      } else {
        setMessage("Password reset successfully. Redirecting to login...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black flex flex-col relative text-white">
      <Link 
        id="back-to-login-link"
        href="/login" 
        className="absolute top-8 left-8 z-20 text-white hover:text-primary transition-colors flex items-center gap-2 uppercase tracking-widest text-sm font-bold"
      >
        <ArrowLeft size={20} /> Back to Login
      </Link>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent"></div>
          
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black tracking-[0.2em] uppercase text-white mb-2">
              RCK'S <span className="text-primary text-glow">MERCHHH</span>
            </h1>
            <p className="text-gray-500 uppercase tracking-widest text-sm">
              {step === 1 ? "Forgot Password" : "Reset Password"}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSendOtp}
                className="space-y-6"
                id="forgot-password-step1-form"
              >
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-start gap-3">
                  <Mail className="text-primary mt-1 shrink-0" size={20} />
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Enter the email address associated with your account. We will send you a 6-digit verification code to reset your password.
                  </p>
                </div>

                <div>
                  <label htmlFor="reset-email-input" className="block text-white text-sm font-bold uppercase tracking-widest mb-2">Email Address</label>
                  <input
                    id="reset-email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/20 p-4 text-white focus:outline-none focus:border-primary transition-colors rounded"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                {error && <p id="error-message" className="text-red-500 text-sm font-bold">{error}</p>}

                <button
                  id="send-otp-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 bg-primary text-black font-black uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {loading ? "Sending Code..." : "Send Verification Code"}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleResetPassword}
                className="space-y-6"
                id="forgot-password-step2-form"
              >
                {message && (
                  <div id="success-notification" className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-start gap-3">
                    <CheckCircle className="text-emerald-500 mt-1 shrink-0" size={20} />
                    <p className="text-xs text-emerald-400 leading-relaxed">
                      {message}
                    </p>
                  </div>
                )}

                <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-start gap-3">
                  <Key className="text-primary mt-1 shrink-0" size={20} />
                  <p className="text-xs text-gray-400 leading-relaxed">
                    A code has been sent to <strong className="text-white">{email}</strong>. Enter it below along with your new password to complete the reset.
                  </p>
                </div>

                <div>
                  <label htmlFor="otp-input" className="block text-white text-sm font-bold uppercase tracking-widest mb-2">Verification Code</label>
                  <input
                    id="otp-input"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full bg-white/5 border border-white/20 p-4 text-white focus:outline-none focus:border-primary transition-colors rounded text-center text-2xl font-bold tracking-[0.5em]"
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="new-password-input" className="block text-white text-sm font-bold uppercase tracking-widest mb-2">New Password</label>
                  <input
                    id="new-password-input"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/20 p-4 text-white focus:outline-none focus:border-primary transition-colors rounded"
                    placeholder="••••••••"
                    minLength={6}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="confirm-password-input" className="block text-white text-sm font-bold uppercase tracking-widest mb-2">Confirm New Password</label>
                  <input
                    id="confirm-password-input"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/20 p-4 text-white focus:outline-none focus:border-primary transition-colors rounded"
                    placeholder="••••••••"
                    minLength={6}
                    required
                  />
                </div>

                {error && <p id="error-message-step2" className="text-red-500 text-sm font-bold">{error}</p>}

                <div className="flex flex-col gap-3">
                  <button
                    id="reset-password-btn"
                    type="submit"
                    disabled={loading}
                    className="w-full py-5 bg-primary text-black font-black uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? "Resetting Password..." : "Reset Password"}
                  </button>

                  <button
                    id="change-email-btn"
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setError("");
                      setMessage("");
                    }}
                    className="w-full py-3 bg-transparent text-gray-500 hover:text-white font-bold uppercase tracking-widest text-xs transition-colors cursor-pointer"
                  >
                    Change Email
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
