import { redirect } from "next/navigation";
import { GigsView } from "@/components/crm/gigs-view";
import { getSessionUser } from "@/lib/auth";
import { getContactOptions, getGigs, getVenueOptions } from "@/lib/crm/queries";

export default async function GigsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/crm/login");

  const [gigs, venueOptions, contactOptions] = await Promise.all([
    getGigs(),
    getVenueOptions(),
    getContactOptions(),
  ]);

  return (
    <GigsView
      gigs={gigs}
      venueOptions={venueOptions}
      contactOptions={contactOptions}
    />
  );
}
