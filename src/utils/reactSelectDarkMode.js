/**
 * React-Select Dark Mode Styles
 * 
 * This utility provides custom styles for react-select components to support dark mode.
 * Import and spread these styles into your Select component's `styles` prop.
 * 
 * Usage:
 * import { getReactSelectDarkModeStyles } from 'utils/reactSelectDarkMode';
 * 
 * <Select
 *   options={options}
 *   styles={getReactSelectDarkModeStyles()}
 *   ...
 * />
 */

/**
 * Checks if dark mode is currently active
 * @returns {boolean} true if dark mode is active
 */
export const isDarkMode = () => {
  if (typeof document === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
};

/**
 * Dark mode color palette
 */
const darkColors = {
  dark900: '#0f172a',
  dark800: '#1e293b',
  dark700: '#334155',
  dark600: '#475569',
  dark500: '#64748b',
  dark400: '#94a3b8',
  dark300: '#cbd5e1',
  dark200: '#e2e8f0',
  dark100: '#f1f5f9',
  white: '#ffffff',
  brandPrimary: '#f4d03f',
  brandSecondary: '#0a2463',
  red500: '#ef4444',
};

/**
 * Light mode color palette (default react-select colors)
 */
const lightColors = {
  neutral0: '#ffffff',
  neutral5: '#f9fafb',
  neutral10: '#f3f4f6',
  neutral20: '#e5e7eb',
  neutral30: '#d1d5db',
  neutral40: '#9ca3af',
  neutral50: '#6b7280',
  neutral60: '#4b5563',
  neutral70: '#374151',
  neutral80: '#1f2937',
  neutral90: '#111827',
  primary: '#f4d03f',
  primary25: '#fee2e2',
  primary50: '#fecaca',
  primary75: '#fca5a5',
};

/**
 * Returns custom styles for react-select that support dark mode
 * @param {Object} customStyles - Additional custom styles to merge
 * @returns {Object} Styles object for react-select
 */
export const getReactSelectDarkModeStyles = (customStyles = {}) => {
  return {
    control: (provided, state) => {
      const dark = isDarkMode();
      return {
        ...provided,
        backgroundColor: dark ? darkColors.dark700 : lightColors.neutral0,
        borderColor: state.isFocused 
          ? darkColors.brandPrimary 
          : (dark ? darkColors.dark600 : lightColors.neutral20),
        boxShadow: state.isFocused 
          ? `0 0 0 1px ${darkColors.brandPrimary}` 
          : 'none',
        color: dark ? darkColors.white : lightColors.neutral90,
        '&:hover': {
          borderColor: state.isFocused 
            ? darkColors.brandPrimary 
            : (dark ? darkColors.dark500 : lightColors.neutral30),
        },
        ...(customStyles.control ? customStyles.control(provided, state) : {}),
      };
    },
    
    menu: (provided, state) => {
      const dark = isDarkMode();
      return {
        ...provided,
        backgroundColor: dark ? darkColors.dark700 : lightColors.neutral0,
        borderColor: dark ? darkColors.dark600 : lightColors.neutral20,
        border: `1px solid ${dark ? darkColors.dark600 : lightColors.neutral20}`,
        ...(customStyles.menu ? customStyles.menu(provided, state) : {}),
      };
    },
    
    menuList: (provided, state) => {
      const dark = isDarkMode();
      return {
        ...provided,
        backgroundColor: dark ? darkColors.dark700 : lightColors.neutral0,
        ...(customStyles.menuList ? customStyles.menuList(provided, state) : {}),
      };
    },
    
    option: (provided, state) => {
      const dark = isDarkMode();
      return {
        ...provided,
        backgroundColor: state.isSelected
          ? darkColors.brandPrimary
          : state.isFocused
          ? (dark ? darkColors.dark600 : lightColors.neutral5)
          : (dark ? darkColors.dark700 : lightColors.neutral0),
        color: state.isSelected 
          ? darkColors.white 
          : (dark ? darkColors.white : lightColors.neutral90),
        '&:active': {
          backgroundColor: state.isSelected
            ? darkColors.brandPrimary
            : (dark ? darkColors.dark600 : lightColors.neutral10),
        },
        ...(customStyles.option ? customStyles.option(provided, state) : {}),
      };
    },
    
    singleValue: (provided, state) => {
      const dark = isDarkMode();
      return {
        ...provided,
        color: dark ? darkColors.white : lightColors.neutral90,
        ...(customStyles.singleValue ? customStyles.singleValue(provided, state) : {}),
      };
    },
    
    multiValue: (provided, state) => {
      const dark = isDarkMode();
      return {
        ...provided,
        backgroundColor: dark ? darkColors.dark600 : lightColors.neutral10,
        ...(customStyles.multiValue ? customStyles.multiValue(provided, state) : {}),
      };
    },
    
    multiValueLabel: (provided, state) => {
      const dark = isDarkMode();
      return {
        ...provided,
        color: dark ? darkColors.white : lightColors.neutral90,
        ...(customStyles.multiValueLabel ? customStyles.multiValueLabel(provided, state) : {}),
      };
    },
    
    multiValueRemove: (provided, state) => {
      const dark = isDarkMode();
      return {
        ...provided,
        color: dark ? darkColors.white : lightColors.neutral60,
        '&:hover': {
          backgroundColor: darkColors.red500,
          color: darkColors.white,
        },
        ...(customStyles.multiValueRemove ? customStyles.multiValueRemove(provided, state) : {}),
      };
    },
    
    input: (provided, state) => {
      const dark = isDarkMode();
      return {
        ...provided,
        color: dark ? darkColors.white : lightColors.neutral90,
        ...(customStyles.input ? customStyles.input(provided, state) : {}),
      };
    },
    
    placeholder: (provided, state) => {
      const dark = isDarkMode();
      return {
        ...provided,
        color: dark ? darkColors.dark400 : lightColors.neutral50,
        ...(customStyles.placeholder ? customStyles.placeholder(provided, state) : {}),
      };
    },
    
    indicatorSeparator: (provided, state) => {
      const dark = isDarkMode();
      return {
        ...provided,
        backgroundColor: dark ? darkColors.dark600 : lightColors.neutral30,
        ...(customStyles.indicatorSeparator ? customStyles.indicatorSeparator(provided, state) : {}),
      };
    },
    
    dropdownIndicator: (provided, state) => {
      const dark = isDarkMode();
      return {
        ...provided,
        color: dark ? darkColors.dark300 : lightColors.neutral50,
        '&:hover': {
          color: dark ? darkColors.white : lightColors.neutral70,
        },
        ...(customStyles.dropdownIndicator ? customStyles.dropdownIndicator(provided, state) : {}),
      };
    },
    
    clearIndicator: (provided, state) => {
      const dark = isDarkMode();
      return {
        ...provided,
        color: dark ? darkColors.dark300 : lightColors.neutral50,
        '&:hover': {
          color: dark ? darkColors.white : lightColors.neutral70,
        },
        ...(customStyles.clearIndicator ? customStyles.clearIndicator(provided, state) : {}),
      };
    },
    
    loadingIndicator: (provided, state) => {
      const dark = isDarkMode();
      return {
        ...provided,
        color: dark ? darkColors.white : lightColors.neutral50,
        ...(customStyles.loadingIndicator ? customStyles.loadingIndicator(provided, state) : {}),
      };
    },
    
    group: (provided, state) => {
      return {
        ...provided,
        ...(customStyles.group ? customStyles.group(provided, state) : {}),
      };
    },
    
    groupHeading: (provided, state) => {
      const dark = isDarkMode();
      return {
        ...provided,
        color: dark ? darkColors.dark300 : lightColors.neutral60,
        ...(customStyles.groupHeading ? customStyles.groupHeading(provided, state) : {}),
      };
    },
    
    noOptionsMessage: (provided, state) => {
      const dark = isDarkMode();
      return {
        ...provided,
        color: dark ? darkColors.dark300 : lightColors.neutral60,
        ...(customStyles.noOptionsMessage ? customStyles.noOptionsMessage(provided, state) : {}),
      };
    },
    
    loadingMessage: (provided, state) => {
      const dark = isDarkMode();
      return {
        ...provided,
        color: dark ? darkColors.dark300 : lightColors.neutral60,
        ...(customStyles.loadingMessage ? customStyles.loadingMessage(provided, state) : {}),
      };
    },
  };
};

export default getReactSelectDarkModeStyles;

