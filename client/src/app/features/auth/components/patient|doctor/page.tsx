import Image from "next/image"
export const Identity = () => {
    return <div className="flex flex-col items-center  justify-center" >
        <h1 className="h1 my-32 text-main">Please select who you are </h1>
        <div className="flex flex-row gap-40 justify-center items-center ">
            <div className="flex flex-col space-y-6">
            <Image alt="" src="doctorCard.svg" width="347" height="347"></Image>
            <h3 className="h3 text-main">Doctor</h3>
            </div>
            <div className=" flex flex-col space-y-6">
            <Image alt="" src="patient.svg" width="347" height="347"></Image>
            <h3 className="h3 text-main">Patient</h3>
            </div>

        </div>
    </div>
}
export default Identity;