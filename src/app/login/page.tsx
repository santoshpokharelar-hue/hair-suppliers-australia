import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginTabs } from "@/components/auth/login-tabs";

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/");

  return <LoginTabs />;
}
