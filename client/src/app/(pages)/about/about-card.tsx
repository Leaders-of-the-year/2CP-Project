import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
  import Image from "next/image"
interface AboutCardProps {
    icon:string,title:string,text:string,width:number,height:number,className:string;
}
// TODO:change className type 
export const AboutCard=({icon,title,text,width,height,className}:AboutCardProps)=>{
    return <Card className={`${className}`}>
    <CardHeader>
      <CardTitle>
        <Image className="py-6" alt="" src={icon} width={width} height={height}/>
        {title}
      </CardTitle>
      <CardDescription>Card Description</CardDescription>
    </CardHeader>
    <CardContent>
      <p>{text}</p>
    </CardContent>
    <CardFooter>
      <p className="text-muted ">More</p>
    </CardFooter>
  </Card>
  
}  
export default AboutCard;