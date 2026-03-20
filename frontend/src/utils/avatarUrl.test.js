/**
 * اختبارات دالة toAbsoluteAvatarUrl – تحويل روابط الصور إلى روابط مطلقة
 */
import { vi, describe, it, expect } from "vitest";

vi.mock("../services/apiClient.js", () => ({
  apiClient: {
    defaults: { baseURL: "https://api.example.com/api/v1" },
  },
}));

const { toAbsoluteAvatarUrl } = await import("./avatarUrl.js");

describe("toAbsoluteAvatarUrl", () => {
  it("يرجع الرابط كما هو إذا كان كاملاً (http)", () => {
    const url = "http://res.cloudinary.com/demo/image/upload/photo.jpg";
    expect(toAbsoluteAvatarUrl(url)).toBe(url);
  });

  it("يرجع الرابط كما هو إذا كان كاملاً (https)", () => {
    const url = "https://res.cloudinary.com/dvhhxjzeo/image/upload/hr-system/123.jpg";
    expect(toAbsoluteAvatarUrl(url)).toBe(url);
  });

  it("يضيف أصل الـ API للمسار النسبي الذي يبدأ بـ /", () => {
    expect(toAbsoluteAvatarUrl("/uploads/avatar.png")).toBe(
      "https://api.example.com/uploads/avatar.png"
    );
  });

  it("يضيف أصل الـ API للمسار النسبي بدون / في البداية", () => {
    expect(toAbsoluteAvatarUrl("uploads/avatar.png")).toBe(
      "https://api.example.com/uploads/avatar.png"
    );
  });

  it("يرجع null إذا القيمة فارغة", () => {
    expect(toAbsoluteAvatarUrl("")).toBe(null);
    expect(toAbsoluteAvatarUrl(null)).toBe(null);
  });

  it("يرجع null إذا القيمة ليست نصاً", () => {
    expect(toAbsoluteAvatarUrl(123)).toBe(null);
    expect(toAbsoluteAvatarUrl(undefined)).toBe(null);
  });
});
