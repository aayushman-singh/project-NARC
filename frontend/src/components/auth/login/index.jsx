import React, { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserInfo } from "../../../features/userSlice";
import axios from "axios";

const Login = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isSigningIn) return;
    setIsSigningIn(true);
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5001/api/users/login",
        {
          email,
          password,
        },
      );

      if (response.data) {
        dispatch(setUserInfo(response.data));
        localStorage.setItem("userInfo", JSON.stringify(response.data));
      }
    } catch (error) {
      setErrorMessage("Invalid credentials, please try again.");
      console.error(error);
    } finally {
      setIsSigningIn(false);
      setLoading(false);
    }
  };

  if (localStorage.getItem("userInfo")) {
    return <Navigate to="/home" replace={true} />;
  }

  return (
    <div className="bg-gray-900 min-h-screen text-gray-100">
      <main className="w-full h-screen flex self-center place-content-center place-items-center">
        <div className="w-96 bg-gray-800 text-gray-300 space-y-5 p-6 shadow-2xl border border-gray-700 rounded-xl">
          <div className="text-center">
            <div className="mt-2">
              <h3 className="text-gray-100 text-xl font-semibold sm:text-2xl">
                Welcome Back
              </h3>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-sm text-gray-400 font-bold">Email</label>
              <input
                type="email"
                autoComplete="email"
                placeholder="example@gmail.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-2 px-3 py-2 text-gray-300 bg-gray-700 outline-none border border-gray-600 focus:border-indigo-500 shadow-sm rounded-lg transition duration-300"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 font-bold">
                Password
              </label>
              <input
                type="password"
                autoComplete="current-password"
                required
                placeholder="example123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-2 px-3 py-2 text-gray-300 bg-gray-700 outline-none border border-gray-600 focus:border-indigo-500 shadow-sm rounded-lg transition duration-300"
              />
            </div>

            {errorMessage && (
              <span className="text-red-400 font-bold">{errorMessage}</span>
            )}

            <button
              type="submit"
              disabled={isSigningIn || loading}
              className={`w-full px-4 py-2 text-white font-medium rounded-lg ${
                isSigningIn || loading
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl transition duration-300"
              }`}
            >
              {isSigningIn || loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="hover:underline font-bold text-indigo-400"
            >
              Sign up
            </Link>
          </p>

          <div className="flex flex-row text-center w-full">
            <div className="border-b-2 border-gray-600 mb-2.5 mr-2 w-full"></div>
            <div className="text-sm font-bold w-fit text-gray-400">OR</div>
            <div className="border-b-2 border-gray-600 mb-2.5 ml-2 w-full"></div>
          </div>

          {/* Add Google Sign-in functionality if required */}
          <button
            disabled={isSigningIn || loading}
            onClick={() => console.log("Google Sign-in not implemented")}
            className={`w-full flex items-center justify-center gap-x-3 py-2.5 border border-gray-700 rounded-lg text-sm font-medium ${
              isSigningIn || loading
                ? "cursor-not-allowed"
                : "hover:bg-gray-700 transition duration-300 active:bg-gray-800"
            }`}
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_17_40)">
                <path
                  d="M47.532 24.5528C47.532 22.9214 47.3997 21.2811 47.1175 19.6761H24.48V28.9181H37.4434C36.9055 31.8988 35.177 34.5356 32.6461 36.2111V42.2078H40.3801C44.9217 38.0278 47.532 31.8547 47.532 24.5528Z"
                  fill="#4285F4"
                />
                <path
                  d="M24.48 48.0016C30.9529 48.0016 36.4116 45.8764 40.3888 42.2078L32.6549 36.2111C30.5031 37.675 27.7252 38.5039 24.4888 38.5039C18.2275 38.5039 12.9187 34.2798 11.0139 28.6006H3.03296V34.7825C7.10718 42.8868 15.4056 48.0016 24.48 48.0016Z"
                  fill="#34A853"
                />
                <path
                  d="M11.0051 28.6006C9.99973 25.6199 9.99973 22.3922 11.0051 19.4115V13.2296H3.03298C-0.371021 20.0112 -0.371021 28.0009 3.03298 34.7825L11.0051 28.6006Z"
                  fill="#FBBC04"
                />
                <path
                  d="M24.48 9.49932C27.9016 9.44641 31.2086 10.7339 33.6866 13.0973L40.5387 6.24523C36.2 2.17101 30.4414 -0.068932 24.48 0.00161733C15.4055 0.00161733 7.10718 5.11644 3.03296 13.2296L11.005 19.4115C12.901 13.7235 18.2187 9.49932 24.48 9.49932Z"
                  fill="#EA4335"
                />
              </g>
              <defs>
                <clipPath id="clip0_17_40">
                  <rect width="48" height="48" fill="white" />
                </clipPath>
              </defs>
            </svg>
            {isSigningIn || loading ? "Signing In..." : "Continue with Google"}
          </button>
        </div>
      </main>
    </div>
  );
};

export default Login;
