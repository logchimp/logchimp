import type { Knex } from "knex";

export interface TableUsers {
  userId: string;
  name: string | null;
  email: string;
  password: string | null;
  username: string;
  avatar: string | null;
  isVerified: boolean;
  isOwner: boolean;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
  notes: string | null;
}

interface TableAuthIdentities {
  id: string;
  user_id: TableUsers["userId"];
  provider: string;
  subject: string;
  email: string;
  email_verified: boolean;
  updated_at: Date | null;
  created_at: Date;
}

interface TableEmailVerification {
  email: string;
  token: string;
  createdAt: Date;
}

export interface TablePosts {
  postId: string;
  title: string;
  slug: string;
  slugId: string;
  contentMarkdown: string | null;
  userId: TableUsers["userId"];
  createdAt: Date;
  updatedAt: Date;
}

// biome-ignore lint/suspicious/noEmptyInterface: <explanation>
export interface TablePostsExtensions {}

interface TableResetPassword {
  email: string;
  token: string;
  createdAt: Date;
}

interface TableSettings {
  title: string | null;
  description: string | null;
  logo: string | null;
  icon: string | null;
  accentColor: string | null;
  googleAnalyticsId: string | null;
  isPoweredBy: boolean;
  allowSignup: boolean;
  developer_mode: boolean;
  labs: object;
}

interface TableVotes {
  voteId: string;
  userId: TableUsers["userId"];
  postId: TablePosts["postId"];
  createdAt: Date;
}

declare module "knex/types/tables" {
  interface Tables {
    users: Knex.CompositeTableType<
      TableUsers,
      Pick<TableUsers, "userId" | "email" | "username"> &
        Partial<
          Pick<
            TableUsers,
            | "name"
            | "password"
            | "avatar"
            | "isVerified"
            | "isOwner"
            | "isBlocked"
            | "notes"
            | "createdAt"
            | "updatedAt"
          >
        >,
      Partial<TableUsers>
    >;
    auth_identities: Knex.CompositeTableType<
      TableAuthIdentities,
      Pick<
        TableAuthIdentities,
        "id" | "user_id" | "provider" | "subject" | "email" | "email_verified"
      > &
        Partial<Pick<TableAuthIdentities, "created_at" | "updated_at">>,
      Partial<TableAuthIdentities>
    >;
    emailVerification: Knex.CompositeTableType<
      TableEmailVerification,
      TableEmailVerification,
      TableEmailVerification
    >;
    posts: Knex.CompositeTableType<
      TablePosts & TablePostsExtensions,
      Pick<TablePosts, "postId" | "title" | "slug" | "slugId" | "userId"> &
        Partial<
          Pick<TablePosts, "createdAt" | "updatedAt" | "contentMarkdown">
        > &
        Partial<TablePostsExtensions>,
      Partial<TablePosts & TablePostsExtensions>
    >;
    resetPassword: Knex.CompositeTableType<
      TableResetPassword,
      TableResetPassword,
      TableResetPassword
    >;
    settings: Knex.CompositeTableType<
      TableSettings,
      Partial<
        Pick<
          TableSettings,
          | "title"
          | "description"
          | "logo"
          | "icon"
          | "accentColor"
          | "googleAnalyticsId"
          | "isPoweredBy"
          | "allowSignup"
          | "labs"
          | "developer_mode"
        >
      >,
      Partial<TableSettings>
    >;
    votes: Knex.CompositeTableType<
      TableVotes,
      Pick<TableVotes, "voteId" | "userId" | "postId"> &
        Partial<Pick<TableVotes, "createdAt">>,
      Partial<TableVotes>
    >;
  }
}
