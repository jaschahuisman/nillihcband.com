import { redirect } from "next/navigation";
import { VenueDetailView } from "@/components/crm/venue-detail-view";
import { getSessionUser } from "@/lib/auth";
import { getContactOptions } from "@/lib/crm/queries";

export default async function NewVenuePage() {
  const user = await getSessionUser();
  if (!user) redirect("/crm/login");

  const contactOptions = await getContactOptions();

  return <VenueDetailView venue={null} contactOptions={contactOptions} />;
}
