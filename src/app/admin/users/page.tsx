import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { UsersDashboard } from "@/components/admin/users-dashboard";
import { listAllUsers } from "@/lib/queries/users";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const users = await listAllUsers();

  return <UsersDashboard users={users} currentUserId={session.user.id} />;
}
