import { redirect } from "next/navigation";
import { VenuesView } from "@/components/crm/venues-view";
import { getSessionUser } from "@/lib/auth";
import { getVenues } from "@/lib/crm/queries";

export default async function VenuesPage() {
  const user = await getSessionUser();
  if (!user) redirect("/crm/login");

  const venues = await getVenues();

  return <VenuesView venues={venues} />;
}
