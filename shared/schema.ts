import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  inviteCode: text("invite_code").notNull().unique(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  password: text("password").notNull(),
  groupId: integer("group_id").notNull(),
  points: integer("points").notNull().default(0),
});

export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  points: integer("points").notNull(),
  difficulty: text("difficulty").notNull(),
  icon: text("icon").notNull().default("star"),
  groupId: integer("group_id").notNull(),
});

export const userChallengeCompletions = pgTable("user_challenge_completions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  challengeId: integer("challenge_id").notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
});

export const insertGroupSchema = createInsertSchema(groups).omit({
  id: true,
  inviteCode: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  points: true,
});

export const insertChallengeSchema = createInsertSchema(challenges).omit({
  id: true,
});

export const insertCompletionSchema = createInsertSchema(userChallengeCompletions).omit({
  id: true,
  completedAt: true,
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  groupCode: z.string().min(1, "Group code is required"),
});

export type Group = typeof groups.$inferSelect;
export type User = typeof users.$inferSelect;
export type Challenge = typeof challenges.$inferSelect;
export type UserChallengeCompletion = typeof userChallengeCompletions.$inferSelect;
export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type InsertCompletion = z.infer<typeof insertCompletionSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
