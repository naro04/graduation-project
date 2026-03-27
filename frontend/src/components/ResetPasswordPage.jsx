import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../services/auth";

const LogoDesktop = new URL("../images/LogoDesktop.png", import.meta.url).href;
const LogoMobile = new URL("../images/LogoMobile.jpg", import.meta.url).href;
const Rectangle12 = new URL("../images/Shapes/Rectangle 12.png", import.meta.url).href;
const Rectangle13 = new URL("../images/Shapes/Rectangle 13.png", import.meta.url).href;
const Polygon1 = new URL("../images/Shapes/Polygon 1.png", import.meta.url).href;
const Ellipse1 = new URL("../images/Shapes/Ellipse 1.png", import.meta.url).href;

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!tokenFromUrl) {
      setError("Invalid or expired link. Request a new reset link from Forgot password.");
    }
  }, [tokenFromUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!tokenFromUrl) return;
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(tokenFromUrl, password, confirmPassword);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.message || "Invalid or expired link. Request a new link.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => navigate("/login");
  const handleRequestNewLink = () => navigate("/forgot-password");

  const formContent = (
    <>
      <h2 className="text-center text-[24px] lg:text-[28px] font-bold text-black leading-tight mb-[4px]">
        Reset Password
      </h2>
      <p
        className="text-center text-[14px] font-normal leading-[16.94px] mb-[24px]"
        style={{ color: "rgba(26, 38, 52, 0.7)" }}
      >
        Enter your new password below
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-[347px] lg:max-w-[420px] flex flex-col gap-[14px]">
        <div>
          <label className="block text-[14px] font-medium text-black mb-[3px]">New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            placeholder="At least 8 characters"
            className="w-full h-[48px] rounded-[8px] px-[16px] outline-none"
            style={{
              border: "1px solid rgba(28, 137, 154, 0.7)",
              backgroundColor: "transparent",
            }}
          />
        </div>
        <div>
          <label className="block text-[14px] font-medium text-black mb-[3px]">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            placeholder="Confirm new password"
            className="w-full h-[48px] rounded-[8px] px-[16px] outline-none"
            style={{
              border: "1px solid rgba(28, 137, 154, 0.7)",
              backgroundColor: "transparent",
            }}
          />
        </div>

        {error && <p className="text-[14px] text-red-600">{error}</p>}
        {success && (
          <p className="text-[14px] font-medium" style={{ color: "#00564F" }}>
            Password changed successfully. Redirecting to sign in...
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !tokenFromUrl || success}
          className="w-full h-[50px] rounded-[8px] text-white text-[16px] font-semibold mt-[8px] disabled:opacity-70"
          style={{
            backgroundColor: "#00564F",
            border: "1px solid rgba(28, 137, 154, 0.7)",
          }}
        >
          {loading ? "Saving..." : "RESET PASSWORD"}
        </button>

        <div className="text-center mt-[16px] flex flex-col gap-[8px]">
          <button
            type="button"
            onClick={handleBackToLogin}
            className="text-[14px] font-medium"
            style={{ color: "#00564F" }}
          >
            Back to Sign In
          </button>
          {!tokenFromUrl && (
            <button
              type="button"
              onClick={handleRequestNewLink}
              className="text-[14px] font-medium"
              style={{ color: "#00564F" }}
            >
              Request new reset link
            </button>
          )}
        </div>
      </form>
    </>
  );

  return (
    <div className="min-h-screen w-full" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Mobile */}
      <div className="lg:hidden relative min-h-screen bg-white flex flex-col items-center px-[23px] py-[43px] overflow-hidden">
        <div className="mb-[48px]">
          <img src={LogoMobile} alt="Logo" style={{ width: "156px", height: "51px", objectFit: "contain" }} />
        </div>
        {formContent}
        <img src={Rectangle12} alt="" className="absolute pointer-events-none" style={{ top: "80px", right: "-30px", width: "80px", height: "80px", opacity: 0.1 }} />
        <img src={Polygon1} alt="" className="absolute pointer-events-none" style={{ top: "50%", right: "-40px", width: "100px", height: "110px", opacity: 0.1 }} />
        <img src={Rectangle13} alt="" className="absolute pointer-events-none" style={{ bottom: "20%", right: "-25px", width: "60px", height: "70px", opacity: 0.1 }} />
        <img src={Ellipse1} alt="" className="absolute pointer-events-none" style={{ bottom: "-80px", left: "-80px", width: "200px", height: "200px", opacity: 0.1 }} />
      </div>

      {/* Desktop */}
      <div className="hidden lg:flex h-screen max-w-[1440px] mx-auto overflow-hidden">
        <div className="relative w-[52%] h-full flex flex-col overflow-hidden" style={{ backgroundColor: "#00564F" }}>
          <div className="pt-[30px] pl-[25px]">
            <img src={LogoDesktop} alt="Logo" style={{ height: "110px", width: "auto", objectFit: "contain", objectPosition: "left" }} />
          </div>
          <div className="flex flex-col items-center justify-center flex-1 px-[92px]">
            <h1 className="text-center text-[32px] font-semibold leading-[38.73px] mb-[5px]" style={{ color: "rgba(255, 255, 255, 0.9)" }}>
              Create your organization<br />account
            </h1>
            <p className="text-center text-[16px] font-normal leading-[19.36px] max-w-[350px] mb-[32px]" style={{ color: "rgba(255, 255, 255, 0.8)" }}>
              Manage your team's workflow and support their well-being programs.
            </p>
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="w-[260px] h-[48px] rounded-[8px] text-white text-[16px] font-semibold"
              style={{ border: "1.5px solid rgba(255, 255, 255, 0.7)", backgroundColor: "transparent" }}
            >
              SIGN UP
            </button>
          </div>
          <img src={Rectangle12} alt="" className="absolute pointer-events-none" style={{ top: "8%", right: "-20px", width: "113px", height: "113px" }} />
          <img src={Polygon1} alt="" className="absolute pointer-events-none" style={{ top: "40%", right: "-50px", width: "150px", height: "160px" }} />
          <img src={Rectangle13} alt="" className="absolute pointer-events-none" style={{ bottom: "18%", right: "-35px", width: "92px", height: "103px" }} />
          <img src={Ellipse1} alt="" className="absolute pointer-events-none" style={{ bottom: "-15%", left: "-10%", width: "45%", height: "50%" }} />
        </div>
        <div className="flex-1 h-full bg-white flex flex-col items-center justify-center px-[80px]">
          <div className="w-full max-w-[420px] flex flex-col items-center">{formContent}</div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
