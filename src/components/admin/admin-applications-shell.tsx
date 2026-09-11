import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminApplicationsManager } from "@/components/admin/admin-applications-manager";
import { MobileAdminNav } from "@/components/mobile/admin/MobileAdminNav";
import { getAdminViewer } from "@/lib/admin-access";

export async function AdminApplicationsShell({
  initialApplicationId,
}: {
  initialApplicationId?: string;
}) {
  const viewer = await getAdminViewer();

  if (!viewer?.canReview) {
    redirect("/dashboard");
  }

  return (
    <>
      <div className="bg-cream px-5 pb-5 pt-5 md:hidden">
        <MobileAdminNav active="Applications" />
        <AdminApplicationsManager
          userRole={viewer.role}
          userMemberships={viewer.programs}
          initialApplicationId={initialApplicationId}
        />
      </div>

      <div className="hidden min-h-screen w-full bg-cream md:flex">
        <AdminSidebar active="Applications" />
        <AdminApplicationsManager
          userRole={viewer.role}
          userMemberships={viewer.programs}
          initialApplicationId={initialApplicationId}
          embedded
        />
      </div>
    </>
  );
}
