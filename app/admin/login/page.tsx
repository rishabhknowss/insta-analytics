import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/adminAuth";
import AdminLoginForm from "./_components/AdminLoginForm";

export default async function AdminLoginPage() {
  // Already logged in → go straight to admin
  const authed = await getAdminSession();
  if (authed) redirect("/admin");

  return <AdminLoginForm />;
}
