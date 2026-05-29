"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, User, Menu, Shield, LogOut, X, Home, Package } from "lucide-react";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { useCartStore } from "@/store/cartStore";
import CartDrawer from "./CartDrawer";
import { signIn, signOut, useSession } from "next-auth/react";

function MagneticButton({ children, onClick }: { children: React.ReactNode, onClick?: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.3, y: middleY * 0.3 });
  };

  const reset = () => setPosition({ x: 0, y: 0 });

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      onClick={onClick}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className="p-3 rounded-full glass-panel hover:bg-white/10 transition-colors"
    >
      {children}
    </motion.button>
  );
}

export default function Navbar() {
  const { items, setIsOpen } = useCartStore();
  const { data: session } = useSession();
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  // Lock body scroll when menu open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <>
      <nav className="fixed top-0 w-full z-40 px-6 py-8 flex justify-between items-center mix-blend-difference pointer-events-none">
        <div className="pointer-events-auto">
          <Link href="/">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold tracking-[0.2em] uppercase text-white"
            >
              RCK&apos;S <span className="text-primary">MERCHHH</span>
            </motion.div>
          </Link>
        </div>

        <div className="flex gap-4 pointer-events-auto text-white">
          {/* Cart */}
          <div className="relative">
            <MagneticButton onClick={() => setIsOpen(true)}>
              <ShoppingCart size={20} />
            </MagneticButton>
            {totalItems > 0 && (
              <div className="absolute -top-1 -right-1 bg-primary text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center pointer-events-none">
                {totalItems}
              </div>
            )}
          </div>

          {/* Admin Shield */}
          {session?.user && session.user.role === 'ADMIN' && (
            <Link href="/admin">
              <MagneticButton>
                <Shield size={20} className="text-primary" />
              </MagneticButton>
            </Link>
          )}

          {/* User Button + Dropdown */}
          {session ? (
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <motion.button
                onClick={() => setDropdownOpen(prev => !prev)}
                className="p-3 rounded-full glass-panel hover:bg-white/10 transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-primary text-black flex items-center justify-center font-bold text-xs uppercase">
                  {session.user?.email?.charAt(0)}
                </div>
              </motion.button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      position: 'fixed',
                      top: '72px',
                      right: '16px',
                      width: '220px',
                      zIndex: 99999,
                      mixBlendMode: 'normal',
                      backgroundColor: '#111',
                      border: '1px solid #333',
                      borderRadius: '12px',
                      boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
                      overflow: 'hidden',
                    }}
                  >
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #333' }}>
                      <p style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Signed in as</p>
                      <p style={{ fontSize: '14px', color: 'white', fontWeight: 'bold', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session.user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        signOut({ callbackUrl: "/", redirect: true });
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px 16px',
                        fontSize: '14px',
                        color: '#f87171',
                        textDecoration: 'none',
                        cursor: 'pointer',
                        background: 'none',
                        border: 'none',
                        width: '100%',
                        textAlign: 'left',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(127,29,29,0.3)')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <LogOut size={16} />
                      Log Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <MagneticButton onClick={() => signIn()}>
              <User size={20} />
            </MagneticButton>
          )}

          {/* Menu Button */}
          <MagneticButton onClick={() => setMenuOpen(true)}>
            <Menu size={20} />
          </MagneticButton>
        </div>
      </nav>

      {/* Full-screen Navigation Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60]"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 250 }}
              className="fixed top-0 right-0 h-full w-full max-w-sm bg-[#0a0a0a] border-l border-white/10 z-[70] flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="p-8 flex justify-between items-center border-b border-white/10">
                <span className="text-white font-bold tracking-widest uppercase text-sm">Navigation</span>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                >
                  <X size={22} />
                </button>
              </div>

              {/* Nav Links */}
              <nav className="flex-1 flex flex-col justify-center p-8 space-y-2">
                {[
                  { href: "/", label: "Home", icon: <Home size={20} /> },
                  { href: "/product/signature", label: "Signature Series", icon: <Package size={20} /> },
                ].map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 + 0.1 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-4 py-5 border-b border-white/5 text-gray-400 hover:text-white hover:pl-2 transition-all duration-200 group"
                    >
                      <span className="text-primary opacity-60 group-hover:opacity-100 transition-opacity">{link.icon}</span>
                      <span className="text-2xl font-black uppercase tracking-wider">{link.label}</span>
                    </Link>
                  </motion.div>
                ))}

                {!session && (
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.24 }}
                    className="pt-6"
                  >
                    <Link href="/login" onClick={() => setMenuOpen(false)}>
                      <button className="w-full py-4 bg-primary text-black font-black uppercase tracking-widest hover:bg-white transition-colors">
                        Sign In
                      </button>
                    </Link>
                    <Link href="/signup" onClick={() => setMenuOpen(false)}>
                      <button className="w-full py-4 border border-white/20 text-white font-bold uppercase tracking-widest hover:bg-white/5 transition-colors mt-3">
                        Create Account
                      </button>
                    </Link>
                  </motion.div>
                )}

                {session && (
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.24 }}
                    className="pt-6"
                  >
                    <button
                      onClick={() => { setMenuOpen(false); signOut({ callbackUrl: '/' }); }}
                      className="w-full py-4 border border-white/20 text-white font-bold uppercase tracking-widest hover:bg-red-900/30 hover:text-red-400 hover:border-red-900 transition-colors flex items-center justify-center gap-3"
                    >
                      <LogOut size={18} />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </nav>

              {/* Footer */}
              <div className="p-8 border-t border-white/10">
                <p className="text-xs text-gray-600 uppercase tracking-widest">RCK&apos;s Merchhh © 2025</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <CartDrawer />
    </>
  );
}

