import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserDetailsByToken, updateUserDetailsByToken } from '../../api/manageUser';

function Profile() {
  const [user, setUser] = useState({
    name: ''
  });

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });

  const [isFirstTime, setIsFirstTime] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await getUserDetailsByToken();
        if (response.status === 200) {
          setIsFirstTime(false);
        }

        const userDetails = response.data;
        const firstName = userDetails.name.split(" ")[0];

        setUser({ name: firstName });
        setFormData({
          name: userDetails.name,
          phone: userDetails.phone || '',
          email: userDetails.email || ''
        });
      } catch (error) {
        console.error(error);
      }
    };
    fetchUserDetails();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const newData = await updateUserDetailsByToken(formData.name, formData.phone, formData.email);
      const firstName = newData.data.name.split(" ")[0];
      setUser({ name: firstName });
      // Optional: show success message
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const navigate = useNavigate();

  return (
    <div className="min-h-[90vh] bg-linear-to-br from-[#fffaf3] to-[#ffe8c8] relative overflow-hidden px-6 md:px-12 lg:px-20 py-12">
      {/* Decorative blobs (same as Welcome/Reservations) */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-[#ff9900]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#ff9900]/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

      <div className="container mx-auto max-w-3xl relative z-10">
        {/* Header with green dot */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            My Profile
          </h1>
        </div>

        {/* Main card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200 p-8 md:p-10">
          {/* Welcome message */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-[#ff9900] rounded-full"></div>
              <span className="text-sm font-semibold text-[#ff9900] uppercase tracking-wider">
                {isFirstTime ? 'Welcome!' : 'Welcome Back'}
              </span>
              <div className="w-2 h-2 bg-[#ff9900] rounded-full"></div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              {isFirstTime
                ? `Hello, ${user.name}!`
                : `${user.name}, great to see you again`}
            </h2>
            <p className="text-gray-600 mt-2">
              {isFirstTime
                ? "Let's complete your profile to enhance your dining experience."
                : "Keep your details up to date for seamless reservations."}
            </p>
          </div>

          {/* Form */}
          <form className="space-y-6 max-w-md mx-auto" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-[#ff9900] uppercase tracking-wide mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-5 py-3.5 text-gray-800 placeholder-gray-400 bg-white/90 focus:outline-none focus:ring-2 focus:ring-[#ff9900] focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-[#ff9900] uppercase tracking-wide mb-2">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                name="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-5 py-3.5 text-gray-800 placeholder-gray-400 bg-white/90 focus:outline-none focus:ring-2 focus:ring-[#ff9900] focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[#ff9900] uppercase tracking-wide mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                name="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-5 py-3.5 text-gray-800 placeholder-gray-400 bg-white/90 focus:outline-none focus:ring-2 focus:ring-[#ff9900] focus:border-transparent transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full m-0 my-4 bg-[#ff9900] text-white font-semibold py-4 rounded-xl hover:bg-[#e68a00] transition-all duration-200 shadow-md cursor-pointer hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              Update Profile
            </button>

            <button
              onClick={() => navigate(-1)}
              className="w-full text-red-500 cursor-pointer"
            >
              Go Back
            </button>
          </form>

          {/* Subtle footer note */}
          <p className="text-xs text-gray-500 text-center mt-8">
            Your information is securely stored and used only for reservation purposes.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Profile;