import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { items, address, phone } = body;
    
    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Calculate total amount in INR (Razorpay expects paise, so multiply by 100)
    const totalAmount = items.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0);
    const amountInPaise = totalAmount * 100;

    if (amountInPaise < 100) {
       return NextResponse.json(
        { success: false, error: 'Amount too low' },
        { status: 400 }
      );
    }

    // Create a Razorpay Order
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || '',
      key_secret: process.env.RAZORPAY_KEY_SECRET || '',
    });
    
    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: 'receipt_' + Math.random().toString(36).substring(7),
      });
    } catch (err: any) {
      console.error("Razorpay API error:", err);
      return NextResponse.json({ success: false, error: 'Payment gateway error' }, { status: 500 });
    }

    // Save order to database
    if (!session.user.email) {
      return NextResponse.json({ success: false, error: 'User email not found in session' }, { status: 400 });
    }
    
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found in database' }, { status: 404 });
    }

    // Ensure all products exist in DB
    const orderItemsData = await Promise.all(items.map(async (item: any) => {
      let dbProduct = await prisma.product.findUnique({ where: { id: item.id } });
      if (!dbProduct) {
        // Create a placeholder product if not found (e.g., for the hardcoded signature tee)
        dbProduct = await prisma.product.create({
          data: {
            id: item.id,
            name: item.name || "Product",
            description: "Premium streetwear",
            price: item.price,
            sizes: ["S", "M", "L", "XL"],
            stock: 100
          }
        });
      }
      return {
        productId: dbProduct.id,
        quantity: item.quantity,
        size: item.size,
        price: item.price
      };
    }));

    // Use Razorpay order ID as our DB order ID for easy lookup during verification
    await prisma.order.create({
      data: {
        id: razorpayOrder.id,
        userId: user.id,
        totalAmount: totalAmount,
        status: 'PENDING',
        paymentId: razorpayOrder.id,
        items: {
          create: orderItemsData
        }
      }
    });

    return NextResponse.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: 'INR',
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error during checkout' },
      { status: 500 }
    );
  }
}
