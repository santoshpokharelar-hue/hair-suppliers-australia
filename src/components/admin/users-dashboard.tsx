"use client";

import { useState, useTransition } from "react";
import { setUserDisabledAction } from "@/lib/actions/admin-users";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { listAllUsers } from "@/lib/queries/users";

type User = Awaited<ReturnType<typeof listAllUsers>>[number];

export function UsersDashboard({ users, currentUserId }: { users: User[]; currentUserId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  return (
    <div>
      <div className="mb-4 text-sm text-muted-foreground">{users.length} registered users</div>
      {error && <p className="mb-3 text-sm font-medium text-destructive">{error}</p>}

      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs text-muted-foreground">
              <th className="px-3 py-2 font-medium">User</th>
              <th className="px-3 py-2 font-medium">Role</th>
              <th className="px-3 py-2 font-medium">Joined</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-line last:border-0">
                <td className="px-3 py-2">
                  <div className="font-medium">{user.businessName || user.name}</div>
                  <div className="text-xs text-muted-foreground">{user.email}</div>
                </td>
                <td className="px-3 py-2 capitalize">{user.role}</td>
                <td className="px-3 py-2 text-xs text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString("en-AU", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="px-3 py-2">
                  <Badge variant={user.disabled ? "destructive" : "default"}>
                    {user.disabled ? "Disabled" : "Active"}
                  </Badge>
                </td>
                <td className="px-3 py-2 text-right">
                  {user.id === currentUserId ? (
                    <span className="text-xs text-muted-foreground">(you)</span>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={pending}
                      onClick={() =>
                        startTransition(async () => {
                          const res = await setUserDisabledAction(user.id, !user.disabled);
                          if (!res.ok) setError(res.message || "Something went wrong.");
                        })
                      }
                    >
                      {user.disabled ? "Enable" : "Disable"}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
