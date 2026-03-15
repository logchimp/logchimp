export type PermissionAction =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "destroy"
  | "assign"
  | "unassign"
  | "view_internal"
  | "create_internal";

export type TPermissionEntities =
  | "post"
  | "board"
  | "roadmap"
  | "vote"
  | "comment"
  | "dashboard"
  | "role"
  | "settings";

export type TPermissionScope =
  // None is not a permission scope
  // Solely used as a fallback/default value in the type system
  | "none"
  // User with 'own' scope can interact with their own data of the same entity (TPermissionEntities)
  | "own"
  // User with 'any' scope can interact with any data of the same entity (TPermissionEntities)
  | "any";

export type TPermission =
  | "post:read"
  | "post:create"
  | "post:update"
  | "post:destroy"
  | "board:read"
  | "board:create"
  | "board:update"
  | "board:destroy"
  | "board:assign"
  | "board:unassign"
  | "vote:create"
  | "vote:destroy"
  | "vote:assign"
  | "vote:unassign"
  | "roadmap:read"
  | "roadmap:create"
  | "roadmap:update"
  | "roadmap:destroy"
  | "roadmap:assign"
  | "roadmap:unassign"
  | "comment:create"
  | "comment:create_internal"
  | "comment:update:own"
  | "comment:update:any"
  | "comment:delete:own"
  | "comment:delete:any"
  | "comment:view_internal"
  | "dashboard:read"
  | "role:read"
  | "role:create"
  | "role:update"
  | "role:destroy"
  | "role:assign"
  | "role:unassign"
  | "settings:read"
  | "settings:update";

export interface IGetPermissionResponse {
  permissions: TPermission[];
}

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
    update: TPermissionScope;
    delete: TPermissionScope;
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
