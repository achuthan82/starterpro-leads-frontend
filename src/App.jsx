// Import Dependencies
import { RouterProvider } from "react-router";
import { useEffect } from "react";

// Local Imports
import { AuthProvider } from "app/contexts/auth/Provider";
import { BreakpointProvider } from "app/contexts/breakpoint/Provider";
import { LocaleProvider } from "app/contexts/locale/Provider";
import { SidebarProvider } from "app/contexts/sidebar/Provider";
import { ThemeProvider } from "app/contexts/theme/Provider";
import { CallProvider } from "app/contexts/call/Provider";
import router from "app/router/router";

// ----------------------------------------------------------------------

function App() {
  // This function toggles dark mode
  function toggleDarkMode() {
    // Get the <html> element
    const htmlElement = document.documentElement;

    // Check if it already has the 'dark' class
    if (htmlElement.classList.contains('dark')) {
      // If it does, remove it
      htmlElement.classList.remove('dark');
      // Optional: save preference
      localStorage.theme = 'light';
    }
  }

  useEffect(() => {
    toggleDarkMode();
  }, []);
  return (
    <AuthProvider>
      <ThemeProvider>
        <LocaleProvider>
          <BreakpointProvider>
            <SidebarProvider>
              <CallProvider>
                <RouterProvider router={router} />
              </CallProvider>
            </SidebarProvider>
          </BreakpointProvider>
        </LocaleProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
