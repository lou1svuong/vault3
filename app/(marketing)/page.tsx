import Footer from "@/components/layouts/footer";
import AnnouncementBar from "@/container/marketing/announcement-bar";
import CallToAction from "@/container/marketing/call-to-action";
import FAQs from "@/container/marketing/faqs";
import Feature from "@/container/marketing/feature";
import Hero from "@/container/marketing/hero";
import LogoCloud from "@/container/marketing/logo-cloud";
import Testimonial from "@/container/testimonial/page";

export default function Home() {
  return (
    <div className="w-full md:overflow-hidden flex flex-col items-center justify-center">
      <div className="w-full mx-auto border border-dashed flex flex-col my-2">
        {/* <AnnouncementBar /> */}
        <Hero />
        <Feature />
        {/* <LogoCloud /> */}
        <FAQs />
        {/* <Testimonial /> */}
        <CallToAction />
        <Footer />
      </div>
    </div>
  );
}
