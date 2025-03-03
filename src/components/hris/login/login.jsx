import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import Cookies from "js-cookie";
import Login_Right from "../../../assets/login-logo.png";
import LoginImg from "../../../assets/login-right-side.jpg";

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const API_URL = process.env.REACT_APP_BACKEND_URL;

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleSubmit = async (e) => { 
    e.preventDefault();

    try {
      const response = await fetch(`https://back-81-guards.casknet.dev/v1/81guards/user/userLogin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const { user_token, user_type, employee_no, username } = data;

        // Store necessary user data in cookies
        Cookies.set("user_token", user_token);
        Cookies.set("user_type", user_type);
        Cookies.set("employee_no", employee_no);
        Cookies.set("username", username);

        navigate("/dashboard");
      } else {
        const errorData = await response.json();
        setLoginError(errorData.message || "Invalid username or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="flex gap-[10px] items-center overflow-y-hidden">
      <div className="w-1/2">
        <div className="ml-[15%]">
          <img src={Login_Right} alt="Logo" className="w-[750px] h-[350px]" />
        </div>

        <div className="ml-[20%]">
          <h2 className="text-[35px] font-semibold text-gray-800 mb-4">
            Login
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col w-fit static">
              <label
                htmlFor="username"
                className="text-md font-semibold relative top-2 ml-[7px] px-[3px] bg-gray-100 rounded-[20px] w-fit"
              >
                Username
              </label>
              <input
                id="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border-black px-[10px] py-[11px] text-ml bg-white border-2 rounded-xl h-[56px] w-[512px] focus:outline-none placeholder:text-black/25"
              />
            </div>
            <div className="flex flex-col w-fit static">
              <label
                htmlFor="password"
                className="text-md font-semibold relative top-2 ml-[7px] px-[3px] bg-gray-100 rounded-[20px] w-fit z-50"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-black px-[10px] py-[11px] text-ml bg-white border-2 rounded-xl h-[56px] w-[512px] focus:outline-none placeholder:text-black/25"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-[10px] focus:outline-none"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <FiEyeOff className="text-[#252C58] h-[20px] w-[20px]" />
                  ) : (
                    <FiEye className="text-[#252C58] h-[20px] w-[20px]" />
                  )}
                </button>
              </div>
            </div>
            <div className="mt-[20px] text-red-500">
              {loginError && <p>{loginError}</p>}
            </div>
            <div className="mt-[80px]">
              <button
                type="submit"
                className="w-[512px] bg-[#001F3F] text-[25px] text-white font-bold py-2 focus:outline-none rounded-xl mt-10"
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="flex justify-end w-1/2 h-screen overflow-y-hidden">
        <img
          src={LoginImg}
          alt="Login"
          className="object-cover w-full h-full"
        />
      </div>
    </div>
  );
}

export default Login;
