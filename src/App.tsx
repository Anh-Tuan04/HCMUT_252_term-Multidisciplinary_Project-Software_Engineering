import { useEffect, useMemo } from "react";

import { useAuth, AuthProvider } from "./contexts/AuthContext";
import { useHashRoute } from "./hooks/useHashRoute";
import { AuthLandingPage } from "./pages/auth/AuthLandingPage";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/auth/ResetPasswordPage";
import { ResetVerifyPage } from "./pages/auth/ResetVerifyPage";
import { SignInPage } from "./pages/auth/SignInPage";
import { SignUpPage } from "./pages/auth/SignUpPage";
import { ChangePasswordPage } from "./pages/ChangePasswordPage";
import MapPage from "./pages/MapPage";

const AppContent = () => {
  const { isAuthenticated } = useAuth();
  const { path, navigate } = useHashRoute();
  const cleanPath = useMemo(() => path.split("?")[0], [path]);

  useEffect(() => {
    if (cleanPath === "/") {
      navigate("/map");
      return;
    }

    if (cleanPath.startsWith("/account") && !isAuthenticated) {
      navigate("/auth/login");
      return;
    }

    if (cleanPath.startsWith("/auth") && isAuthenticated) {
      navigate("/map");
    }
  }, [cleanPath, isAuthenticated, navigate]);

  if (cleanPath === "/auth") {
    return <AuthLandingPage navigate={navigate} />;
  }

  if (cleanPath === "/auth/login") {
    return <SignInPage navigate={navigate} />;
  }

  if (cleanPath === "/auth/signup") {
    return <SignUpPage navigate={navigate} />;
  }

  if (cleanPath === "/auth/forgot") {
    return <ForgotPasswordPage navigate={navigate} />;
  }

  if (cleanPath === "/auth/reset/verify") {
    return <ResetVerifyPage navigate={navigate} />;
  }

  if (cleanPath === "/auth/reset/password") {
    return <ResetPasswordPage navigate={navigate} />;
  }

  if (cleanPath === "/account/change-password") {
    return <ChangePasswordPage navigate={navigate} />;
  }

  return <MapPage navigate={navigate} />;
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
