# للاختبار المؤقت فقط - وضع توكن يدوياً

## ⚠️ للاختبار فقط - لا تستخدم في Production

### الطريقة:

1. افتح Console في DevTools (F12)

2. الصق الكود التالي (استبدل YOUR_TOKEN_HERE بتوكن حقيقي من الباك إند):

```javascript
localStorage.setItem('token', 'YOUR_TOKEN_HERE');
```

3. أعد تحميل الصفحة (F5)

---

## الحل الصحيح:

✅ استخدم صفحة تسجيل الدخول الطبيعية
✅ تأكد أن Login page تحفظ التوكن في localStorage بعد الدخول الناجح
✅ تأكد أن apiClient.js يرسل التوكن مع كل طلب (موجود بالفعل ✓)

---

## كود apiClient.js الحالي (صحيح ✅):

```javascript
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

هذا الكود صحيح ويرسل التوكن تلقائياً مع كل طلب!
