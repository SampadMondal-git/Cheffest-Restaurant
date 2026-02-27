import food from '../../src/assets/icons/fresh.png'
import chef from '../../src/assets/icons/chef.png'
import juice from '../../src/assets/icons/orange-juice.png'
import vegan from '../../src/assets/icons/fresh-food.png'
import './facilities.css'

function Facilities() {
    return (
        <div className="max-w-7xl mx-auto flex gap-8 justify-between">

            {[
                { img: food, title: "Fresh Product" },
                { img: chef, title: "Skilled Chefs" },
                { img: juice, title: "Drinks & Juices" },
                { img: vegan, title: "Vegan Cuisine" },
            ].map((item, index) => (
                <div
                    key={index}
                    className="box w-[25%] bg-[#fff6ea] rounded-xl px-6 py-10
                 flex flex-col items-center text-center gap-4"
                >
                    <img
                        src={item.img}
                        alt={item.title}
                        className="w-14 mb-2
          filter-[brightness(0)_saturate(100%)_invert(60%)_sepia(19%)_saturate(2792%)_hue-rotate(360deg)_brightness(102%)_contrast(105%)]"
                    />

                    <h2 className="text-2xl font-black">
                        {item.title}
                    </h2>

                    <p className="text-gray-600 font-medium">
                        Professional consider everyone
                        problems small niche friendly.
                    </p>
                </div>
            ))}
        </div>
    )
}

export default Facilities