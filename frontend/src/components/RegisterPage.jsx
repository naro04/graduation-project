import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { register, googleAuth } from "../services/auth.js";

// Logo image
const LogoMobile = new URL("../images/LogoMobile.jpg", import.meta.url).href;

// Social icons
const GoogleIcon = new URL("../images/icons/google.png", import.meta.url).href;
const EyeIcon = new URL("../images/icons/eye.png", import.meta.url).href;

// Shape images
const Rectangle12 = new URL("../images/Shapes/Rectangle 12.png", import.meta.url).href;
const Rectangle13 = new URL("../images/Shapes/Rectangle 13.png", import.meta.url).href;
const Polygon1 = new URL("../images/Shapes/Polygon 1.png", import.meta.url).href;
const Polygon1Alt = new URL("../images/Shapes/Polygon 1 (1).png", import.meta.url).href;
const Ellipse1 = new URL("../images/Shapes/Ellipse 1.png", import.meta.url).href;
const Ellipse1Alt = new URL("../images/Shapes/Ellipse 1 (1).png", import.meta.url).href;


const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Load Google OAuth script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      // Initialize Google OAuth when script loads
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
          callback: handleGoogleCallback,
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGoogleCallback = async (response) => {
    try {
      setIsGoogleLoading(true);
      setError("");

      // Send the credential token to backend
      const result = await googleAuth(response.credential);
      
      // Success - redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Google sign-up failed. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    try {
      setIsGoogleLoading(true);
      setError("");

      // Check if Google Identity Services is loaded
      if (typeof window.google === 'undefined' || !window.google.accounts) {
        setError("Google sign-in is not available. Please try again.");
        setIsGoogleLoading(false);
        return;
      }

      // Trigger Google sign-in popup
      window.google.accounts.oauth2.initTokenClient({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
        scope: 'email profile',
        callback: async (tokenResponse) => {
          try {
            // Send the access token to backend
            const result = await googleAuth(tokenResponse.access_token);
            
            // Success - redirect to dashboard
            navigate("/dashboard");
          } catch (err) {
            setError(err.message || "Google sign-up failed. Please try again.");
            setIsGoogleLoading(false);
          }
        },
      }).requestAccessToken();

    } catch (err) {
      setError(err.message || "Google sign-up failed. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!firstName.trim()) {
      setError("Please enter your first name");
      return;
    }
    if (!lastName.trim()) {
      setError("Please enter your last name");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }
    if (!phone.trim()) {
      setError("Please enter your phone number");
      return;
    }
    if (!password.trim()) {
      setError("Please enter a password");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!agreeToTerms) {
      setError("Please agree to the Terms and Conditions");
      return;
    }

    setIsLoading(true);

    try {
      const response = await register(
        firstName.trim(),
        lastName.trim(),
        email.trim(),
        password,
        phone.trim()
      );
      
      // Success - redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Desktop Version */}
      <div className="hidden lg:flex min-h-screen max-w-[1440px] mx-auto">
        {/* Left Section - White Background with Form */}
        <div className="w-[48%] min-h-screen bg-white flex flex-col">
          {/* Logo */}
          <div className="pt-[43px] pl-[32px]">
            <img 
              src={LogoMobile} 
              alt="Mind-Body Medicine Logo" 
              style={{ width: '156px', height: '51px', objectFit: 'contain' }}
            />
          </div>

          {/* Form Container */}
          <div className="flex flex-col items-center px-[92px] pt-[40px] pb-[40px]">
            {/* Title */}
            <h1 
              className="text-center text-[28px] font-semibold leading-[33.89px] mb-[3px]"
              style={{ color: '#000000' }}
            >
              Create  account
            </h1>
            
            <p 
              className="text-center text-[14px] font-normal leading-[16.94px] mb-[30px]"
              style={{ color: 'rgba(26, 38, 52, 0.7)' }}
            >
              Create your account and begin your journey
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="w-full max-w-[420px] flex flex-col gap-[13px]">
              {/* Error Message */}
              {error && (
                <div className="w-full p-[12px] rounded-[8px] bg-red-50 border border-red-200">
                  <p className="text-[14px] text-red-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {error}
                  </p>
                </div>
              )}

              {/* First Name */}
              <div>
                <label className="block text-[14px] font-medium text-black mb-[3px]">
                  First Name
                </label>
                <input 
                  type="text"
                  placeholder="Enter your First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
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
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-[14px] font-medium text-black mb-[3px]">
                  Last Name
                </label>
                <input 
                  type="text"
                  placeholder="Enter your Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
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
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-[14px] font-medium text-black mb-[3px]">
                  Email Address
                </label>
                <input 
                  type="email"
                  placeholder="Enter your Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-[14px] font-medium text-black mb-[3px]">
                  Phone Number
                </label>
                <input 
                  type="tel"
                  placeholder="Enter your Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
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
                    placeholder="Create a Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              {/* Confirm Password */}
              <div>
                <label className="block text-[14px] font-medium text-black mb-[3px]">
                  Confirm Password
                </label>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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

              {/* Terms and Conditions */}
              <div className="flex items-center gap-[11px] mt-[8px]">
                <input 
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="w-[16px] h-[16px] rounded-[4px] flex-shrink-0"
                  style={{ border: '1px solid rgba(28, 137, 154, 0.7)' }}
                />
                <label 
                  className="text-[11px] font-normal flex-1 whitespace-nowrap"
                  style={{ 
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: '11px',
                    lineHeight: '100%',
                    letterSpacing: '0%',
                    color: '#000000',
                    textAlign: 'left'
                  }}
                >
                  I agree to the{' '}
                  <button 
                    type="button"
                    className="underline"
                    style={{ color: '#004641' }}
                    onClick={() => console.log('Terms and Conditions clicked')}
                  >
                    Terms and Conditions
                  </button>
                  {' '}and{' '}
                  <button 
                    type="button"
                    className="underline"
                    style={{ color: '#004641' }}
                    onClick={() => console.log('Privacy Policy clicked')}
                  >
                    Privacy Policy
                  </button>
                </label>
              </div>

              {/* Sign Up Button */}
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full h-[50px] rounded-[12px] text-white text-[16px] font-semibold mt-[12px] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  backgroundColor: '#00564F',
                  border: '1px solid rgba(28, 137, 154, 0.7)'
                }}
              >
                {isLoading ? "SIGNING UP..." : "SIGN UP"}
              </button>

              {/* OR Divider */}
              <div className="flex items-center gap-[10px] mt-[8px]">
                <div 
                  className="flex-1 h-[1px]"
                  style={{ backgroundColor: 'rgba(28, 137, 154, 1)' }}
                />
                <span 
                  className="text-[16px] font-normal"
                  style={{ color: 'rgba(1, 93, 102, 1)' }}
                >
                  OR
                </span>
                <div 
                  className="flex-1 h-[1px]"
                  style={{ backgroundColor: 'rgba(28, 137, 154, 1)' }}
                />
              </div>

              {/* Sign up with Google Button */}
              <button 
                type="button"
                onClick={handleGoogleSignUp}
                disabled={isGoogleLoading || isLoading}
                className="w-full h-[50px] rounded-[8px] bg-white flex items-center justify-center gap-[8px] mt-[4px] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  fontFamily: 'Inter, sans-serif',
                  border: '1px solid rgba(0, 0, 0, 0.7)'
                }}
              >
                <img src={GoogleIcon} alt="Google" className="w-[20px] h-[20px] object-contain" />
                <span 
                  className="text-[16px] font-medium text-black"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, lineHeight: '100%', letterSpacing: '0%' }}
                >
                  {isGoogleLoading ? "Signing up with Google..." : "Sign up with Google"}
                </span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Section - Green Background */}
        <div 
          className="relative w-[52%] min-h-screen flex flex-col overflow-hidden"
          style={{ backgroundColor: '#00564F' }}
        >
          {/* Content - Centered */}
          <div className="flex flex-col items-center justify-center h-full px-[80px]">
            <h1 
              className="text-center text-[32px] font-semibold leading-[38.73px] mb-[10px]"
              style={{ color: 'rgba(255, 255, 255, 0.9)' }}
            >
              Support your team to support<br />others
            </h1>
            
            <p 
              className="text-center text-[16px] font-normal leading-[19.36px] max-w-[350px] mb-[30px]"
              style={{ color: 'rgba(255, 255, 255, 0.8)' }}
            >
              Manage therapists, staff schedules, and well-being programs. in one secure platform.
            </p>
            
            {/* Sign In Button */}
            <button 
              onClick={() => navigate("/login")}
              className="w-[260px] h-[48px] rounded-[12px] text-white text-[16px] font-semibold transition-opacity hover:opacity-90"
              style={{ 
                border: '1.5px solid rgba(255, 255, 255, 0.7)',
                backgroundColor: 'transparent'
              }}
            >
              SIGN IN
            </button>
          </div>

          {/* Decorative Shapes - Using Images */}
          <img 
            src={Polygon1Alt}
            alt=""
            className="absolute pointer-events-none"
            style={{
              top: '-200px',
              right: '-350px',
              width: '808px',
              height: '784px'
            }}
          />

          <img 
            src={Rectangle12}
            alt=""
            className="absolute pointer-events-none"
            style={{
              top: '45%',
              right: '-35px',
              width: '85px',
              height: '85px'
            }}
          />

          <img 
            src={Ellipse1Alt}
            alt=""
            className="absolute pointer-events-none"
            style={{
              bottom: '-40px',
              left: '-40px',
              width: '80px',
              height: '80px'
            }}
          />

          <img 
            src={Polygon1}
            alt=""
            className="absolute pointer-events-none"
            style={{
              bottom: '-100px',
              right: '10%',
              width: '250px',
              height: '250px'
            }}
          />
        </div>
      </div>

      {/* Mobile Version */}
      <div className="lg:hidden relative min-h-screen bg-white flex flex-col items-center px-[23px] py-[30px] overflow-hidden">
        {/* Logo */}
        <div className="mb-[30px]">
          <img 
            src={LogoMobile} 
            alt="Mind-Body Medicine Logo" 
            style={{ width: '156px', height: '51px', objectFit: 'contain' }}
          />
        </div>

        {/* Title */}
        <h1 
          className="text-center text-[24px] font-semibold leading-[29.05px] mb-[4px]"
          style={{ color: '#000000' }}
        >
          Create  account
        </h1>
        
        <p 
          className="text-center text-[14px] font-normal leading-[16.94px] mb-[25px]"
          style={{ color: 'rgba(26, 38, 52, 0.7)' }}
        >
          Create your account and begin your journey
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-[347px] flex flex-col gap-[12px]">
          {/* Error Message */}
          {error && (
            <div className="w-full p-[12px] rounded-[8px] bg-red-50 border border-red-200">
              <p className="text-[14px] text-red-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                {error}
              </p>
            </div>
          )}

          {/* First Name */}
          <div>
            <label className="block text-[14px] font-medium text-black mb-[3px]">
              First Name
            </label>
            <input 
              type="text"
              placeholder="Enter your First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
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
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-[14px] font-medium text-black mb-[3px]">
              Last Name
            </label>
            <input 
              type="text"
              placeholder="Enter your Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
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
            />
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-[14px] font-medium text-black mb-[3px]">
              Email Address
            </label>
            <input 
              type="email"
              placeholder="Enter your Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-[14px] font-medium text-black mb-[3px]">
              Phone Number
            </label>
            <input 
              type="tel"
              placeholder="Enter your Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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
                placeholder="Create a Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          {/* Confirm Password */}
          <div>
            <label className="block text-[14px] font-medium text-black mb-[3px]">
              Confirm Password
            </label>
            <div className="relative">
              <input 
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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

          {/* Terms and Conditions */}
          <div className="flex items-center gap-[11px] mt-[8px]">
            <input 
              type="checkbox"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              className="w-[16px] h-[16px] rounded-[4px] flex-shrink-0"
              style={{ border: '1px solid rgba(28, 137, 154, 0.7)' }}
            />
            <label 
              className="text-[11px] font-normal flex-1 whitespace-nowrap"
              style={{ 
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: '11px',
                lineHeight: '100%',
                letterSpacing: '0%',
                color: '#000000',
                textAlign: 'left'
              }}
            >
              I agree to the{' '}
              <button 
                type="button"
                className="underline"
                style={{ color: '#004641' }}
                onClick={() => console.log('Terms and Conditions clicked')}
              >
                Terms and Conditions
              </button>
              {' '}and{' '}
              <button 
                type="button"
                className="underline"
                style={{ color: '#004641' }}
                onClick={() => console.log('Privacy Policy clicked')}
              >
                Privacy Policy
              </button>
            </label>
          </div>

          {/* Sign Up Button */}
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full h-[50px] rounded-[12px] text-white text-[16px] font-semibold mt-[10px] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              backgroundColor: '#00564F',
              border: '1px solid rgba(28, 137, 154, 0.7)'
            }}
          >
            {isLoading ? "SIGNING UP..." : "SIGN UP"}
          </button>

          {/* OR Divider */}
          <div className="flex items-center gap-[10px] mt-[8px]">
            <div 
              className="flex-1 h-[1px]"
              style={{ backgroundColor: 'rgba(28, 137, 154, 1)' }}
            />
            <span 
              className="text-[16px] font-normal"
              style={{ color: 'rgba(1, 93, 102, 1)' }}
            >
              OR
            </span>
            <div 
              className="flex-1 h-[1px]"
              style={{ backgroundColor: 'rgba(28, 137, 154, 1)' }}
            />
          </div>

          {/* Sign up with Google Button */}
          <button 
            type="button"
            onClick={handleGoogleSignUp}
            disabled={isGoogleLoading || isLoading}
            className="w-full h-[50px] rounded-[8px] bg-white flex items-center justify-center gap-[8px] mt-[4px] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              fontFamily: 'Inter, sans-serif',
              border: '1px solid rgba(0, 0, 0, 0.7)'
            }}
          >
            <img src={GoogleIcon} alt="Google" className="w-[20px] h-[20px] object-contain" />
            <span 
              className="text-[16px] font-medium text-black"
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, lineHeight: '100%', letterSpacing: '0%' }}
            >
              {isGoogleLoading ? "Signing up with Google..." : "Sign up with Google"}
            </span>
          </button>
        </form>

        {/* Sign In Link */}
        <p className="text-center text-[14px] font-medium mt-[15px]">
          <span style={{ color: '#000000' }}>Already have an account? </span>
          <button 
            onClick={() => navigate("/login")}
            style={{ color: '#00564F' }} 
            className="font-semibold"
          >
            SIGN IN
          </button>
        </p>

        {/* Decorative Shapes - Mobile with opacity */}
        <img 
          src={Ellipse1}
          alt=""
          className="absolute pointer-events-none"
          style={{
            bottom: '-80px',
            left: '-80px',
            width: '180px',
            height: '180px',
            opacity: 0.1
          }}
        />
        <img 
          src={Rectangle13}
          alt=""
          className="absolute pointer-events-none"
          style={{
            bottom: '15%',
            right: '-25px',
            width: '50px',
            height: '55px',
            opacity: 0.1
          }}
        />
        <img 
          src={Polygon1}
          alt=""
          className="absolute pointer-events-none"
          style={{
            top: '60%',
            right: '-30px',
            width: '80px',
            height: '90px',
            opacity: 0.1
          }}
        />
        <img 
          src={Rectangle12}
          alt=""
          className="absolute pointer-events-none"
          style={{
            top: '20%',
            right: '-20px',
            width: '50px',
            height: '50px',
            opacity: 0.1
          }}
        />
      </div>
    </div>
  );
};

export default RegisterPage;

