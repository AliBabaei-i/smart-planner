// ═══════════════════════════════════════════════
// ✅ محاسبات مالی اسلامی (فقه تشیع)
// ═══════════════════════════════════════════════

// ═══════════════════════════════════════════════
// ✅ خمس (یک‌پنجم)
// ═══════════════════════════════════════════════

/**
 * محاسبه خمس
 * خمس = ۲۰٪ از مازاد درآمد سالانه (اضافه بر مخارج سال)
 * 
 * ⚠️ نکته فقهی: این یه محاسبه ساده است. برای محاسبه دقیق:
 *   - باید همه درآمدهای مشمول خمس در طول سال جمع بشه
 *   - مخارج سالانه (مؤونه) کسر بشه
 *   - ۲۰٪ باقیمانده = خمس
 *   - تقسیم به دو سهم مساوی: سهم امام (ع) + سهم سادات
 */
export const calculateKhums = (totalIncome, totalExpenses) => {
  const income = Number(totalIncome) || 0
  const expenses = Number(totalExpenses) || 0
  
  const surplus = Math.max(0, income - expenses)
  const khums = surplus * 0.2
  
  return {
    totalIncome: income,
    totalExpenses: expenses,
    surplus,
    khums,
    sahmImam: khums / 2,
    sahmSadat: khums / 2
  }
}

// ═══════════════════════════════════════════════
// ✅ زکات
// ═══════════════════════════════════════════════

/**
 * نصاب‌های شرعی
 * 
 * ⚠️ نکته مهم: زکات فقط به ۹ چیز تعلق می‌گیرد:
 *   ۱. گوسفند  ۲. گاو  ۳. شتر
 *   ۴. طلا  ۵. نقره
 *   ۶. گندم  ۷. جو  ۸. خرما  ۹. کشمش
 * 
 * ⚠️ زکات به پول نقد تعلق نمی‌گیرد — به پول نقد فقط خمس تعلق می‌گیرد
 */

export const ZAKAT_NISAB = {
  goldGrams: 87.48,      // ۲۰ دینار = ۸۷.۴۸ گرم طلا
  silverGrams: 612.36,   // ۲۰۰ درهم = ۶۱۲.۳۶ گرم نقره
  zakatRate: 1 / 40      // ۲.۵٪
}

/**
 * محاسبه زکات طلا و نقره
 * 
 * شرایط:
 *   - باید از نصاب بگذرد
 *   - باید ۱۱ ماه قمری از مالکیت گذشته باشه
 *   - زکات = ۲.۵٪ از ارزش
 */
export const calculateZakat = (goldGrams, silverGrams, goldPrice, silverPrice) => {
  const gold = Number(goldGrams) || 0
  const silver = Number(silverGrams) || 0
  const goldPriceNum = Number(goldPrice) || 0
  const silverPriceNum = Number(silverPrice) || 0
  
  let zakatGold = 0
  let zakatSilver = 0
  
  if (gold >= ZAKAT_NISAB.goldGrams) {
    zakatGold = gold * ZAKAT_NISAB.zakatRate * goldPriceNum
  }
  
  if (silver >= ZAKAT_NISAB.silverGrams) {
    zakatSilver = silver * ZAKAT_NISAB.zakatRate * silverPriceNum
  }
  
  return {
    goldGrams: gold,
    silverGrams: silver,
    goldMeetsNisab: gold >= ZAKAT_NISAB.goldGrams,
    silverMeetsNisab: silver >= ZAKAT_NISAB.silverGrams,
    zakatGold,
    zakatSilver,
    total: zakatGold + zakatSilver
  }
}

// ═══════════════════════════════════════════════
// ✅ رد مظالم
// ═══════════════════════════════════════════════

/**
 * رد مظالم
 * 
 * اگه مال حلال با حرام مخلوط شده و صاحبش معلوم نیست:
 *   - باید به فقیر شرعی صدقه داده بشه
 *   - به نیت رد مظالم (نه صدقه عادی)
 * 
 * ⚠️ مقدارش توسط خود مکلف تعیین می‌شه
 */

export const RED_MAZALIM_TYPES = {
  unknown_owner: 'مالی که صاحبش معلوم نیست',
  mixed_halal_haram: 'مال حلال مخلوط به حرام',
  debt_to_unknown: 'بدهی به شخص نامعلوم',
  interest_repentance: 'توبه از ربا'
}

// ═══════════════════════════════════════════════
// ✅ حرمت ربا
// ═══════════════════════════════════════════════

/**
 * تشخیص ربا
 * 
 * ربا دو نوعه:
 *   ۱. ربای قرضی: هرگونه زیادی در قرض
 *   ۲. ربای معاملی: در معامله دو کالای همجنس
 */

export const INTEREST_WARNING_MESSAGE = 
  '⚠️ توجه: دریافت یا پرداخت سود (ربا) در اسلام حرام است. ' +
  'اگر این مبلغ شامل سود قرض یا وام ربوی است، لطفاً با دقت بررسی کنید. ' +
  'برای جایگزین شرعی، می‌توانید از عقود اسلامی مثل مضاربه، مشارکت یا مرابحه استفاده کنید.'

export const isInterestWarning = (category) => {
  // اگه کاربر سود بانکی یا ربا رو انتخاب کرد
  return category === 'interest' || category === 'riba'
}

// ═══════════════════════════════════════════════
// ✅ سهم سادات
// ═══════════════════════════════════════════════

export const SADAT_INFO = {
  who: 'سیدهایی که از طرف پدر به هاشم (جد پیامبر) منتسب هستند',
  share: 'نصف خمس (بعد از کسر سهم امام ع)',
  howToPay: 'باید به سید فقیر یا یتیم سید داده بشه — با اجازه مرجع تقلید'
}

// ═══════════════════════════════════════════════
// ✅ Helper: فرمت‌دهی نتایج فقهی
// ═══════════════════════════════════════════════

/**
 * فرمت کامل محاسبه خمس برای نمایش
 */
export const formatKhumsReport = (calc) => {
  return {
    income: calc.totalIncome,
    expenses: calc.totalExpenses,
    surplus: calc.surplus,
    khums: calc.khums,
    sahmImam: calc.sahmImam,
    sahmSadat: calc.sahmSadat,
    summary: `خمس قابل پرداخت: ${calc.khums.toLocaleString('fa-IR')} ریال`
  }
}

export default {
  calculateKhums,
  calculateZakat,
  ZAKAT_NISAB,
  RED_MAZALIM_TYPES,
  INTEREST_WARNING_MESSAGE,
  isInterestWarning,
  SADAT_INFO,
  formatKhumsReport
}