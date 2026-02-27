function Gallery() {
    return (
        <div className="gallery flex justify-center items-center flex-col py-12 gap-4 px-12 text-center">
            <h1 className="text-lg uppercase border-t border-b border-[#ff9900] font-bold tracking-[0.5rem]">Gallery</h1>
            <h1 className="font-bold text-4xl">What We Make</h1>
            <div className="grid grid-cols-4 gap-6 p-10">

                <div className="grid grid-rows-2 gap-6">
                    <img src="https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80" className="w-full h-full object-cover" />
                    <img src="https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80" className="w-full h-full object-cover" />
                </div>

                <div className="col-span-2">
                    <img src="https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80" className="w-full h-full object-cover" />
                </div>

                <div className="grid grid-rows-2 gap-6">
                    <img src="https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80" className="w-full h-full object-cover" />
                    <img src="https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80" className="w-full h-full object-cover" />
                </div>

            </div>

        </div>
    )
}

export default Gallery