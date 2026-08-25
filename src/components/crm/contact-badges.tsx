import { Badge } from "@/components/ui/badge";
import { formatContactName } from "@/lib/crm/labels";
import type { LinkedContact } from "@/lib/crm/queries";

export function ContactBadges({
  contacts,
  max = 2,
}: {
  contacts: LinkedContact[];
  max?: number;
}) {
  if (contacts.length === 0) {
    return <span className="text-muted-foreground">—</span>;
  }

  const visible = contacts.slice(0, max);
  const remaining = contacts.length - visible.length;

  return (
    <div className="flex flex-wrap gap-1">
      {visible.map((contact) => (
        <Badge
          key={contact.id}
          variant="secondary"
          className="rounded-md px-1.5 py-0 text-[10px] font-normal"
        >
          {formatContactName(contact)}
        </Badge>
      ))}
      {remaining > 0 ? (
        <Badge
          variant="outline"
          className="rounded-md px-1.5 py-0 text-[10px] font-normal"
        >
          +{remaining}
        </Badge>
      ) : null}
    </div>
  );
}
