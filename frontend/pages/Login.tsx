import { Link, useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { useAuth } from "../src/contexts/useAuth";

const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const navigate = useNavigate();
  const { login } = useAuth();

  const showToast = (message: string) => {
    setToastMessage(message);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!identifier.trim() || !password.trim()) {
      showToast("Please enter your email/phone and password.");
      return;
    }

    try {
      await login(identifier.trim(), password, rememberMe);
      setIdentifier("");
      setPassword("");
      setRememberMe(false);
      navigate("/");
    } catch (error: unknown) {
      const responseMessage =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;

      const message = responseMessage || "Login failed. Please check your email/number and password.";
      console.error(error);
      showToast(message);
    }
  };

  return (
    <div className="flex min-h-[70vh] w-full flex-col items-center justify-center px-4 py-8 text-center sm:px-6 lg:px-8">
      {toastMessage && (
        <div
          role="alert"
          aria-live="assertive"
          className="fixed top-6 left-1/2 z-50 flex w-[min(92vw,420px)] -translate-x-1/2 items-start gap-3 rounded-xl border border-red-200 bg-white p-4 text-[#ff9900] shadow-2xl"
        >
          <svg
            className="mt-0.5 h-6 w-6 shrink-0 text-[#ff9900]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="flex-1">
            <p className="font-medium">Login failed</p>
            <p className="mt-1 text-sm text-gray-600">{toastMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            aria-label="Close login error"
            className="rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Login form – unchanged except the heading */}
      <div className="w-full max-w-3xl flex flex-col gap-6 rounded-md border border-orange-100 bg-[#fff6ea] p-6 shadow-lg sm:p-8 lg:p-12">
        {/* ========== UPDATED HEADING – simple, fresh, no extra stuff ========== */}
        <div className="mx-auto flex w-fit items-center gap-3">
          <div className="h-8 w-1 rounded-full bg-[#ff9900]" />

          <h3 className="text-xl font-extrabold uppercase tracking-[0.3rem] text-gray-800">
            <span className="text-[#ff9900]">Log</span>in
          </h3>
        </div>
        {/* ================================================================== */}

        <h1 className="text-2xl text-center font-bold sm:text-2xl lg:text-3xl">
          Sign in to your account
        </h1>

        <div className="form w-full">
          <form
            className="mx-auto flex w-full max-w-sm flex-col gap-4"
            onSubmit={handleSubmit}
          >
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

            <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
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
  );
};

export default Login;