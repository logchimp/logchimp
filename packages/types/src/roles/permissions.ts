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
