"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AuthButton() {
  const { signOut } = useAuthActions();
  const user = useQuery(api.auth.getCurrentUser);

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src="" alt={user?.name || user?.email} />
          <AvatarFallback>
            {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm text-gray-700">
          {user?.name || user?.email}
        </span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => signOut()}
      >
        Sign Out
      </Button>
    </div>
  );
}
