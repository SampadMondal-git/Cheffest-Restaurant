function Gallery() {
    return (
        <div className="gallery flex justify-center items-center flex-col py-8 md:py-12 gap-4 px-4 md:px-12 text-center">
            <h1 className="relative flex items-center gap-4 text-lg uppercase font-semibold tracking-[0.35rem] text-[#ff9900]">
                <span className="h-px w-10 bg-[#ff9900]" />

                <span className="relative">
                    Gallery
                    <span className="absolute -bottom-2 left-0 h-px w-1/2 bg-[#ff9900]" />
                </span>

                <span className="h-px flex-1 bg-linear-to-r from-[#ff9900]/60 to-transparent" />
            </h1>
            <h1 className="font-bold text-2xl md:text-3xl">What We Make</h1>

            {/* Responsive grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 p-4 md:p-10 w-full">
                {/* Left column: two stacked images */}
                <div className="grid grid-rows-2 gap-4 md:gap-6">
                    <img
                        src="https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80"
                        alt=""
                        className="h-48 md:h-full w-full object-cover"
                    />
                    <img
                        src="https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80"
                        alt=""
                        className="h-48 md:h-full w-full object-cover"
                    />
                </div>

                {/* Center wide image (spans 2 cols on desktop) */}
                <div className="col-span-1 md:col-span-2">
                    <img
                        src="https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80"
                        alt=""
                        className="h-64 md:h-full w-full object-cover"
                    />
                </div>

                {/* Right column: two stacked images */}
                <div className="grid grid-rows-2 gap-4 md:gap-6">
                    <img
                        src="https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80"
                        alt=""
                        className="h-48 md:h-full w-full object-cover"
                    />
                    <img
                        src="https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80"
                        alt=""
                        className="h-48 md:h-full w-full object-cover"
                    />
                </div>
            </div>
        </div>
    )
}

export default Gallery