import { Page, PageContent } from "@/components/layout/page";
import { Bio } from "@/components/sections/bio";
import { Hero } from "@/components/sections/hero";
import { Listen } from "@/components/sections/listen";
import { Live } from "@/components/sections/live";

export default function Home() {
  return (
    <Page>
      <Hero />
      <PageContent>
        <Listen />
        <Live />
        <Bio />
      </PageContent>
    </Page>
  );
}
