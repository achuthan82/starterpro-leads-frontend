import { useState } from "react";
import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
// import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Spinner } from "components/ui";
import authService from "utils/authService";
import { Card } from "components/ui";
import Logo from "assets/app-logo/logo-text.svg?.react";

// Validation schema
const schema = yup.object().shape({
  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Email is required"),
});

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await authService.forgotPassword({ email: data.email });

      // Handle successful response
      if (response && (response.message || response.status === 200)) {
        setSubmittedEmail(data.email);
        setIsSubmitted(true);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error("Forgot password error:", err);

      // Handle different types of errors
      if (err.response?.status === 404) {
        setError(
          "Email address not found. Please check your email and try again.",
        );
      } else if (err.response?.status === 429) {
        setError("Too many requests. Please wait a moment and try again.");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(`Request failed: ${err.message}`);
      } else {
        setError(
          "Failed to send reset link. Please check your connection and try again.",
        );
      }
    }

    setIsLoading(false);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-100vh flex grid min-h-screen w-full grow grid-cols-1 place-items-center items-center justify-center bg-[#f2f2f2]">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="mb-1 inline-flex items-center justify-center">
              <img
                src={Logo}
                alt="Logo"
                style={{
                  maxWidth: "60%",
                  height: "auto",
                  objectFit: "contain",
                }}
              />
            </div>

            {/* Header */}
            <h2 className="mb-2 bg-gradient-to-r from-[#b8860b] via-[#d4af37] to-[#ffd700] bg-clip-text text-3xl font-extrabold text-transparent">
              Check your email
            </h2>

            {/* Message */}
            <p className="mb-8 text-gray-600">
              We&apos;ve sent a password reset link to{" "}
              <strong className="text-gray-600">{submittedEmail}</strong>
            </p>

            {/* Tip Box */}
            <div className="mb-6 rounded-lg border border-yellow-300 bg-yellow-50 p-4">
              <p className="text-sm text-yellow-800">
                If you don&apos;t see the email in your inbox, check your spam
                folder.
              </p>
            </div>

            {/* Buttons */}
            <div className="space-y-4">
              <Link
                to="/login"
                className="group flex w-full justify-center rounded-full px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                style={{
                  background:
                    "linear-gradient(to right, #b8860b, #d4af37, #ffd700)",
                }}
              >
                Back to login
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>

              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setSubmittedEmail("");
                }}
                className="flex w-full justify-center rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 focus:ring-2 focus:ring-[#d4af37] focus:ring-offset-2 focus:outline-none"
              >
                Try another email
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-100vh grid w-full grow grid-cols-1 place-items-center bg-[#f2f2f2]">
      <div className="w-full max-w-[28rem] p-4 sm:px-5">
        <div className="text-center">
          {/* <Logo className="mx-auto size-16" /> */}
          <div className="mb-1 inline-flex items-center justify-center">
            <img
              src={Logo}
              alt="Logo"
              style={{ maxWidth: "60%", height: "auto", objectFit: "contain" }}
            />
          </div>
          <div className="">
            <p className="text-gray-600">
              Mortgage Protection Lead Management System
            </p>
          </div>
        </div>
        <Card className="mt-5 max-w-[28rem] rounded-lg bg-white p-5 lg:p-8">
          <form onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <div className="mb-6 text-center">
              <h2 className="font-montserrat mb-2 text-2xl font-bold text-gray-900">
                Forgot Password?
              </h2>
              <p className="text-sm text-gray-600">
                No worries, we&apos;ll help you get back in.
              </p>
            </div>
            <div className="space-y-4">
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                {...register("email")}
                className={`w-full border px-3 py-2 ${errors.email ? "border-red-400" : "border-gray-300"} rounded-lg placeholder-gray-400 shadow-sm focus:border-[var(--color-atoll)] focus:ring-2 focus:ring-[var(--color-atoll)] focus:outline-none`}
                placeholder="Enter your email"
              />
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
                  <span className="ml-3">Sending reset link...</span>
                </div>
              ) : (
                "Send reset link"
              )}
            </button>
          </form>
        </Card>

        <div className="dark:text-dark-300 mt-8 flex justify-center text-xs text-gray-600">
          <a href="##">Privacy Notice</a>
          <div className="dark:bg-dark-500 mx-2.5 my-0.5 w-px bg-gray-200 text-gray-600"></div>
          <a href="##">Term of service</a>
        </div>
      </div>
    </main>
    // <div className="min-h-screen bg-[var(--color-ecru-white)]">
    //   <div className="flex min-h-full">
    //     {/* Left side - Branding */}
    //     <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[var(--color-atoll)] via-[var(--color-shadow-green)] to-[var(--color-beryl-green)] relative overflow-hidden">
    //       <div className="flex flex-col justify-center px-12 text-white z-10">
    //         <div className="mb-8">
    //           <div className="flex items-center mb-6">
    //             <img
    //               src="/shieldnest-icon.png"
    //               alt="ShieldNest"
    //               className="w-16 h-16 mr-4 object-contain"
    //             />
    //             <div>
    //               <h1 className="text-4xl font-bold">ShieldNest</h1>
    //               <p className="text-lg opacity-90">Password Recovery</p>
    //             </div>
    //           </div>
    //           <p className="text-xl text-white/90 mb-6">
    //             Forgot your password? No worries, we&apos;ll help you get back in.
    //           </p>
    //         </div>
    //       </div>
    //       <div className="absolute inset-0 bg-black/20"></div>
    //       <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full"></div>
    //       <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/5 rounded-full"></div>
    //     </div>

    //     {/* Right side - Form */}
    //     <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
    //       <div className="mx-auto w-full max-w-sm lg:w-96">
    //         {/* Header */}
    //         <div className="text-center lg:text-left mb-8">
    //           <div className="flex items-center justify-center lg:justify-start mb-6 lg:hidden">
    //             <img
    //               src="/shieldnest-icon.png"
    //               alt="ShieldNest"
    //               className="w-12 h-12 mr-3 object-contain"
    //             />
    //             <div>
    //               <h1 className="text-2xl font-bold text-[var(--color-atoll)]">ShieldNest</h1>
    //             </div>
    //           </div>
    //           <h2 className="text-2xl font-bold text-gray-900 lg:text-3xl">Forgot your password?</h2>
    //           <p className="mt-2 text-sm text-gray-600">
    //             Enter your email address and we&apos;ll send you a link to reset your password.
    //           </p>
    //         </div>

    //         {/* Form */}
    //         <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
    //           {error && (
    //             <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
    //               {error}
    //             </div>
    //           )}

    //           <div>
    //             <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
    //               Email address
    //             </label>
    //             <input
    //               id="email"
    //               name="email"
    //               type="email"
    //               {...register('email')}
    //               className={`w-full px-3 py-2 border ${errors.email ? 'border-red-400' : 'border-gray-300'} rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-atoll)] focus:border-[var(--color-atoll)]`}
    //               placeholder="Enter your email"
    //             />
    //             {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
    //           </div>

    //           <div>
    //             <button
    //               type="submit"
    //               disabled={isLoading}
    //               className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[var(--color-atoll)] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-atoll)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
    //             >
    //               {isLoading ? (
    //                 <div className="flex items-center justify-center">
    //                   <Spinner color="info" className="size-4 border" />
    //                   <span className="ml-3">Sending reset link...</span>
    //                 </div>
    //               ) : (
    //                 'Send reset link'
    //               )}
    //             </button>
    //           </div>

    //           <div className="text-center">
    //             <Link
    //               to="/shieldnest/login"
    //               className="inline-flex items-center text-sm text-[var(--color-atoll)] hover:text-opacity-80 transition-colors duration-200"
    //             >
    //               <ArrowLeftIcon className="w-4 h-4 mr-2" />
    //               Back to login
    //             </Link>
    //           </div>
    //         </form>

    //         {/* Footer */}
    //         <div className="mt-8 text-center">
    //           <p className="text-xs text-gray-500">
    //             © 2025 ShieldNest. All rights reserved.
    //           </p>
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // </div>
  );
};

export default ForgotPassword;
