import user from '../../src/assets/icons/user.png'

function Testimonial() {
    return (
        <div className="testimonial-container flex justify-center items-center flex-col py-12 gap-4 px-12 text-center">
            <h1 className="text-lg uppercase border-t border-b border-[#ff9900] font-bold tracking-[0.5rem]">Testimonial</h1>
            <h1 className="font-bold text-4xl">What Our Clients Say</h1>
            <p className="max-w-3xl text-lg">We love to hear our customers, so please leave a comment or say hello in an email.</p>

            <div className="feedback-container w-full flex justify-center items-center my-12 gap-10">
                <div className="feedback w-1/3 h-[300px] bg-[#343942] flex flex-col rounded-lg p-6">
                    <div className="user flex items-center gap-4 pb-4 border-b border-gray-400">
                        <img src={user} alt="user" className="w-12 h-12" />
                        <div className="user-details text-start">
                            <h3 className="font-bold text-white text-xl">Rahul Das</h3>
                            <p className="text-[#ff9900]">Kolkata</p>
                        </div>
                    </div>
                    <div className="user-feedback text-white text-start italic mt-4">
                        “It’s professional, respectful of everyone’s time, able to consider the bigger picture as well as niche details, and maintains a friendly tone.”
                    </div>
                </div>

                <div className="feedback w-1/3 h-[300px] bg-[#343942] flex flex-col rounded-lg p-6">
                    <div className="user flex items-center gap-4 pb-4 border-b border-gray-400">
                        <img src={user} alt="user" className="w-12 h-12" />
                        <div className="user-details text-start">
                            <h3 className="font-bold text-white text-xl">Priyanka Mondal</h3>
                            <p className="text-[#ff9900]">Park Street</p>
                        </div>
                    </div>
                    <div className="user-feedback text-white text-start italic mt-4">
                        “The restaurant nails it: fresh ingredients, clean flavors, and dishes that actually match the menu photos. Service is quick, and the place runs smoother than most spots in the area.”
                    </div>
                </div>

                <div className="feedback w-1/3 h-[300px] bg-[#343942] flex flex-col rounded-lg p-6">
                    <div className="user flex items-center gap-4 pb-4 border-b border-gray-400">
                        <img src={user} alt="user" className="w-12 h-12" />
                        <div className="user-details text-start">
                            <h3 className="font-bold text-white text-xl">Pranay Saha</h3>
                            <p className="text-[#ff9900]">Saltlake</p>
                        </div>
                    </div>
                    <div className="user-feedback text-white text-start italic mt-4">
                        “Consistently good food with zero pretension—well-seasoned, properly cooked, and served while it’s still hot. The atmosphere is relaxed, and the staff actually pays attention.”
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Testimonial