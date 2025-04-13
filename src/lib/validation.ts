import { z } from "zod";

const requiredString = z.string().min(1, "Required");
export const signupSchema = z.object({
  username: requiredString.regex(
    /^[a-zA-Z0-9_-]+$/,
    "Only letters, numbers, _ and - are allowed",
  ),
  email: requiredString.email("Invalid email address"),

  password: requiredString.min(
    8,
    "Password must be at least 8 characters long",
  ),
});

export type signupSchemaValues = z.infer<typeof signupSchema>;

export const signinSchema = z.object({
  username: requiredString,
  password: requiredString,
});

export type signinSchemaValues = z.infer<typeof signinSchema>;

export const createPostSchema = z.object({
  content: requiredString,
  attachments: z.array(
    z.object({
      url: z.string(),
      type: z.enum(["IMAGE", "VIDEO"]),
    }),
  ).optional(),
});

export const ProfileFormSchema = z.object({
  displayName: z
    .string()
    .min(2, { message: "Name must be at least 2 characters." })
    .optional(),
  bio: z.string().max(300).optional(),
  avatarUrl: z.any().optional(),
});
export type UpdateProfileFormValues = z.infer<typeof ProfileFormSchema>;

export const createCommentSchema = z.object({
  content: requiredString
})