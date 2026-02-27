import restaurant from '../../src/assets/resturant-image/restaurant-image.jpg';

function About({year}: {year: number}) {
    return (
        <>
            <div className="w-full flex flex-col md:flex-row items-center justify-between px-4 md:px-12 py-16 md:py-24 gap-12">
                <div className="w-full md:w-1/2 flex justify-center">
                    <div className="relative">
                        {/* Modern glass effect container */}
                        <div className="relative w-full max-w-[500px]">
                            {/* Glassmorphism frame */}
                            <div className="absolute -inset-4 bg-linear-to-r from-orange-500/10 to-amber-400/10 rounded-3xl backdrop-blur-sm border border-white/20"></div>

                            {/* Main image with layered effect */}
                            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                                <img
                                    src={restaurant}
                                    className="w-full h-[500px] object-cover transform hover:scale-110 transition-transform duration-700"
                                    alt="Restaurant interior"
                                />

                                {/* Gradient overlay */}
                                <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent"></div>

                                {/* Floating decorative elements */}
                                <div className="absolute top-6 right-6 w-16 h-16 bg-linear-to-br from-[#ff9900] to-[#ffcc66] rounded-full flex items-center justify-center shadow-lg">
                                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z" />
                                    </svg>
                                </div>
                            </div>

                            {/* Corner accent */}
                            <div className="absolute -bottom-3 -right-3 w-24 h-24 border-t-2 border-r-2 border-[#ff9900] rounded-tr-3xl"></div>
                            <div className="absolute -top-3 -left-3 w-24 h-24 border-b-2 border-l-2 border-amber-400 rounded-bl-3xl"></div>

                            {/* Floating badge */}
                            <div className="absolute -bottom-6 -left-6 bg-white px-5 py-3 rounded-xl shadow-xl border border-gray-100 transform -rotate-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="font-bold text-gray-900">Since {year}</span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">Family Owned</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="offers w-full md:w-1/2 max-w-3xl flex flex-col gap-6">
                    <h3 className="uppercase text-lg border-t border-b border-[#ff9900] font-bold w-fit tracking-[0.3rem]">About us</h3>
                    <h1 className="text-4xl md:text-5xl font-bold">Quality and Tradition</h1>
                    <p className="text-lg md:text-xl">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Architecto asperiores officia, rerum nesciunt repellat iusto, magni eveniet sed hic sint mollitia quaerat quam est beatae harum esse repudiandae libero quae non, id totam? Excepturi, dolore!
                    </p>
                </div>
            </div>
        </>
    )
}

export default About