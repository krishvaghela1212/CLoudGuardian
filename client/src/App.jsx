import React, { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ThemeToggle from "./components/ThemeToggle";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Scanner from "./pages/Scanner";
import Copilot from "./pages/Copilot";
import CloudConnections from "./pages/CloudConnections";
import ProtectedRoute from "./components/ProtectedRoute";

const LandingPage = lazy(() => import("./pages/Landing/index"));

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <ThemeToggle />
          <Routes>
            <Route path="/" element={<Navigate to="/landing" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/landing"
              element={
                <Suspense
                  fallback={
                    <div className="min-h-screen bg-background flex items-center justify-center">
                      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  }
                >
                  <LandingPage />
                </Suspense>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/scanner"
              element={
                <ProtectedRoute>
                  <Scanner />
                </ProtectedRoute>
              }
            />

            <Route
              path="/copilot"
              element={
                <ProtectedRoute>
                  <Copilot />
                </ProtectedRoute>
              }
            />

            <Route
              path="/connections"
              element={
                <ProtectedRoute>
                  <CloudConnections />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/landing" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
