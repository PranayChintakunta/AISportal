import { redirect } from "next/navigation";
import { getAdminViewer } from "@/lib/admin-access";
import { canManageApplications } from "@/lib/roles";

export default async function NewApplicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const viewer = await getAdminViewer();

  if (!canManageApplications(viewer?.role)) {
    redirect("/admin/applications");
  }

  return <>{children}</>;
}
