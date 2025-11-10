"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@heroui/input";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Spinner } from "@heroui/spinner";
import { Checkbox } from "@heroui/checkbox";
import { Eye, EyeOff, Shield, Lock } from "lucide-react";

import { useAuth } from "../../auth-context";

const AdminLoginPage = memo(function AdminLoginPage() {
  const [userId, setUserId] = useState("9999911111");
  const [password, setPassword] = useState("janParty@123");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [userIdError, setUserIdError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const { login, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push("/admin");
    }
  }, [isAuthenticated, isLoading, router]);

  const validateForm = useCallback(() => {
    let isValid = true;

    setUserIdError("");
    setPasswordError("");
    setError("");

    if (!userId.trim()) {
      setUserIdError("User ID is required");
      isValid = false;
    }

    if (!password.trim()) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      isValid = false;
    }

    return isValid;
  }, [userId, password]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);
      setError("");

      try {
        const success = await login(parseInt(userId), password);

        if (success) {
          router.push("/admin");
        } else {
          setError("Login failed. Please check your credentials.");
        }
      } catch (err) {
        setError("An unexpected error occurred. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [login, userId, password, router, validateForm],
  );

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 overflow-auto">
      <Card className="w-full max-w-md shadow-xl border-0 min-h-[500px]">
        <CardHeader className="flex flex-col items-center pb-2">
          <h1 className="text-2xl font-bold text-center text-gray-800">
            Admin Portal
          </h1>
          <p className="text-gray-600 text-center text-sm">
            Secure access to the administration panel
          </p>
        </CardHeader>
        <CardBody className="px-6 pb-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* User ID Field */}
            <div className="space-y-2">
              <Input
                classNames={{
                  input: "text-sm",
                  label: "text-gray-700 font-medium",
                }}
                errorMessage={userIdError}
                isInvalid={!!userIdError}
                label="User ID"
                placeholder="Enter your user ID"
                startContent={
                  <div className="text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                }
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Input
                classNames={{
                  input: "text-sm pr-10",
                  label: "text-gray-700 font-medium",
                }}
                endContent={
                  <button
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer focus:outline-none"
                    type="button"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                }
                errorMessage={passwordError}
                isInvalid={!!passwordError}
                label="Password"
                placeholder="Enter your password"
                startContent={
                  <div className="text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                }
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <Checkbox
                classNames={{
                  label: "text-gray-600 text-sm",
                }}
                isSelected={rememberMe}
                size="sm"
                onValueChange={setRememberMe}
              >
                Remember me
              </Checkbox>
              <button
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                type="button"
                onClick={() =>
                  alert(
                    "Please contact system administrator for password reset.",
                  )
                }
              >
                Forgot password?
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start">
                <div className="flex-shrink-0 mr-2 mt-0.5">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      clipRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      fillRule="evenodd"
                    />
                  </svg>
                </div>
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button - FIXED TEXT VISIBILITY */}
            <button
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 cursor-pointer hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white !important font-bold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl disabled:shadow-none transition-all duration-300 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              disabled={isSubmitting || isLoading}
              style={{ color: "white !important" }}
              type="submit"
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" style={{ color: "white" }} />
                  <span style={{ color: "white", fontWeight: "600" }}>
                    Signing In...
                  </span>
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" style={{ color: "green" }} />
                  <span style={{ color: "green", fontWeight: "600" }}>
                    Sign In
                  </span>
                </>
              )}
            </button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
});

AdminLoginPage.displayName = "AdminLoginPage";

export default AdminLoginPage;
