"use client"

import Header from "@/components/sections/Header";
import Media from "@/components/sections/Media";
import Listen from "@/components/sections/Listen";
import VideoCarousel from "@/components/sections/VideoCarousel";
import Bio from "@/components/sections/Bio";
// import Musicians from "@/components/sections/Musicians";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <main>
      <Header />
      <Media />
      <Listen />
      <VideoCarousel />
      <Bio />
      <Contact />
      {/* <Musicians /> */}
      <Footer />
    </main>
  );
}
