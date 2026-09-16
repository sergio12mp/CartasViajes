import { notFound } from "next/navigation";
import { requireUser } from "./session";
export function parseAdminEmails(value: string | undefined) {
  return new Set((value ?? "").split(",").map(email => email.trim().toLowerCase()).filter(Boolean));
}
export function isAdmin(email: string | null | undefined, admins = parseAdminEmails(process.env.ADMIN_EMAILS)) {
  return Boolean(email) && admins.has(email!.toLowerCase());
}
// Non-admins get a 404 so the admin area stays invisible.
export async function requireAdmin() {
  const user = await requireUser();
  if (!isAdmin(user.email)) notFound();
  return user;
}
