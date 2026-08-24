import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../src/contexts/AuthContext";

const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showToast, setShowToast] = useState(false);
  const [toastActive, setToastActive] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const dismissToast = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (error) {
      setShowToast(true);
      requestAnimationFrame(() => {
        setToastActive(true);
      });
      timer = setTimeout(() => {
        dismissToast();
      }, 3000);
    } else {
      setToastActive(false);
      timer = setTimeout(() => {
        setShowToast(false);
      }, 300);
    }

    return () => clearTimeout(timer);
  }, [error, dismissToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await login(identifier, password, rememberMe);
      setIdentifier("");
      setPassword("");
      setRememberMe(false);
      navigate("/");
    } catch (error: any) {
      console.error(error);
      setError(
        error?.response?.data?.message ||
        "Login failed. Please check your email/number and password."
      );
    }
  };

  return (
    <div className="flex min-h-[70vh] w-full flex-col items-center justify-center px-4 py-8 text-center sm:px-6 lg:px-8">
      {/* Toast – unchanged */}
      {showToast && (
        <div
          role="alert"
          className={`fixed top-25 right-4 z-50 max-w-sm w-full flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 shadow-lg transition-all duration-300 ease-in-out ${toastActive
              ? "translate-x-0 opacity-100"
              : "translate-x-full opacity-0"
            }`}
        >
          <svg
            className="mt-0.5 h-5 w-5 shrink-0 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-red-800 text-left">Login failed</p>
            <p className="mt-0.5 text-sm text-red-600 text-left">{error}</p>
          </div>
          <button
            type="button"
            onClick={dismissToast}
            className="ml-2 shrink-0 text-red-400 transition-colors hover:text-red-600 cursor-pointer"
            aria-label="Dismiss error"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
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