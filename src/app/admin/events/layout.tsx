import { redirect } from "next/navigation";
import { getAdminViewer } from "@/lib/admin-access";

export default async function AdminEventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const viewer = await getAdminViewer();

  if (!viewer?.isAdmin) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
