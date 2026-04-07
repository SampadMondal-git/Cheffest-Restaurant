import { Link } from "react-router-dom";

export default function NotFound() {
    return (
        <div className="py-12 flex items-center justify-center px-4">
            <div className="bg-amber-50 p-10 rounded-2xl shadow-md text-center max-w-md w-full">

                <h1 className="text-4xl font-bold text-[#ff9900] mb-6">
                    404
                </h1>

                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#ff9900]">
                    <span className="text-white text-3xl font-bold">?</span>
                </div>

                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Page Not Found
                </h2>

                <p className="text-gray-600 mb-8">
                    The page you are looking for doesn’t exist or was moved.
                </p>

                <Link
                    to="/"
                    className="inline-block bg-[#ff9900] hover:bg-[#ff8800] text-white px-8 py-3 rounded-lg font-semibold transition"
                >
                    Back to Home
                </Link>

            </div>
        </div>
    );
}
