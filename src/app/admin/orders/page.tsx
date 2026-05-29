"use client";

import { useEffect, useState } from 'react';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    setLoading(true);
    fetch('/api/admin/orders')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOrders(data.data);
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId: string, status: string) => {
    const res = await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, status })
    });
    const data = await res.json();
    if (data.success) {
      fetchOrders(); // refresh
    } else {
      alert("Failed to update status");
    }
  };

  if (loading && orders.length === 0) {
    return <div className="p-8 text-[#D0FF00]">Loading orders...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8 uppercase tracking-wider text-white">Order Management</h1>
      
      <div className="bg-[#111] border border-[#333] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#1a1a1a]">
              <tr className="text-gray-400 text-sm">
                <th className="p-4 font-medium">Order ID</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Items</th>
                <th className="p-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-[#333] hover:bg-[#151515] transition-colors">
                  <td className="p-4 font-mono text-xs text-gray-500">{order.id}</td>
                  <td className="p-4">
                    <div className="text-white">{order.user?.name || 'Guest'}</div>
                    <div className="text-gray-500 text-xs">{order.user?.email}</div>
                  </td>
                  <td className="p-4 text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-[#D0FF00] font-bold">
                    ₹{order.totalAmount}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      order.status === 'PROCESSING' ? 'bg-yellow-500/20 text-yellow-500' :
                      order.status === 'SHIPPED' ? 'bg-blue-500/20 text-blue-500' :
                      order.status === 'DELIVERED' ? 'bg-green-500/20 text-green-500' :
                      'bg-gray-500/20 text-gray-500'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="max-w-[200px] text-gray-400 text-xs truncate">
                      {order.items.map((item: any) => `${item.quantity}x ${item.product?.name} (${item.size})`).join(', ')}
                    </div>
                  </td>
                  <td className="p-4">
                    {order.status === 'PROCESSING' && (
                      <button 
                        onClick={() => updateStatus(order.id, 'SHIPPED')}
                        className="px-3 py-1 bg-[#D0FF00] text-black text-xs font-bold rounded hover:bg-[#b0d600] transition-colors"
                      >
                        Mark Shipped
                      </button>
                    )}
                    {order.status === 'SHIPPED' && (
                      <button 
                        onClick={() => updateStatus(order.id, 'DELIVERED')}
                        className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded hover:bg-green-600 transition-colors"
                      >
                        Mark Delivered
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
