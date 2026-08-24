import image from '../../src/assets/resturant-image/restaurant-image.jpg';

function Story() {
    const establishedYear: number = 2017;
    const currentYear: number = new Date().getFullYear();

    return (
        <div className="flex flex-col md:flex-row justify-between items-center w-full">
            {/* Image Container */}
            <div className="image-container w-full md:w-1/2 p-4 sm:p-6 md:p-6 lg:px-12">
                <img
                    src={image}
                    alt="store-image"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-55 xs:h-[260px] sm:h-75 md:h-87.5 lg:h-100 object-cover rounded-sm"
                />
            </div>

            {/* Divider — horizontal on mobile, vertical on tablet+ */}
            <div className="border-b-2 md:border-b-0 md:border-r-2 border-[#ff9900] w-3/4 md:w-0 md:h-100 my-3 md:my-12 mx-auto md:mx-0"></div>

            {/* Story Container */}
            <div className="story-container w-full md:w-1/2 flex flex-col justify-center px-4 sm:px-6 md:px-6 lg:px-12 py-6 md:py-0">
                {/* Heading & paragraph */}
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4 tracking-tight text-center lg:text-left">
                    Our Story
                </h2>
                <p className="text-sm sm:text-base md:text-lg leading-relaxed text-gray-800 mb-4 md:mb-6 text-center lg:text-left">
                    Lorem ipsum dolor sit amet consectetur, adipisicing elit. Officiis libero eius at
                    deleniti dolorem minus commodi, tempora fugiat iste odit!
                </p>

                {/* Years — card style on mobile/tablet, clean text on desktop */}
                <div className="years flex flex-row flex-wrap justify-between items-stretch gap-3 sm:gap-4 mt-2 md:mt-6">
                    <div className="established-year flex-1 min-w-25 
                                    bg-gray-50/80 border border-gray-200 rounded-xl shadow-sm 
                                    lg:bg-transparent lg:border-0 lg:shadow-none lg:rounded-none
                                    p-4 sm:p-5 lg:p-0 text-center lg:text-left
                                    transition-all duration-200">
                        <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1 tracking-tight text-[#ff9900] 
                                       relative inline-block 
                                       after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#ff9900] 
                                       after:scale-x-0 after:transition-transform after:duration-300
                                       hover:after:scale-x-100
                                       lg:after:scale-x-0 lg:hover:after:scale-x-0">
                            {establishedYear}
                        </h3>
                        <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed mt-0 lg:mt-2">
                            Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                        </p>
                    </div>
                    <div className="current-year flex-1 min-w-25 
                                    bg-gray-50/80 border border-gray-200 rounded-xl shadow-sm 
                                    lg:bg-transparent lg:border-0 lg:shadow-none lg:rounded-none
                                    p-4 sm:p-5 lg:p-0 text-center lg:text-left
                                    transition-all duration-200">
                        <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1 tracking-tight text-[#ff9900] 
                                       relative inline-block 
                                       after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#ff9900] 
                                       after:scale-x-0 after:transition-transform after:duration-300
                                       hover:after:scale-x-100
                                       lg:after:scale-x-0 lg:hover:after:scale-x-0">
                            {currentYear}
                        </h3>
                        <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed mt-0 lg:mt-2">
                            Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Story;