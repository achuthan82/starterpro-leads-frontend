import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { EyeIcon, EyeSlashIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Spinner, Card } from "components/ui";
import authService from 'utils/authService';
import Logo from "assets/app-logo/logo-text.svg?.react";

// Validation schema
const passwordRules = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[A-Z])(?=.*[!@#$%^&*()_\-+={}[\];':"\\|,.<>/?])\S{8,}$/;
const schema = yup.object().shape({
  new_password: yup.string()
    .matches(
      passwordRules,
      'Password must be at least 8 characters, contain at least one letter, one uppercase letter, one number, one special character, and have no spaces'
    )
    .required('New password is required'),
  // new_password: yup.string()
  //   .min(8, 'Password must be at least 8 characters')
  //   .required('New password is required'),
  confirm_password: yup.string()
    .oneOf([yup.ref('new_password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

const ResetPassword = () => {
  const params = useParams();
  const token = params.token?.replace(/\${5}/g, ".");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [alreadyLoggedIn, setAlreadyLoggedIn] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setError('You are already logged in. Please logout to reset your password.');
      setAlreadyLoggedIn(true);
    }
  }, [])

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');

    try {
      const payload = {
        new_password: data.new_password,
        confirm_password: data.confirm_password,
      };

      const response = await authService.resetPassword(payload, token);
      console.log(response);
      // Handle successful response
      if (response && response.status === 200) {
        setIsSuccess(true);
      } else if (response && response.message && response.status !== 200) {
        setError(response.message);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error('Reset password error:', err);

      // Handle different types of errors
      if (err.response?.status === 400) {
        setError('Invalid password format. Please try again.');
      } else if (err.response?.status === 401) {
        setError('Invalid or expired reset token. Please request a new reset link.');
      } else if (err.response?.status === 422) {
        setError('Password validation failed. Please check your password requirements.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(`Request failed: ${err.message}`);
      } else {
        setError('Failed to reset password. Please check your connection and try again.');
      }
    }

    setIsLoading(false);
  };

  if (isSuccess) {
    return (
      <div className="min-h-100vh flex grid min-h-screen w-full grow grid-cols-1 place-items-center items-center justify-center bg-[linear-gradient(135deg,_rgb(10,36,99)_0%,_rgb(30,58,138)_25%,_rgb(45,55,72)_50%,_rgb(30,58,138)_75%,_rgb(10,36,99)_100%)] dark:bg-gray-900">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-yellow-200/50 dark:border-green-400/50 bg-gradient-to-br from-white to-yellow-50 dark:from-gray-700 dark:to-green-500/20 shadow-2xl">
              <CheckIcon className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="mb-2 bg-gradient-to-r from-[#b8860b] via-[#d4af37] to-[#ffd700] dark:from-yellow-400 dark:via-yellow-500 dark:to-yellow-600 bg-clip-text text-3xl font-extrabold text-transparent">
              Password reset successful!
            </h2>
            <p className="mb-8 text-gray-200 dark:text-gray-300">
              Your password has been successfully reset. You can now sign in with your new password.
            </p>
            <Link
              to="/login"
              className="group flex w-full justify-center rounded-full px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              style={{
                background:
                  "linear-gradient(to right, #b8860b, #d4af37, #ffd700)",
              }}
            >
              Continue to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-100vh flex grid min-h-screen w-full grow grid-cols-1 place-items-center items-center justify-center bg-[linear-gradient(135deg,_rgb(10,36,99)_0%,_rgb(30,58,138)_25%,_rgb(45,55,72)_50%,_rgb(30,58,138)_75%,_rgb(10,36,99)_100%)] dark:bg-gray-900">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-yellow-200/50 dark:border-red-400/50 bg-gradient-to-br from-white to-yellow-50 dark:from-gray-700 dark:to-red-500/20 shadow-2xl">
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
                className="text-[#0a2463] dark:text-red-400 h-12 w-12"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
              </svg>
            </div>
            <h2 className="mb-2 bg-gradient-to-r from-[#b8860b] via-[#d4af37] to-[#ffd700] dark:from-red-400 dark:via-red-500 dark:to-red-600 bg-clip-text text-3xl font-extrabold text-transparent">
              Invalid reset link
            </h2>
            <p className="mb-8 text-gray-200 dark:text-gray-300">
              This password reset link is invalid or has expired.
            </p>
            <div className="space-y-4">
              <Link
                to="/forgot-password"
                className="group flex w-full justify-center rounded-full px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                style={{
                  background:
                    "linear-gradient(to right, #b8860b, #d4af37, #ffd700)",
                }}
              >
                Request new reset link
              </Link>
              <Link
                to="/login"
                className="flex w-full justify-center rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-2 focus:ring-[#d4af37] dark:focus:ring-yellow-500 focus:ring-offset-2 focus:outline-none"
              >
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-100vh grid w-full grow grid-cols-1 place-items-center bg-[#f2f2f2] dark:bg-gray-900">
      <div className="w-full max-w-[28rem] p-4 sm:px-5">
        <div className="text-center">
          <div className="mb-1 inline-flex items-center justify-center">
            <img
              src={Logo}
              alt="Logo"
              style={{ maxWidth: "60%", height: "auto", objectFit: "contain" }}
            />
          </div>
          {/* <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-yellow-200/50 bg-gradient-to-br from-white to-yellow-50 shadow-2xl">
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
          </div> */}
          {/* <div className="">
            <h1 className="font-montserrat mb-2 text-4xl font-black text-white">
              <span className="text-white">Aegis</span>
              <span className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-200 bg-clip-text text-transparent">
                Suite
              </span>
            </h1>
            <p className="text-gray-200">
              Mortgage Protection Lead Management System
            </p>
          </div> */}
        </div>
        <Card className="mt-5 max-w-[28rem] rounded-lg bg-white dark:bg-gray-800 p-5 lg:p-8">
          <form onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-400">
                {error}
              </div>
            )}
            <div className="mb-6 text-center">
              <h2 className="font-montserrat mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
                Reset Password
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Enter your new password below.
              </p>
            </div>

            <div className="space-y-4">
              <label
                htmlFor="new_password"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  id="new_password"
                  name="new_password"
                  type={showPassword ? 'text' : 'password'}
                  onKeyDown={(e) => {
                    if (e.key === ' ') {
                      e.preventDefault(); 
                    }
                  }}
                  onPaste={(e) => {
                    if (e.clipboardData.getData('Text').includes(' ')) {
                      e.preventDefault(); 
                    }
                  }}
                  {...register('new_password')}
                  className={`w-full border px-3 py-2 ${errors.new_password ? "border-red-400 dark:border-red-600" : "border-gray-300 dark:border-gray-600"} rounded-lg placeholder-gray-400 dark:placeholder-gray-500 shadow-sm focus:border-[#0a2463] dark:focus:border-blue-500 focus:ring-2 focus:ring-[#0a2463] dark:focus:ring-blue-500 focus:outline-none pr-10 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  ) : (
                    <EyeIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  )}
                </button>
              </div>
              {errors.new_password && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.new_password.message}</p>}
            </div>

            <div className="space-y-4 mt-4">
              <label
                htmlFor="confirm_password"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  onKeyDown={(e) => {
                    if (e.key === ' ') {
                      e.preventDefault(); 
                    }
                  }}
                  onPaste={(e) => {
                    if (e.clipboardData.getData('Text').includes(' ')) {
                      e.preventDefault(); 
                    }
                  }}
                  {...register('confirm_password')}
                  className={`w-full border px-3 py-2 ${errors.confirm_password ? "border-red-400 dark:border-red-600" : "border-gray-300 dark:border-gray-600"} rounded-lg placeholder-gray-400 dark:placeholder-gray-500 shadow-sm focus:border-[#0a2463] dark:focus:border-blue-500 focus:ring-2 focus:ring-[#0a2463] dark:focus:ring-blue-500 focus:outline-none pr-10 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  ) : (
                    <EyeIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  )}
                </button>
              </div>
              {errors.confirm_password && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.confirm_password.message}</p>}
            </div>

            <button
              type="submit"
              className="group mt-5 flex w-full transform items-center justify-center rounded-full px-6 py-3.5 font-bold text-gray-900 dark:text-white transition-all hover:-translate-y-0.5 hover:shadow-xl"
              style={{
                background:
                  "linear-gradient(to right, #b8860b, #d4af37, #ffd700)",
              }}
              disabled={isLoading || alreadyLoggedIn}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Spinner color="info" className="size-4 border" />
                  <span className="ml-3">Resetting password...</span>
                </div>
              ) : (
                "Reset password"
              )}
            </button>
          </form>
        </Card>

        <div className="dark:text-dark-300 mt-8 flex justify-center text-xs text-gray-700 dark:text-gray-100">
          <a target="_blank" rel="noopener noreferrer" href="https://www.starterproleads.com/privacy-policy">Privacy Notice</a>
          <div className="dark:bg-dark-500 mx-2.5 my-0.5 w-px bg-gray-200 text-gray-700 dark:text-gray-100"></div>
          <a target="_blank" rel="noopener noreferrer" href="https://www.starterproleads.com/terms-of-service">Term of service</a>
        </div>
      </div>
    </main>
  );
};

export default ResetPassword; 