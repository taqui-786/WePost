"use server";

import prisma from "@/lib/prisma";
import { signinSchema, signinSchemaValues } from "@/lib/validation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { verify } from "@node-rs/argon2";
import { lucia, validateRequest } from "@/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
export async function login(
  credentials: signinSchemaValues,
): Promise<{ error: string }> {
  try {
    const { username, password } = signinSchema.parse(credentials);
    const existingUser = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
      },
    });
    if (!existingUser || !existingUser.passwordHash) {
      return {
        error: "Incorrect username or password.",
      };
    }
    const validatePassword = await verify(existingUser.passwordHash, password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });
    if (!validatePassword) {
      return {
        error: "Incorrect username or password.",
      };
    }
    const session = await lucia.createSession(existingUser.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    (await cookies()).set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );
    return redirect("/");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      error: "Something went wrong. Please try again.",
    };
  }
}

export async function logout() {
  const { session } = await validateRequest();
  if (!session) {
    throw new Error("Unauthorized");
  }
  await lucia.invalidateSession(session.id);
  const sessionCookie = lucia.createBlankSessionCookie();
  (await cookies()).set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );
  return redirect("/login")
}
