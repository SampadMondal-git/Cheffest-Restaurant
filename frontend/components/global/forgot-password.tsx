import { Link } from "react-router-dom"

function ResetPassword() {
    return (
        <div className="flex justify-center items-center flex-col py-12 gap-4 text-center">
            <div className="max-w-3xl flex flex-col gap-6 bg-[#fff6ea] p-20 rounded-2xl">
                <h3 className="uppercase text-lg border-t border-b border-[#ff9900] font-bold w-fit mx-auto tracking-[0.3rem]">
                    Reset
                </h3>

                <h1 className="text-4xl text-center font-bold">
                    Reset Password
                </h1>

                <p className="text-gray-600 max-w-md mx-auto">
                    Enter your email and choose a new password to regain access.
                </p>

                <div className="form w-full">
                    <form className="flex flex-col gap-4 max-w-sm mx-auto">
                        <input
                            type="email"
                            placeholder="Email"
                            name="email"
                            className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                            required
                        />

                        <input
                            type="password"
                            placeholder="New Password"
                            name="password"
                            className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                            required
                        />

                        <input
                            type="password"
                            placeholder="Confirm New Password"
                            name="confirmPassword"
                            className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                            required
                        />

                        <button
                            type="submit"
                            className="mt-2 bg-[#ff9900] text-white font-semibold py-3 rounded-md hover:bg-[#ff8800] transition cursor-pointer"
                        >
                            Reset Password
                        </button>

                        <Link
                            to="/login"
                            className="text-sm text-orange-500 hover:underline mt-2"
                        >
                            Back to login
                        </Link>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ResetPassword
