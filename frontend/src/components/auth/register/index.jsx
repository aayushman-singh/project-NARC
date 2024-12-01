import { useState } from "react";
import {  Link, useNavigate } from "react-router-dom";
import {  useDispatch } from "react-redux";
import { setUserInfo } from "../../../features/userSlice";
import axios from "axios";

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    termsAccepted: false,
  });

  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [id]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.termsAccepted) {
      setErrorMessage("You must accept the terms and conditions");
      return;
    }

    setIsRegistering(true);
    setErrorMessage("");

    try {
      const { data } = await axios.post(
        "http://localhost:5001/api/users/signup",
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        },
        { headers: { "Content-Type": "application/json" } },
      );

      dispatch(setUserInfo(data));
      localStorage.setItem("userInfo", JSON.stringify(data));
      navigate("/home");
    } catch (error) {
      setErrorMessage("Registration failed. Please try again."+error);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <main className="w-full h-screen bg-gray-900 text-gray-100 flex justify-center items-center">
      <div className="w-96 bg-gray-800 text-gray-300 space-y-5 p-6 shadow-2xl border border-gray-700 rounded-xl">
        <h3 className="text-gray-100 text-xl font-semibold text-center">
          Create a New Account
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 font-bold">Full Name</label>
            <input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full mt-2 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 font-bold">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full mt-2 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 font-bold">Password</label>
            <input
              id="password"
              type="password"
              value={formData.password}
              placeholder="Create a new password"
              onChange={handleChange}
              required
              className="w-full mt-2 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"
            />
          </div>

          <div className="flex items-center">
            <input
              id="termsAccepted"
              type="checkbox"
              checked={formData.termsAccepted}
              onChange={handleChange}
              className="mr-2"
            />
            <label htmlFor="termsAccepted" className="text-sm text-gray-400">
              I accept the terms and conditions
            </label>
          </div>

          {errorMessage && (
            <span className="text-red-400 font-bold">{errorMessage}</span>
          )}

          <button
            type="submit"
            disabled={isRegistering}
            className={`w-full px-4 py-2 text-white font-medium rounded-lg ${
              isRegistering
                ? "bg-gray-600"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {isRegistering ? "Signing Up..." : "Sign Up"}
          </button>

          <div className="text-sm text-center">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-indigo-400 hover:underline font-bold"
            >
              Continue
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
};

export default Register;
