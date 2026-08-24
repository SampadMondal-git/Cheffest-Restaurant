import { useState } from "react"
import { validateToken, resetPassword } from "../../api/authService"
import { useParams, Link } from "react-router-dom"
const ResetPassword = () => {

    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [, setMessage] = useState("")
    const [, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const { token } = useParams<{ token: string }>();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (password.trim() !== confirmPassword.trim()) {
                setMessage("Passwords do not match");
                setLoading(false);
                return;
            }

            if (password.length < 8) {
                setMessage("Password must be at least 8 characters long");
                setLoading(false);
                return;
            }

            if (!token) {
                throw new Error("Token is missing");
            }
            const isValid = await validateToken(token);

            if (!isValid) {
                setMessage("Invalid or expired token");
                setLoading(false);
                return;
            }

            await resetPassword(token, password, confirmPassword);

            setSuccess(true);
            setPassword("");
            setConfirmPassword("");
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center flex-col py-12 gap-4 text-center">
            <div className="max-w-3xl flex flex-col gap-6 bg-[#fff6ea] p-20 rounded-2xl">
                <h3 className="uppercase text-lg border-t border-b border-[#ff9900] font-bold w-fit mx-auto tracking-[0.3rem]">
                    Reset
                </h3>

                <h1 className="text-4xl text-center font-bold">
                    Reset Password
                </h1>
                {success ? (
                    <>
                        <p className="text-[#ff8800]">Your password has been reset successfully. You can now log in with your new password.</p>
                        <Link to="/login" className="text-[#ff8800] hover:underline">Back to Login</Link>
                    </>
                ) : (
                    <>
                        <p className="text-gray-600 max-w-md mx-auto">
                            Enter your new password to reset your account access after forgetting your previous one
                        </p>
                        <div className="form w-full">
                            <form className="flex flex-col gap-4 max-w-sm mx-auto" onSubmit={handleSubmit}>
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
                                    name="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                                    required
                                />

                                <button
                                    type="submit"
                                    className="mt-2 bg-[#ff9900] text-white font-semibold py-3 rounded-md hover:bg-[#ff8800] transition cursor-pointer"
                                >
                                    Reset Password
                                </button>
                            </form>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default ResetPassword
