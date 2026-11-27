
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function requireSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("UNAUTHORIZED");
  }

  return session;
}

export async function requireOrganization() {
  const session = await requireSession();

  const organizationId = session.session.activeOrganizationId;

  if (!organizationId) {
    throw new Error("NO_ACTIVE_ORGANIZATION");
  }

  const member = await auth.api.getActiveMember({
    headers: await headers(),
  });

  if (!member || member.organizationId !== organizationId) {
    throw new Error("FORBIDDEN");
  }

  return {
    session,
    organizationId,
    member,
  };
}


export async function requirePermission(
  permissions: NonNullable<
    Parameters<typeof auth.api.hasPermission>[0]
  >["body"]["permissions"]
) {
  const organization = await requireOrganization();

  const result = await auth.api.hasPermission({
    headers: await headers(),
    body: {
      organizationId: organization.organizationId,
      permissions,
    },
  });

  if (!result.success) {
    console.error("Permission check failed:", {
      organizationId: organization.organizationId,
      permissions,
      role: organization.member.role,
    });

    throw new Error("MISSING_PERMISSION");
  }

  return organization;
}


