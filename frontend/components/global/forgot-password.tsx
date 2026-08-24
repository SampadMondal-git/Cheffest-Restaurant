import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../../api/authService";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [, setMessage] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      await forgotPassword(email);
      setMessage("A password reset link has been sent to your email. Please check your inbox.");
      setEmail("");
      setEmailSent(true);
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex justify-center items-center flex-col py-8 md:py-12 gap-4 text-center px-4">
      <div className="w-full max-w-3xl flex flex-col gap-6 bg-[#fff6ea] p-6 sm:p-10 md:p-16 lg:p-20 rounded-md">
        <div className="mx-auto flex w-fit items-center gap-3">
          <div className="h-8 w-1 rounded-full bg-[#ff9900]" />
          <h3 className="text-xl font-extrabold uppercase tracking-[0.3rem] text-gray-800">
            <span className="text-[#ff9900]">Re</span>set
          </h3>
        </div>

        <h1 className="text-xl sm:text-2xl lg:text-3xl text-center font-bold">
          Reset Password
        </h1>

        {emailSent ? (
          <div className="emailSent">
            <p className="text-[#ff8800] wrap-break-word">
              <a
                href="https://mail.google.com/mail/u/0/"
                target="_blank"
                className="hover:underline"
              >
                A password reset link has been sent to your email. Please check your inbox.
              </a>
            </p>
          </div>
        ) : (
          <>
            <p className="text-gray-600 max-w-md mx-auto">
              Enter your email to receive a password reset link.
            </p>
            <div className="form w-full">
              <form
                className="flex flex-col gap-4 w-full max-w-sm mx-auto"
                onSubmit={handleSubmit}
              >
                <input
                  type="email"
                  placeholder="Email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  required
                />
                <button
                  type="submit"
                  className="mt-2 bg-[#ff9900] text-white font-semibold py-3 rounded-md hover:bg-[#ff8800] transition cursor-pointer w-full"
                >
                  Send Reset Link
                </button>
              </form>
            </div>
          </>
        )}
        <Link to="/login" className="text-[#ff8800] hover:underline">
          Back to login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;