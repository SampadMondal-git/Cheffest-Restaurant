import restaurant from '../../src/assets/resturant-image/restaurant-image.jpg';

function About({ year }: { year: number }) {
    return (
        <>
            <div className="w-full flex flex-col md:flex-row items-center justify-between px-4 md:px-12 py-16 md:py-24 gap-8 md:gap-12">
                <div className="w-full md:w-1/2 flex justify-center">
                    <div className="relative w-full max-w-[320px] sm:max-w-sm md:max-w-125">
                        {/* Glassmorphism frame */}
                        <div className="absolute -inset-2 sm:-inset-3 md:-inset-4 bg-linear-to-r from-orange-500/10 to-amber-400/10 rounded-xl sm:rounded-2xl md:rounded-3xl backdrop-blur-sm border border-white/20"></div>

                        {/* Main image with layered effect */}
                        <div className="relative overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl shadow-2xl">
                            <img
                                src={restaurant}
                                className="w-full h-65 sm:h-87.5 md:h-125 object-cover"
                                alt="Restaurant interior"
                            />

                            {/* Gradient overlay - Chef badge */}
                            <div className="absolute top-2 right-2 sm:top-4 sm:right-4 md:top-6 md:right-6 bg-linear-to-br from-[#111111] via-[#1a1a1a] to-[#545454] backdrop-blur-md px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-3 rounded-lg md:rounded-xl border border-white/10 shadow-[-5px_5px_15px_rgba(255,153,0,0.25)] flex items-center gap-1.5 sm:gap-2 md:gap-3 transition duration-300">
                                <svg
                                    className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-[#ffb347]"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M12 3c-2.21 0-4 1.79-4 4 0 .34.04.67.12.99C6.35 8.27 5 9.94 5 12c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4 0-2.06-1.35-3.73-3.12-4.01.08-.32.12-.65.12-.99 0-2.21-1.79-4-4-4zM9 18v2h6v-2H9z" />
                                </svg>
                                <div className="leading-tight gap-0 flex flex-col">
                                    <p className="text-white text-[10px] sm:text-xs md:text-sm tracking-wide font-bold">
                                        Chef Crafted
                                    </p>
                                    <p className="text-gray-400 text-[8px] sm:text-[10px] md:text-xs tracking-wide">
                                        Premium Quality
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Corner accents */}
                        <div className="absolute -bottom-1.5 -right-1.5 sm:-bottom-2 sm:-right-2 md:-bottom-3 md:-right-3 w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 border-t-2 border-r-2 border-[#ff9900] rounded-tr-xl sm:rounded-tr-2xl md:rounded-tr-3xl"></div>
                        <div className="absolute -top-1.5 -left-1.5 sm:-top-2 sm:-left-2 md:-top-3 md:-left-3 w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 border-b-2 border-l-2 border-amber-400 rounded-bl-xl sm:rounded-bl-2xl md:rounded-bl-3xl"></div>

                        {/* Floating badge */}
                        <div className="absolute -bottom-3 -left-3 sm:-bottom-4 sm:-left-4 md:-bottom-6 md:-left-6 bg-white px-2 py-1.5 sm:px-3 sm:py-2 md:px-5 md:py-3 rounded-lg md:rounded-xl shadow-xl border border-gray-100 transform -rotate-3">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-3 md:h-3 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="font-bold text-gray-900 text-[10px] sm:text-sm md:text-base">Since {year}</span>
                            </div>
                            <p className="text-[8px] sm:text-xs md:text-sm text-gray-600 mt-0.5">Family Owned</p>
                        </div>
                    </div>
                </div>

                {/* Alternative 5: Rustic / Heritage Style */}
                <div className="offers w-full md:w-1/2 max-w-3xl flex flex-col gap-4 md:gap-6">
                    <div className="relative inline-block w-fit">
                        {/* Brush stroke background */}
                        <svg className="absolute -left-2 -top-1 w-[130%] h-[140%] text-orange-200/40" viewBox="0 0 200 40" fill="none">
                            <path d="M5 20 Q40 5 80 22 T150 15 T195 25" stroke="currentColor" strokeWidth="12" strokeLinecap="round" fill="none" />
                        </svg>
                        <span className="relative text-sm sm:text-base font-bold uppercase tracking-[0.4rem] text-stone-800 bg-stone-100/80 px-5 py-1.5 rounded-sm">
                            About Us
                        </span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-stone-800">
                        Quality &amp; Tradition
                    </h1>

                    {/* Retro stamp badge */}
                    <div className="flex items-center gap-4 -mt-1">
                        <div className="border-2 border-amber-600/30 rounded-full px-3 py-0.5">
                            <span className="text-[10px] sm:text-xs font-bold tracking-[0.15rem] text-[#ff9900] uppercase">
                                Since {year}
                            </span>
                        </div>
                        <div className="h-px flex-1 bg-stone-200"></div>
                    </div>

                    <p className="text-base sm:text-lg md:text-xl text-stone-600">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Architecto asperiores officia, rerum nesciunt repellat iusto, magni eveniet sed hic sint mollitia quaerat quam est beatae harum esse repudiandae libero quae non, id totam? Excepturi, dolore!
                    </p>
                </div>
            </div>
        </>
    );
}

export default About;