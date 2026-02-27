import item1 from '../../src/assets/foods-images/crispy-spicy-chicken-wings.jpg';
import item2 from '../../src/assets/foods-images/juicy-cheeseburger.jpg';
import item3 from '../../src/assets/foods-images/pouring-honey-on-pancakes.jpg';

type Item = {
    name: string;
    image: string;
    rating: string;
    price: number;
}

const items: Item[] = [
    {
        name: "Spicy Chicken Wings",
        image: item1,
        rating: "4.5",
        price: 249,
    },
    {
        name: "Juicy Cheeseburger",
        image: item2,
        rating: "4.2",
        price: 149,
    },
    {
        name: "Pouring Honey on Pancake",
        image: item3,
        rating: "4.8",
        price: 299,
    }
];

function Menu() {
    return (
        <div className="menu-container flex justify-center items-center flex-col py-12 gap-4 px-12 text-center">
            <h1 className="text-lg uppercase border-t border-b border-[#ff9900] font-bold tracking-[0.5rem]">Our Menu</h1>
            <h1 className="font-bold text-4xl">Popular Dishes</h1>
            <p className="max-w-3xl text-lg">Lorem ipsum dolor sit amet consectetur adipisicing elit. Ducimus est cupiditate consequatur, incidunt natus, laudantium, non odio facere pariatur quidem deserunt quibusdam ipsum illo suscipit.</p>

            {/* Redesigned items section */}
            <div className="w-full flex justify-between gap-8 px-12 py-12">
                {items.map((item, index) => (
                    <div
                        key={index}
                        className="bg-white w-100 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition"
                    >
                        <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-74 object-cover cursor-pointer"
                        />

                        <div className="px-4 py-4 border-t">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-semibold text-lg">{item.name}</h3>
                                <span className="text-[#ff9900] font-bold">&#8377; {item.price}</span>
                            </div>

                            <div className="flex justify-between items-center mt-2">
                                <div className="flex items-center gap-1 text-sm">
                                    <span className="font-bold">{item.rating}</span>
                                    <span className="text-[#ff9900]">★★★★★</span>
                                </div>

                                <button className="bg-[#ff9900] text-white text-sm font-semibold px-4 py-2 rounded-md hover:bg-[#ff8800] cursor-pointer">
                                    View details
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button className="bg-[#ff9900] text-white px-6 py-4 font-bold font-[karla] rounded-lg cursor-pointer hover:bg-[#ff8800]">See All Dishes</button>
        </div>
    );
}

export default Menu;
