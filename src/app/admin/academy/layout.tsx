import { redirect } from "next/navigation";
import { getAdminViewer } from "@/lib/admin-access";

/**
 * Academy admin is the one surface where team affiliation is load-bearing:
 * Executives and Directors get in by role, Officers only when they sit on the
 * AI Academy team.
 */
export default async function AdminAcademyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const viewer = await getAdminViewer();

  if (!viewer?.canManageAcademy) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
