import { z } from 'zod';
import { insertUserSchema, insertDoctorSchema, insertOrganizationSchema, insertServiceSchema, insertSliderSchema, insertTipSchema, users, doctors, organizations, services, sliders, dailyTips } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/auth/login',
      input: z.object({ phone: z.string() }),
      responses: {
        200: z.object({ message: z.string() }), // OTP sent
        400: errorSchemas.validation,
      },
    },
    verify: {
      method: 'POST' as const,
      path: '/api/auth/login/verify',
      input: z.object({ phone: z.string(), otp: z.string() }),
      responses: {
        200: z.object({ 
          data: z.object({
            accessToken: z.string(),
            refreshToken: z.string().optional(),
            user: z.custom<typeof users.$inferSelect>().optional()
          })
        }),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    refresh: {
      method: 'POST' as const,
      path: '/api/auth/refresh',
      input: z.object({ refreshToken: z.string() }),
      responses: {
        200: z.object({ 
          data: z.object({
            accessToken: z.string(),
            refreshToken: z.string().optional()
          })
        }),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/auth/logout',
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
  },
  users: {
    list: {
      method: 'GET' as const,
      path: '/api/users',
      input: z.object({ page: z.string().optional(), limit: z.string().optional() }).optional(),
      responses: {
        200: z.object({
          data: z.array(z.custom<typeof users.$inferSelect>()),
          total: z.number(),
        }),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/users',
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/users/:id',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  doctors: {
    list: {
      method: 'GET' as const,
      path: '/api/admin/doctors',
      input: z.object({ 
        limit: z.string().optional(),
        isApproved: z.string().optional(),
        isVip: z.string().optional(),
        search: z.string().optional()
      }).optional(),
      responses: {
        200: z.object({
          data: z.array(z.custom<typeof doctors.$inferSelect>()),
        }),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/admin/doctors',
      input: insertDoctorSchema,
      responses: {
        201: z.object({ data: z.object({ doctor: z.custom<typeof doctors.$inferSelect>() }) }),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/doctors/:id',
      responses: {
        200: z.custom<typeof doctors.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/admin/doctors/:id',
      input: insertDoctorSchema.partial(),
      responses: {
        200: z.custom<typeof doctors.$inferSelect>(),
      },
    },
    approve: {
      method: 'POST' as const,
      path: '/api/admin/doctors/:id/approve',
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
    reject: {
      method: 'POST' as const,
      path: '/api/admin/doctors/:id/reject',
      input: z.object({ reason: z.string() }),
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
    setVip: {
      method: 'POST' as const,
      path: '/api/admin/doctors/:id/vip',
      input: z.object({ isVip: z.boolean(), expiresAt: z.string().nullable().optional() }),
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/admin/doctors/:id',
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
  },
  organizations: {
    list: {
      method: 'GET' as const,
      path: '/api/admin/organizations',
      input: z.object({ 
        limit: z.string().optional(),
        status: z.string().optional(), // pending, approved
        search: z.string().optional()
      }).optional(),
      responses: {
        200: z.object({
          data: z.array(z.custom<typeof organizations.$inferSelect>()),
        }),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/admin/organizations',
      input: insertOrganizationSchema,
      responses: {
        201: z.custom<typeof organizations.$inferSelect>(),
      },
    },
    approve: {
      method: 'POST' as const,
      path: '/api/admin/organizations/:id/approve',
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
    reject: {
      method: 'POST' as const,
      path: '/api/admin/organizations/:id/reject',
      input: z.object({ reason: z.string() }),
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
  },
  dashboard: {
    stats: {
      method: 'GET' as const,
      path: '/api/admin/dashboard/stats',
      responses: {
        200: z.object({
          totalUsers: z.number(),
          totalDoctors: z.number(),
          totalOrganizations: z.number(),
          activeServices: z.number(),
        }),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
