import { Container } from "@/components/Container";
import { Hero } from "@/components/Hero";
import { SectionTitle } from "@/components/SectionTitle";
import { Benefits } from "@/components/Benefits";
import { Cta } from "@/components/Cta";
import { Navbar } from "@/components/Navbar";
import Image from "next/image";
import dashboardImg from "../public/img/dashboardScreenshot.png";

import { benefitOne, benefitTwo } from "@/components/data";
export default function Home() {
  return (
    <Container>
      <Navbar />
      <Hero />
      <SectionTitle
        preTitle="WealthScore Benefits"
        title=" Why should you use WeathScore"
      >
        Unlike an opaque credit score, this score is completely intuitive, 
        allowing you to instantly see how your daily habits directly improve 
        your financial wellness.
      </SectionTitle>
      <Container>
        <div className="flex items-center justify-center w-full">
          <Image
            src={dashboardImg}
            width="1200"
            height="900"
            className={"object-cover"}
            alt="Dashboard Screenshot"
            loading="eager"
            placeholder="blur"
          />
        </div>
      </Container>

      <Benefits data={benefitOne} />
      <Benefits imgPos="right" data={benefitTwo} />

      <Cta />
    </Container>
  );
}