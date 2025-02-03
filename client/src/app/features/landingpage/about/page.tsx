import AboutCard from "./about-card";
import { items } from "./aboutCardsinfo";
export default function About() {

    return (
  
  <section className="bg-second flex flex-col text-alt items-center  h-[120vh] rounded-tr-[64px]  pt-[128px] px-6">
    <h1 className="text-[72px] font-bold justify-start">High-quality care—anywhere, anytime</h1>
    <div className="flex items-center justify-center center pb-[60px]">
    <h3 className="medium text-center">Our top-rated primary care doctors and therapists provide a wide range of healthcare services, including weight management, urgent care, pediatric care, chronic disease treatment and online therapy. Access comprehensive care for all life stages in one convenient app.</h3>
    </div>
    <div className="flex flex-row items-center justify-center gap-[44px]  ">
    {items.map((item, index) => {
      return <AboutCard className="h-[550px]  w-[550px] bg-alt" key={index} width={100} height={100} title={item.title} icon={item.icon} text={item.text} />;
    })}

    </div>

  </section>

  );
}
