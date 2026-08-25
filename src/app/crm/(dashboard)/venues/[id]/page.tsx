import { notFound, redirect } from "next/navigation";
import { VenueDetailView } from "@/components/crm/venue-detail-view";
import { getSessionUser } from "@/lib/auth";
import { getContactOptions, getVenue } from "@/lib/crm/queries";

export default async function VenueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/crm/login");

  const { id } = await params;
  const [venue, contactOptions] = await Promise.all([
    getVenue(id),
    getContactOptions(),
  ]);

  if (!venue) notFound();

  return <VenueDetailView venue={venue} contactOptions={contactOptions} />;
}
