import { z } from "zod";

export const validate = (schema) => (req, res, next) => {
  try {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      const firstError = result.error.errors[0]?.message || "Validation failed";
      return res.status(400).json({
        message: firstError,
        errors: result.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
    }

    if (result.data.body && typeof req.body === "object") {
      Object.assign(req.body, result.data.body);
    }
    req.validated = result.data;

    next();
  } catch (err) {
    console.error("VALIDATION RUNTIME ERROR:", err);
    return res.status(400).json({ message: "Invalid request payload" });
  }
};

export const signupSchema = z.object({
  body: z.object({
    fullName: z
      .string({ required_error: "Full name is required" })
      .trim()
      .min(2, "Full name must be at least 2 characters")
      .max(50, "Full name cannot exceed 50 characters"),
    email: z
      .string({ required_error: "Email is required" })
      .trim()
      .toLowerCase()
      .email("Please provide a valid email address"),
    password: z
      .string({ required_error: "Password is required" })
      .min(6, "Password must be at least 6 characters long")
      .max(100, "Password cannot exceed 100 characters"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: "Email is required" })
      .trim()
      .toLowerCase()
      .email("Please provide a valid email address"),
    password: z
      .string({ required_error: "Password is required" })
      .min(1, "Password cannot be empty"),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    profilePicture: z
      .string({ required_error: "Profile picture is required" })
      .min(1, "Profile picture cannot be empty"),
  }),
});

export const getMessagesSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID"),
  }),
  query: z
    .object({
      cursor: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid cursor ID")
        .optional(),
      limit: z
        .string()
        .regex(/^\d+$/, "Limit must be a numeric string")
        .optional(),
    })
    .optional(),
});

export const sendMessageSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid receiver ID"),
  }),
  body: z.object({
    text: z.string().max(5000, "Message text cannot exceed 5000 characters").optional(),
  }).optional(),
});
