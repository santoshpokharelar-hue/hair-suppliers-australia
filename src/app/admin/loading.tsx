import { Loader2 } from "lucide-react";

export default function AdminLoading() {
  return (
    <div className="flex flex-1 items-center justify-center py-24 text-muted-foreground">
      <Loader2 className="size-5 animate-spin" />
    </div>
  );
}
