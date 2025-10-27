import Logo from "assets/app-logo/logo-text.svg?.react";

const AegisSuiteLoader = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* AegisSuite Logo with Spin Animation */}
      <div className="relative">
        <div className={`${sizeClasses[size]} animate-spin`}>
          <div className="absolute inset-0 border-4 border-[var(--color-botticelli)] rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-[var(--color-atoll)] rounded-full animate-spin"></div>
        </div>
        <div className={`absolute inset-0 flex items-center justify-center ${sizeClasses[size]}`}>
          <img 
            src={Logo}
            alt="AegisSuite" 
            className="w-40 h-40 object-contain opacity-80"
          />
        </div>
      </div>

      {/* Loading Text */}
      {text && (
        <div className={`${textSizeClasses[size]} font-medium text-[var(--color-atoll)] dark:text-blue-400 animate-pulse`}>
          {text}
        </div>
      )}

      {/* Animated Dots */}
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-[var(--color-atoll)] dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-[var(--color-atoll)] dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-[var(--color-atoll)] dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
};

export default AegisSuiteLoader;
