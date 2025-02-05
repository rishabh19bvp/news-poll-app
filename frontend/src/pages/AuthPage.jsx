import React, { useState } from "react";
import { signInWithGoogle, signUpWithEmail, loginWithEmail } from "../auth";
import { useNavigate } from "react-router-dom";

const AuthPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    const user = await signInWithGoogle();
    if (user) navigate("/profile");
  };

  const handleEmailSignUp = async () => {
    const user = await signUpWithEmail(email, password);
    if (user) navigate("/profile");
  };

  const handleEmailLogin = async () => {
    const user = await loginWithEmail(email, password);
    if (user) navigate("/profile");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-lightbg dark:bg-darkbg px-4">
      <div className="w-full max-w-sm bg-white dark:bg-gray-900 shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">
          Sign Up / Login
        </h1>

        {/* ✅ Google Login Button with Image */}
        {/* Google Login Button */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center bg-white border border-gray-300 py-2 rounded-lg hover:bg-gray-100 transition shadow-md mb-4"
        >
          <img
            src="/assets/google-logo.png"
            alt="Google"
            className="w-6 h-6 md:w-7 md:h-7 object-contain mr-3"
          />
          <span className="text-gray-800 font-medium text-sm md:text-base">
            Sign in with Google
          </span>
        </button>

        {/* ✅ Added `mb-4` to add spacing below the Google button */}

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border border-gray-300 rounded-md mb-2 focus:ring-2 focus:ring-primary focus:outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border border-gray-300 rounded-md mb-4 focus:ring-2 focus:ring-primary focus:outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleEmailSignUp}
          className="w-full bg-blue-500 text-white py-2 rounded-lg mb-2 hover:bg-blue-600 transition"
        >
          Sign Up with Email
        </button>

        <button
          onClick={handleEmailLogin}
          className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
        >
          Login with Email
        </button>
      </div>
    </div>
  );
};

export default AuthPage;
