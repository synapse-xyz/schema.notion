import type { Message } from '@/types/chat'
import { jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const threads = pgTable('threads', {
  id: uuid('id').primaryKey().defaultRandom(),
  chatId: text('chat_id').notNull().unique(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  diagram: text('diagram').default('').notNull(),
  schemasSql: text('schemas_sql').default('').notNull(),
  schemasMongo: text('schemas_mongo').default('').notNull(),
  conversation: jsonb('conversation').$type<Message[]>().default([]).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type User = typeof users.$inferSelect
export type InsertUser = typeof users.$inferInsert
export type Thread = typeof threads.$inferSelect
export type InsertThread = typeof threads.$inferInsert
