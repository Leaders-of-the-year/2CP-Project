import FooterCard from "./footerCard"
import { Separator } from "@/components/ui/separator";
export const FooterLandingPage=()=>{
    const footerItems = [
        {
            title: "About Us",
            subtitles: ["Our Story", "Mission", "Vision", "Team"]
        },
        {
            title: "Services",
            subtitles: ["Consulting", "Development", "Design", "Marketing"]
        },
        {
            title: "Support",
            subtitles: ["Help Center", "Contact Us", "FAQs", "Live Chat"]
        },
        {
            title: "Legal",
            subtitles: ["Privacy Policy", "Terms of Service", "Cookie Policy", "Disclaimer"]
        }
    ];

    const shuffledFooterItems = footerItems.sort(() => Math.random() - 0.5);

    return (
        <footer className="flex flex-col bg-main w-full items-center justify-center px-24 text-alt">
            <div className="flex flex-row space-x-6 gap-[30px] w-full items-center justify-around">
                {shuffledFooterItems.map((item, index) => (
                    <FooterCard key={index} title={item.title} subtitles={item.subtitles} />
                ))}
            </div>
            <Separator />
            <div className="flex flex-row justify-end">
            <p className="justify-end   ">© 2025 [Website Name]. All Rights Reserved</p>
            </div>
        </footer>
    );
}