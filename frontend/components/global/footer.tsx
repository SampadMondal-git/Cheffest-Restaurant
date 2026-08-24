import logo from "../../src/assets/logo.png";

function Footer() {
    return (
        <>
            <footer className="bg-black text-[#ff9900] relative overflow-hidden">

                <div className="px-6 py-10 md:px-12 md:py-16 lg:py-20">
                    <div className="max-w-6xl mx-auto">

                        {/* Mobile & Tablet layout – logo removed */}
                        <div className="flex flex-col items-center text-center space-y-10 md:space-y-12 lg:hidden">
                            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                                <div className="space-y-3">
                                    <h3 className="uppercase tracking-[0.4rem] border-t border-b border-[#ff9900]/70 w-fit mx-auto py-1 text-sm md:text-base font-light">
                                        Contact
                                    </h3>
                                    <div className="space-y-1.5 text-sm md:text-base text-[#e0e0e0]">
                                        <p>Park Street, Kolkata, West Bengal 700016</p>
                                        <p>
                                            <span className="text-[#ff9900] font-semibold">Call:</span> +91 1234 5678 90
                                        </p>
                                        <p className="text-[#ff9900] hover:text-[#ffb84d] transition-colors duration-200">
                                            example123@mail.com
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="uppercase tracking-[0.4rem] border-t border-b border-[#ff9900]/70 w-fit mx-auto py-1 text-sm md:text-base font-light">
                                        Working Hours
                                    </h3>
                                    <div className="space-y-1.5 text-sm md:text-base text-[#e0e0e0]">
                                        <p>
                                            <span className="text-[#ff9900] font-semibold">Mon - Fri:</span> 10:00 AM – 10:00 PM
                                        </p>
                                        <p>
                                            <span className="text-[#ff9900] font-semibold">Sat - Sun:</span> 12:00 PM – 11:30 PM
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Desktop layout – unchanged */}
                        <div className="hidden lg:grid lg:grid-cols-3 gap-16">
                            <div className="text-[#e0e0e0] space-y-5">
                                <h3 className="uppercase tracking-[0.4rem] border-t border-b border-[#ff9900]/70 w-fit py-1 font-light">
                                    Contact
                                </h3>
                                <div className="space-y-2">
                                    <p>Park Street, Kolkata, West Bengal 700016</p>
                                    <p>
                                        <span className="text-[#ff9900] font-semibold">Call:</span> +91 1234 5678 90
                                    </p>
                                    <p className="text-[#ff9900] hover:text-[#ffb84d] transition-colors duration-200">
                                        example123@mail.com
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col items-center text-center space-y-5">
                                <img
                                    src={logo}
                                    alt="logo"
                                    className="h-24 opacity-100"
                                />
                                <div className="relative">
                                    <p className="tracking-wide italic text-[#e0e0e0]">
                                        Elevated Dining Without the Pretension
                                    </p>
                                    <span className="block w-12 h-0.5 bg-[#ff9900] mx-auto mt-2 rounded-full" />
                                </div>
                            </div>

                            <div className="text-[#e0e0e0] space-y-5 md:text-right">
                                <h3 className="uppercase tracking-[0.4rem] border-t border-b border-[#ff9900]/70 w-fit md:ml-auto py-1 font-light">
                                    Working Hours
                                </h3>
                                <p>
                                    <span className="text-[#ff9900] font-semibold">Mon - Fri:</span> 10:00 AM – 10:00 PM
                                </p>
                                <p>
                                    <span className="text-[#ff9900] font-semibold">Sat - Sun:</span> 12:00 PM – 11:30 PM
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </footer>

            {/* Copyright – unchanged */}
            <div className="bg-black text-white pb-6 pt-3 border-t border-[#ff9900]/30">
                <p className="text-center text-xs sm:text-sm md:text-base px-4 tracking-wide">
                    Copyright &copy; <span className="text-[#ff9900] font-semibold">Cheffest</span>{" "}
                    {new Date().getFullYear()} | Designed by{" "}
                    <a
                        href="https://sampad-mondal-portfolio.vercel.app/"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#ff9900] hover:text-[#ffb84d] transition-colors duration-200 font-medium relative after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-px after:bg-[#ff9900] after:transition-all after:duration-300 hover:after:w-full"
                    >
                        Sampad Mondal
                    </a>
                </p>
            </div>
        </>
    );
}

export default Footer;