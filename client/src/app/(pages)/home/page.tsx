import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function Home() {
  const items=[{text:"Free Online Doctor Consultations"},{text:"Accessible Healthcare for All"},{text:"Confidential and Secure"},]
  return (
    <div className="pl-[104px] flex flex-row items-center justify-center w-full h-full my-16">
      <div className="justify-start flex flex-col w-1/2 h-[80vh] space-y-10">
        <h1 className='text-[42px] font-bold self-stretch'>
          Trusted care from top doctors, just a tap away
        </h1>
        <h2 className='text-2xl font-medium text-gray-600'>
          Connecting you with exceptional care and trusted expertise from the palm of your hand.
        </h2>
        <div className='text-[32px]'>
        {(items.map((item,index) => {
            return  <p key={index}>
            <span className='inline-block px-4'><svg width="31" height="23" viewBox="0 0 31 23" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.25 11.5L8.25 20L29.75 2" stroke="black" stroke-width="3" />
          </svg></span>
          {item.text}
          </p>
        }))} 
        
        </div>
        <Button variant="default">Get started</Button>

      </div>
      <div className="justify-end w-1/2 h-[80vh] border-inherit  rounded-bl-[64px] bg-custom-gradient">
        <Image alt='' src="laptop.svg" className='w-[922px] h-[383px]' width={922} height={383}/>
      </div>
    </div>

  );
}
