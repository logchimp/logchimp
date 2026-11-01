import type { components } from "@logchimp/api-ts-types";

export interface IPermissionsState {
  post: {
    create: boolean;
    read: boolean;
    update: boolean;
    destroy: boolean;
  };
  comment: {
    create: boolean;
    view_internal: boolean;
    create_internal: boolean;
    update: components["schemas"]["PermissionScope"];
    delete: components["schemas"]["PermissionScope"];
  };
  board: {
    create: boolean;
    read: boolean;
    update: boolean;
    destroy: boolean;
    assign: boolean;
    unassign: boolean;
  };
  roadmap: {
    create: boolean;
    read: boolean;
    update: boolean;
    destroy: boolean;
    assign: boolean;
    unassign: boolean;
  };
  vote: {
    create: boolean;
    destroy: boolean;
    assign: boolean;
    unassign: boolean;
  };
  dashboard: {
    read: boolean;
  };
  role: {
    create: boolean;
    read: boolean;
    update: boolean;
    destroy: boolean;
    assign: boolean;
    unassign: boolean;
  };
  settings: {
    read: boolean;
    update: boolean;
  };
}
