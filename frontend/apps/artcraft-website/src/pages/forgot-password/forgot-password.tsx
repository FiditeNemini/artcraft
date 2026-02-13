import {
  faArrowLeft,
  faEnvelope,
  faLock,
  faEye,
  faEyeSlash,
  faSpinner,
  faKey,
  faCheckCircle,
} from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "@storyteller/ui-button";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PasswordResetApi } from "@storyteller/api";

import Seo from "../../components/seo";

type Step = "request" | "verify" | "success";

const ForgotPassword = () => {
  const navigate = useNavigate();

  // Step state
  const [step, setStep] = useState<Step>("request");

  // Step 1: Request reset
  const [email, setEmail] = useState("");
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  // Step 2: Verify & new password
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [redeemError, setRedeemError] = useState<string | null>(null);

  // Field-level validation errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleRequestReset = async () => {
    setRequestError(null);

    if (!email.trim()) {
      setRequestError("Please enter your email or username.");
      return;
    }

    setRequestLoading(true);

    const api = new PasswordResetApi();
    const response = await api.RequestPasswordReset({
      usernameOrEmail: email.trim(),
    });

    setRequestLoading(false);

    if (response.success) {
      setStep("verify");
    } else {
      setRequestError(
        response.errorMessage ||
          "Failed to send reset email. Please try again.",
      );
    }
  };

  const handleRedeemReset = async () => {
    setRedeemError(null);
    setFieldErrors({});

    // Client-side validation
    const errors: Record<string, string> = {};
    if (!verificationCode.trim()) {
      errors.verificationCode = "Verification code is required.";
    }
    if (!newPassword) {
      errors.newPassword = "New password is required.";
    } else if (newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters.";
    }
    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your new password.";
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setRedeemLoading(true);

    const api = new PasswordResetApi();
    const response = await api.RedeemPasswordReset({
      resetToken: verificationCode.trim(),
      newPassword: newPassword,
      newPasswordValidation: confirmPassword,
    });

    setRedeemLoading(false);

    if (response.success) {
      setStep("success");
    } else {
      setRedeemError(
        response.errorMessage ||
          "Failed to reset password. Please check your code and try again.",
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter") {
      action();
    }
  };

  return (
    <div className="relative min-h-screen bg-[#101014] text-white bg-dots flex flex-col">
      <Seo
        title="Reset Password - ArtCraft"
        description="Reset your ArtCraft password."
      />
      <div className="dotted-pattern absolute inset-0 z-[0] opacity-30" />

      <main className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#1C1C20] border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* ── Step 1: Request Reset ── */}
          {step === "request" && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold mb-2">Reset Password</h1>
                <p className="text-white/60 text-sm">
                  Enter your email to receive reset instructions
                </p>
              </div>

              <div className="space-y-4">
                {requestError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-sm text-center">
                    {requestError}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/60 uppercase tracking-wide ml-1">
                    Email or Username
                  </label>
                  <input
                    id="reset-email"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, handleRequestReset)}
                    placeholder="you@example.com"
                    className="w-full bg-black/20 border border-white/10 focus:border-primary/50 rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none transition-colors"
                  />
                </div>

                <Button
                  id="send-reset-btn"
                  className="w-full bg-primary hover:bg-primary-600 text-white border-none justify-center font-bold h-12 mt-2"
                  onClick={handleRequestReset}
                  disabled={requestLoading}
                >
                  {requestLoading ? (
                    <FontAwesomeIcon icon={faSpinner} spin />
                  ) : (
                    "Send Reset Code"
                  )}
                </Button>
              </div>
            </>
          )}

          {/* ── Step 2: Verification Code + New Password ── */}
          {step === "verify" && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold mb-2">
                  Password Reset Verification
                </h1>
                <p className="text-white/60 text-sm">
                  Enter the code sent to your email address.
                </p>
              </div>

              <div className="space-y-5">
                {redeemError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-sm text-center">
                    {redeemError}
                  </div>
                )}

                {/* Verification Code */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/60 uppercase tracking-wide ml-1">
                    Verification Code
                  </label>
                  <div className="relative">
                    <FontAwesomeIcon
                      icon={faKey}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20"
                    />
                    <input
                      id="verification-code"
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="Enter verification code"
                      className={`w-full bg-black/20 border ${
                        fieldErrors.verificationCode
                          ? "border-red-500/50"
                          : "border-white/10"
                      } focus:border-primary/50 rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/20 outline-none transition-colors`}
                    />
                  </div>
                  {fieldErrors.verificationCode && (
                    <p className="text-red-400 text-xs ml-1 mt-1">
                      {fieldErrors.verificationCode}
                    </p>
                  )}
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/60 uppercase tracking-wide ml-1">
                    New Password
                  </label>
                  <div className="relative">
                    <FontAwesomeIcon
                      icon={faLock}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20"
                    />
                    <input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className={`w-full bg-black/20 border ${
                        fieldErrors.newPassword
                          ? "border-red-500/50"
                          : "border-white/10"
                      } focus:border-primary/50 rounded-xl pl-11 pr-12 py-3 text-white placeholder-white/20 outline-none transition-colors`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                    >
                      <FontAwesomeIcon
                        icon={showNewPassword ? faEyeSlash : faEye}
                      />
                    </button>
                  </div>
                  {fieldErrors.newPassword && (
                    <p className="text-red-400 text-xs ml-1 mt-1">
                      {fieldErrors.newPassword}
                    </p>
                  )}
                </div>

                {/* Verify New Password */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/60 uppercase tracking-wide ml-1">
                    Verify New Password
                  </label>
                  <div className="relative">
                    <FontAwesomeIcon
                      icon={faLock}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20"
                    />
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, handleRedeemReset)}
                      placeholder="Enter new password again"
                      className={`w-full bg-black/20 border ${
                        fieldErrors.confirmPassword
                          ? "border-red-500/50"
                          : "border-white/10"
                      } focus:border-primary/50 rounded-xl pl-11 pr-12 py-3 text-white placeholder-white/20 outline-none transition-colors`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                    >
                      <FontAwesomeIcon
                        icon={showConfirmPassword ? faEyeSlash : faEye}
                      />
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p className="text-red-400 text-xs ml-1 mt-1">
                      {fieldErrors.confirmPassword}
                    </p>
                  )}
                </div>

                <Button
                  id="change-password-btn"
                  className="w-full bg-primary hover:bg-primary-600 text-white border-none justify-center font-bold h-12 mt-2"
                  onClick={handleRedeemReset}
                  disabled={redeemLoading}
                >
                  {redeemLoading ? (
                    <FontAwesomeIcon icon={faSpinner} spin />
                  ) : (
                    "Change Password"
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setStep("request");
                    setRedeemError(null);
                    setFieldErrors({});
                    setVerificationCode("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  className="w-full text-white/40 hover:text-white/70 text-sm text-center transition-colors mt-1"
                >
                  Didn't receive a code? Try again
                </button>
              </div>
            </>
          )}

          {/* ── Step 3: Success ── */}
          {step === "success" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500">
                <FontAwesomeIcon icon={faCheckCircle} className="text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                Password Reset Successfully
              </h3>
              <p className="text-white/60 text-sm mb-8">
                Your password has been changed. You can now log in with your new
                password.
              </p>
              <Button
                id="go-to-login-btn"
                className="w-full bg-primary hover:bg-primary-600 text-white border-none justify-center font-bold h-12"
                onClick={() => navigate("/login")}
              >
                Go to Login
              </Button>
            </div>
          )}

          {/* ── Back to Login link ── */}
          {step !== "success" && (
            <div className="mt-8 text-center text-sm">
              <Link
                to="/login"
                className="text-white/40 hover:text-white transition-colors flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon icon={faArrowLeft} /> Back to Log in
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ForgotPassword;
