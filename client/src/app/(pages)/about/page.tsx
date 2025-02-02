import AboutCard from "./about-card";

export default function About() {
  const items=[{title:"Urgent Consultation",icon:"urgent.svg",text:"Need immediate medical attention? Connect with a doctor instantly for urgent health concerns. Get quick advice, prescriptions, and guidance in critical situations."}
    ,{title:"Scheduled Consultation",icon:"calendar.svg",text:"Plan your health checkup at your convenience. Book an appointment with a doctor for a detailed and personalized consultation at a time that suits you."},
    {title:"Regular Consultation",icon:"doctor.svg",text:"For ongoing care and follow-ups, stay in touch with your doctor. Discuss your progress, get advice, and manage your health seamlessly over video calls."},]
  return (
  
  <section className="bg-second flex flex-col text-alt items-center  h-[100vh]  pt-[128px] px-6">
    <h1 className="text-[72px] font-bold justify-start">High-quality care—anywhere, anytime</h1>
    <div className="flex items-center justify-center center pb-[60px]">
    <h3 >Our top-rated primary care doctors and therapists provide a wide range of healthcare services, including weight management, urgent care, pediatric care, chronic disease treatment and online therapy. Access comprehensive care for all life stages in one convenient app.</h3>
    </div>
    <div className="flex flex-row items-center justify-center gap-[44px] ">
    {items.map((item, index) => {
      return <AboutCard className="h-[550px] w-[550px]" key={index} width={100} height={100} title={item.title} icon={item.icon} text={item.text} />;
    })}

    </div>
  </section>

  );
}
