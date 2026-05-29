"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";

export default function LogoutPage() {
  useEffect(() => {
    signOut({ callbackUrl: "/", redirect: true });
  }, []);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <p className="text-white text-xl tracking-widest uppercase">Signing out...</p>
    </div>
  );
}
