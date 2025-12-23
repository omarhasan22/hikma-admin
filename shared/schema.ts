import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === USERS ===
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  phone: text("phone").notNull().unique(),
  fullName: text("full_name").notNull(),
  email: text("email"),
  userType: text("user_type").notNull().default("patient"), // patient, admin, superadmin
  role: text("role").default("user"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// === SPECIALTIES ===
export const specialties = pgTable("specialties", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon"),
});

// === DOCTORS ===
export const doctors = pgTable("doctors", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id), // Link to user account
  phone: text("phone").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email"),
  specialtyId: integer("specialty_id").references(() => specialties.id),
  licenseNumber: text("license_number"),
  experienceYears: integer("experience_years"),
  bio: text("bio"),
  address: text("address"),
  latitude: decimal("latitude"),
  longitude: decimal("longitude"),
  whatsapp: text("whatsapp"),
  isApproved: boolean("is_approved").default(false),
  isVip: boolean("is_vip").default(false),
  vipExpiresAt: timestamp("vip_expires_at"),
  rating: decimal("rating").default("0"),
  reviewCount: integer("review_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// === ORGANIZATIONS ===
export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  type: text("type").notNull(), // hospital, clinic, pharmacy
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  latitude: decimal("latitude"),
  longitude: decimal("longitude"),
  description: text("description"),
  website: text("website"),
  isApproved: boolean("is_approved").default(false),
  logo: text("logo"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === SERVICES ===
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price"),
  duration: integer("duration"), // minutes
  doctorId: integer("doctor_id").references(() => doctors.id),
  organizationId: integer("organization_id").references(() => organizations.id),
  isActive: boolean("is_active").default(true),
});

// === SLIDERS ===
export const sliders = pgTable("sliders", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  imageUrl: text("image_url").notNull(),
  link: text("link"),
  isActive: boolean("is_active").default(true),
  order: integer("order").default(0),
});

// === DAILY TIPS ===
export const dailyTips = pgTable("daily_tips", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  authorId: integer("author_id").references(() => users.id),
  publishDate: timestamp("publish_date").defaultNow(),
  isActive: boolean("is_active").default(true),
});

// === OTP Codes (for Auth) ===
export const otpCodes = pgTable("otp_codes", {
  id: serial("id").primaryKey(),
  phone: text("phone").notNull(),
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
});

// === INSERTS ===
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertDoctorSchema = createInsertSchema(doctors).omit({ id: true, rating: true, reviewCount: true, createdAt: true });
export const insertOrganizationSchema = createInsertSchema(organizations).omit({ id: true, createdAt: true });
export const insertServiceSchema = createInsertSchema(services).omit({ id: true });
export const insertSliderSchema = createInsertSchema(sliders).omit({ id: true });
export const insertTipSchema = createInsertSchema(dailyTips).omit({ id: true });

// === TYPES ===
export type User = typeof users.$inferSelect;
export type Doctor = typeof doctors.$inferSelect;
export type Organization = typeof organizations.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Slider = typeof sliders.$inferSelect;
export type DailyTip = typeof dailyTips.$inferSelect;
