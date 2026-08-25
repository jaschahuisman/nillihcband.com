import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CrmToolbar({
  search,
  onSearchChange,
  searchPlaceholder,
  addLabel,
  onAdd,
  children,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  addLabel: string;
  onAdd: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          className="h-8 border-border bg-muted/40 pl-8 text-sm shadow-none"
        />
      </div>
      {children}
      <Button size="sm" onClick={onAdd} className="h-8 shrink-0 gap-1 px-2.5 text-xs">
        <Plus className="size-3.5" />
        {addLabel}
      </Button>
    </div>
  );
}
