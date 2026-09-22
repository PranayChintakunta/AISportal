import { redirect } from "next/navigation";

/** Workshops are the landing section of Academy admin. */
export default function AdminAcademyPage() {
  redirect("/admin/academy/workshops");
}
