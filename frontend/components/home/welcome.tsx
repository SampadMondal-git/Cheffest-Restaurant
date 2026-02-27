import restaurant from '../../src/assets/resturant-image/restaurant-image.jpg';

function Welcome({ title }: { title: string }) {
    const establishedYear: number = 2017;
    const currentYear: number = new Date().getFullYear();

    const years = Array.from({ length: currentYear - establishedYear + 1 }, (_, index) => establishedYear + index);

    return (
        <>
            <div className="min-h-[90vh] bg-linear-to-br from-[#fffaf3] to-[#ffe8c8] flex items-center px-6 md:px-12 lg:px-20 relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 left-0 w-72 h-72 bg-[#ff9900]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#ff9900]/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

                <div className="container mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20 relative z-10">
                    {/* Text Section */}
                    <div className="w-full lg:w-1/2 flex flex-col gap-8">
                        <div className="heading flex flex-col gap-2">
                            <div className="inline-flex items-center gap-2 mb-2">
                                <div className="w-3 h-3 bg-[#ff9900] rounded-full"></div>
                                <span className="text-sm font-semibold text-[#ff9900] tracking-wide uppercase">Premium Dining Experience</span>
                            </div>
                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                                Welcome to
                                <span className="subtext block bg-linear-to-r from-[#ff7b00] to-[#ffaa33] bg-clip-text text-transparent mt-2">
                                    {title}
                                </span>
                            </h1>
                        </div>

                        <p className="text-lg md:text-xl max-w-2xl">
                            Experience culinary excellence in an atmosphere designed for memorable moments.
                            Our chefs craft each dish with passion, using locally-sourced ingredients to
                            deliver exceptional flavors.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 mt-2">
                            <button className="group px-8 py-4 bg-linear-to-r from-gray-900 to-black text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-orange-500/20 flex items-center gap-3 self-start hover:shadow-2xl cursor-pointer">
                                Explore Our Menu
                            </button>

                            <button className="px-8 py-4 bg-white/80 backdrop-blur-sm border-2 border-gray-200 font-semibold rounded-xl hover:bg-white hover:border-[#ff9900] transition-all duration-300 hover:shadow-lg self-start cursor-pointer">
                                Book a Table
                            </button>
                        </div>

                        {/* Stats/Highlights */}
                        <div className="flex flex-wrap gap-6 mt-8 pt-8 border-t border-gray-200/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#ff9900]/10 rounded-lg flex items-center justify-center">
                                    <span className="text-[#ff9900] font-bold text-lg">4.8</span>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">Google Rating</p>
                                    <p className="text-sm text-gray-600">500+ Reviews</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#ff9900]/10 rounded-lg flex items-center justify-center">
                                    <span className="text-[#ff9900] font-bold text-lg">{years.length}+</span>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">Years Experience</p>
                                    <p className="text-sm text-gray-600">Since {establishedYear}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Image Section */}
                    <div className="w-full lg:w-1/2 flex justify-center">
                        <div className="relative">
                            {/* Main image container with modern frame */}
                            <div className="relative w-[400px] h-[500px] md:w-[450px] md:h-[550px] rounded-3xl overflow-hidden shadow-2xl shadow-orange-500/20">
                                <img
                                    src={restaurant}
                                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                                    alt="Restaurant interior"
                                />
                                {/* Overlay linear */}
                                <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent"></div>
                            </div>

                            {/* Decorative floating elements */}
                            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-linear-to-br from-[#ff9900] to-[#ffcc66] rounded-2xl rotate-12 shadow-xl"></div>
                            <div className="absolute -top-6 -right-6 w-24 h-24 bg-linear-to-br from-gray-900 to-black rounded-2xl -rotate-12 shadow-xl flex items-center justify-center">
                                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM6.75 9.25a.75.75 0 000 1.5h4.59l-2.1 1.95a.75.75 0 001.02 1.1l3.5-3.25a.75.75 0 000-1.1l-3.5-3.25a.75.75 0 10-1.02 1.1l2.1 1.95H6.75z" clipRule="evenodd"></path>
                                </svg>
                            </div>

                            {/* Floating tag */}
                            <div className="absolute top-8 -right-8 bg-white px-4 py-3 rounded-xl shadow-lg rotate-3 border border-gray-100">
                                <p className="font-bold text-gray-900">Refined Spaces</p>
                                <p className="text-sm text-gray-600">Calm Atmosphere</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Welcome