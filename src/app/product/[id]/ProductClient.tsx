"use client";

import DynamicScene from "@/components/DynamicScene";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, Plus, Minus } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ProductClient({ product }: { product: any }) {
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || "M");
  const { items, addToCart, updateQuantity, removeFromCart } = useCartStore();
  const { data: session } = useSession();
  const router = useRouter();
  const productId = product.id;
  
  const cartItem = items.find(i => i.id === productId && i.size === selectedSize);

  const handleAddToCart = () => {
    if (!session) {
      router.push('/login');
      return;
    }
    addToCart({
      id: productId,
      name: product.name,
      price: product.price,
      size: selectedSize,
      quantity: 1,
      image: product.images?.[0] || ""
    });
  };

  const handleBuyNow = () => {
    if (!session) {
      router.push('/login');
      return;
    }
    handleAddToCart();
    router.push('/checkout');
  };

  return (
    <main className="min-h-screen bg-black flex flex-col md:flex-row">
      {/* LEFT: 3D Product Viewer (Fallback to image if no 3D available) */}
      <div className="relative w-full md:w-1/2 h-[50vh] md:h-screen bg-[#050505]">
        <Link href="/" className="absolute top-8 left-8 z-20 text-white hover:text-primary transition-colors flex items-center gap-2">
          <ArrowLeft size={20} /> Back
        </Link>
        {productId === 'aguu-signature-tee' ? (
          <>
            <DynamicScene />
            <div className="absolute bottom-8 left-8 z-20 pointer-events-none">
              <p className="text-white/50 text-sm uppercase tracking-widest">Interactive Viewer</p>
              <p className="text-white text-xs">Drag to rotate • Scroll to zoom</p>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center p-12">
            {product.images && product.images.length > 0 ? (
              <img src={product.images[0]} alt={product.name} className="max-w-full max-h-full object-contain" />
            ) : (
              <p className="text-gray-500 tracking-widest uppercase">No Image</p>
            )}
          </div>
        )}
      </div>

      {/* RIGHT: Product Details */}
      <div className="w-full md:w-1/2 h-[50vh] md:h-screen overflow-y-auto px-8 md:px-16 py-12 md:py-24 custom-scrollbar">
        <div className="max-w-xl mx-auto">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black uppercase text-white mb-2">{product.name}</h1>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-primary">₹{product.price}</p>
            </div>
          </div>

          <div className="w-full h-px bg-white/10 my-8" />

          {/* Size Selector */}
          <div className="mb-8">
            <div className="flex justify-between mb-4">
              <span className="text-sm text-white uppercase font-bold tracking-widest">Select Size</span>
              <span className="text-sm text-gray-500 underline cursor-pointer hover:text-white">Size Guide</span>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {(product.sizes && product.sizes.length > 0 ? product.sizes : ['S', 'M', 'L', 'XL']).map((size: string) => (
                <button 
                  key={size} 
                  onClick={() => setSelectedSize(size)}
                  className={`py-4 border text-white transition-colors uppercase font-bold ${
                    selectedSize === size 
                      ? "border-primary text-primary" 
                      : "border-white/20 hover:border-primary hover:text-primary"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-4 mb-12">
            {cartItem ? (
              <div className="w-full py-5 border border-primary text-primary font-black uppercase tracking-widest flex items-center justify-between px-8 bg-primary/10 transition-colors">
                <button 
                  onClick={() => {
                    if (cartItem.quantity > 1) {
                      updateQuantity(productId, selectedSize, cartItem.quantity - 1);
                    } else {
                      removeFromCart(productId, selectedSize);
                    }
                  }}
                  className="p-2 hover:text-white transition-colors"
                >
                  <Minus size={20} />
                </button>
                <span>{cartItem.quantity} In Cart</span>
                <button 
                  onClick={() => updateQuantity(productId, selectedSize, cartItem.quantity + 1)}
                  className="p-2 hover:text-white transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>
            ) : (
              <button 
                onClick={handleAddToCart}
                disabled={product.stock <= 0 && productId !== 'aguu-signature-tee'}
                className="w-full py-5 bg-primary text-black font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-white transition-colors disabled:opacity-50"
              >
                <ShoppingBag size={20} /> {product.stock <= 0 && productId !== 'aguu-signature-tee' ? 'Sold Out' : 'pakkana pettu'}
              </button>
            )}
            <button 
              onClick={handleBuyNow}
              disabled={product.stock <= 0 && productId !== 'aguu-signature-tee'}
              className="w-full py-5 border border-white/20 text-white font-bold uppercase tracking-widest hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              venteneyy kanuu
            </button>
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <h3 className="text-white uppercase font-bold mb-2">Description</h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                {product.description}
              </p>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
