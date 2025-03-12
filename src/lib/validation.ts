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
})
