import { redirect } from "next/navigation";
import { SimilarArtistsView } from "@/components/crm/similar-artists-view";
import { getSessionUser } from "@/lib/auth";
import { getContactOptions, getSimilarArtists } from "@/lib/crm/queries";

export default async function SimilarArtistsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/crm/login");

  const [artists, contactOptions] = await Promise.all([
    getSimilarArtists(),
    getContactOptions(),
  ]);

  return (
    <SimilarArtistsView artists={artists} contactOptions={contactOptions} />
  );
}
