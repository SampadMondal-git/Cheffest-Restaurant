import chefOne from '../../src/assets/chef-images/chef-1.jpg'
import chefTwo from '../../src/assets/chef-images/chef-2.jpg'
import chefThree from '../../src/assets/chef-images/chef-3.jpg'
import chefFour from '../../src/assets/chef-images/chef-4.jpg'

function Chef() {
    return (
        <div className="testimonial-container flex justify-center items-center flex-col py-12 gap-4 px-12 text-center">
            <h1 className="text-lg uppercase border-t border-b border-[#ff9900] font-bold tracking-[0.5rem]">Team</h1>
            <h1 className="font-bold text-4xl">Meet Our Professional Chefs</h1>

            <div className="w-full bg-linear-to-br from-[#fffaf3] to-[#ffe8c8] flex justify-around items-center px-20 py-10 my-12 rounded-xl">
                <div className="chef-container flex flex-col gap-4">
                    <img src={chefOne} alt="" className="h-65 w-65 rounded-lg shadow-xs" />
                    <div className="chef-details">
                        <h2 className="font-bold text-xl">Evan Mattew</h2>
                        <p className="text-sm text-gray-600">Master Chef</p>
                    </div>
                </div>
                <div className="chef-container flex flex-col gap-4">
                    <img src={chefTwo} alt="" className="h-65 w-65 rounded-lg shadow-xs" />
                    <div className="chef-details">
                        <h2 className="font-bold text-xl">Diane Clarkson</h2>
                        <p className="text-sm text-gray-600">Master Chef</p>
                    </div>
                </div>
                <div className="chef-container flex flex-col gap-4">
                    <img src={chefThree} alt="" className="h-65 w-65 rounded-lg shadow-xs" />
                    <div className="chef-details">
                        <h2 className="font-bold text-xl">Dan Rafalin</h2>
                        <p className="text-sm text-gray-600">Master Chef</p>
                    </div>
                </div>
                <div className="chef-container flex flex-col gap-4">
                    <img src={chefFour} alt="" className="h-65 w-65 rounded-lg shadow-xs object-cover" />
                    <div className="chef-details">
                        <h2 className="font-bold text-xl">Andrew Garfield</h2>
                        <p className="text-sm text-gray-600">Master Chef</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Chef