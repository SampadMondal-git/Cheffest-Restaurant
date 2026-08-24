import menus from '../../src/assets/icons/menu.png';
import opened from '../../src/assets/icons/open.png';
import delivery from '../../src/assets/icons/fast-delivery.png';

function Service() {
    return (
        <div className="bg-[#fff6ea] w-full flex flex-col md:flex-row items-center justify-between my-6 sm:my-8 md:my-12 px-4 sm:px-8 md:px-12 py-12 sm:py-16 md:py-24 gap-6 sm:gap-8 md:gap-12">
            {/* Left section – centered on mobile/tablet, left on desktop */}
            <div className="offers w-full md:w-1/2 max-w-3xl flex flex-col gap-4 sm:gap-5 md:gap-6 text-center lg:text-left">
                <div className="relative flex items-center justify-center lg:justify-start w-full gap-3">
                    <div className="h-px w-8 sm:w-12 bg-linear-to-r from-transparent to-[#ff9900]"></div>
                    <div className="flex items-center gap-2">
                        <span className="text-[#ff9900] text-lg sm:text-xl">✦</span>
                        <h3 className="text-sm sm:text-base uppercase font-bold tracking-[0.4rem] sm:tracking-[0.6rem] text-[#ff9900]">
                            What We Offer
                        </h3>
                        <span className="text-[#ff9900] text-lg sm:text-xl">✦</span>
                    </div>
                    <div className="h-px w-8 sm:w-12 bg-linear-to-l from-transparent to-[#ff9900]"></div>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Our Great Services</h1>
                <p className="text-sm sm:text-base md:text-lg">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Officiis neque suscipit
                    ipsa qui excepturi pariatur molestias mollitia aspernatur deserunt beatae!
                </p>
            </div>

            <div className="offer-icons w-full md:w-1/2 flex flex-wrap md:flex-nowrap items-center justify-center sm:justify-between gap-4 sm:gap-6">
                <div className="icon flex flex-col items-center justify-center w-full sm:w-[calc(50%-0.75rem)] md:w-1/3 h-40 sm:h-44 md:h-48 bg-[#292836] text-white gap-3 sm:gap-4 p-3 sm:p-4">
                    <img src={menus} alt="menu" className="w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12" />
                    <h3 className="text-sm sm:text-base">Special Menus</h3>
                </div>

                <div className="icon flex flex-col items-center justify-center w-full sm:w-[calc(50%-0.75rem)] md:w-1/3 h-40 sm:h-44 md:h-48 bg-[#292836] text-white gap-3 sm:gap-4 p-3 sm:p-4">
                    <img src={opened} alt="hours" className="w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12" />
                    <h3 className="text-center text-sm sm:text-base">
                        Mon - Fri<br />10:00 AM - 10:00 PM
                    </h3>
                </div>

                <div className="icon flex flex-col items-center justify-center w-full sm:w-[calc(50%-0.75rem)] md:w-1/3 h-40 sm:h-44 md:h-48 bg-[#292836] text-white gap-3 sm:gap-4 p-3 sm:p-4">
                    <img src={delivery} alt="delivery" className="w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12" />
                    <h3 className="text-sm sm:text-base">Home Delivery</h3>
                </div>
            </div>
        </div>
    );
}

export default Service;