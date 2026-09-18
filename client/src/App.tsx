/**
 * Design reminder: Figma-reference fidelity — restrained editorial marketplace UI with paper-white surfaces,
 * compact hierarchy, navy controls, and Oma Orange accents. Do not introduce decorative visual styles.
 */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import { Storefront } from "./components/Storefront";
import { ThemeProvider } from "./contexts/ThemeContext";

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Storefront />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
