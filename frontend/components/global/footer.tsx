import logo from "../../src/assets/logo.png";

function Footer() {
    return (
        <>
            <footer className="bg-black text-[#ff9900] px-12 py-16">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">

                    <div className="text-white space-y-5">
                        <h3 className="uppercase tracking-[0.4rem] border-t border-b border-[#ff9900] w-fit py-1">
                            Contact
                        </h3>
                        <div className="space-y-2">
                            <p>Park Street, Kolkata, West Bengal 700016</p>
                            <p>
                                <span className="text-[#ff9900] font-semibold">Call:</span> +91 1234 5678 90
                            </p>
                            <p className="text-[#ff9900] hover:text-white transition">example123@mail.com</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center md:items-center text-center space-y-5">
                        <img src={logo} alt="logo" className="h-24 opacity-100" />
                        <p className="tracking-wide italic">
                            Elevated Dining Without the Pretension
                        </p>
                    </div>

                    <div className="text-white space-y-5 md:text-right">
                        <h3 className="uppercase tracking-[0.4rem] border-t border-b border-[#ff9900] w-fit md:ml-auto py-1">
                            Working Hours
                        </h3>
                        <p>
                            <span className="text-[#ff9900] font-semibold">Mon - Fri: </span>10:00 AM – 10:00 PM
                        </p>
                        <p>
                            <span className="text-[#ff9900] font-semibold">Sat - Sun: </span>12:00 PM – 11:30 PM
                        </p>
                    </div>
                </div>
            </footer>

            <div className="bg-black text-white pb-6 pt-3 border-t border-[#ff9900]/40">
                <p className="text-center">Copyright &copy; <span className="text-[#ff9900] font-semibold">Cheffest</span> {new Date().getFullYear()} |
                    Designed by{" "}
                    <a
                        href="https://sampad-mondal-portfolio.vercel.app/"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#ff9900] hover:text-white transition font-medium"
                    >
                        Sampad Mondal
                    </a>
                </p>
            </div>
        </>
    );
}

export default Footer;
