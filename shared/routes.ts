import { z } from 'zod';
import { insertUserSchema, insertDoctorSchema, insertOrganizationSchema, insertServiceSchema, insertSliderSchema, insertTipSchema, insertServiceImageSchema, insertReviewSchema, users, doctors, organizations, services, sliders, dailyTips, serviceImages, reviews } from './schema';

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
      path: '/api/auth/admin/login',
      input: z.object({ code: z.string() }),
      responses: {
        200: z.object({
          error: z.string(),
          errorCode: z.string(),
          status: z.string(),
          result: z.object({
            accessToken: z.string(),
            refreshToken: z.string().optional(),
            user: z.any().optional(),
            profile: z.any().optional(),
            doctor: z.any().nullable().optional(),
            session: z.any().optional(),
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
      input: z.object({ limit: z.string().optional(), userType: z.string().optional(), search: z.string().optional() }).optional(),
      responses: {
        200: z.object({
          status: z.string(),
          error: z.string(),
          errorCode: z.string(),
          result: z.array(z.custom<typeof users.$inferSelect>()),
        }),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/users',
      input: insertUserSchema,
      responses: {
        201: z.object({
          status: z.string(),
          error: z.string(),
          errorCode: z.string(),
          result: z.custom<typeof users.$inferSelect>(),
        }),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/users/:id',
      responses: {
        200: z.object({
          status: z.string(),
          error: z.string(),
          errorCode: z.string(),
          result: z.custom<typeof users.$inferSelect>(),
        }),
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
          status: z.string(),
          error: z.string(),
          errorCode: z.string(),
          result: z.array(z.custom<typeof doctors.$inferSelect>()),
        }),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/admin/doctors',
      input: insertDoctorSchema,
      responses: {
        201: z.object({ 
          status: z.string(),
          error: z.string(),
          errorCode: z.string(),
          result: z.object({ 
            message: z.string(),
            doctor: z.custom<typeof doctors.$inferSelect>() 
          }),
        }),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/doctors/:id',
      responses: {
        200: z.object({
          status: z.string(),
          error: z.string(),
          errorCode: z.string(),
          result: z.custom<typeof doctors.$inferSelect>(),
        }),
        404: errorSchemas.notFound,
      },
    },
    getAdmin: {
      method: 'GET' as const,
      path: '/api/admin/doctors/:doctorId',
      responses: {
        200: z.object({
          status: z.string(),
          error: z.string(),
          errorCode: z.string(),
          result: z.custom<typeof doctors.$inferSelect>(),
        }),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/admin/doctors/:doctorId',
      input: insertDoctorSchema.partial(),
      responses: {
        200: z.object({
          status: z.string(),
          error: z.string(),
          errorCode: z.string(),
          result: z.object({
            message: z.string(),
            doctor: z.custom<typeof doctors.$inferSelect>(),
          }),
        }),
      },
    },
    approve: {
      method: 'POST' as const,
      path: '/api/admin/doctors/:doctorId/approve',
      responses: {
        200: z.object({ 
          status: z.string(),
          error: z.string(),
          errorCode: z.string(),
          result: z.custom<typeof doctors.$inferSelect>(),
        }),
      },
    },
    reject: {
      method: 'POST' as const,
      path: '/api/admin/doctors/:doctorId/reject',
      input: z.object({ reason: z.string() }),
      responses: {
        200: z.object({ 
          status: z.string(),
          error: z.string(),
          errorCode: z.string(),
          result: z.object({ message: z.string() }),
        }),
      },
    },
    setVip: {
      method: 'POST' as const,
      path: '/api/admin/doctors/:doctorId/vip',
      input: z.object({ isVip: z.boolean(), expiresAt: z.string().nullable().optional() }),
      responses: {
        200: z.object({ 
          status: z.string(),
          error: z.string(),
          errorCode: z.string(),
          result: z.custom<typeof doctors.$inferSelect>(),
        }),
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/admin/doctors/:doctorId',
      responses: {
        200: z.object({ 
          status: z.string(),
          error: z.string(),
          errorCode: z.string(),
          result: z.object({ message: z.string() }),
        }),
      },
    },
    getAnalytics: {
      method: 'GET' as const,
      path: '/api/admin/doctors/:doctorId/analytics',
      responses: {
        200: z.object({
          status: z.string(),
          error: z.string(),
          errorCode: z.string(),
          result: z.object({
            appointments: z.object({
              pending: z.number(),
              confirmed: z.number(),
              in_progress: z.number(),
              completed: z.number(),
              cancelled: z.number(),
              total: z.number(),
            }),
            profileViews: z.object({
              total: z.number(),
              unique: z.number(),
              today: z.number(),
              thisWeek: z.number(),
              thisMonth: z.number(),
            }),
            reviews: z.object({
              total: z.number(),
              average: z.number(),
            }),
          }),
        }),
      },
    },
    getProfileViews: {
      method: 'GET' as const,
      path: '/api/admin/doctors/:doctorId/analytics/profile-views',
      responses: {
        200: z.object({
          status: z.string(),
          error: z.string(),
          errorCode: z.string(),
          result: z.array(z.object({
            id: z.string(),
            doctor_id: z.string(),
            viewer_id: z.string().nullable(),
            viewed_at: z.string(),
            ip_address: z.string().nullable(),
            user_agent: z.string().nullable(),
            referrer: z.string().nullable(),
            viewer: z.object({
              id: z.string(),
              full_name: z.string().nullable(),
              user_type: z.string(),
              avatar_url: z.string().nullable(),
            }).nullable(),
          })),
        }),
      },
    },
  },
  organizations: {
    list: {
      method: 'GET' as const,
      path: '/api/admin/clinics',
      input: z.object({
        limit: z.string().optional(),
        status: z.string().optional(), // pending, approved, suspended
        search: z.string().optional()
      }).optional(),
      responses: {
        200: z.object({
          status: z.string(),
          error: z.string(),
          errorCode: z.string(),
          result: z.array(z.custom<typeof organizations.$inferSelect>()),
        }),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/clinics/:clinicId',
      responses: {
        200: z.object({
          status: z.string(),
          error: z.string(),
          errorCode: z.string(),
          result: z.custom<typeof organizations.$inferSelect>(),
        }),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/clinics',
      input: z.object({
        name: z.string().min(2).max(100),
        ownerId: z.string().uuid(),
        description: z.string().max(1000).optional(),
        phone: z.string().max(20).optional(),
        email: z.string().email().max(100).optional(),
        website: z.string().url().max(200).optional(),
        address: z.string().max(500).optional(),
        latitude: z.number().min(-90).max(90).optional(),
        longitude: z.number().min(-180).max(180).optional(),
        timezone: z.string().max(50).optional(),
        logo_url: z.string().url().max(500).optional(),
      }),
      responses: {
        201: z.object({ 
          status: z.string(),
          error: z.string(),
          errorCode: z.string(),
          result: z.object({ 
            message: z.string(),
            clinic: z.custom<typeof organizations.$inferSelect>() 
          }),
        }),
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/admin/clinics/:clinicId',
      input: insertOrganizationSchema.partial(),
      responses: {
        200: z.object({
          status: z.string(),
          error: z.string(),
          errorCode: z.string(),
          result: z.custom<typeof organizations.$inferSelect>(),
        }),
      },
    },
    approve: {
      method: 'POST' as const,
      path: '/api/admin/clinics/:clinicId/approve',
      responses: {
        200: z.object({ 
          status: z.string(),
          error: z.string(),
          errorCode: z.string(),
          result: z.object({ message: z.string(), clinic: z.custom<typeof organizations.$inferSelect>() }),
        }),
      },
    },
    reject: {
      method: 'POST' as const,
      path: '/api/admin/clinics/:clinicId/reject',
      input: z.object({ reason: z.string() }),
      responses: {
        200: z.object({ 
          status: z.string(),
          error: z.string(),
          errorCode: z.string(),
          result: z.object({ message: z.string(), clinic: z.custom<typeof organizations.$inferSelect>() }),
        }),
      },
    },
    suspend: {
      method: 'POST' as const,
      path: '/api/admin/clinics/:clinicId/suspend',
      input: z.object({ reason: z.string() }),
      responses: {
        200: z.object({ 
          status: z.string(),
          error: z.string(),
          errorCode: z.string(),
          result: z.object({ message: z.string(), clinic: z.custom<typeof organizations.$inferSelect>() }),
        }),
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/admin/clinics/:clinicId',
      responses: {
        200: z.object({ 
          status: z.string(),
          error: z.string(),
          errorCode: z.string(),
          result: z.object({ message: z.string() }),
        }),
      },
    },
  },
  dashboard: {
    stats: {
      method: 'GET' as const,
      path: '/api/admin/dashboard/stats',
      responses: {
        200: z.object({
          status: z.string(),
          error: z.string(),
          errorCode: z.string(),
          result: z.object({
            totalUsers: z.number(),
            totalDoctors: z.number(),
            totalOrganizations: z.number(),
            activeServices: z.number(),
          }),
        }),
      },
    },
  },
  services: {
    list: {
      method: 'GET' as const,
      path: '/api/services',
      responses: {
        200: z.object({
          status: z.string(),
          error: z.string(),
          errorCode: z.string(),
          result: z.array(z.custom<typeof services.$inferSelect>()),
        }),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/services/:serviceId',
      responses: {
        200: z.object({
          status: z.string(),
          error: z.string(),
          errorCode: z.string(),
          result: z.custom<typeof services.$inferSelect>(),
        }),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/services',
      input: insertServiceSchema,
      responses: {
        201: z.object({ 
          status: z.string(),
          error: z.string(),
          errorCode: z.string(),
          result: z.custom<typeof services.$inferSelect>(),
        }),
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/services/:serviceId',
      input: insertServiceSchema.partial(),
      responses: {
        200: z.object({
          status: z.string(),
          error: z.string(),
          errorCode: z.string(),
          result: z.custom<typeof services.$inferSelect>(),
        }),
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/services/:serviceId',
      responses: {
        200: z.object({ 
          status: z.string(),
          error: z.string(),
          errorCode: z.string(),
          result: z.object({ message: z.string() }),
        }),
      },
    },
  },
  serviceImages: {
    list: {
      method: 'GET' as const,
      path: '/api/service-images',
      responses: {
        200: z.object({
          data: z.array(z.custom<typeof serviceImages.$inferSelect>()),
        }),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/service-images',
      input: insertServiceImageSchema,
      responses: {
        201: z.object({ data: z.custom<typeof serviceImages.$inferSelect>() }),
      },
    },
    createBulk: {
      method: 'POST' as const,
      path: '/api/service-images/bulk',
      input: z.object({ images: z.array(insertServiceImageSchema) }),
      responses: {
        201: z.object({ data: z.array(z.custom<typeof serviceImages.$inferSelect>()) }),
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/service-images/:id',
      input: insertServiceImageSchema.partial(),
      responses: {
        200: z.custom<typeof serviceImages.$inferSelect>(),
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/service-images/:id',
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
  },
  sliders: {
    list: {
      method: 'GET' as const,
      path: '/api/sliders',
      responses: {
        200: z.object({
          status: z.string(),
          error: z.string(),
          errorCode: z.string(),
          result: z.array(z.custom<typeof sliders.$inferSelect>()),
        }),
      },
    },
    listAll: {
      method: 'GET' as const,
      path: '/api/sliders/admin/all',
      responses: {
        200: z.object({
          status: z.string(),
          error: z.string(),
          errorCode: z.string(),
          result: z.array(z.custom<typeof sliders.$inferSelect>()),
        }),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/sliders/:sliderId',
      responses: {
        200: z.object({
          status: z.string(),
          error: z.string(),
          errorCode: z.string(),
          result: z.custom<typeof sliders.$inferSelect>(),
        }),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/sliders',
      input: insertSliderSchema,
      responses: {
        201: z.object({ 
          status: z.string(),
          error: z.string(),
          errorCode: z.string(),
          result: z.custom<typeof sliders.$inferSelect>(),
        }),
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/sliders/:sliderId',
      input: insertSliderSchema.partial(),
      responses: {
        200: z.object({
          status: z.string(),
          error: z.string(),
          errorCode: z.string(),
          result: z.custom<typeof sliders.$inferSelect>(),
        }),
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/sliders/:sliderId',
      responses: {
        200: z.object({ 
          status: z.string(),
          error: z.string(),
          errorCode: z.string(),
          result: z.object({ message: z.string() }),
        }),
      },
    },
  },
  dailyTips: {
    list: {
      method: 'GET' as const,
      path: '/api/daily-tips/active',
      responses: {
        200: z.object({
          status: z.string(),
          error: z.string(),
          errorCode: z.string(),
          result: z.custom<typeof dailyTips.$inferSelect>().nullable(),
        }),
      },
    },
    listAll: {
      method: 'GET' as const,
      path: '/api/daily-tips/admin/all',
      responses: {
        200: z.object({
          status: z.string(),
          error: z.string(),
          errorCode: z.string(),
          result: z.array(z.custom<typeof dailyTips.$inferSelect>()),
        }),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/daily-tips/:tipId',
      responses: {
        200: z.object({
          status: z.string(),
          error: z.string(),
          errorCode: z.string(),
          result: z.custom<typeof dailyTips.$inferSelect>(),
        }),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/daily-tips',
      input: insertTipSchema,
      responses: {
        201: z.object({ 
          status: z.string(),
          error: z.string(),
          errorCode: z.string(),
          result: z.custom<typeof dailyTips.$inferSelect>(),
        }),
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/daily-tips/:tipId',
      input: insertTipSchema.partial(),
      responses: {
        200: z.object({
          status: z.string(),
          error: z.string(),
          errorCode: z.string(),
          result: z.custom<typeof dailyTips.$inferSelect>(),
        }),
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/daily-tips/:tipId',
      responses: {
        200: z.object({ 
          status: z.string(),
          error: z.string(),
          errorCode: z.string(),
          result: z.object({ message: z.string() }),
        }),
      },
    },
  },
  reviews: {
    list: {
      method: 'GET' as const,
      path: '/api/reviews',
      input: z.object({
        doctorId: z.string().optional(),
        clinicId: z.string().optional(),
      }).optional(),
      responses: {
        200: z.object({
          status: z.string(),
          error: z.string(),
          errorCode: z.string(),
          result: z.array(z.custom<typeof reviews.$inferSelect>()),
        }),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/reviews/:reviewId',
      responses: {
        200: z.object({
          status: z.string(),
          error: z.string(),
          errorCode: z.string(),
          result: z.custom<typeof reviews.$inferSelect>(),
        }),
        404: errorSchemas.notFound,
      },
    },
    updateVisibility: {
      method: 'PATCH' as const,
      path: '/api/reviews/:reviewId/visibility',
      input: z.object({ isVisible: z.boolean() }),
      responses: {
        200: z.object({
          status: z.string(),
          error: z.string(),
          errorCode: z.string(),
          result: z.custom<typeof reviews.$inferSelect>(),
        }),
      },
    },
  },
  health: {
    check: {
      method: 'GET' as const,
      path: '/api/health',
      responses: {
        200: z.object({
          status: z.string(),
          timestamp: z.string(),
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
