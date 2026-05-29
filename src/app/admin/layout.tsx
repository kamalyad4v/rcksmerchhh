"use client";

import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, ShoppingBag, Package, LogOut } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/admin');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return <div className="flex h-screen bg-[#050505] items-center justify-center text-[#D0FF00]">Loading...</div>;
  }

  if (status === 'unauthenticated' || (status === 'authenticated' && session?.user?.role !== 'ADMIN')) {
    return null;
  }

  return (
    <div className="flex h-screen bg-[#050505] text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-[#111] border-r border-[#333] flex flex-col">
        <div className="p-6 border-b border-[#333]">
          <h2 className="text-xl font-bold tracking-widest text-[#D0FF00]">RCK&apos;S MERCHHH</h2>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Admin Portal</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-[#222] transition-colors">
            <LayoutDashboard size={20} className="text-[#D0FF00]" />
            <span>Dashboard</span>
          </Link>
          <Link href="/admin/orders" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-[#222] transition-colors">
            <ShoppingBag size={20} className="text-[#D0FF00]" />
            <span>Orders</span>
          </Link>
          <Link href="/admin/products" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-[#222] transition-colors">
            <Package size={20} className="text-[#D0FF00]" />
            <span>Products</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-[#333] space-y-2">
          <Link href="/" className="block text-center px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
            &larr; Back to Store
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#222] text-white text-sm font-bold rounded-lg hover:bg-red-900/50 hover:text-red-500 transition-colors"
          >
            <LogOut size={16} />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#0a0a0a]">
        {children}
      </main>
    </div>
  );
}
