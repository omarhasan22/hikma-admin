import { users, doctors, organizations, services, sliders, dailyTips, otpCodes, type User, type InsertUser, type Doctor, type InsertDoctor, type Organization, type InsertOrganization, type Service, type InsertService, type Slider, type InsertSlider, type DailyTip, type InsertTip } from "@shared/schema";
import { db } from "./db";
import { eq, ilike, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(params?: { page?: number; limit?: number }): Promise<{ data: User[]; total: number }>;

  // Doctors
  createDoctor(doctor: InsertDoctor): Promise<Doctor>;
  getDoctor(id: number): Promise<Doctor | undefined>;
  getDoctors(filters?: { isApproved?: boolean; isVip?: boolean; search?: string; limit?: number }): Promise<Doctor[]>;
  updateDoctor(id: number, doctor: Partial<InsertDoctor>): Promise<Doctor>;
  deleteDoctor(id: number): Promise<void>;

  // Organizations
  createOrganization(org: InsertOrganization): Promise<Organization>;
  getOrganizations(filters?: { status?: string; search?: string; limit?: number }): Promise<Organization[]>;
  updateOrganization(id: number, org: Partial<InsertOrganization>): Promise<Organization>;

  // Services
  getServices(): Promise<Service[]>;
  
  // Dashboard
  getStats(): Promise<{ totalUsers: number; totalDoctors: number; totalOrganizations: number; activeServices: number }>;

  // OTP
  createOtp(phone: string, code: string): Promise<void>;
  verifyOtp(phone: string, code: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phone, phone));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getUsers(params?: { page?: number; limit?: number }): Promise<{ data: User[]; total: number }> {
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const offset = (page - 1) * limit;

    const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const total = Number(countResult.count);

    const data = await db.select().from(users).limit(limit).offset(offset).orderBy(desc(users.createdAt));
    return { data, total };
  }

  async createDoctor(insertDoctor: InsertDoctor): Promise<Doctor> {
    const [doctor] = await db.insert(doctors).values(insertDoctor).returning();
    return doctor;
  }

  async getDoctor(id: number): Promise<Doctor | undefined> {
    const [doctor] = await db.select().from(doctors).where(eq(doctors.id, id));
    return doctor;
  }

  async getDoctors(filters?: { isApproved?: boolean; isVip?: boolean; search?: string; limit?: number }): Promise<Doctor[]> {
    const conditions = [];
    if (filters?.isApproved !== undefined) conditions.push(eq(doctors.isApproved, filters.isApproved));
    if (filters?.isVip !== undefined) conditions.push(eq(doctors.isVip, filters.isVip));
    if (filters?.search) conditions.push(ilike(doctors.fullName, `%${filters.search}%`));

    return await db.select()
      .from(doctors)
      .where(and(...conditions))
      .limit(filters?.limit || 50)
      .orderBy(desc(doctors.createdAt));
  }

  async updateDoctor(id: number, updates: Partial<InsertDoctor>): Promise<Doctor> {
    const [updated] = await db.update(doctors).set(updates).where(eq(doctors.id, id)).returning();
    return updated;
  }

  async deleteDoctor(id: number): Promise<void> {
    await db.delete(doctors).where(eq(doctors.id, id));
  }

  async createOrganization(insertOrg: InsertOrganization): Promise<Organization> {
    const [org] = await db.insert(organizations).values(insertOrg).returning();
    return org;
  }

  async getOrganizations(filters?: { status?: string; search?: string; limit?: number }): Promise<Organization[]> {
    const conditions = [];
    if (filters?.status === 'approved') conditions.push(eq(organizations.isApproved, true));
    if (filters?.status === 'pending') conditions.push(eq(organizations.isApproved, false));
    if (filters?.search) conditions.push(ilike(organizations.name, `%${filters.search}%`));

    return await db.select()
      .from(organizations)
      .where(and(...conditions))
      .limit(filters?.limit || 50)
      .orderBy(desc(organizations.createdAt));
  }

  async updateOrganization(id: number, updates: Partial<InsertOrganization>): Promise<Organization> {
    const [updated] = await db.update(organizations).set(updates).where(eq(organizations.id, id)).returning();
    return updated;
  }

  async getServices(): Promise<Service[]> {
    return await db.select().from(services);
  }

  async getStats(): Promise<{ totalUsers: number; totalDoctors: number; totalOrganizations: number; activeServices: number }> {
    const [usersCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [doctorsCount] = await db.select({ count: sql<number>`count(*)` }).from(doctors);
    const [orgsCount] = await db.select({ count: sql<number>`count(*)` }).from(organizations);
    const [servicesCount] = await db.select({ count: sql<number>`count(*)` }).from(services).where(eq(services.isActive, true));

    return {
      totalUsers: Number(usersCount.count),
      totalDoctors: Number(doctorsCount.count),
      totalOrganizations: Number(orgsCount.count),
      activeServices: Number(servicesCount.count),
    };
  }

  async createOtp(phone: string, code: string): Promise<void> {
    // Expires in 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await db.insert(otpCodes).values({ phone, code, expiresAt, used: false });
  }

  async verifyOtp(phone: string, code: string): Promise<boolean> {
    const [otp] = await db.select()
      .from(otpCodes)
      .where(and(eq(otpCodes.phone, phone), eq(otpCodes.code, code), eq(otpCodes.used, false)))
      .orderBy(desc(otpCodes.expiresAt))
      .limit(1);

    if (otp && new Date() < otp.expiresAt) {
      await db.update(otpCodes).set({ used: true }).where(eq(otpCodes.id, otp.id));
      return true;
    }
    return false;
  }
}

export const storage = new DatabaseStorage();
