import React from "react";

// Logo image
const LogoMobile = new URL("../images/LogoMobile.jpg", import.meta.url).href;

// Social icons
const GoogleIcon = new URL("../images/icons/google.svg", import.meta.url).href;
const FacebookIcon = new URL("../images/icons/facebook.svg", import.meta.url).href;

// Shape images
const Rectangle12 = new URL("../images/Shapes/Rectangle 12.png", import.meta.url).href;
const Rectangle13 = new URL("../images/Shapes/Rectangle 13.png", import.meta.url).href;
const Polygon1 = new URL("../images/Shapes/Polygon 1.png", import.meta.url).href;
const Polygon1Alt = new URL("../images/Shapes/Polygon 1 (1).png", import.meta.url).href;
const Ellipse1 = new URL("../images/Shapes/Ellipse 1.png", import.meta.url).href;
const Ellipse1Alt = new URL("../images/Shapes/Ellipse 1 (1).png", import.meta.url).href;


const RegisterPage = () => {
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
            <div className="w-full max-w-[420px] flex flex-col gap-[13px]">
              {/* First Name */}
              <div>
                <label className="block text-[14px] font-medium text-black mb-[3px]">
                  First Name
                </label>
                <input 
                  type="text"
                  className="w-full h-[48px] rounded-[8px] px-[16px] outline-none"
                  style={{ 
                    border: '1px solid rgba(28, 137, 154, 0.7)',
                    backgroundColor: 'transparent'
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
                  className="w-full h-[48px] rounded-[8px] px-[16px] outline-none"
                  style={{ 
                    border: '1px solid rgba(28, 137, 154, 0.7)',
                    backgroundColor: 'transparent'
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
                  className="w-full h-[48px] rounded-[8px] px-[16px] outline-none"
                  style={{ 
                    border: '1px solid rgba(28, 137, 154, 0.7)',
                    backgroundColor: 'transparent'
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
                  className="w-full h-[48px] rounded-[8px] px-[16px] outline-none"
                  style={{ 
                    border: '1px solid rgba(28, 137, 154, 0.7)',
                    backgroundColor: 'transparent'
                  }}
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-[14px] font-medium text-black mb-[3px]">
                  Password
                </label>
                <input 
                  type="password"
                  className="w-full h-[48px] rounded-[8px] px-[16px] outline-none"
                  style={{ 
                    border: '1px solid rgba(28, 137, 154, 0.7)',
                    backgroundColor: 'transparent'
                  }}
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-[14px] font-medium text-black mb-[3px]">
                  Confirm Password
                </label>
                <input 
                  type="password"
                  className="w-full h-[48px] rounded-[8px] px-[16px] outline-none"
                  style={{ 
                    border: '1px solid rgba(28, 137, 154, 0.7)',
                    backgroundColor: 'transparent'
                  }}
                />
              </div>

              {/* Sign Up Button */}
              <button 
                className="w-full h-[50px] rounded-[12px] text-white text-[16px] font-semibold mt-[12px]"
                style={{ 
                  backgroundColor: '#00564F',
                  border: '1px solid rgba(28, 137, 154, 0.7)'
                }}
              >
                SIGN UP
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

              {/* Social Login */}
              <div className="flex items-center justify-center gap-[8px] mt-[4px]">
                <button className="w-[28px] h-[28px] rounded-full">
                  <img src={FacebookIcon} alt="Facebook" className="w-full h-full" />
                </button>
                <button className="w-[28px] h-[28px] rounded-full">
                  <img src={GoogleIcon} alt="Google" className="w-full h-full" />
                </button>
              </div>
            </div>
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
              className="w-[260px] h-[48px] rounded-[12px] text-white text-[16px] font-semibold"
              style={{ 
                border: '1.5px solid rgba(255, 255, 255, 0.7)',
                backgroundColor: 'transparent'
              }}
            >
              SIGN IN
            </button>
          </div>

          {/* Decorative Shapes - Using Images */}
          {/* Polygon 1 (1) - Top Right Triangle */}
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

          {/* Rectangle 12 - Right Middle Square */}
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

          {/* Ellipse 1 (1) - Bottom Left Circle */}
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

          {/* Polygon 1 - Bottom Right Triangle */}
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
        <div className="w-full max-w-[347px] flex flex-col gap-[12px]">
          {/* First Name */}
          <div>
            <label className="block text-[14px] font-medium text-black mb-[3px]">
              First Name
            </label>
            <input 
              type="text"
              className="w-full h-[48px] rounded-[8px] px-[16px] outline-none"
              style={{ 
                border: '1px solid rgba(28, 137, 154, 0.7)',
                backgroundColor: 'transparent'
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
              className="w-full h-[48px] rounded-[8px] px-[16px] outline-none"
              style={{ 
                border: '1px solid rgba(28, 137, 154, 0.7)',
                backgroundColor: 'transparent'
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
              className="w-full h-[48px] rounded-[8px] px-[16px] outline-none"
              style={{ 
                border: '1px solid rgba(28, 137, 154, 0.7)',
                backgroundColor: 'transparent'
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
              className="w-full h-[48px] rounded-[8px] px-[16px] outline-none"
              style={{ 
                border: '1px solid rgba(28, 137, 154, 0.7)',
                backgroundColor: 'transparent'
              }}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-[14px] font-medium text-black mb-[3px]">
              Password
            </label>
            <input 
              type="password"
              className="w-full h-[48px] rounded-[8px] px-[16px] outline-none"
              style={{ 
                border: '1px solid rgba(28, 137, 154, 0.7)',
                backgroundColor: 'transparent'
              }}
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-[14px] font-medium text-black mb-[3px]">
              Confirm Password
            </label>
            <input 
              type="password"
              className="w-full h-[48px] rounded-[8px] px-[16px] outline-none"
              style={{ 
                border: '1px solid rgba(28, 137, 154, 0.7)',
                backgroundColor: 'transparent'
              }}
            />
          </div>

          {/* Sign Up Button */}
          <button 
            className="w-full h-[50px] rounded-[12px] text-white text-[16px] font-semibold mt-[10px]"
            style={{ 
              backgroundColor: '#00564F',
              border: '1px solid rgba(28, 137, 154, 0.7)'
            }}
          >
            SIGN UP
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

          {/* Social Login */}
          <div className="flex items-center justify-center gap-[8px] mt-[4px]">
            <button className="w-[28px] h-[28px] rounded-full">
              <img src={FacebookIcon} alt="Facebook" className="w-full h-full" />
            </button>
            <button className="w-[28px] h-[28px] rounded-full">
              <img src={GoogleIcon} alt="Google" className="w-full h-full" />
            </button>
          </div>

          {/* Sign In Link */}
          <p className="text-center text-[14px] font-medium mt-[15px]">
            <span style={{ color: '#000000' }}>Already have an account? </span>
            <button style={{ color: '#00564F' }} className="font-semibold">
              SIGN IN
            </button>
          </p>
        </div>

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

