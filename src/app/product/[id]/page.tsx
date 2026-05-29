import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import ProductClient from "./ProductClient";

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let product;
  
  if (id === 'signature') {
    // Fallback for the hardcoded signature link on homepage
    product = {
      id: 'aguu-signature-tee',
      name: 'AGUU Signature Tee',
      price: 499,
      description: 'The pinnacle of our collection. Crafted from 180 GSM French Terry cotton, featuring an oversized drop-shoulder fit. The fabric has been specially treated for a vintage grunge texture that ages beautifully.',
      sizes: ['S', 'M', 'L', 'XL'],
      images: []
    };
  } else {
    product = await prisma.product.findUnique({
      where: { id }
    });
  }

  if (!product) {
    notFound();
  }

  return <ProductClient product={product} />;
}
