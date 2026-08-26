import { notFound, redirect } from "next/navigation";
import { VenueDetailView } from "@/components/crm/venue-detail-view";
import { getSessionUser } from "@/lib/auth";
import { getContactOptions, getVenue } from "@/lib/crm/queries";
import { getVenueOutreach } from "@/lib/outreach/queries";

export default async function VenueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/crm/login");

  const { id } = await params;
  const [venue, contactOptions, outreach] = await Promise.all([
    getVenue(id),
    getContactOptions(),
    getVenueOutreach(id),
  ]);

  if (!venue) notFound();

  return (
    <VenueDetailView
      venue={venue}
      contactOptions={contactOptions}
      outreach={outreach}
    />
  );
}
