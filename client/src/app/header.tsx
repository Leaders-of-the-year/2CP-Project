"use client"
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
export const Header = () => {
    const pathname=usePathname();
    const items = [{ name: "Home", alt: "/home" }, { name: "Services", alt: "/services" }, { name: "About us", alt: "/about" }, { name: "TopDoctors", alt: "/top-doctors" },]
    return <nav className="flex flex-row justify-between my-2 px-12 py-3 items-center  h-15 border-b border-black">
        <Image className="justify-start" src="logo.svg" alt="" width={61.09} height={58.396}></Image>
        <div className="flex flex-row space-x-5">
            {items.map((item,index) => {
                return <Link key={index} href={item.alt} >
                    <h1 className={` font-bold p-4 ${pathname===item.alt ? "border-b-2 border-black":""}`} >
                        {item.name}
                        </h1>
                </Link>;
            })}
        </div>
        <div className="space-x-3 justify-end">
            <Button variant="default"  onClick={()=>{}}>Sign in</Button>
            <Button variant="outline"   onClick={()=>{}}>Sign up</Button>
        </div>

    </nav>
}
export default Header;