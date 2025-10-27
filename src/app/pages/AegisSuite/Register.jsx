import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate, useParams } from "react-router";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { Spinner } from "components/ui";
import authService from "utils/authService";
import Logo from "assets/app-logo/logo-text.svg?.react";

// import Logo from "assets/appLogo.svg?react";
// import DashboardMeet from "assets/illustrations/dashboard-meet.svg?react";

// Validation schema
const phoneRegExp = /^[0-9]{10}$/;
// const phoneRegExp = /^(\+1)?[ -.]?\(?([2-9][0-8][0-9])\)?[ -.]?([2-9][0-9]{2})[ -.]?([0-9]{4})$/;
const passwordRules =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[A-Z])(?=.*[!@#$%^&*()_\-+={}[\];':"\\|,.<>/?])\S{8,}$/;

const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  agency_name: yup.string().required("Agency Name is required"),
  phone: yup
    .string()
    .matches(phoneRegExp, "Phone number must be exactly 10 digits")
    .required("Phone is required"),
  // password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
  password: yup
    .string()
    .matches(
      passwordRules,
      "Password must be at least 8 characters, contain at least one letter, one uppercase letter, one number, one special character, and have no spaces",
    )
    .required("Password is required"),
  confirm_password: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords must match")
    .required("Confirm Password is required"),
});

export default function Register() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const registeredName = searchParams.get("name") || "";
  const registeredPhone = searchParams.get("phone") || "";
  const agencyName = searchParams.get("agency_name") || "";
  const params = useParams();
  const register_token = params.token.replace(/\${5}/g, ".");

  const [showPassword, setShowPassword] = useState(false);
  const [alreadyLoggedIn, setAlreadyLoggedIn] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: registeredName,
      agency_name: agencyName,
      phone: registeredPhone,
      password: "",
      confirm_password: "",
    },
  });

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setError(
        "You are already logged in. Please logout to register a new account.",
      );
      setAlreadyLoggedIn(true);
    }
  }, []);

  // Pre-fill fields if params change
  // (for react-hook-form, setValue is needed if params can change after mount)
  // Not strictly necessary if params are static on mount

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError("");
    setSuccess(false);
    try {
      const payload = {
        name: data.name,
        agency_name: data.agency_name,
        phone: data.phone,
        password: data.password,
        confirm_password: data.confirm_password,
      };
      const response = await authService.registerFromInvitation(
        payload,
        register_token,
      );
      console.log(response);
      if (response.status === 200) {
        setSuccess(true);
        setError("");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(
          response.message
            ? response.message
            : "Registration failed. Please try again.",
        );
      }
    } catch (err) {
      if (err?.message) setError(err.message);
      else if (err?.error) setError(err.error);
      else setError("Registration failed. Please try again.");
    }
    setIsLoading(false);
  };

  /*useEffect(() => {
    setValue('name', registeredName)
    setValue('phone', registeredPhone)
    if (agencyName) setValue('agency_name', agencyName)
  }, [])*/

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f2f2f2] dark:bg-gray-900">
      <div className="mx-auto w-full max-w-md px-4">
        {/* Logo and Brand */}
        {/* <div className="text-center mb-8">
          <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-yellow-200/50 bg-gradient-to-br from-white to-yellow-50 shadow-2xl">
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
              className="text-aegis-navy h-12 w-12"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
            </svg>
          </div>
          <div className="">
            <h1 className="font-montserrat mb-2 text-4xl font-black text-white">
              <span className="text-white">Aegis</span>
              <span className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-200 bg-clip-text text-transparent">
                Suite
              </span>
            </h1>
            <p className="text-gray-200">
              Mortgage Protection Lead Management System
            </p>
          </div>
        </div> */}
        <div className="mb-1 inline-flex items-center justify-center">
          <img
            src={Logo}
            alt="Logo"
            style={{ maxWidth: "60%", height: "auto", objectFit: "contain" }}
          />
        </div>
        {/* Register Form Card */}
        <div className="rounded-lg bg-white dark:bg-gray-800 p-8 shadow-xl">
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-2xl font-bold text-[#0a2463] dark:text-blue-400">
              Create your account
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Complete your registration to access Starterpro Leads
            </p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-400">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-3 text-sm text-green-700 dark:text-green-400">
                Registration successful! Redirecting to login...
              </div>
            )}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-[#0a2463] dark:text-blue-400"
              >
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                {...register("name")}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 transition-colors focus:border-[#0a2463] dark:focus:border-blue-500 focus:ring-2 focus:ring-[#0a2463] dark:focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="Enter your name"
                defaultValue={registeredName}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="agency_name"
                className="mb-2 block text-sm font-medium text-[#0a2463] dark:text-blue-400"
              >
                Agency Name
              </label>
              <input
                id="agency_name"
                name="agency_name"
                type="text"
                {...register("agency_name")}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 transition-colors focus:border-[#0a2463] dark:focus:border-blue-500 focus:ring-2 focus:ring-[#0a2463] dark:focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="Enter your agency name"
                defaultValue={agencyName}
              />
              {errors.agency_name && (
                <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                  {errors.agency_name.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-medium text-[#0a2463] dark:text-blue-400"
              >
                Phone
              </label>
              <input
                id="phone"
                name="phone"
                type="text"
                {...register("phone")}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 transition-colors focus:border-[#0a2463] dark:focus:border-blue-500 focus:ring-2 focus:ring-[#0a2463] dark:focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="Enter your US phone number"
                defaultValue={registeredPhone}
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                  {errors.phone.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-[#0a2463] dark:text-blue-400"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  onKeyDown={(e) => {
                    if (e.key === " ") {
                      e.preventDefault();
                    }
                  }}
                  onPaste={(e) => {
                    if (e.clipboardData.getData("Text").includes(" ")) {
                      e.preventDefault();
                    }
                  }}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 pr-10 transition-colors focus:border-[#0a2463] dark:focus:border-blue-500 focus:ring-2 focus:ring-[#0a2463] dark:focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  ) : (
                    <EyeIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="confirm_password"
                className="mb-2 block text-sm font-medium text-[#0a2463] dark:text-blue-400"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirm_password")}
                  onKeyDown={(e) => {
                    if (e.key === " ") {
                      e.preventDefault();
                    }
                  }}
                  onPaste={(e) => {
                    if (e.clipboardData.getData("Text").includes(" ")) {
                      e.preventDefault();
                    }
                  }}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 pr-10 transition-colors focus:border-[#0a2463] dark:focus:border-blue-500 focus:ring-2 focus:ring-[#0a2463] dark:focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="Repeat your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  ) : (
                    <EyeIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  )}
                </button>
              </div>
              {errors.confirm_password && (
                <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                  {errors.confirm_password.message}
                </p>
              )}
            </div>
            <div>
              <button
                type="submit"
                disabled={isLoading || alreadyLoggedIn}
                className="w-full rounded-lg bg-gradient-to-b from-[#f4d03f] to-[#e6c23a] dark:from-blue-600 dark:to-blue-700 px-4 py-3 font-semibold text-white transition-all duration-200 hover:from-[#e6c23a] hover:to-[#d4b82a] dark:hover:from-blue-700 dark:hover:to-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Spinner color="info" className="size-4 border" />
                    <span className="ml-3">Signing up...</span>
                  </div>
                ) : (
                  "Sign Up"
                )}
              </button>
            </div>
            <div className="text-center">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Already have an account?{" "}
              </span>
              <Link
                to="/login"
                className="text-sm text-[#0a2463] dark:text-blue-400 transition-colors duration-200 hover:text-[#0a1a4a] dark:hover:text-blue-300"
              >
                Sign In
              </Link>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              © 2025 AegisSuite. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
