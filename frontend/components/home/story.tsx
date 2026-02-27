import image from '../../src/assets/resturant-image/restaurant-image.jpg';

function Story() {
    const establishedYear: number = 2017;
    const currentYear: number = new Date().getFullYear();

    return (
        <div className="flex justify-between items-center">
            <div className="image-container w-1/2 p-6 px-12">
                <img
                    src={image}
                    alt="store-image"
                    className="w-full h-[400px] object-cover"
                />
            </div>

            <div className="border-r-2 border-[#ff9900] h-[400px] my-12"></div>

            <div className="story-container w-1/2 flex flex-col justify-center px-12">
                <h2 className="text-4xl font-bold mb-4">Our Story</h2>
                <p className="text-lg mb-4">
                    Lorem ipsum dolor sit amet consectetur, adipisicing elit. Officiis libero eius at deleniti dolorem minus commodi, tempora fugiat iste odit!
                </p>
                <div className="years flex justify-between mt-6">
                    <div className="established-year">
                        <h3 className="text-4xl font-bold mb-2">{establishedYear}</h3>
                        <p className="text-gray-600">Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>
                    </div>
                    <div className="current-year">
                        <h3 className="text-4xl font-bold mb-2">{currentYear}</h3>
                        <p className="text-gray-600">Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Story