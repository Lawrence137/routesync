
import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { customers } from "@/db/schema";
import { requirePermission } from "@/lib/authorization";
import { createCustomerSchema } from "@/lib/validators/customer";

export async function GET() {
  try {
    const { organizationId } = await requirePermission({
      customers: ["read"],
    });

    const results = await db
      .select()
      .from(customers)
      .where(eq(customers.organizationId, organizationId))
      .orderBy(desc(customers.createdAt));

    return NextResponse.json({
      success: true,
      data: results,
    });
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

    console.error("Fetch customers error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to fetch customers" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { organizationId } = await requirePermission({
      customers: ["create"],
    });

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const validation = createCustomerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid customer data",
          errors: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const input = validation.data;

    const [newCustomer] = await db
      .insert(customers)
      .values({
        organizationId,
        name: input.name,
        email: input.email || null,
        phone: input.phone || null,
        companyName: input.companyName || null,
        address: input.address || null,
        city: input.city || null,
        country: input.country || null,
        notes: input.notes || null,
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        message: "Customer created successfully",
        data: newCustomer,
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

    console.error("Create customer error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to create customer" },
      { status: 500 }
    );
  }
}
