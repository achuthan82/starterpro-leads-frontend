// Import Dependencies
import { useEffect, useReducer } from "react";
import PropTypes from "prop-types";

// Local Imports
import { AuthContext } from "./context";

// ----------------------------------------------------------------------

const initialState = {
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  errorMessage: null,
  user: null,
};

const reducerHandlers = {
  INITIALIZE: (state, action) => {
    const { isAuthenticated, user } = action.payload;
    return {
      ...state,
      isAuthenticated,
      isInitialized: true,
      user,
    };
  },

  LOGIN_REQUEST: (state) => {
    return {
      ...state,
      isLoading: true,
    };
  },

  LOGIN_SUCCESS: (state, action) => {
    const { user } = action.payload;
    return {
      ...state,
      isAuthenticated: true,
      isLoading: false,
      user,
    };
  },

  LOGIN_ERROR: (state, action) => {
    const { errorMessage } = action.payload;

    return {
      ...state,
      errorMessage,
      isLoading: false,
    };
  },

  LOGOUT: (state) => ({
    ...state,
    isAuthenticated: false,
    user: null,
  }),
};

const reducer = (state, action) => {
  const handler = reducerHandlers[action.type];
  if (handler) {
    return handler(state, action);
  }
  return state;
};

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const init = async () => {
      try {
        // Check for existing authentication
        const authToken = window.localStorage.getItem("authToken");
        const isAuthenticated = window.localStorage.getItem("isAuthenticated") === "true";
        const currentUser = window.localStorage.getItem("currentUser");

        console.log('AuthProvider Init - Checking stored auth:', { 
          hasToken: !!authToken, 
          isAuthenticated, 
          currentUser: currentUser ? 'exists' : 'missing'
        });

        if (isAuthenticated && authToken && currentUser) {
          // Parse the stored user data
          const userData = JSON.parse(currentUser);
          // Ensure the role is set correctly from localStorage
          const userRole = window.localStorage.getItem("userRole");
          userData.role = userRole || (userData.role_id === 1 ? 'admin' : 'agent');

          console.log('AuthProvider Init - Using stored auth data:', userData);
          
          dispatch({
            type: "INITIALIZE",
            payload: {
              isAuthenticated: true,
              user: userData,
            },
          });
          return;
        }

        // Default: not authenticated
        dispatch({
          type: "INITIALIZE",
          payload: {
            isAuthenticated: false,
            user: null,
          },
        });
      } catch (err) {
        console.error('AuthProvider Init - Unexpected error:', err);
        // Always initialize, even on error
        dispatch({
          type: "INITIALIZE",
          payload: {
            isAuthenticated: false,
            user: null,
          },
        });
      }
    };

    init();
  }, []);

  const login = async ({ username }) => {
    dispatch({
      type: "LOGIN_REQUEST",
    });

    try {
      // Get the real authentication data from localStorage (set by Login component)
      const userRole = window.localStorage.getItem("userRole");
      const currentUser = window.localStorage.getItem("currentUser");
      
      // Parse the user data from localStorage
      let userData;
      if (currentUser) {
        userData = JSON.parse(currentUser);
        // Ensure the role is set correctly
        userData.role = userRole || (userData.role_id === 1 ? 'admin' : 'agent');
      } else {
        userData = {
          id: username,
          email: username,
          role: userRole || 'agent',
          name: username.split('@')[0].replace('.', ' '),
          isShieldNest: true
        };
      }

      console.log("AuthProvider Login - Setting user data:", userData);
      
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          user: userData,
        },
      });
    } catch (err) {
      dispatch({
        type: "LOGIN_ERROR",
        payload: {
          errorMessage: err,
        },
      });
    }
  };

  const logout = async () => {
    console.log("AuthProvider Logout - Clearing all authentication data");
    
    // Clear all authentication data
    window.localStorage.removeItem("authToken");
    window.localStorage.removeItem("isAuthenticated");
    window.localStorage.removeItem("userRole");
    window.localStorage.removeItem("userEmail");
    window.localStorage.removeItem("agentId");
    window.localStorage.removeItem("currentUser");
    
    console.log("AuthProvider Logout - Data cleared, dispatching LOGOUT");
    dispatch({ type: "LOGOUT" });
  };

  if (!children) {
    return null;
  }

  return (
    <AuthContext
      value={{
        ...state,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node,
};