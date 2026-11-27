import {
  pgTable,
  pgEnum,
  uuid,
  text,
  varchar,
  boolean,
  integer,
  numeric,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { organization, user } from "./auth-schema";

// --------------------------------------------------
// ENUMS
// --------------------------------------------------

export const driverStatusEnum = pgEnum("driver_status", [
  "available",
  "on_delivery",
  "offline",
  "suspended",
]);

export const vehicleStatusEnum = pgEnum("vehicle_status", [
  "available",
  "in_use",
  "maintenance",
  "inactive",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "confirmed",
  "assigned",
  "in_progress",
  "completed",
  "cancelled",
]);

export const deliveryStatusEnum = pgEnum("delivery_status", [
  "pending",
  "assigned",
  "picked_up",
  "in_transit",
  "delivered",
  "failed",
  "cancelled",
  "returned",
]);

// --------------------------------------------------
// CUSTOMERS
// --------------------------------------------------

export const customers = pgTable(
  "customers",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),

    name: varchar("name", { length: 160 }).notNull(),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 30 }),

    companyName: varchar("company_name", { length: 160 }),

    address: text("address"),
    city: varchar("city", { length: 100 }),
    country: varchar("country", { length: 100 }),

    notes: text("notes"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("customers_organization_idx").on(table.organizationId),
    index("customers_email_idx").on(table.organizationId, table.email),
  ]
);

// --------------------------------------------------
// DRIVERS
// --------------------------------------------------

export const drivers = pgTable(
  "drivers",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),

    userId: text("user_id").references(() => user.id, {
      onDelete: "set null",
    }),

    firstName: varchar("first_name", { length: 100 }).notNull(),
    lastName: varchar("last_name", { length: 100 }).notNull(),

    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 30 }),

    licenseNumber: varchar("license_number", { length: 100 }),

    status: driverStatusEnum("status")
      .default("offline")
      .notNull(),

    isActive: boolean("is_active").default(true).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("drivers_organization_idx").on(table.organizationId),
    index("drivers_user_idx").on(table.userId),
    uniqueIndex("drivers_org_user_unique").on(
      table.organizationId,
      table.userId
    ),
  ]
);

// --------------------------------------------------
// VEHICLES
// --------------------------------------------------

export const vehicles = pgTable(
  "vehicles",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),

    registrationNumber: varchar("registration_number", {
      length: 50,
    }).notNull(),

    make: varchar("make", { length: 100 }),
    model: varchar("model", { length: 100 }),
    year: integer("year"),

    vehicleType: varchar("vehicle_type", { length: 80 }),

    capacityKg: numeric("capacity_kg", {
      precision: 10,
      scale: 2,
    }),

    status: vehicleStatusEnum("status")
      .default("available")
      .notNull(),

    isActive: boolean("is_active").default(true).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("vehicles_org_registration_unique").on(
      table.organizationId,
      table.registrationNumber
    ),
    index("vehicles_organization_idx").on(table.organizationId),
  ]
);

// --------------------------------------------------
// ORDERS
// --------------------------------------------------

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),

    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "restrict" }),

    orderNumber: varchar("order_number", { length: 50 }).notNull(),

    status: orderStatusEnum("status")
      .default("pending")
      .notNull(),

    description: text("description"),

    pickupAddress: text("pickup_address").notNull(),
    pickupCity: varchar("pickup_city", { length: 100 }),

    deliveryAddress: text("delivery_address").notNull(),
    deliveryCity: varchar("delivery_city", { length: 100 }),

    recipientName: varchar("recipient_name", { length: 160 }),
    recipientPhone: varchar("recipient_phone", { length: 30 }),

    packageCount: integer("package_count").default(1).notNull(),

    totalWeightKg: numeric("total_weight_kg", {
      precision: 10,
      scale: 2,
    }),

    deliveryFee: numeric("delivery_fee", {
      precision: 12,
      scale: 2,
    }),

    currency: varchar("currency", { length: 3 })
      .default("KES")
      .notNull(),

    scheduledAt: timestamp("scheduled_at", {
      withTimezone: true,
    }),

    createdBy: text("created_by").references(() => user.id, {
      onDelete: "set null",
    }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("orders_org_number_unique").on(
      table.organizationId,
      table.orderNumber
    ),
    index("orders_organization_idx").on(table.organizationId),
    index("orders_status_idx").on(table.organizationId, table.status),
    index("orders_customer_idx").on(table.customerId),
  ]
);

// --------------------------------------------------
// DELIVERIES
// --------------------------------------------------

export const deliveries = pgTable(
  "deliveries",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),

    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "restrict" }),

    driverId: uuid("driver_id").references(() => drivers.id, {
      onDelete: "set null",
    }),

    vehicleId: uuid("vehicle_id").references(() => vehicles.id, {
      onDelete: "set null",
    }),

    status: deliveryStatusEnum("status")
      .default("pending")
      .notNull(),

    assignedAt: timestamp("assigned_at", { withTimezone: true }),
    pickedUpAt: timestamp("picked_up_at", { withTimezone: true }),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),

    estimatedArrivalAt: timestamp("estimated_arrival_at", {
      withTimezone: true,
    }),

    failureReason: text("failure_reason"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("deliveries_order_unique").on(table.orderId),
    index("deliveries_organization_idx").on(table.organizationId),
    index("deliveries_status_idx").on(table.organizationId, table.status),
    index("deliveries_driver_idx").on(table.driverId),
  ]
);

// --------------------------------------------------
// DELIVERY EVENTS
// --------------------------------------------------

export const deliveryEvents = pgTable(
  "delivery_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),

    deliveryId: uuid("delivery_id")
      .notNull()
      .references(() => deliveries.id, { onDelete: "cascade" }),

    actorUserId: text("actor_user_id").references(() => user.id, {
      onDelete: "set null",
    }),

    eventType: varchar("event_type", { length: 80 }).notNull(),

    description: text("description"),

    metadata: jsonb("metadata"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("delivery_events_delivery_idx").on(table.deliveryId),
    index("delivery_events_organization_idx").on(table.organizationId),
    index("delivery_events_created_idx").on(table.createdAt),
  ]
);

// --------------------------------------------------
// DRIVER LOCATIONS
// --------------------------------------------------

export const driverLocations = pgTable(
  "driver_locations",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),

    driverId: uuid("driver_id")
      .notNull()
      .references(() => drivers.id, { onDelete: "cascade" }),

    latitude: numeric("latitude", {
      precision: 10,
      scale: 7,
    }).notNull(),

    longitude: numeric("longitude", {
      precision: 10,
      scale: 7,
    }).notNull(),

    heading: numeric("heading", {
      precision: 6,
      scale: 2,
    }),

    speedKph: numeric("speed_kph", {
      precision: 7,
      scale: 2,
    }),

    recordedAt: timestamp("recorded_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("driver_locations_driver_idx").on(
      table.driverId,
      table.recordedAt
    ),
    index("driver_locations_organization_idx").on(table.organizationId),
  ]
);