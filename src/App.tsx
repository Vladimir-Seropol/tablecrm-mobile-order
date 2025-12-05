import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AuthForm from "./components/AuthForm";
import OrderForm from "./components/OrderForm";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { OrderProvider } from "./contexts/OrderContext";
import { ThemeProvider, createTheme } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import "./App.css";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuth();
  return token ? <>{children}</> : <Navigate to="/" />;
};

function App() {
  const [showDebug] = useState(false);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <OrderProvider>
          {showDebug && <></>}

          <Router>
            <div className="App">
              <Toaster position="top-right" />
              <Routes>
                <Route path="/" element={<AuthForm />} />
                <Route
                  path="/order"
                  element={
                    <ProtectedRoute>
                      <OrderForm />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </div>
          </Router>
        </OrderProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
