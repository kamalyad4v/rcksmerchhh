import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();



export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: 'Missing payment details' },
        { status: 400 }
      );
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Verify signature
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, error: 'Signature mismatch' },
        { status: 400 }
      );
    }

    // Update order status in DB and fetch user/items for the email
    const updatedOrder = await prisma.order.update({
      where: { id: razorpay_order_id },
      data: {
        status: 'PROCESSING', // or PAID
        paymentId: razorpay_payment_id,
      },
      include: {
        user: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    // Send confirmation email
    if (updatedOrder.user && updatedOrder.user.email) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        const mailOptions = {
          from: `"AG AGUU" <${process.env.EMAIL_USER}>`,
          to: updatedOrder.user.email,
          subject: `Order Confirmation - AG AGUU (#${updatedOrder.id})`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #000; color: #fff; padding: 20px; border: 1px solid #333;">
              <h1 style="color: #D0FF00; text-transform: uppercase;">Order Confirmed</h1>
              <p>Hi ${updatedOrder.user.name || 'there'},</p>
              <p>Thank you for shopping with AG AGUU. Your payment of <strong>₹${updatedOrder.totalAmount}</strong> was completely successful and your order is now being processed.</p>
              
              <h3 style="color: #D0FF00; border-bottom: 1px solid #333; padding-bottom: 10px; margin-top: 30px;">Order Summary</h3>
              <ul style="list-style: none; padding: 0;">
                ${updatedOrder.items.map((item: any) => `
                  <li style="margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #222;">
                    <strong>${item.product.name}</strong><br/>
                    <span style="color: #aaa;">Size: ${item.size} | Qty: ${item.quantity}</span><br/>
                    <span style="color: #D0FF00;">₹${item.price * item.quantity}</span>
                  </li>
                `).join('')}
              </ul>
              
              <p style="margin-top: 30px; color: #888;">We will notify you once your order is shipped.</p>
              <p>Best regards,<br/><strong>AG AGUU Team</strong></p>
            </div>
          `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Confirmation email sent to ${updatedOrder.user.email}`);
      } catch (mailError) {
        console.error("Failed to send confirmation email:", mailError);
        // We don't want to fail the whole payment verification just because the email failed
      }
    }

    return NextResponse.json({ success: true, message: 'Payment verified and email sent successfully' });
  } catch (error) {
    console.error('Verify payment error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error during verification' },
      { status: 500 }
    );
  }
}
