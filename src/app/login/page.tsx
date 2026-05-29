"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col relative">
      <Link href="/" className="absolute top-8 left-8 z-20 text-white hover:text-primary transition-colors flex items-center gap-2">
        <ArrowLeft size={20} /> Back
      </Link>
      
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 p-8 rounded-2xl shadow-2xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black tracking-[0.2em] uppercase text-white mb-2">
              RCK'S <span className="text-primary">MERCHHH</span>
            </h1>
            <p className="text-gray-500 uppercase tracking-widest text-sm">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white text-sm font-bold uppercase tracking-widest mb-2">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/20 p-4 text-white focus:outline-none focus:border-primary transition-colors"
                placeholder="you@example.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-white text-sm font-bold uppercase tracking-widest mb-2">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/20 p-4 text-white focus:outline-none focus:border-primary transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            {error && <p className="text-red-500 text-sm font-bold">{error}</p>}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-5 bg-primary text-black font-black uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Sign In"}
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Don't have an account? <Link href="/signup" className="text-white hover:text-primary cursor-pointer underline">Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
