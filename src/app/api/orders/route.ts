
import { NextResponse } from "next/server";
import { eq, desc, and } from "drizzle-orm";

import { db } from "@/db";
import { orders, customers } from "@/db/schema";
import { requirePermission } from "@/lib/authorization";
import { createOrderSchema } from "@/lib/validators/order";

export async function GET() {
  try {
    const { organizationId } = await requirePermission({
      orders: ["read"],
    });

    const results = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        status: orders.status,
        description: orders.description,
        pickupAddress: orders.pickupAddress,
        pickupCity: orders.pickupCity,
        deliveryAddress: orders.deliveryAddress,
        deliveryCity: orders.deliveryCity,
        recipientName: orders.recipientName,
        recipientPhone: orders.recipientPhone,
        packageCount: orders.packageCount,
        totalWeightKg: orders.totalWeightKg,
        deliveryFee: orders.deliveryFee,
        currency: orders.currency,
        scheduledAt: orders.scheduledAt,
        createdAt: orders.createdAt,
        customer: {
          id: customers.id,
          name: customers.name,
          companyName: customers.companyName,
        },
      })
      .from(orders)
      .leftJoin(
        customers,
        eq(orders.customerId, customers.id)
      )
      .where(eq(orders.organizationId, organizationId))
      .orderBy(desc(orders.createdAt));

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Unable to fetch orders" },
      { status: 500 }
    );
  }
}


export async function POST(request: Request) {
  try {
    // 1. Verify the user's permission and organization.
    const { organizationId, session } = await requirePermission({
      orders: ["create"],
    });

    // 2. Parse and validate the request body.
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const validation = createOrderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order data",
          errors: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const input = validation.data;

    // 3. Verify that the customer belongs to this organization.
    const [customer] = await db
      .select({ id: customers.id })
      .from(customers)
      .where(
        and(
          eq(customers.id, input.customerId),
          eq(customers.organizationId, organizationId)
        )
      )
      .limit(1);

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer not found",
        },
        { status: 404 }
      );
    }

    // 4. Generate a unique order number.
    const orderNumber = `RS-${crypto
      .randomUUID()
      .slice(0, 8)
      .toUpperCase()}`;

    // 5. Create the order using server-controlled ownership.
    const [newOrder] = await db
      .insert(orders)
      .values({
        organizationId,
        customerId: input.customerId,
        orderNumber,
        description: input.description,
        pickupAddress: input.pickupAddress,
        pickupCity: input.pickupCity,
        deliveryAddress: input.deliveryAddress,
        deliveryCity: input.deliveryCity,
        recipientName: input.recipientName,
        recipientPhone: input.recipientPhone,
        packageCount: input.packageCount,
        totalWeightKg: input.totalWeightKg?.toString(),
        deliveryFee: input.deliveryFee.toString(),
        currency: input.currency,
        scheduledAt: input.scheduledAt
          ? new Date(input.scheduledAt)
          : undefined,
        status: "pending",
        createdBy: session.user.id,
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully",
        data: newOrder,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 401 }
        );
      }

      if (
        error.message === "FORBIDDEN" ||
        error.message === "NO_ACTIVE_ORGANIZATION"
      ) {
        return NextResponse.json(
          { success: false, message: "Forbidden" },
          { status: 403 }
        );
      }
    }

    console.error("Create order error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to create order" },
      { status: 500 }
    );
  }
}
