import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { PublicOnlyRoute } from "./auth/PublicOnlyRoute";
import { AuthLayout } from "./shell/AuthLayout";
import { AppLayout } from "./shell/AppLayout";
import { LoginPage } from "../features/auth/LoginPage";
import { SignupPage } from "../features/auth/SignupPage";
import { ForgotPasswordPage } from "../features/auth/ForgotPasswordPage";
import { ChatPage } from "../features/chat/ChatPage";
import { BillingPage } from "../features/billing/BillingPage";
import { SuccessPage } from "../features/billing/SuccessPage";
import { CancelPage } from "../features/billing/CancelPage";
import { NotFoundPage } from "../features/misc/NotFoundPage";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/app" replace /> },
  {
    element: (
      <PublicOnlyRoute>
        <AuthLayout />
      </PublicOnlyRoute>
    ),
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/signup", element: <SignupPage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
    ],
  },
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "/app", element: <ChatPage /> },
      { path: "/billing", element: <BillingPage /> },
    ],
  },
  { path: "/success", element: <SuccessPage /> },
  { path: "/cancel", element: <CancelPage /> },
  { path: "*", element: <NotFoundPage /> },
]);

