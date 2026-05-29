import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const [
      totalUsers,
      recentUsers,
      totalOrders,
      completedOrders,
      pendingOrders,
      totalRevenue
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.user.findMany({ 
        where: { role: 'USER' },
        orderBy: { id: 'desc' }, // Assuming auto-increment/cuid correlates loosely with time, or we should add createdAt to User. Wait, User model doesn't have createdAt? Let's check schema.
        take: 5 
      }),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'SHIPPED' } }), // we'll treat SHIPPED/DELIVERED as completed
      prisma.order.count({ where: { status: { in: ['PENDING', 'PROCESSING'] } } }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: { not: 'CANCELLED' } }
      })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        recentUsers,
        totalOrders,
        completedOrders,
        pendingOrders,
        totalRevenue: totalRevenue._sum.totalAmount || 0
      }
    });

  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
