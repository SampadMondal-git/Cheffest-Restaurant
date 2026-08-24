import chefOne from '../../src/assets/chef-images/chef-1.jpg'
import chefTwo from '../../src/assets/chef-images/chef-2.jpg'
import chefThree from '../../src/assets/chef-images/chef-3.jpg'
import chefFour from '../../src/assets/chef-images/chef-4.jpg'

function Chef() {
    return (
        <div className="testimonial-container flex justify-center items-center flex-col py-8 md:py-12 gap-4 px-6 md:px-12 text-center">
            {/* Requires a tiny bit of CSS – see below */}
            <div className="relative inline-block">
                <div className="font-mono text-2xl sm:text-3xl md:text-3xl font-bold uppercase tracking-[0.5rem] text-stone-800">
                    <span className="text-[#ff9900]">|</span> Team
                    <span className="text-[#ff9900]">_</span>
                </div>
            </div>
            <h1 className="font-bold text-2xl md:text-3xl">
                Meet Our Professional Chefs
            </h1>

            {/* Responsive chef grid */}
            <div className="w-full bg-linear-to-br from-[#fffaf3] to-[#ffe8c8] flex flex-col md:flex-row justify-around items-center px-6 md:px-20 py-8 md:py-10 my-8 md:my-12 rounded-xl gap-8 md:gap-0">
                {/* Chef 1 */}
                <div className="chef-container flex flex-col items-center gap-4">
                    <img
                        src={chefOne}
                        alt="Evan Mattew"
                        className="h-40 w-40 md:h-65 md:w-65 rounded-lg shadow-xs object-cover"
                    />
                    <div className="chef-details text-center">
                        <h2 className="font-bold text-lg md:text-xl">Evan Mattew</h2>
                        <p className="text-sm text-gray-600">Master Chef</p>
                    </div>
                </div>

                {/* Chef 2 */}
                <div className="chef-container flex flex-col items-center gap-4">
                    <img
                        src={chefTwo}
                        alt="Diane Clarkson"
                        className="h-40 w-40 md:h-65 md:w-65 rounded-lg shadow-xs object-cover"
                    />
                    <div className="chef-details text-center">
                        <h2 className="font-bold text-lg md:text-xl">Diane Clarkson</h2>
                        <p className="text-sm text-gray-600">Master Chef</p>
                    </div>
                </div>

                {/* Chef 3 */}
                <div className="chef-container flex flex-col items-center gap-4">
                    <img
                        src={chefThree}
                        alt="Dan Rafalin"
                        className="h-40 w-40 md:h-65 md:w-65 rounded-lg shadow-xs object-cover"
                    />
                    <div className="chef-details text-center">
                        <h2 className="font-bold text-lg md:text-xl">Dan Rafalin</h2>
                        <p className="text-sm text-gray-600">Master Chef</p>
                    </div>
                </div>

                {/* Chef 4 */}
                <div className="chef-container flex flex-col items-center gap-4">
                    <img
                        src={chefFour}
                        alt="Andrew Garfield"
                        className="h-40 w-40 md:h-65 md:w-65 rounded-lg shadow-xs object-cover"
                    />
                    <div className="chef-details text-center">
                        <h2 className="font-bold text-lg md:text-xl">Andrew Garfield</h2>
                        <p className="text-sm text-gray-600">Master Chef</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Chef