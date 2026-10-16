# Smart Planner — برنامه‌ریزی هوشمند

پلتفرم مدیریت زمان و بهره‌وری — PWA آفلاین + Sync چند دستگاهی

## 🎯 ویژگی‌ها

- مدیریت پروژه‌ها، کارها، عادت‌ها، یادداشت‌ها، اهداف
- برنامه‌ریزی هفتگی (Time-Blocking)
- Pomodoro، تحلیل‌ها، دستاوردها، رشد شخصی
- **ماژول مالی اسلامی** (خمس، زکات، بودجه، وام، تراکنش)
- **Sync چند دستگاهی** (Chrome, Firefox, موبایل)
- PWA — قابل نصب روی موبایل و دسکتاپ
- دوزبانه: فارسی (RTL) + انگلیسی (LTR)

## 🛠️ Tech Stack

**Frontend:**
React 18, Vite 4, Redux Toolkit, Tailwind CSS, redux-persist, react-i18next, Recharts

**Backend:**
Express, better-sqlite3, JWT, bcrypt, zod

## 📦 نصب و راه‌اندازی

```bash
# کلون
git clone https://github.com/AliBabaei-i/smart-planner.git
cd smart-planner

# نصب و migrate (همه چیز یکجا)
npm run setup