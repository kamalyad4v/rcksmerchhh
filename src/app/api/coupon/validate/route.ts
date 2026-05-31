import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Coupon code is required' },
        { status: 400 }
      );
    }

    const codeUpper = code.trim().toUpperCase();

    // Auto-create/seed the SAVE498 coupon if it doesn't exist
    if (codeUpper === 'SAVE498') {
      try {
        const existing = await prisma.coupon.findUnique({
          where: { code: codeUpper },
        });

        if (!existing) {
          await prisma.coupon.create({
            data: {
              code: codeUpper,
              discount: 498.0,
              expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 10), // 10 years expiry
              isActive: true,
            },
          });
        }
      } catch (dbErr) {
        console.error('Error auto-seeding coupon:', dbErr);
      }
    }

    // Fetch the coupon from the database
    const coupon = await prisma.coupon.findUnique({
      where: { code: codeUpper },
    });

    if (!coupon) {
      return NextResponse.json(
        { success: false, error: 'Invalid coupon code' },
        { status: 404 }
      );
    }

    // Check if the coupon is active
    if (!coupon.isActive) {
      return NextResponse.json(
        { success: false, error: 'This coupon is no longer active' },
        { status: 400 }
      );
    }

    // Check if the coupon has expired
    if (new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'This coupon has expired' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        discount: coupon.discount,
      },
    });

  } catch (error) {
    console.error('Coupon validation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error during validation' },
      { status: 500 }
    );
  }
}
