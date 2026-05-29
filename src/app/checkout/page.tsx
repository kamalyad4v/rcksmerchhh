"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { ArrowLeft, CreditCard, Banknote, Trash2 } from "lucide-react";
import Link from "next/link";
import Script from "next/script";

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { items, getTotalPrice, clearCart, removeFromCart } = useCartStore();

  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("online"); // online or cod
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <h2 className="text-2xl font-bold uppercase mb-4">Your cart is empty</h2>
        <Link href="/">
          <button className="px-6 py-3 bg-primary text-black font-bold uppercase hover:bg-white transition-colors">
            Return to Shop
          </button>
        </Link>
      </div>
    );
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, address, phone, paymentMethod }),
      });
      const data = await res.json();

      if (!data.success) {
        alert("Checkout failed: " + data.error);
        setLoading(false);
        return;
      }

      if (paymentMethod === "cod" || data.isMock) {
        alert("Order Successful! Order ID: " + data.orderId + (data.isMock ? " (Mock Mode)" : ""));
        clearCart();
        router.push("/");
      } else {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || data.key,
          amount: data.amount,
          currency: data.currency,
          name: "AG AGUU",
          description: "Purchase from AG AGUU",
          order_id: data.orderId,
          handler: async function (response: any) {
            try {
              const verifyRes = await fetch("/api/verify-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });
              
              const verifyData = await verifyRes.json();
              if (verifyData.success) {
                alert("Payment verified successfully!");
                clearCart();
                router.push("/");
              } else {
                alert("Payment verification failed: " + verifyData.error);
                setLoading(false);
              }
            } catch (err) {
              console.error(err);
              alert("Error verifying payment");
              setLoading(false);
            }
          },
          prefill: {
            name: session?.user?.name || "",
            email: session?.user?.email || "",
            contact: phone,
          },
          theme: {
            color: "#D0FF00", // primary color
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on("payment.failed", function (response: any) {
          alert("Payment Failed: " + response.error.description);
          setLoading(false);
        });
        rzp.open();
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative flex flex-col md:flex-row">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      {/* Left Column: Form */}
      <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center overflow-y-auto custom-scrollbar">
        <Link href="/" className="text-gray-500 hover:text-white transition-colors flex items-center gap-2 mb-8">
          <ArrowLeft size={20} /> Back to Shop
        </Link>
        
        <h1 className="text-4xl font-black uppercase tracking-widest mb-8">Checkout</h1>

        <form onSubmit={handleCheckout} className="space-y-8">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-4 border-b border-white/10 pb-2">Shipping Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Full Address</label>
                <textarea 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 p-4 text-white focus:outline-none focus:border-primary transition-colors h-24 resize-none"
                  placeholder="123 Street, City, State, ZIP"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 p-4 text-white focus:outline-none focus:border-primary transition-colors"
                  placeholder="+91 9876543210"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-4 border-b border-white/10 pb-2">Payment Method</h2>
            <div className="grid grid-cols-1 gap-4">
              <div 
                onClick={() => setPaymentMethod("online")}
                className={`border p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${paymentMethod === 'online' ? 'border-primary text-primary bg-primary/5' : 'border-white/20 hover:border-white/50 text-white'}`}
              >
                <CreditCard size={24} />
                <span className="uppercase font-bold text-sm tracking-widest text-center">Online Payment<br/>(Razorpay)</span>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-5 bg-primary text-black font-black uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50 mt-8"
          >
            {loading ? "Processing..." : "Place Order"}
          </button>
        </form>
      </div>

      {/* Right Column: Order Summary */}
      <div className="w-full md:w-1/2 bg-[#050505] border-l border-white/10 p-8 md:p-16 flex flex-col overflow-y-auto custom-scrollbar">
        <h2 className="text-xl font-bold uppercase tracking-widest mb-8">Order Summary</h2>
        <div className="flex-1 space-y-6">
          {items.map((item) => (
            <div key={`${item.id}-${item.size}`} className="flex gap-4 items-center">
              <div className="w-16 h-20 bg-black rounded border border-white/10 flex items-center justify-center text-[10px] text-gray-600 uppercase">
                {item.name.split(' ')[0]}
              </div>
              <div className="flex-1 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold uppercase text-sm truncate">{item.name}</h3>
                  <button 
                    onClick={() => removeFromCart(item.id, item.size)}
                    className="text-gray-500 hover:text-red-500 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="flex justify-between items-end mt-2">
                  <p className="text-gray-500 text-xs uppercase">Size: {item.size} • Qty: {item.quantity}</p>
                  <p className="font-bold text-primary">₹{item.price * item.quantity}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 pt-8 border-t border-white/10 space-y-4">
          <div className="flex justify-between text-gray-400 text-sm uppercase">
            <span>Subtotal</span>
            <span>₹{getTotalPrice()}</span>
          </div>
          <div className="flex justify-between text-gray-400 text-sm uppercase">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="flex justify-between text-white text-xl font-black uppercase mt-4">
            <span>Total</span>
            <span className="text-primary">₹{getTotalPrice()}</span>
          </div>
        </div>
      </div>

    </div>
  );
}
