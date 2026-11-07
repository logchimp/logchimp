import type { Knex } from "knex";
import type { TableUsers, TablePosts } from "../dbTypes";

export interface TablePostsEE extends TablePosts {
  boardId: TableBoards["boardId"] | null;
  roadmap_id: TableRoadmaps["id"] | null;
}

declare module "../dbTypes" {
  interface TablePostsExtensions
    extends Pick<TablePostsEE, "boardId" | "roadmap_id"> {}
}

export interface TablePostsActivity {
  id: string;
  type: string;
  posts_comments_id: string | null;
  post_id: string;
  author_id: string;
  created_at: Date;
}

export interface TablePostsComments {
  id: string;
  parent_id: string | null;
  activity_id: TablePostsActivity["id"];
  body: string;
  is_internal: boolean;
  is_edited: boolean;
  is_spam: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface TableBoards {
  boardId: string;
  name: string;
  url: string;
  color: string;
  display: boolean;
  view_voters: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TablePermissions {
  id: string;
  name: string | null;
  type: string;
  action: string;
  scope: string | null;
  created_at: Date;
}

export interface TableRoles {
  id: string;
  name: string;
  description: string | null;
  is_system: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface TableRolesUsers {
  id: string;
  role_id: TableRoles["id"];
  user_id: TableUsers["userId"];
}

export interface TablePermissionsRoles {
  id: string;
  permission_id: TablePermissions["id"];
  role_id: TableRoles["id"];
}

export interface TableRoadmaps {
  id: string;
  name: string;
  url: string;
  index: number;
  color: string;
  display: boolean;
  created_at: Date;
  updated_at: Date;
}

declare module "knex/types/tables" {
  interface Tables {
    posts_activity: Knex.CompositeTableType<
      TablePostsActivity,
      Pick<TablePostsActivity, "id" | "type" | "post_id" | "author_id"> &
        Partial<Pick<TablePostsActivity, "created_at" | "posts_comments_id">>,
      Partial<TablePostsActivity>
    >;
    posts_comments: Knex.CompositeTableType<
      TablePostsComments,
      Pick<TablePostsComments, "id" | "activity_id" | "body"> &
        Partial<
          Pick<
            TablePostsComments,
            | "parent_id"
            | "is_edited"
            | "is_spam"
            | "is_internal"
            | "created_at"
            | "updated_at"
          >
        >,
      Partial<TablePostsComments>
    >;
    boards: Knex.CompositeTableType<
      TableBoards,
      Pick<TableBoards, "boardId" | "name" | "url" | "color"> &
        Partial<
          Pick<
            TableBoards,
            "display" | "view_voters" | "createdAt" | "updatedAt"
          >
        >,
      Partial<TableBoards>
    >;
    permissions: Knex.CompositeTableType<
      TablePermissions,
      Pick<TablePermissions, "id" | "type" | "action"> &
        Partial<Pick<TablePermissions, "name" | "scope" | "created_at">>,
      Partial<TablePermissions>
    >;
    roles: Knex.CompositeTableType<
      TableRoles,
      Pick<TableRoles, "id" | "name"> &
        Partial<
          Pick<
            TableRoles,
            "description" | "is_system" | "created_at" | "updated_at"
          >
        >,
      Partial<TableRoles>
    >;
    roles_users: Knex.CompositeTableType<
      TableRolesUsers,
      Pick<TableRolesUsers, "id" | "role_id" | "user_id">,
      Partial<TableRolesUsers>
    >;
    permissions_roles: Knex.CompositeTableType<
      TablePermissionsRoles,
      Pick<TablePermissionsRoles, "id" | "permission_id" | "role_id">,
      Partial<TablePermissionsRoles>
    >;
    roadmaps: Knex.CompositeTableType<
      TableRoadmaps,
      Pick<TableRoadmaps, "id" | "name" | "url" | "index" | "color"> &
        Partial<Pick<TableRoadmaps, "display" | "created_at" | "updated_at">>,
      Partial<TableRoadmaps>
    >;
  }
}
