import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"  
interface FooterCardProps {
    title:string,subtitles:Array<string>
}
const FooterCard=({title,subtitles}:FooterCardProps)=>{
    return <Card className="bg-main w-full border-none text-alt">
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
    <p>{subtitles[0]}</p>
    <p>{subtitles[1]}</p>
    <p>{subtitles[2]}</p>  
    <p>{subtitles[3]}</p>
    </CardContent>
    <CardFooter>
      <p>Card Footer</p>
    </CardFooter>
  </Card>
  
}
export default FooterCard;