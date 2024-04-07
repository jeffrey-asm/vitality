import Header from "@/components/home/header";
import Journey from "@/components/home/journey";
import Highlights from "@/components/home/highlights";
import Services from "@/components/home/services";
import Testimonials from "@/components/home/testimonials";
import Feedback from "@/components/home/feedback";

export default function Home() {
  return (
    <>
      <Header />
      <main className="animate-slidein flex min-h-screen w-full flex-col items-center justify-start p-4 text-center">
        <Journey />
        <Highlights />
        <Services />
        <Testimonials />
        <Feedback />
      </main>
    </>

  );
}
