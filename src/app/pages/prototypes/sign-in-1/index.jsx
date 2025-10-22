// Import Dependencies
// import { Link } from "react-router";
import { useState } from "react";
import { Link, useNavigate } from "react-router";

import { EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { Spinner } from "components/ui";
import { useAuthContext } from "app/contexts/auth/context";
import { authService } from "utils/apiService";
import { getUserRole } from "configs/auth.config";
// import {logo} from "../../../../assets/app-logo/logo-text.svg"
// Local Imports
// import Logo from "assets/appLogo.svg?react";
import Logo from "assets/app-logo/logo-text-black.svg?.react";

import { Card, Input } from "components/ui";

// ----------------------------------------------------------------------

export default function SignInV1() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { login } = useAuthContext();
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error && value) setError("");
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Use the real authService to authenticate with ShieldNest API
      const response = await authService.login({
        email: formData.email,
        password: formData.password,
      });

      console.log("Login API response:", response);

      // Handle different response formats
      const responseData = response.data || response;
      // Check for token in both top level response and data object
      const token =
        response.auth_token ||
        response.token ||
        response.access_token ||
        response.accessToken ||
        responseData.token ||
        responseData.access_token ||
        responseData.accessToken ||
        responseData.auth_token;
      const user = responseData.user || responseData;

      console.log("Parsed login data:", {
        responseData,
        token,
        user,
        fullResponse: response,
      });

      // Check if we have a successful response and a valid token
      if (response && token && (user?.email || responseData?.email)) {
        // Determine user data - could be nested or direct
        const userData = user?.email
          ? user
          : responseData?.email
            ? responseData
            : null;

        if (userData) {
          // Map role ID to role name
          const roleName = getUserRole(userData);

          // Extract agent ID from the response for agent users
          let agentId = null;
          if (
            roleName === "agent" &&
            userData.agents &&
            userData.agents.length > 0
          ) {
            agentId = userData.agents[0].id;
            console.log("Agent ID extracted from login response:", agentId);
          }

          // Store user information and auth token - only if we have a valid token
          localStorage.setItem("userRole", roleName);
          localStorage.setItem("userEmail", userData.email);
          localStorage.setItem("isAuthenticated", "true");
          localStorage.setItem("authToken", token);

          // Store agent ID if available
          if (agentId) {
            localStorage.setItem("agentId", agentId.toString());
            console.log("Agent ID stored in localStorage:", agentId);
          }

          // Store complete user data for reference
          localStorage.setItem("currentUser", JSON.stringify(userData));

          // Use the context login method
          await login({
            username: formData.email,
            password: formData.password,
          });

          // Navigate based on user role
          if (roleName === "admin") {
            navigate("/admin/users", { replace: true });
          } else {
            navigate("/agent-dashboard", { replace: true });
          }
        } else {
          setError(
            "Login successful but user data not found. Please try again.",
          );
        }
      } else if (!token) {
        setError("Login failed: No authentication token received from server.");
      } else {
        setError(
          responseData?.message ||
            "Login failed. Please check your credentials.",
        );
      }
    } catch (err) {
      console.error("Login error:", err);

      // Handle different types of errors
      if (err.response?.status === 401) {
        setError("Invalid email or password. Please try again.");
      } else if (err.response?.status === 429) {
        setError("Too many login attempts. Please try again later.");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(`Login failed: ${err.message}`);
      } else {
        setError("Login failed. Please check your connection and try again.");
      }
    }

    setIsLoading(false);
  };
  return (
    <main className="min-h-100vh grid w-full grow grid-cols-1 place-items-center bg-[linear-gradient(135deg,_rgb(10,36,99)_0%,_rgb(30,58,138)_25%,_rgb(45,55,72)_50%,_rgb(30,58,138)_75%,_rgb(10,36,99)_100%)]">
      <div className="w-full max-w-[28rem] p-4 sm:px-5">
        <div className="text-center">
          {/* <Logo className="mx-auto size-16" /> */}
          <div className="mb-1 inline-flex  items-center justify-center">
          {/* <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-yellow-200/50 bg-gradient-to-br from-white to-yellow-50 shadow-2xl"> */}
            <img
              src={Logo}
              alt="Logo"
              style={{maxWidth:'60%', height:'auto', objectFit:'contain'}}
              // className="h-30 w-30"
              // className="h-25 w-25 object-contain"
            />
          </div>
          <div className="">
            {/* <h1 className="font-montserrat mb-2 text-4xl font-black text-white">
              <span className="text-white">Aegis</span>
              <span className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-200 bg-clip-text text-transparent">
                Suite
              </span>
            </h1> */}
            <p className="text-gray-200">
              Mortgage Protection Lead Management System
            </p>
          </div>
        </div>
        <Card className="mt-1 max-w-[28rem] rounded-lg bg-white p-5 lg:p-8">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <div className="mb-6 text-center">
              <h2 className="font-montserrat mb-2 text-2xl font-bold text-gray-900">
                Agency Dashboard Access
              </h2>
              <p className="text-sm text-gray-600">
                Manage your agency and team
              </p>
            </div>
            {/* <div className="mb-4 rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
              <div className="flex items-start">
                <div className="mr-3 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-white"
                  >
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div className="flex-1 text-sm">
                  <p className="mb-1 font-bold text-blue-900">
                    Demo Credentials:
                  </p>
                  <p className="font-medium text-blue-700">
                    admin@aegis.com / admin123
                  </p>
                  <button
                    type="button"
                    className="mt-2 text-xs font-bold text-blue-600 underline transition-colors hover:text-blue-800"
                  >
                    Click to auto-fill →
                  </button>
                </div>
              </div>
            </div> */}
            <div className="space-y-4">
              <Input
                id="email"
                label="Email"
                type="email"
                name="email"
                onChange={handleInputChange}
                placeholder="Enter Email"
                prefix={
                  <EnvelopeIcon
                    className="size-5 transition-colors duration-200"
                    strokeWidth="1"
                  />
                }
              />
              <Input
                id="password"
                name="password"
                label="Password"
                placeholder="Enter Password"
                type="password"
                onChange={handleInputChange}
                prefix={
                  <LockClosedIcon
                    className="size-5 transition-colors duration-200"
                    strokeWidth="1"
                  />
                }
              />
            </div>
            <div className="mt-4 space-y-2 py-2">
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3 w-3 text-white"
                  >
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                </div>
                <span className="text-sm text-gray-600">
                  14-day free trial included
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3 w-3 text-white"
                  >
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                </div>
                <span className="text-sm text-gray-600">
                  No credit card required
                </span>
              </div>
            </div>
            <button
              type="submit"
              className="group mt-5 flex w-full transform items-center justify-center rounded-full px-6 py-3.5 font-bold text-gray-900 transition-all hover:-translate-y-0.5 hover:shadow-xl"
              style={{
                background:
                  "linear-gradient(to right, #b8860b, #d4af37, #ffd700)",
              }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Spinner color="info" className="size-4 border" />
                  <span className="ml-3">Signing in...</span>
                </div>
              ) : (
                <>
                  Sign In to Your Account
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1"
                  >
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </>
              )}
            </button>
            <div className="mt-4 flex items-center justify-between pt-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="text-aegis-gold focus:ring-aegis-gold h-4 w-4 rounded border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-aegis-blue hover:text-aegis-navy text-sm font-semibold transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="mt-6 border-t border-gray-200 pt-6">
              <p className="text-center text-sm text-gray-600">
                Don&apos;t have an account?{" "}
                <a
                  href="#"
                  className="inline-block bg-gradient-to-r from-[#b8860b] via-[#d4af37] to-[#ffd700] bg-clip-text font-bold text-transparent transition-all hover:from-[#d4af37] hover:via-[#ffd700] hover:to-[#fff8dc]"
                >
                  Contact Sales
                </a>
              </p>
            </div>
            <div className="mt-6 flex items-center justify-center gap-6 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
                </svg>
                <span>Bank-Level Security</span>
              </div>
              <div className="flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M20 6 9 17l-5-5"></path>
                </svg>
                <span>SOC 2 Compliant</span>
              </div>
            </div>
          </form>
        </Card>
        <div className="mt-8 flex items-center justify-center gap-8 text-center">
          <div>
            <div className="text-2xl font-bold text-yellow-400">10,000+</div>
            <p className="text-xs text-gray-300">Active Users</p>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-400">4.9/5</div>
            <p className="text-xs text-gray-300">User Rating</p>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-400">847%</div>
            <p className="text-xs text-gray-300">Avg ROI</p>
          </div>
        </div>

        <div className="dark:text-dark-300 mt-8 flex justify-center text-xs text-gray-400">
          <a href="##">Privacy Notice</a>
          <div className="dark:bg-dark-500 mx-2.5 my-0.5 w-px bg-gray-200"></div>
          <a href="##">Term of service</a>
        </div>
      </div>
    </main>
  );
}
