import type { IRole } from "@logchimp/types";

export const EXAMPLE_ROLES_DATA: Array<IRole> = [
  {
    id: "1",
    name: "Manager",
    description: "",
    created_at: new Date(Date.now() - 3 * 60 * 1000),
    updated_at: new Date(Date.now() - 3 * 60 * 1000),
  },
  {
    id: "2",
    name: "Marketing and Sales Role",
    description: "Read only access of users data.",
    created_at: new Date(Date.now() - 7 * 60 * 1000),
    updated_at: new Date(Date.now() - 7 * 60 * 1000),
  },
  {
    id: "4",
    name: "Admin Role",
    description: "Full access to all features and data.",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: "3",
    name: "Engineer Role",
    description: "",
    created_at: new Date(),
    updated_at: new Date(),
  },
];
