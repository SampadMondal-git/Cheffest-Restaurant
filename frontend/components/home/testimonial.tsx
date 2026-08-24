import user from '../../src/assets/icons/user.png';

function Testimonial() {
    return (
        <div className="testimonial-container flex justify-center items-center flex-col py-8 sm:py-10 lg:py-12 gap-3 sm:gap-4 px-4 sm:px-6 lg:px-12 text-center">
{/* হেডিং D */}
<div className="flex flex-col items-center">
    <span className="text-xs sm:text-sm uppercase tracking-[0.3rem] text-[#ff9900] font-semibold">
        Testimonial
    </span>
    <div className="flex items-center gap-3 my-1">
        <div className="w-8 h-px bg-linear-to-r from-transparent to-[#ff9900]"></div>
        <div className="w-2 h-2 bg-[#ff9900] rotate-45"></div>
        <div className="w-8 h-px bg-linear-to-l from-transparent to-[#ff9900]"></div>
    </div>
    <h2 className="font-bold text-2xl sm:text-3xl lg:text-4xl text-gray-800">
        What Our Clients Say
    </h2>
</div>
            <p className="max-w-3xl text-sm sm:text-base lg:text-lg">
                We love to hear our customers, so please leave a comment or say hello in an email.
            </p>

            <div className="feedback-container w-full flex flex-wrap lg:flex-nowrap justify-center items-stretch my-6 sm:my-8 lg:my-12 gap-4 sm:gap-6 lg:gap-10">
                {/* Card 1 */}
                <div className="feedback w-full sm:w-[calc(50%-0.75rem)] lg:w-1/3 min-h-50 sm:min-h-60 lg:min-h-75 h-auto lg:h-75 bg-[#343942] flex flex-col rounded-lg p-4 sm:p-5 lg:p-6">
                    <div className="user flex items-center gap-3 sm:gap-4 pb-4 border-b border-gray-400">
                        <img src={user} alt="user" className="w-8 sm:w-10 lg:w-12 h-8 sm:h-10 lg:h-12" />
                        <div className="user-details text-start">
                            <h3 className="font-bold text-white text-base sm:text-lg lg:text-xl">Rahul Das</h3>
                            <p className="text-[#ff9900] text-sm sm:text-base">Kolkata</p>
                        </div>
                    </div>
                    <div className="user-feedback text-white text-start italic mt-3 sm:mt-4 text-sm sm:text-base">
                        “It’s professional, respectful of everyone’s time, able to consider the bigger picture as well as niche details, and maintains a friendly tone.”
                    </div>
                </div>

                {/* Card 2 */}
                <div className="feedback w-full sm:w-[calc(50%-0.75rem)] lg:w-1/3 min-h-50 sm:min-h-60 lg:min-h-75 h-auto lg:h-75 bg-[#343942] flex flex-col rounded-lg p-4 sm:p-5 lg:p-6">
                    <div className="user flex items-center gap-3 sm:gap-4 pb-4 border-b border-gray-400">
                        <img src={user} alt="user" className="w-8 sm:w-10 lg:w-12 h-8 sm:h-10 lg:h-12" />
                        <div className="user-details text-start">
                            <h3 className="font-bold text-white text-base sm:text-lg lg:text-xl">Priyanka Mondal</h3>
                            <p className="text-[#ff9900] text-sm sm:text-base">Park Street</p>
                        </div>
                    </div>
                    <div className="user-feedback text-white text-start italic mt-3 sm:mt-4 text-sm sm:text-base">
                        “The restaurant nails it: fresh ingredients, clean flavors, and dishes that actually match the menu photos. Service is quick, and the place runs smoother than most spots in the area.”
                    </div>
                </div>

                {/* Card 3 */}
                <div className="feedback w-full sm:w-[calc(50%-0.75rem)] lg:w-1/3 min-h-50 sm:min-h-60 lg:min-h-75 h-auto lg:h-75 bg-[#343942] flex flex-col rounded-lg p-4 sm:p-5 lg:p-6">
                    <div className="user flex items-center gap-3 sm:gap-4 pb-4 border-b border-gray-400">
                        <img src={user} alt="user" className="w-8 sm:w-10 lg:w-12 h-8 sm:h-10 lg:h-12" />
                        <div className="user-details text-start">
                            <h3 className="font-bold text-white text-base sm:text-lg lg:text-xl">Pranay Saha</h3>
                            <p className="text-[#ff9900] text-sm sm:text-base">Saltlake</p>
                        </div>
                    </div>
                    <div className="user-feedback text-white text-start italic mt-3 sm:mt-4 text-sm sm:text-base">
                        “Consistently good food with zero pretension—well-seasoned, properly cooked, and served while it’s still hot. The atmosphere is relaxed, and the staff actually pays attention.”
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Testimonial;