import Image from 'next/image';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
interface  DoctorCardProps {
    image:string,name:string,description:string,className:string,
}
export const DoctorCard=({image,name,description,className}:DoctorCardProps)=>{
    return <Card className={className}>
    <CardHeader className='items-center justify-center'>
      <Image alt='' src={image} width={248} height={295}/>
      
    </CardHeader>
    <CardContent className='items-center justify-center '>
        <CardTitle className='text-[32px]'>{name}</CardTitle>
        <CardDescription className='text-[16px]'>{description}</CardDescription>
    </CardContent>
    <CardFooter>
      <p>Rate</p>
    </CardFooter>
  </Card>
  
}