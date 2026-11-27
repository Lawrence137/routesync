CREATE TYPE "public"."delivery_status" AS ENUM('pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'failed', 'cancelled', 'returned');--> statement-breakpoint
CREATE TYPE "public"."driver_status" AS ENUM('available', 'on_delivery', 'offline', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'confirmed', 'assigned', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."vehicle_status" AS ENUM('available', 'in_use', 'maintenance', 'inactive');--> statement-breakpoint
CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"name" varchar(160) NOT NULL,
	"email" varchar(255),
	"phone" varchar(30),
	"company_name" varchar(160),
	"address" text,
	"city" varchar(100),
	"country" varchar(100),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deliveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"order_id" uuid NOT NULL,
	"driver_id" uuid,
	"vehicle_id" uuid,
	"status" "delivery_status" DEFAULT 'pending' NOT NULL,
	"assigned_at" timestamp with time zone,
	"picked_up_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"estimated_arrival_at" timestamp with time zone,
	"failure_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "delivery_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"delivery_id" uuid NOT NULL,
	"actor_user_id" text,
	"event_type" varchar(80) NOT NULL,
	"description" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "driver_locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"driver_id" uuid NOT NULL,
	"latitude" numeric(10, 7) NOT NULL,
	"longitude" numeric(10, 7) NOT NULL,
	"heading" numeric(6, 2),
	"speed_kph" numeric(7, 2),
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "drivers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"email" varchar(255),
	"phone" varchar(30),
	"license_number" varchar(100),
	"status" "driver_status" DEFAULT 'offline' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"customer_id" uuid NOT NULL,
	"order_number" varchar(50) NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"description" text,
	"pickup_address" text NOT NULL,
	"pickup_city" varchar(100),
	"delivery_address" text NOT NULL,
	"delivery_city" varchar(100),
	"recipient_name" varchar(160),
	"recipient_phone" varchar(30),
	"package_count" integer DEFAULT 1 NOT NULL,
	"total_weight_kg" numeric(10, 2),
	"delivery_fee" numeric(12, 2),
	"currency" varchar(3) DEFAULT 'KES' NOT NULL,
	"scheduled_at" timestamp with time zone,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"registration_number" varchar(50) NOT NULL,
	"make" varchar(100),
	"model" varchar(100),
	"year" integer,
	"vehicle_type" varchar(80),
	"capacity_kg" numeric(10, 2),
	"status" "vehicle_status" DEFAULT 'available' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_driver_id_drivers_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_events" ADD CONSTRAINT "delivery_events_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_events" ADD CONSTRAINT "delivery_events_delivery_id_deliveries_id_fk" FOREIGN KEY ("delivery_id") REFERENCES "public"."deliveries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_events" ADD CONSTRAINT "delivery_events_actor_user_id_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "driver_locations" ADD CONSTRAINT "driver_locations_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "driver_locations" ADD CONSTRAINT "driver_locations_driver_id_drivers_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "customers_organization_idx" ON "customers" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "customers_email_idx" ON "customers" USING btree ("organization_id","email");--> statement-breakpoint
CREATE UNIQUE INDEX "deliveries_order_unique" ON "deliveries" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "deliveries_organization_idx" ON "deliveries" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "deliveries_status_idx" ON "deliveries" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "deliveries_driver_idx" ON "deliveries" USING btree ("driver_id");--> statement-breakpoint
CREATE INDEX "delivery_events_delivery_idx" ON "delivery_events" USING btree ("delivery_id");--> statement-breakpoint
CREATE INDEX "delivery_events_organization_idx" ON "delivery_events" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "delivery_events_created_idx" ON "delivery_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "driver_locations_driver_idx" ON "driver_locations" USING btree ("driver_id","recorded_at");--> statement-breakpoint
CREATE INDEX "driver_locations_organization_idx" ON "driver_locations" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "drivers_organization_idx" ON "drivers" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "drivers_user_idx" ON "drivers" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "drivers_org_user_unique" ON "drivers" USING btree ("organization_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_org_number_unique" ON "orders" USING btree ("organization_id","order_number");--> statement-breakpoint
CREATE INDEX "orders_organization_idx" ON "orders" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "orders_customer_idx" ON "orders" USING btree ("customer_id");--> statement-breakpoint
CREATE UNIQUE INDEX "vehicles_org_registration_unique" ON "vehicles" USING btree ("organization_id","registration_number");--> statement-breakpoint
CREATE INDEX "vehicles_organization_idx" ON "vehicles" USING btree ("organization_id");