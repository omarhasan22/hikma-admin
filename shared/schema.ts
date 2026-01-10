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
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  overlayColor: text("overlay_color"),
  link: text("link"),
  isActive: boolean("is_active").default(true),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// === SERVICE IMAGES ===
export const serviceImages = pgTable("service_images", {
  id: serial("id").primaryKey(),
  serviceId: integer("service_id").references(() => services.id),
  imageUrl: text("image_url").notNull(),
  altText: text("alt_text"),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// === REVIEWS ===
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  doctorId: integer("doctor_id").references(() => doctors.id),
  organizationId: integer("organization_id").references(() => organizations.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  isHidden: boolean("is_hidden").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// === DAILY TIPS ===
export const dailyTips = pgTable("daily_tips", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content"),
  image: text("image"),
  authorId: integer("author_id").references(() => users.id),
  publishDate: timestamp("publish_date").defaultNow(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
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
export const insertSliderSchema = createInsertSchema(sliders).omit({ id: true, createdAt: true });
export const insertTipSchema = createInsertSchema(dailyTips).omit({ id: true, createdAt: true });
export const insertServiceImageSchema = createInsertSchema(serviceImages).omit({ id: true, createdAt: true });
export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true });

// === TYPES ===
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Doctor = typeof doctors.$inferSelect;
export type InsertDoctor = typeof doctors.$inferInsert;
export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = typeof organizations.$inferInsert;
export type Service = typeof services.$inferSelect;
export type InsertService = typeof services.$inferInsert;
export type Slider = typeof sliders.$inferSelect;
export type InsertSlider = typeof sliders.$inferInsert;
export type DailyTip = typeof dailyTips.$inferSelect;
export type InsertTip = typeof dailyTips.$inferInsert;
export type ServiceImage = typeof serviceImages.$inferSelect;
export type InsertServiceImage = typeof serviceImages.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;
