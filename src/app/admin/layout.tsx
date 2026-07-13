import { Shield } from "lucide-react";
import { AdminNav } from "@/components/admin/admin-nav";

// Reachable only because middleware.ts already verified role === "admin" for
// everything under /admin/:path*.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8">
      <div className="mb-1 flex items-center gap-2.5">
        <Shield className="size-6 text-plum" />
        <h1 className="font-display text-2xl font-bold text-plum-dark">Admin dashboard</h1>
      </div>
      <p className="mb-5 mt-1 text-sm text-muted-foreground">
        Manage the catalogue, review quote requests, and control account access.
      </p>
      <AdminNav />
      {children}
    </div>
  );
}
