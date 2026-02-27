import menus from '../../src/assets/icons/menu.png'
import opened from '../../src/assets/icons/open.png'
import delivery from '../../src/assets/icons/fast-delivery.png'

function Service() {
    return (
        <div className="bg-[#fff6ea] w-full flex flex-col md:flex-row items-center justify-between my-12 px-12 py-24 gap-12">
            <div className="offers w-full md:w-1/2 max-w-3xl flex flex-col gap-6">
                <h3 className="uppercase text-lg border-t border-b font-bold w-fit tracking-[0.5rem]">What We Offer</h3>
                <h1 className="text-4xl font-bold">Our Great Services</h1>
                <p className="text-lg">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Officiis neque suscipit
                    ipsa qui excepturi pariatur molestias mollitia aspernatur deserunt beatae!
                </p>
            </div>

            <div className="offer-icons w-full md:w-1/2 flex items-center justify-between gap-6">
                <div className="icon flex flex-col items-center justify-center w-1/3 h-48 bg-[#292836] text-white gap-4 p-4">
                    <img src={menus} alt="menu" className="w-12 h-12" />
                    <h3>Special Menus</h3>
                </div>

                <div className="icon flex flex-col items-center justify-center w-1/3 h-48 bg-[#292836] text-white gap-4 p-4">
                    <img src={opened} alt="hours" className="w-12 h-12" />
                    <h3 className="text-center">Mon - Fri<br />10:00 AM - 10:00 PM</h3>
                </div>

                <div className="icon flex flex-col items-center justify-center w-1/3 h-48 bg-[#292836] text-white gap-4 p-4">
                    <img src={delivery} alt="delivery" className="w-12 h-12" />
                    <h3>Home Delivery</h3>
                </div>
            </div>
        </div>

    )
}

export default Service