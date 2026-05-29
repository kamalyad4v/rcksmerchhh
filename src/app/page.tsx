import Navbar from "@/components/Navbar";
import DynamicScene from "@/components/DynamicScene";
import Link from "next/link";
import { PrismaClient } from "@prisma/client";

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export default async function Home() {
  let products: any[] = [];
  try {
    products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    });
  } catch (e) {
    // DB might not be available during build - gracefully show empty state
    products = [];
  }


  return (
    <main className="relative min-h-[200vh] bg-black">
      <Navbar />

      {/* 3D Background */}
      <div className="fixed inset-0 z-0">
        <DynamicScene />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 h-screen flex flex-col justify-center items-center pointer-events-none">
        <h1 className="text-[12vw] font-black uppercase tracking-tighter leading-none text-white mix-blend-overlay opacity-80 text-center">
          AG AGUU
        </h1>
        <p className="mt-4 text-xl md:text-2xl tracking-[0.3em] uppercase text-primary/80">
          The New Standard
        </p>
      </section>

      {/* Product Highlight Overlay / Scroll trigger area */}
      <section className="relative z-10 h-screen flex items-center justify-between px-10 pointer-events-none mb-32">
        <div className="max-w-md pointer-events-auto">
          <h2 className="text-4xl md:text-6xl font-bold uppercase mb-4 text-white">
            Signature<br/>Series
          </h2>
          <p className="text-gray-400 mb-8">
            Experience our premium collection with uncompromising quality and futuristic design. 
            Manga-inspired grunge textures meet high-end luxury.
          </p>
          <Link href="/product/signature">
            <button className="px-8 py-4 bg-primary text-black font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors rounded-none">
              Explore Collection
            </button>
          </Link>
        </div>
        
        <div className="w-1/3 text-right pointer-events-auto hidden md:block">
           <div className="glass-panel p-6 inline-block text-left">
              <p className="text-sm text-primary uppercase font-bold tracking-widest mb-2">Material</p>
              <p className="text-white">Heavyweight French Terry</p>
              <div className="w-full h-px bg-white/20 my-4" />
              <p className="text-sm text-primary uppercase font-bold tracking-widest mb-2">Weight</p>
              <p className="text-white">450 GSM</p>
           </div>
        </div>
      </section>

      {/* Collections Section */}
      <section className="relative z-10 min-h-screen bg-[#050505] pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-widest mb-16 text-white border-l-4 border-primary pl-6">
            The Collection
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <Link href={`/product/${product.id}`} key={product.id}>
                <div className="group cursor-pointer">
                  <div className="aspect-[3/4] bg-[#111] overflow-hidden relative border border-[#333] group-hover:border-primary transition-colors duration-500">
                    {product.images && product.images.length > 0 ? (
                      <img 
                        src={product.images[0]} 
                        alt={product.name} 
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 font-mono text-sm uppercase tracking-widest">
                        Image Pending
                      </div>
                    )}
                    {product.stock <= 0 && (
                      <div className="absolute top-4 right-4 bg-red-600 text-white text-xs font-bold px-3 py-1 uppercase tracking-widest">
                        Sold Out
                      </div>
                    )}
                  </div>
                  <div className="mt-6 flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-white uppercase tracking-wider group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-400 mt-1 uppercase tracking-widest line-clamp-1">{product.description}</p>
                    </div>
                    <span className="text-primary font-bold">₹{product.price}</span>
                  </div>
                </div>
              </Link>
            ))}

            {products.length === 0 && (
              <div className="col-span-full py-20 text-center text-gray-500 uppercase tracking-widest">
                New Drops Coming Soon
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
