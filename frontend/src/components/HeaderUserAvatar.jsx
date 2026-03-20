import React, { useState } from "react";
import { getCurrentUser } from "../services/auth.js";
import { toAbsoluteAvatarUrl } from "../utils/avatarUrl.js";

const PersonIcon = () => (
  <svg className="w-1/2 h-1/2 text-[#9CA3AF]" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

/** يعرض صورة من src أو placeholder (دائرة + أيقونة) عند عدم وجود صورة أو فشل التحميل – بدون صورة ثابتة. */
export function AvatarOrPlaceholder({ src, alt = "", className = "w-9 h-9", ...props }) {
  const [failed, setFailed] = useState(false);
  const resolvedSrc = (typeof src === "string" && src.trim() !== "") ? src : null;
  const showImg = resolvedSrc && !failed;

  if (!showImg) {
    return (
      <div
        className={`${className} rounded-full bg-[#E5E7EB] flex items-center justify-center overflow-hidden flex-shrink-0`}
        aria-label={alt || "Avatar"}
      >
        <PersonIcon />
      </div>
    );
  }
  return (
    <img
      src={resolvedSrc}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
      {...props}
    />
  );
}

/**
 * Header user avatar – يعرض صورة المستخدم فقط. إذا ما في صورة أو فشل التحميل يُظهر دائرة رمادية مع أيقونة شخص (بدون صورة ثابتة).
 */
export default function HeaderUserAvatar({ className, alt = "User", ...props }) {
  const user = getCurrentUser();
  const avatarUrl = user?.avatar_url ?? user?.avatarUrl;
  const src = avatarUrl ? (toAbsoluteAvatarUrl(avatarUrl) || avatarUrl) : null;
  const [failed, setFailed] = useState(false);
  const showImg = src && !failed;

  if (!showImg) {
    return (
      <div
        className={`${className || "w-9 h-9"} rounded-full bg-[#E5E7EB] flex items-center justify-center overflow-hidden flex-shrink-0`}
        aria-label={alt}
      >
        <PersonIcon />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
      {...props}
    />
  );
}
