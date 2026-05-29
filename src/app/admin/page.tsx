"use client";

import { useEffect, useState } from 'react';
import { Users, ShoppingBag, CheckCircle, Clock, IndianRupee } from 'lucide-react';

interface Stats {
  totalUsers: number;
  recentUsers: any[];
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStats(data.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-8 text-[#D0FF00]">Loading dashboard...</div>;
  }

  if (!stats) {
    return <div className="p-8 text-red-500">Failed to load statistics.</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8 uppercase tracking-wider text-white">Dashboard Overview</h1>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
        <StatCard title="Total Revenue" value={`₹${stats.totalRevenue}`} icon={<IndianRupee size={24} />} />
        <StatCard title="Total Orders" value={stats.totalOrders.toString()} icon={<ShoppingBag size={24} />} />
        <StatCard title="Pending" value={stats.pendingOrders.toString()} icon={<Clock size={24} />} color="text-yellow-500" />
        <StatCard title="Completed" value={stats.completedOrders.toString()} icon={<CheckCircle size={24} />} color="text-green-500" />
        <StatCard title="Total Users" value={stats.totalUsers.toString()} icon={<Users size={24} />} />
      </div>

      {/* Recent Users */}
      <div className="bg-[#111] border border-[#333] rounded-xl p-6">
        <h2 className="text-xl font-bold mb-6 text-[#D0FF00]">Recent Users</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-500 border-b border-[#333]">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Role</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentUsers.map((user, idx) => (
                <tr key={user.id} className="border-b border-[#222] last:border-0">
                  <td className="py-4">{user.name || 'N/A'}</td>
                  <td className="py-4 text-gray-400">{user.email}</td>
                  <td className="py-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-[#222] text-[#D0FF00]">
                      {user.role}
                    </span>
                  </td>
                </tr>
              ))}
              {stats.recentUsers.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-4 text-center text-gray-500">No recent users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color = "text-[#D0FF00]" }: { title: string, value: string, icon: React.ReactNode, color?: string }) {
  return (
    <div className="bg-[#111] border border-[#333] p-6 rounded-xl flex items-center space-x-4 hover:border-[#555] transition-colors">
      <div className={`p-3 bg-[#222] rounded-lg ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold mt-1 text-white">{value}</p>
      </div>
    </div>
  );
}
