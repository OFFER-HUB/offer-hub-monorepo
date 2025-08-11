import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";




export default function OfferFormStep1() {
    return(
        <>
         <form action="" className="bg-[#FFFFFF] w-full max-w-[714px] px-8 py-[60px] rounded-xl gap-11 flex flex-col items-center h-fit  " >

                <div className=" text-center space-y-2 " >
                    <h1 className=" font-bold text-2xl text-[#002333] " >Send an offer</h1>
                    <h3 className="font-semibold text-sm text-[#149A9B] " >Create and send offer to hire</h3>
                </div>


                <label htmlFor="jobTitle" className="w-full" >
                    Job title
                    <Input id="jobTitle" />
                </label>


                <label htmlFor="jobDescription" className="w-full">
                    Job description
                    <Textarea id="jobDescription" />
                </label>

                <label htmlFor="estimate" className="w-full">
                    <Input id="estimate" />
                </label>




                {/* <button onClick={handleNext}>Next</button> */}
            </form>

        </>
    )
}