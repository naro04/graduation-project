import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/auth.js";

// Logo images
const LogoDesktop = new URL("../images/LogoDesktop.png", import.meta.url).href;
const LogoMobile = new URL("../images/LogoMobile.jpg", import.meta.url).href;

// Shape images
const Rectangle12 = new URL("../images/Shapes/Rectangle 12.png", import.meta.url).href;
const Rectangle13 = new URL("../images/Shapes/Rectangle 13.png", import.meta.url).href;
const Polygon1 = new URL("../images/Shapes/Polygon 1.png", import.meta.url).href;
const Ellipse1 = new URL("../images/Shapes/Ellipse 1.png", import.meta.url).href;

// Icons
const EyeIcon = new URL("../images/icons/eye.png", import.meta.url).href;

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!email.trim()) {
      setError("Please enter your email or ID");
      return;
    }
    if (!password.trim()) {
      setError("Please enter your password");
      return;
    }

    setIsLoading(true);

    try {
      console.log('🚀 Attempting login with:', { email: email.trim(), rememberMe });
      const response = await login(email.trim(), password, rememberMe);
      console.log('✅ Login successful:', response);
      
      // Success - redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error('❌ Login failed:', {
        message: err.message,
        status: err.status,
        data: err.data,
        fullError: err
      });
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Mobile Version */}
      <div className="lg:hidden relative min-h-screen bg-white flex flex-col items-center px-[23px] py-[43px] overflow-hidden">
        {/* Logo */}
        <div className="mb-[48px]">
          <img 
            src={LogoMobile} 
            alt="Mind-Body Medicine Logo" 
            style={{ width: '156px', height: '51px', objectFit: 'contain' }}
          />
        </div>

        {/* Welcome Text */}
        <h2 className="text-center text-[24px] font-bold text-black leading-[29.05px] mb-[4px]">
          Welcome back
        </h2>
        
        <p 
          className="text-center text-[14px] font-normal leading-[16.94px] mb-[46px]"
          style={{ color: 'rgba(26, 38, 52, 0.7)' }}
        >
          Manage your work and support your journey
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-[347px] flex flex-col gap-[14px]">
          {/* Error Message */}
          {error && (
            <div 
              className="w-full px-[16px] py-[12px] rounded-[8px] mb-[8px]"
              style={{ 
                backgroundColor: '#FEE2E2',
                border: '1px solid #FCA5A5',
                color: '#DC2626'
              }}
            >
              <p className="text-[12px] font-medium">{error}</p>
            </div>
          )}

          {/* Email Address */}
          <div>
            <label className="block text-[14px] font-medium text-black mb-[3px]">
              Email or ID
            </label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your Email or ID"
              className="w-full h-[48px] rounded-[8px] px-[16px] outline-none"
              style={{ 
                border: '1px solid rgba(28, 137, 154, 0.7)',
                backgroundColor: 'transparent',
                fontFamily: 'Inter, sans-serif',
                fontSize: '12px',
                fontWeight: 400,
                color: '#000000',
                textAlign: 'left'
              }}
              disabled={isLoading}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-[14px] font-medium text-black mb-[3px]">
              Password
            </label>
            <div className="relative">
              <input 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your Password"
                    className="w-full h-[48px] rounded-[8px] px-[16px] pr-[48px] outline-none"
                    style={{ 
                      border: '1px solid rgba(28, 137, 154, 0.7)',
                      backgroundColor: 'transparent',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '12px',
                      fontWeight: 400,
                      color: '#000000',
                      textAlign: 'left'
                    }}
                    disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-[16px] top-1/2 -translate-y-1/2 w-[20px] h-[20px] flex items-center justify-center"
              >
                <svg 
                  className="w-[20px] h-[20px] text-gray-500" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  {showPassword ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Remember Me and Forgot Password */}
          <div className="flex items-center justify-between mt-[11px]">
            <div className="flex items-center gap-[11px]">
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className="w-[16px] h-[16px] rounded-[4px] flex-shrink-0 flex items-center justify-center"
                style={{ 
                  border: '1px solid rgba(28, 137, 154, 0.7)',
                  backgroundColor: rememberMe ? '#00564F' : 'transparent'
                }}
                disabled={isLoading}
              >
                {rememberMe && (
                  <svg className="w-[12px] h-[12px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <span 
                className="text-[14px] font-medium"
                style={{ color: 'rgba(0, 0, 0, 0.7)' }}
              >
                Remember me
              </span>
            </div>
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-[14px] font-medium"
              style={{ 
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                lineHeight: '100%',
                letterSpacing: '0%',
                color: '#000000',
                textAlign: 'center'
              }}
              disabled={isLoading}
            >
              Forgot Password ?
            </button>
          </div>

          {/* Sign In Button */}
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full h-[50px] rounded-[8px] text-white text-[16px] font-semibold mt-[19px] transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              backgroundColor: '#00564F',
              border: '1px solid rgba(28, 137, 154, 0.7)'
            }}
          >
            {isLoading ? "SIGNING IN..." : "SIGN IN"}
          </button>

          {/* Sign Up Link */}
          <div className="text-center mt-[25px]">
            <p className="text-[14px] font-medium text-black">
              Don't have an account?
            </p>
            <button 
              onClick={() => navigate("/register")}
              className="text-[14px] font-medium mt-[4px]"
              style={{ color: '#00564F' }}
            >
              SIGN UP
            </button>
          </div>
        </form>

        {/* Decorative Shapes for Mobile - with opacity */}
        <img 
          src={Rectangle12}
          alt=""
          className="absolute pointer-events-none"
          style={{
            top: '80px',
            right: '-30px',
            width: '80px',
            height: '80px',
            opacity: 0.1
          }}
        />
        
        {/* Polygon 1 - Middle Right */}
        <img 
          src={Polygon1}
          alt=""
          className="absolute pointer-events-none"
          style={{
            top: '50%',
            right: '-40px',
            width: '100px',
            height: '110px',
            opacity: 0.1
          }}
        />

        {/* Rectangle 13 - Bottom Right */}
        <img 
          src={Rectangle13}
          alt=""
          className="absolute pointer-events-none"
          style={{
            bottom: '20%',
            right: '-25px',
            width: '60px',
            height: '70px',
            opacity: 0.1
          }}
        />
        
        {/* Ellipse 1 - Bottom Left */}
        <img 
          src={Ellipse1}
          alt=""
          className="absolute pointer-events-none"
          style={{
            bottom: '-80px',
            left: '-80px',
            width: '200px',
            height: '200px',
            opacity: 0.1
          }}
        />
      </div>

      {/* Desktop Version */}
      <div className="hidden lg:flex h-screen max-w-[1440px] mx-auto overflow-hidden">
        {/* Left Section - Green Background */}
        <div 
          className="relative w-[52%] h-full flex flex-col overflow-hidden"
          style={{ backgroundColor: '#00564F' }}
        >
          {/* Logo */}
          <div className="pt-[30px] pl-[25px]">
            <img 
              src={LogoDesktop} 
              alt="Mind-Body Medicine Logo" 
              style={{ height: '110px', width: 'auto', objectFit: 'contain', objectPosition: 'left' }}
            />
          </div>

          {/* Content */}
          <div className="flex flex-col items-center justify-center flex-1 px-[92px]">
            <h1 
              className="text-center text-[32px] font-semibold leading-[38.73px] mb-[5px]"
              style={{ color: 'rgba(255, 255, 255, 0.9)' }}
            >
              Create your organization<br />account
            </h1>
            
            <p 
              className="text-center text-[16px] font-normal leading-[19.36px] max-w-[350px] mb-[32px]"
              style={{ color: 'rgba(255, 255, 255, 0.8)' }}
            >
              Manage your team's workflow and support their well-being programs.
            </p>
            
            {/* Sign Up Button */}
            <button 
              onClick={() => navigate("/register")}
              className="w-[260px] h-[48px] rounded-[8px] text-white text-[16px] font-semibold transition-opacity hover:opacity-90"
              style={{ 
                border: '1.5px solid rgba(255, 255, 255, 0.7)',
                backgroundColor: 'transparent'
              }}
            >
              SIGN UP
            </button>
          </div>

          {/* Decorative Shapes - Using Images */}
          {/* Rectangle 12 - Top Right Square */}
          <img 
            src={Rectangle12}
            alt=""
            className="absolute pointer-events-none"
            style={{
              top: '8%',
              right: '-20px',
              width: '113px',
              height: '113px'
            }}
          />
          
          {/* Polygon 1 - Middle Right Triangle */}
          <img 
            src={Polygon1}
            alt=""
            className="absolute pointer-events-none"
            style={{
              top: '40%',
              right: '-50px',
              width: '150px',
              height: '160px'
            }}
          />
          
          {/* Rectangle 13 - Bottom Right Rectangle */}
          <img 
            src={Rectangle13}
            alt=""
            className="absolute pointer-events-none"
            style={{
              bottom: '18%',
              right: '-35px',
              width: '92px',
              height: '103px'
            }}
          />
          
          {/* Ellipse 1 - Bottom Left Circle */}
          <img 
            src={Ellipse1}
            alt=""
            className="absolute pointer-events-none"
            style={{
              bottom: '-15%',
              left: '-10%',
              width: '45%',
              height: '50%'
            }}
          />
        </div>

        {/* Right Section - White Background */}
        <div className="flex-1 h-full bg-white flex flex-col items-center justify-center px-[80px]">
          <div className="w-full max-w-[420px]">
            {/* Welcome Text */}
            <h2 className="text-center text-[28px] font-bold text-black leading-[33.89px] mb-[4px]">
              Welcome back
            </h2>
            
            <p 
              className="text-center text-[14px] font-normal leading-[16.94px] mb-[46px]"
              style={{ color: 'rgba(26, 38, 52, 0.7)' }}
            >
              Manage your work and support your journey
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-[14px]">
              {/* Error Message */}
              {error && (
                <div 
                  className="w-full px-[16px] py-[12px] rounded-[8px] mb-[8px]"
                  style={{ 
                    backgroundColor: '#FEE2E2',
                    border: '1px solid #FCA5A5',
                    color: '#DC2626'
                  }}
                >
                  <p className="text-[12px] font-medium">{error}</p>
                </div>
              )}

              {/* Email Address */}
              <div>
                <label className="block text-[14px] font-medium text-black mb-[3px]">
                  Email or ID
                </label>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your Email or ID"
                  className="w-full h-[48px] rounded-[8px] px-[16px] outline-none"
                  style={{ 
                    border: '1px solid rgba(28, 137, 154, 0.7)',
                    backgroundColor: 'transparent',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '12px',
                    fontWeight: 400,
                    color: '#000000',
                    textAlign: 'left'
                  }}
                  disabled={isLoading}
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-[14px] font-medium text-black mb-[3px]">
                  Password
                </label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your Password"
                    className="w-full h-[48px] rounded-[8px] px-[16px] pr-[48px] outline-none"
                    style={{ 
                      border: '1px solid rgba(28, 137, 154, 0.7)',
                      backgroundColor: 'transparent',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '12px',
                      fontWeight: 400,
                      color: '#000000',
                      textAlign: 'left'
                    }}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-[16px] top-1/2 -translate-y-1/2 w-[20px] h-[20px] flex items-center justify-center"
                  >
                    <img 
                      src={EyeIcon} 
                      alt="Toggle password visibility" 
                      className="w-[20px] h-[20px] object-contain"
                    />
                  </button>
                </div>
              </div>

              {/* Remember Me and Forgot Password */}
              <div className="flex items-center justify-between mt-[11px]">
                <div className="flex items-center gap-[11px]">
                  <button
                    type="button"
                    onClick={() => setRememberMe(!rememberMe)}
                    className="w-[16px] h-[16px] rounded-[4px] flex items-center justify-center"
                    style={{ 
                      border: '1px solid rgba(28, 137, 154, 0.7)',
                      backgroundColor: rememberMe ? '#00564F' : 'transparent'
                    }}
                    disabled={isLoading}
                  >
                    {rememberMe && (
                      <svg className="w-[12px] h-[12px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <span 
                    className="text-[14px] font-medium"
                    style={{ color: 'rgba(0, 0, 0, 0.7)' }}
                  >
                    Remember me
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-[14px] font-medium"
                  style={{ 
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: '14px',
                    lineHeight: '100%',
                    letterSpacing: '0%',
                    color: '#000000',
                    textAlign: 'center'
                  }}
                  disabled={isLoading}
                >
                  Forgot Password ?
                </button>
              </div>

              {/* Sign In Button */}
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full h-[50px] rounded-[8px] text-white text-[16px] font-semibold mt-[19px] transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  backgroundColor: '#00564F',
                  border: '1px solid rgba(28, 137, 154, 0.7)'
                }}
              >
                {isLoading ? "SIGNING IN..." : "SIGN IN"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
