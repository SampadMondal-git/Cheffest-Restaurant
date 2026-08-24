import { useNavigate } from 'react-router-dom';
import restaurant from '../../src/assets/resturant-image/restaurant-image.jpg';

function Welcome({ title }: { title: string }) {
    const establishedYear: number = 2017;
    const currentYear: number = new Date().getFullYear();

    const years = Array.from(
        { length: currentYear - establishedYear + 1 },
        (_, index) => establishedYear + index
    );

    const navigate = useNavigate();

    return (
        <div className="min-h-[90vh] bg-linear-to-br from-[#fffaf3] to-[#ffe8c8] flex items-center px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 relative overflow-hidden py-8 sm:py-12 md:py-16">
            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 w-32 sm:w-48 md:w-72 h-32 sm:h-48 md:h-72 bg-[#ff9900]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-40 sm:w-64 md:w-96 h-40 sm:h-64 md:h-96 bg-[#ff9900]/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

            <div className="container mx-auto flex flex-col lg:flex-row items-center gap-6 sm:gap-8 md:gap-10 lg:gap-16 xl:gap-20 relative z-10 w-full">
                {/* Text Section */}
                <div className="w-full lg:w-1/2 flex flex-col gap-3 sm:gap-4 md:gap-5 lg:gap-6 text-left">
                    <div className="heading flex flex-col gap-1 sm:gap-2">
                        <div className="inline-flex items-center gap-2">
                            <div className="flex items-center gap-3 mb-2 w-fit">
                                <span className="text-[#ff9900] text-xl leading-none">✦</span>

                                <div>
                                    <p className="text-[10px] sm:text-xs font-medium uppercase tracking-[0.35em] text-gray-500">
                                        Est. 2017
                                    </p>

                                    <div className="relative">
                                        <p className="text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-[0.22em] text-[#ff9900]">
                                            Premium Dining Experience
                                        </p>
                                        {/* Premium underline */}
                                        <span className="absolute -bottom-0.5 left-0 w-full h-0.5 bg-linear-to-r from-transparent via-[#ff9900] to-transparent" />
                                        <span className="absolute -bottom-1 left-[30%] w-[40%] h-0.75 bg-[#ff9900] opacity-40 blur-sm" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                            Welcome to
                            <span className="subtext block bg-linear-to-r from-[#ff7b00] to-[#ffaa33] bg-clip-text text-transparent mt-1 sm:mt-2">
                                {title}
                            </span>
                        </h1>
                    </div>

                    <p className="text-sm sm:text-base md:text-lg lg:text-xl max-w-2xl leading-relaxed">
                        Experience culinary excellence in an atmosphere designed for memorable moments.
                        Our chefs craft each dish with passion, using locally-sourced ingredients to
                        deliver exceptional flavors.
                    </p>

                    {/* Buttons – more gap on mobile, original gap on desktop */}
                    <div className="flex flex-row flex-wrap gap-6 sm:gap-3 md:gap-4 mt-1 justify-center lg:justify-start">
                        <button
                            className="group px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 bg-linear-to-r from-gray-900 to-black text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-orange-500/20 flex items-center gap-3 justify-center hover:shadow-2xl cursor-pointer text-sm sm:text-base"
                            onClick={() => navigate('/our-menu')}
                        >
                            Explore Our Menu
                        </button>

                        <button
                            className="px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 bg-white/80 backdrop-blur-sm border-2 border-gray-200 font-semibold rounded-xl hover:bg-white hover:border-[#ff9900] transition-all duration-300 hover:shadow-lg justify-center cursor-pointer text-sm sm:text-base"
                            onClick={() => navigate('/reservation')}
                        >
                            Book a Table
                        </button>
                    </div>

                    {/* Stats/Highlights – more gap on mobile, original gap on desktop */}
                    <div className="flex flex-wrap gap-8 sm:gap-4 md:gap-6 mt-3 sm:mt-4 md:mt-6 pt-3 sm:pt-4 md:pt-6 border-t border-gray-200/50 justify-center lg:justify-start">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-8 sm:w-9 md:w-10 h-8 sm:h-9 md:h-10 bg-[#ff9900]/10 rounded-lg flex items-center justify-center shrink-0">
                                <span className="text-[#ff9900] font-bold text-sm sm:text-base md:text-lg">4.8</span>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 text-xs sm:text-sm md:text-base">Google Rating</p>
                                <p className="text-[10px] sm:text-xs md:text-sm text-gray-600">500+ Reviews</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-8 sm:w-9 md:w-10 h-8 sm:h-9 md:h-10 bg-[#ff9900]/10 rounded-lg flex items-center justify-center shrink-0">
                                <span className="text-[#ff9900] font-bold text-sm sm:text-base md:text-lg">{years.length}+</span>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 text-xs sm:text-sm md:text-base">Years Experience</p>
                                <p className="text-[10px] sm:text-xs md:text-sm text-gray-600">Since {establishedYear}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Image Section */}
                <div className="w-full lg:w-1/2 flex justify-center mt-2 sm:mt-4 lg:mt-0">
                    <div className="relative w-full max-w-75 xs:max-w-[340px] sm:max-w-100 md:max-w-112.5 lg:max-w-125 xl:max-w-130 mx-auto">
                        {/* Main image container */}
                        <div className="relative w-full aspect-4/5 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-orange-500/20">
                            <img
                                src={restaurant}
                                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                                alt="Restaurant interior"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent"></div>

                            {/* Featured text overlay */}
                            <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 lg:bottom-6 left-2 sm:left-3 md:left-4 lg:left-6 bg-white/95 rounded-2xl sm:rounded-3xl p-2.5 sm:p-3 md:p-4 shadow-2xl border border-gray-100 w-35 xs:w-[160px] sm:w-47.5 md:w-52.5 lg:w-57.5 backdrop-blur-sm z-10">
                                <div className="flex items-center gap-1 mb-0.5">
                                    <svg
                                        className="w-3.5 sm:w-4 md:w-5 lg:w-6 h-3.5 sm:h-4 md:h-5 lg:h-6 text-[#ff9900]"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.6"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <circle cx="12" cy="14" r="7" />
                                        <ellipse cx="12" cy="14" rx="3.5" ry="2" />
                                        <path d="M12 6c1.5 1 1.5 3 0 4" />
                                    </svg>
                                    <p className="text-[9px] xs:text-[10px] sm:text-xs md:text-sm font-semibold text-gray-900">
                                        Customer Favorite
                                    </p>
                                </div>
                                <p className="text-[8px] xs:text-[9px] sm:text-[10px] md:text-xs lg:text-sm text-gray-600 leading-tight">
                                    A guest-favorite dish, loved for its perfect balance of flavor and freshness.
                                </p>
                            </div>
                        </div>

                        {/* Decorative floating elements */}
                        <div className="absolute -bottom-3 sm:-bottom-4 md:-bottom-6 -left-3 sm:-left-4 md:-left-6 w-14 sm:w-20 md:w-24 lg:w-32 h-14 sm:h-20 md:h-24 lg:h-32 bg-linear-to-br to-[#ffcc66] rounded-xl sm:rounded-2xl rotate-12 shadow-xl"></div>

                        <div className="absolute -top-3 sm:-top-4 md:-top-6 -right-3 sm:-right-4 md:-right-6 w-12 sm:w-16 md:w-20 lg:w-24 h-12 sm:h-16 md:h-20 lg:h-24 bg-linear-to-br to-black rounded-xl sm:rounded-2xl -rotate-12 shadow-xl flex items-center justify-center">
                            <svg className="w-5 sm:w-6 md:w-8 lg:w-10 h-5 sm:h-6 md:h-8 lg:h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM6.75 9.25a.75.75 0 000 1.5h4.59l-2.1 1.95a.75.75 0 001.02 1.1l3.5-3.25a.75.75 0 000-1.1l-3.5-3.25a.75.75 0 10-1.02 1.1l2.1 1.95H6.75z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>

                        {/* Floating tag */}
                        <div className="absolute top-2 sm:top-3 md:top-4 lg:top-8 -right-1 sm:-right-2 md:-right-4 lg:-right-6 bg-white px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-3 rounded-xl shadow-lg rotate-3 sm:rotate-6 md:rotate-10 border border-gray-100">
                            <p className="font-bold text-gray-900 text-[10px] sm:text-xs md:text-sm lg:text-base">Curated Comfort</p>
                            <p className="text-[8px] sm:text-[9px] md:text-xs text-gray-600">Designed for relaxed dining</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Welcome;