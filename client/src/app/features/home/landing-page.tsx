import About from "@/app/features/landingpage/about/page";
import Home from "@/app/features/landingpage/home/page";
import TopDoctors  from "@/app/features/landingpage/top-doctors/page";

export const LandingPage=()=>{
    return <>
        <Home/>
        <About/>
        <TopDoctors/>
    </>
}
export default LandingPage;