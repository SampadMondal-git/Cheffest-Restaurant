import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import { login } from "../api/authService"

type LoginProps = {
    onLogin: (token: string, userData: any) => void;
};

const Login = ({ onLogin }: LoginProps) => {

    const [identifier, setIdentifier] = useState("")
    const [password, setPassword] = useState("")

    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const response = await login(identifier, password)
            console.log(response)

            localStorage.setItem("token", response.token)
            onLogin(response.token, response.data)

            setIdentifier("")
            setPassword("")

            navigate("/")
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className="flex justify-center items-center flex-col py-12 gap-4 text-center">
            <div className="max-w-3xl flex flex-col gap-6 bg-[#fff6ea] p-20 rounded-2xl">
                <h3 className="uppercase text-lg border-t border-b border-[#ff9900] font-bold w-fit mx-auto tracking-[0.3rem]">
                    Login
                </h3>

                <h1 className="text-4xl text-center font-bold">
                    Sign in to your account
                </h1>

                <div className="form w-full">
                    <form className="flex flex-col gap-4 max-w-sm mx-auto" onSubmit={handleSubmit}>
                        <input
                            type="text"
                            placeholder="Email or Phone number"
                            name="email"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
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

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="remember"
                                />
                                Remember me
                            </label>

                            <Link
                                to="/forgot-password"
                                className="text-orange-500 hover:underline text-sm"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            className="mt-4 bg-[#ff9900] text-white font-semibold py-3 rounded-md hover:bg-[#ff8800] transition cursor-pointer"
                        >
                            Sign In
                        </button>

                        <p className="text-sm">
                            Don&apos;t have an account?{" "}
                            <Link
                                to="/signup"
                                className="text-orange-500 hover:underline"
                            >
                                Sign Up
                            </Link>
                        </p>
                    </form>
                </div>

            </div>
        </div>
    )
}

export default Login