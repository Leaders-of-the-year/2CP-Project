import Home from "@/app/features/landingpage/home/page";
import About from "@/app/features/landingpage/about/page";
import TopDoctors from "@/app/features/landingpage/top-doctors/page";
export default function LandingPage() {
  return (
  <div className="bg-alt ">
          <Home/>
          <About/>
          <TopDoctors/>
      </div>

  );
}
// TODO : ADD ANIMATIONS FOR SCROLL VIEW