import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Logo images
const LogoDesktop = new URL("../images/LogoDesktop.png", import.meta.url).href;
const LogoMobile = new URL("../images/LogoMobile.jpg", import.meta.url).href;

// Shape images
const Rectangle12 = new URL("../images/Shapes/Rectangle 12.png", import.meta.url).href;
const Rectangle13 = new URL("../images/Shapes/Rectangle 13.png", import.meta.url).href;
const Polygon1 = new URL("../images/Shapes/Polygon 1.png", import.meta.url).href;
const Ellipse1 = new URL("../images/Shapes/Ellipse 1.png", import.meta.url).href;

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Reset link sent to:", email);
    // You can add success message or redirect logic here
  };

  const handleBackToLogin = () => {
    navigate("/login");
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

        {/* Title Text */}
        <h2 className="text-center text-[24px] font-bold text-black leading-[29.05px] mb-[4px]">
          Forgot Password
        </h2>
        
        <p 
          className="text-center text-[14px] font-normal leading-[16.94px] mb-[46px]"
          style={{ color: 'rgba(26, 38, 52, 0.7)' }}
        >
          Enter your email address and we'll send you a reset link
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-[347px] flex flex-col gap-[14px]">
          {/* Email Address */}
          <div>
            <label className="block text-[14px] font-medium text-black mb-[3px]">
              Email Address
            </label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-[48px] rounded-[8px] px-[16px] outline-none"
              style={{ 
                border: '1px solid rgba(28, 137, 154, 0.7)',
                backgroundColor: 'transparent'
              }}
            />
          </div>

          {/* Send Reset Link Button */}
          <button 
            type="submit"
            className="w-full h-[50px] rounded-[8px] text-white text-[16px] font-semibold mt-[19px]"
            style={{ 
              backgroundColor: '#00564F',
              border: '1px solid rgba(28, 137, 154, 0.7)'
            }}
          >
            SEND RESET LINK
          </button>

          {/* Back to Login Link */}
          <div className="text-center mt-[25px]">
            <button 
              type="button"
              onClick={handleBackToLogin}
              className="text-[14px] font-medium"
              style={{ color: '#00564F' }}
            >
              Back to Sign In
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
              className="w-[260px] h-[48px] rounded-[8px] text-white text-[16px] font-semibold"
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
            {/* Title Text */}
            <h2 className="text-center text-[28px] font-bold text-black leading-[33.89px] mb-[4px]">
              Forgot Password
            </h2>
            
            <p 
              className="text-center text-[14px] font-normal leading-[16.94px] mb-[46px]"
              style={{ color: 'rgba(26, 38, 52, 0.7)' }}
            >
              Enter your email address and we'll send you a reset link
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-[14px]">
              {/* Email Address */}
              <div>
                <label className="block text-[14px] font-medium text-black mb-[3px]">
                  Email Address
                </label>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-[48px] rounded-[8px] px-[16px] outline-none"
                  style={{ 
                    border: '1px solid rgba(28, 137, 154, 0.7)',
                    backgroundColor: 'transparent'
                  }}
                />
              </div>

              {/* Send Reset Link Button */}
              <button 
                type="submit"
                className="w-full h-[50px] rounded-[8px] text-white text-[16px] font-semibold mt-[19px]"
                style={{ 
                  backgroundColor: '#00564F',
                  border: '1px solid rgba(28, 137, 154, 0.7)'
                }}
              >
                SEND RESET LINK
              </button>

              {/* Back to Login Link */}
              <div className="text-center mt-[25px]">
                <button 
                  type="button"
                  onClick={handleBackToLogin}
                  className="text-[14px] font-medium"
                  style={{ color: '#00564F' }}
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

