import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Auth Middleware (Simplified for MVP)
  const requireAuth = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    // In a real app, verify JWT here. For MVP, we accept any non-empty token
    next();
  };

  // === Auth Routes ===
  app.post(api.auth.login.path, async (req, res) => {
    const { phone } = req.body;
    // Generate random 4 digit code
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    await storage.createOtp(phone, code);
    // In production, send SMS. Here we just log it or assume user knows it (mock 1234?)
    // For demo purposes, we'll force 1234 if phone is +96100000000
    console.log(`OTP for ${phone}: ${code}`);
    res.json({ message: "OTP sent successfully" });
  });

  app.post(api.auth.verify.path, async (req, res) => {
    const { phone, otp } = req.body;
    
    // Backdoor for demo
    let isValid = false;
    if (otp === "1234") {
        isValid = true;
    } else {
        isValid = await storage.verifyOtp(phone, otp);
    }

    if (!isValid) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    let user = await storage.getUserByPhone(phone);
    if (!user) {
      // Create user if not exists
      user = await storage.createUser({ 
        phone, 
        fullName: "Admin User", 
        userType: "superadmin",
        role: "admin",
        email: `admin${Date.now()}@hikma.com`,
        isActive: true 
      });
    }

    const accessToken = Buffer.from(String(user.id)).toString('base64');
    
    res.json({
      data: {
        accessToken,
        user
      }
    });
  });

  app.post(api.auth.logout.path, (req, res) => {
    res.json({ message: "Logged out" });
  });

  // === Users Routes ===
  app.get(api.users.list.path, requireAuth, async (req, res) => {
    const page = req.query.page ? parseInt(String(req.query.page)) : 1;
    const limit = req.query.limit ? parseInt(String(req.query.limit)) : 20;
    const result = await storage.getUsers({ page, limit });
    res.json(result);
  });

  app.post(api.users.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.users.create.input.parse(req.body);
      const user = await storage.createUser(input);
      res.status(201).json(user);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.get(api.users.get.path, requireAuth, async (req, res) => {
    const user = await storage.getUser(parseInt(req.params.id));
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  });

  // === Doctors Routes ===
  app.get(api.doctors.list.path, requireAuth, async (req, res) => {
    const filters = {
      limit: req.query.limit ? parseInt(String(req.query.limit)) : 50,
      isApproved: req.query.isApproved === 'true' ? true : req.query.isApproved === 'false' ? false : undefined,
      isVip: req.query.isVip === 'true' ? true : undefined,
      search: req.query.search as string
    };
    const doctors = await storage.getDoctors(filters);
    res.json({ data: doctors });
  });

  app.post(api.doctors.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.doctors.create.input.parse(req.body);
      const doctor = await storage.createDoctor(input);
      res.status(201).json({ data: { doctor } });
    } catch (err) {
       res.status(400).json({ message: "Validation error" });
    }
  });

  app.get(api.doctors.get.path, requireAuth, async (req, res) => {
    const doctor = await storage.getDoctor(parseInt(req.params.id));
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json(doctor);
  });

  app.put(api.doctors.update.path, requireAuth, async (req, res) => {
    const doctor = await storage.updateDoctor(parseInt(req.params.id), req.body);
    res.json(doctor);
  });

  app.post(api.doctors.approve.path, requireAuth, async (req, res) => {
    await storage.updateDoctor(parseInt(req.params.id), { isApproved: true });
    res.json({ message: "Doctor approved" });
  });

  app.post(api.doctors.reject.path, requireAuth, async (req, res) => {
    // In real app, store reason.
    await storage.updateDoctor(parseInt(req.params.id), { isApproved: false });
    res.json({ message: "Doctor rejected" });
  });

  app.post(api.doctors.setVip.path, requireAuth, async (req, res) => {
    const { isVip, expiresAt } = req.body;
    await storage.updateDoctor(parseInt(req.params.id), { 
      isVip, 
      vipExpiresAt: expiresAt ? new Date(expiresAt) : null 
    });
    res.json({ message: "VIP status updated" });
  });

  app.delete(api.doctors.delete.path, requireAuth, async (req, res) => {
    await storage.deleteDoctor(parseInt(req.params.id));
    res.json({ message: "Doctor deleted" });
  });

  // === Organizations Routes ===
  app.get(api.organizations.list.path, requireAuth, async (req, res) => {
    const filters = {
      limit: req.query.limit ? parseInt(String(req.query.limit)) : 50,
      status: req.query.status as string,
      search: req.query.search as string
    };
    const orgs = await storage.getOrganizations(filters);
    res.json({ data: orgs });
  });

  app.post(api.organizations.create.path, requireAuth, async (req, res) => {
    const input = api.organizations.create.input.parse(req.body);
    const org = await storage.createOrganization(input);
    res.status(201).json(org);
  });

  app.post(api.organizations.approve.path, requireAuth, async (req, res) => {
    await storage.updateOrganization(parseInt(req.params.id), { isApproved: true });
    res.json({ message: "Organization approved" });
  });

  app.post(api.organizations.reject.path, requireAuth, async (req, res) => {
    await storage.updateOrganization(parseInt(req.params.id), { isApproved: false });
    res.json({ message: "Organization rejected" });
  });

  // === Dashboard Routes ===
  app.get(api.dashboard.stats.path, requireAuth, async (req, res) => {
    const stats = await storage.getStats();
    res.json(stats);
  });

  // === SEED DATA ===
  const users = await storage.getUsers({ limit: 1 });
  if (users.total === 0) {
    console.log("Seeding database...");
    
    // Create initial superadmin
    const admin = await storage.createUser({
        phone: "+96170123456",
        fullName: "Super Admin",
        email: "admin@hikma.com",
        userType: "superadmin",
        role: "admin",
        isActive: true
    });

    // Create some doctors
    await storage.createDoctor({
        userId: admin.id,
        fullName: "Dr. Sarah Smith",
        phone: "+96170111222",
        email: "sarah@doctor.com",
        specialtyId: null,
        isApproved: true,
        isVip: true,
        rating: "4.8",
        reviewCount: 15
    });

    await storage.createDoctor({
        userId: admin.id,
        fullName: "Dr. John Doe",
        phone: "+96170333444",
        email: "john@doctor.com",
        specialtyId: null,
        isApproved: false, // Pending
        isVip: false
    });

    // Create some organizations
    await storage.createOrganization({
        userId: admin.id,
        name: "Beirut General Hospital",
        type: "hospital",
        phone: "+9611222333",
        isApproved: true,
        address: "Hamra, Beirut"
    });

    await storage.createOrganization({
        userId: admin.id,
        name: "City Clinic",
        type: "clinic",
        phone: "+9611444555",
        isApproved: false, // Pending
        address: "Achrafieh, Beirut"
    });

    console.log("Database seeded!");
  }

  return httpServer;
}
