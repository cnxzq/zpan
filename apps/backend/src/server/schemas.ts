import { z } from 'zod';

// ==================== Authentication Schemas ====================

export const LoginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof LoginSchema>;

// ==================== User Management Schemas ====================

export const CreateUserSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['admin', 'user']).optional(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = z.object({
  password: z.string().min(1, 'Password is required').optional(),
  role: z.enum(['admin', 'user']).optional(),
});

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

export const UserIdSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

export type UserIdParams = z.infer<typeof UserIdSchema>;

// ==================== Upload Schemas ====================

export const UploadPathSchema = z.object({
  path: z.string().min(1, 'Path is required'),
});

export type UploadPathParams = z.infer<typeof UploadPathSchema>;

// ==================== Thumbnail Schemas ====================

export const ThumbnailPathSchema = z.object({
  path: z.string().min(1, 'Path is required'),
});

export type ThumbnailPathParams = z.infer<typeof ThumbnailPathSchema>;

// ==================== API Response Schemas ====================

export const ApiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

export const ApiErrorSchema = z.object({
  error: z.string(),
});

export const FileSchema = z.object({
  name: z.string(),
  path: z.string(),
  isDirectory: z.boolean(),
  size: z.number().optional(),
  lastModified: z.number().optional(),
});

export const FileListSchema = z.object({
  success: z.boolean(),
  files: z.array(FileSchema),
  path: z.string(),
});

export const UserSchema = z.object({
  username: z.string(),
  role: z.enum(['admin', 'user']),
});

export const UserListSchema = z.object({
  success: z.boolean(),
  users: z.array(UserSchema),
});

export const ConfigSchema = z.object({
  baseUrl: z.string().optional(),
  name: z.string(),
});

export const SessionUserSchema = z.object({
  username: z.string(),
  role: z.enum(['admin', 'user']),
  isAdmin: z.boolean(),
});

export const SessionInfoSchema = z.object({
  success: z.boolean(),
  user: SessionUserSchema.optional(),
});

// ==================== Validation Middleware ====================

/**
 * Validate request body against a Zod schema
 */
export function validateBody<T extends z.ZodTypeAny>(schema: T) {
  return (req: any, res: any, next: any) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error: any) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
    }
  };
}

/**
 * Validate request parameters against a Zod schema
 */
export function validateParams<T extends z.ZodTypeAny>(schema: T) {
  return (req: any, res: any, next: any) => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (error: any) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
    }
  };
}

/**
 * Validate request query against a Zod schema
 */
export function validateQuery<T extends z.ZodTypeAny>(schema: T) {
  return (req: any, res: any, next: any) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error: any) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
    }
  };
}
