"use client"
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
export const Header = () => {
    const pathname=usePathname();
    const items = [{ name: "Home", alt: "/home" }, { name: "Services", alt: "/services" }, { name: "About us", alt: "/about" }, { name: "Top Doctors", alt: "/top-doctors" },]
    return <nav className="flex flex-row justify-between fixed w-full px-12 py-3 items-center bg-alt bg-opacity-50   h-20 border-b border-main">
        <div className="pl-48">
            <Image  src="logo.svg" alt="" width={61.09} height={58.396}></Image>
        </div>
        <div className="flex flex-row gap-20 ">
            {items.map((item,index) => {
                return <Link key={index} href={item.alt} >
                    <h1 className={`h5 font-bold p-4 ${pathname===item.alt ? "border-b-2 border-black":""}`} >
                        {item.name}
                        </h1>
                </Link>;
            })}
        </div>
        <div className="space-x-3 justify-end  pr-[196px]">
            <Button variant="default"  onClick={()=>{}}><p className="buttonL"> Sign in </p></Button>
            <Button variant="outline"   onClick={()=>{}}><p className="buttonL"> Sign up </p></Button>
        </div>

    </nav>
}
export default Header;