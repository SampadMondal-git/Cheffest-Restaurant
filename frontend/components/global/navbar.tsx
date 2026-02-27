import { NavLink } from "react-router-dom"
import logo from './../../src/assets/logo.png';

function Navbar() {
    const links = [
        { name: "Home", path: "/" },
        { name: "About", path: "/about" },
        { name: "Menu", path: "/menu" },
        { name: "Reservation", path: "/reservation" },
        { name: "Contact", path: "/contact" },
    ]

    return (
        <nav className="bg-black py-6">
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

                <NavLink to="/">
                    <img src={logo} alt="Logo" className="h-20 cursor-pointer" />
                </NavLink>

                <ul className="flex items-center space-x-10 text-white uppercase tracking-wide">
                    {links.map((link) => (
                        <li key={link.name}>
                            <NavLink
                                to={link.path}
                                className={({ isActive }) =>
                                    `transition cursor-pointer ${isActive
                                        ? "text-[#ff9900]"
                                        : "hover:text-[#ff9900]"
                                    }`
                                }
                            >
                                {link.name}
                            </NavLink>
                        </li>
                    ))}

                    <NavLink
                        to="/login"
                        className="bg-[#ff9900] hover:bg-[#e88c02] transition-colors py-2 px-8 text-black rounded-lg font-bold uppercase cursor-pointer"
                    >
                        Login
                    </NavLink>
                </ul>
            </div>
        </nav>
    )
}

export default Navbar
