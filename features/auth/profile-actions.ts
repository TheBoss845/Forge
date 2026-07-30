"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/database/server";

const updateProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Enter your full name.")
    .max(120, "Name is too long."),
});

export interface ProfileActionResult {
  error?: string;
  message?: string;
}

export async function updateProfileAction(
  input: unknown,
): Promise<ProfileActionResult> {
  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { error: "Forge is not connected to a database yet." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Your session expired. Please sign in again." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data.fullName })
    .eq("id", user.id);

  if (error) {
    console.error("profile: update failed", error.code);
    return { error: "Could not save your changes. Please try again." };
  }

  revalidatePath("/settings");
  return { message: "Profile updated." };
}
