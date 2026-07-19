import { pgTable, serial, varchar, text, integer, timestamp, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const healthCheck = pgTable("health_check", {
  id: serial().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// 读书房间
export const readingRooms = pgTable(
  "reading_rooms",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 255 }).notNull(),
    book_title: varchar("book_title", { length: 255 }).notNull(),
    author: varchar("author", { length: 255 }),
    description: text("description"),
    invite_code: varchar("invite_code", { length: 8 }).notNull().unique(),
    created_by: varchar("created_by", { length: 128 }).notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("reading_rooms_invite_code_idx").on(table.invite_code),
    index("reading_rooms_created_at_idx").on(table.created_at),
  ]
);

// 房间成员
export const roomMembers = pgTable(
  "room_members",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    room_id: varchar("room_id", { length: 36 }).notNull().references(() => readingRooms.id, { onDelete: "cascade" }),
    nickname: varchar("nickname", { length: 128 }).notNull(),
    color: varchar("color", { length: 7 }).notNull().default("#0000FF"),
    joined_at: timestamp("joined_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("room_members_room_id_idx").on(table.room_id),
  ]
);

// 章节
export const chapters = pgTable(
  "chapters",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    room_id: varchar("room_id", { length: 36 }).notNull().references(() => readingRooms.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content").notNull(),
    sort_order: integer("sort_order").notNull().default(0),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("chapters_room_id_idx").on(table.room_id),
    index("chapters_sort_order_idx").on(table.sort_order),
  ]
);

// 批注
export const annotations = pgTable(
  "annotations",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    chapter_id: varchar("chapter_id", { length: 36 }).notNull().references(() => chapters.id, { onDelete: "cascade" }),
    member_id: varchar("member_id", { length: 36 }).notNull().references(() => roomMembers.id, { onDelete: "cascade" }),
    selected_text: text("selected_text").notNull(),
    comment: text("comment").notNull(),
    start_offset: integer("start_offset").notNull(),
    end_offset: integer("end_offset").notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("annotations_chapter_id_idx").on(table.chapter_id),
    index("annotations_member_id_idx").on(table.member_id),
  ]
);

// 讨论线程
export const discussions = pgTable(
  "discussions",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    chapter_id: varchar("chapter_id", { length: 36 }).notNull().references(() => chapters.id, { onDelete: "cascade" }),
    member_id: varchar("member_id", { length: 36 }).notNull().references(() => roomMembers.id, { onDelete: "cascade" }),
    parent_id: varchar("parent_id", { length: 36 }),
    content: text("content").notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("discussions_chapter_id_idx").on(table.chapter_id),
    index("discussions_parent_id_idx").on(table.parent_id),
    index("discussions_member_id_idx").on(table.member_id),
  ]
);
