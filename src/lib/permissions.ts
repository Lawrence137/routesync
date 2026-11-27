import { createAccessControl } from "better-auth/plugins/access";

import {
  defaultStatements,
  ownerAc,
  adminAc,
  memberAc,
} from "better-auth/plugins/organization/access";

const statement = {
  ...defaultStatements,

  orders: ["create", "read", "update", "delete"],
  deliveries: ["create", "read", "update", "assign", "complete"],
  drivers: ["create", "read", "update", "delete"],
  vehicles: ["create", "read", "update", "delete"],
  customers: ["create", "read", "update", "delete"],
  routes: ["create", "read", "update", "delete"],
  analytics: ["read"],
} as const;

export const ac = createAccessControl(statement);

// Company owner: all application permissions.
export const owner = ac.newRole({
  ...ownerAc.statements,
  orders: ["create", "read", "update", "delete"],
  deliveries: ["create", "read", "update", "assign", "complete"],
  drivers: ["create", "read", "update", "delete"],
  vehicles: ["create", "read", "update", "delete"],
  customers: ["create", "read", "update", "delete"],
  routes: ["create", "read", "update", "delete"],
  analytics: ["read"],
});

// Administrator: manage company operations.
export const admin = ac.newRole({
  ...adminAc.statements,
  orders: ["create", "read", "update", "delete"],
  deliveries: ["create", "read", "update", "assign", "complete"],
  drivers: ["create", "read", "update", "delete"],
  vehicles: ["create", "read", "update", "delete"],
  customers: ["create", "read", "update", "delete"],
  routes: ["create", "read", "update", "delete"],
  analytics: ["read"],
});

// Dispatcher: manage orders, assignments and routes.
export const dispatcher = ac.newRole({
  ...memberAc.statements,
  orders: ["create", "read", "update"],
  deliveries: ["create", "read", "update", "assign"],
  drivers: ["read"],
  vehicles: ["read"],
  customers: ["create", "read", "update"],
  routes: ["create", "read", "update"],
  analytics: ["read"],
});

// Driver: access delivery operations only.
// Ownership of an individual delivery must also be checked
// in application queries, not just by this role.
export const driver = ac.newRole({
  ...memberAc.statements,
  deliveries: ["read", "update"],
});