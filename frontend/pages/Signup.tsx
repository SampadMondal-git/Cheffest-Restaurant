import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import signup from "../api/signup"

type SignupProps = {
    onLogin: (token: string, userData: any) => void;
};

const Signup = ({ onLogin }: SignupProps) => {

    const [name, setName] = useState("")
    const [phone, setPhone] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            alert("Passwords do not match")
            return
        }

        try {
            const response = await signup(name, phone, email, password, confirmPassword)
            console.log(response)

            localStorage.setItem("token", response.token)
            onLogin(response.token, response.data)

            setName("")
            setPhone("")
            setEmail("")
            setPassword("")
            setConfirmPassword("")

            navigate("/")
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className="flex justify-center items-center flex-col py-12 gap-4 text-center">
            <div className="max-w-3xl flex flex-col gap-6 bg-[#fff6ea] p-20 rounded-2xl">
                <h3 className="uppercase text-lg border-t border-b border-[#ff9900] font-bold w-fit mx-auto tracking-[0.3rem]">
                    Signup
                </h3>

                <h1 className="text-4xl text-center font-bold">
                    Sign up to your account
                </h1>

                <div className="form w-full">
                    <form className="flex flex-col gap-4 max-w-sm mx-auto" onSubmit={handleSubmit}>
                        <input
                            type="text"
                            placeholder="Enter your name"
                            name="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                            required
                        />

                        <input
                            type="tel"
                            placeholder="Enter your phone number"
                            name="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                            required
                        />

                        <input
                            type="email"
                            placeholder="Enter your email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                            required
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                            required
                        />

                        <input
                            type="password"
                            placeholder="Confirm Password"
                            name="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                            required
                        />

                        <button
                            type="submit"
                            className="mt-4 bg-[#ff9900] text-white font-semibold py-3 rounded-md hover:bg-[#ff8800] transition cursor-pointer"
                        >
                            Sign Up
                        </button>

                        <p className="text-sm">
                            Already have an account?{" "}
                            <Link
                                to="/login"
                                className="text-orange-500 hover:underline"
                            >
                                Sign In
                            </Link>
                        </p>
                    </form>
                </div>

            </div>
        </div>
    )
}

export default Signup