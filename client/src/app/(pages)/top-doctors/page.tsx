import { DoctorCard } from "./doctor-card";

export default function TopDoctors() {
  const doctors=[{name:"Yasser lanacer",image:"doctorCard.svg",description:"Plan your health checkup at your convenience. Book an appointment with a doctor for a detailed and personalized consultation at"},{name:"Mehdi menghour",image:"doctorCard.svg",description:"Plan your health checkup at your convenience. Book an appointment with a doctor for a detailed and personalized consultation at"},{name:"Anis boulgheb",image:"doctorCard.svg",description:"Plan your health checkup at your convenience. Book an appointment with a doctor for a detailed and personalized consultation at"},]
  return (
<section className="bg-alt p-4 h-[100vh] ">
<h1 className="text-main text-[72px] center">Top-rated online doctors</h1>
<div className="flex flex-row items-center justify-center gap-[44px]">
{(doctors.map((doctor,index) => {
    return <DoctorCard className="w-[468px] h-[576px]" key={index} image={doctor.image} name={doctor.name} description={doctor.description}/>;
}))}
</div>
</section>
  );
}
