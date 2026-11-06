import type { components } from "@logchimp/api-ts-types";

export const EXAMPLE_ROLES_DATA: Array<components["schemas"]["RoleItem"]> = [
  {
    id: "1",
    name: "Manager",
    description: "",
    isSystem: true,
    created_at: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    name: "Marketing and Sales Role",
    description: "Read only access of users data.",
    isSystem: false,
    created_at: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
  },
  {
    id: "4",
    name: "Admin Role",
    description: "Full access to all features and data.",
    isSystem: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Engineer Role",
    description: "",
    isSystem: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];
