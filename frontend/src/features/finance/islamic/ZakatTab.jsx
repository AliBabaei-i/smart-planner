import React, { memo } from 'react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { FiPackage } from 'react-icons/fi'
import Card from '../../../components/ui/Card'
import FiqhNote from './FiqhNote'
import { selectZakatCalculation } from '../financeSlice'
import { ZAKAT_NISAB } from '../islamicFinance'
import { formatNumber } from '../currencyHelpers'

const ZakatTab = memo(() => {
  const { i18n } = useTranslation()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')
  const calculation = useSelector(selectZakatCalculation)

  const hasAssets = calculation.totalGold > 0 || calculation.totalSilver > 0

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FiPackage className="text-amber-600" size={20} />
          <span>{isPersian ? 'محاسبه زکات' : 'Zakat Calculation'}</span>
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {isPersian ? 'فقط طلا و نقره (سایر موارد نیاز به محاسبه دستی دارد)' : 'Gold and silver only'}
        </p>
      </div>

      <FiqhNote title={isPersian ? 'زکات به چه چیزهایی تعلق می‌گیرد؟' : 'What is Zakat on?'}>
        {isPersian
          ? 'زکات فقط به ۹ چیز تعلق می‌گیرد: گوسفند، گاو، شتر، طلا، نقره، گندم، جو، خرما، کشمش. زکات به پول نقد تعلق نمی‌گیرد — به پول نقد فقط خمس تعلق می‌گیرد.'
          : 'Zakat applies to 9 items only: sheep, cattle, camels, gold, silver, wheat, barley, dates, raisins.'}
      </FiqhNote>

      <Card className="p-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          {isPersian ? 'نصاب‌های شرعی' : 'Religious Thresholds'}
        </h4>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <div className="text-amber-700 dark:text-amber-300 font-medium">
              {isPersian ? 'نصاب طلا' : 'Gold Nisab'}
            </div>
            <div className="text-base font-bold text-amber-700 dark:text-amber-300 mt-1">
              {formatNumber(ZAKAT_NISAB.goldGrams, isPersian, 2)} {isPersian ? 'گرم' : 'g'}
            </div>
            <div className="text-amber-600 dark:text-amber-400 mt-0.5">
              {isPersian ? '(۲۰ دینار)' : '(20 Dinar)'}
            </div>
          </div>
          <div className="p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
            <div className="text-gray-700 dark:text-gray-300 font-medium">
              {isPersian ? 'نصاب نقره' : 'Silver Nisab'}
            </div>
            <div className="text-base font-bold text-gray-700 dark:text-gray-300 mt-1">
              {formatNumber(ZAKAT_NISAB.silverGrams, isPersian, 2)} {isPersian ? 'گرم' : 'g'}
            </div>
            <div className="text-gray-600 dark:text-gray-400 mt-0.5">
              {isPersian ? '(۲۰۰ درهم)' : '(200 Dirham)'}
            </div>
          </div>
        </div>
      </Card>

      {!hasAssets && (
        <FiqhNote variant="info" title={isPersian ? 'طلا یا نقره‌ای ثبت نشده' : 'No gold or silver found'}>
          {isPersian
            ? 'برای محاسبه زکات، اول باید یک حساب از نوع «طلا» یا «نقره» بسازی و موجودی‌اش رو به گرم وارد کنی.'
            : 'To calculate Zakat, first create a gold or silver account with balance in grams.'}
        </FiqhNote>
      )}

      {hasAssets && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <FiPackage size={16} className="text-amber-600" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {isPersian ? 'طلا' : 'Gold'}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">{isPersian ? 'موجودی' : 'Balance'}:</span>
                  <span className="font-medium">{formatNumber(calculation.totalGold, isPersian, 2)} {isPersian ? 'گرم' : 'g'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{isPersian ? 'به نصاب رسیده؟' : 'Meets Nisab?'}:</span>
                  <span className={calculation.goldMeetsNisab ? 'text-green-600 font-medium' : 'text-gray-400'}>
                    {calculation.goldMeetsNisab ? (isPersian ? 'بله' : 'Yes') : (isPersian ? 'خیر' : 'No')}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-gray-500">{isPersian ? 'زکات' : 'Zakat'}:</span>
                  <span className="font-bold text-amber-600">{formatNumber(calculation.zakatGold, isPersian)}</span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <FiPackage size={16} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {isPersian ? 'نقره' : 'Silver'}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">{isPersian ? 'موجودی' : 'Balance'}:</span>
                  <span className="font-medium">{formatNumber(calculation.totalSilver, isPersian, 2)} {isPersian ? 'گرم' : 'g'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{isPersian ? 'به نصاب رسیده؟' : 'Meets Nisab?'}:</span>
                  <span className={calculation.silverMeetsNisab ? 'text-green-600 font-medium' : 'text-gray-400'}>
                    {calculation.silverMeetsNisab ? (isPersian ? 'بله' : 'Yes') : (isPersian ? 'خیر' : 'No')}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-gray-500">{isPersian ? 'زکات' : 'Zakat'}:</span>
                  <span className="font-bold text-gray-700 dark:text-gray-300">{formatNumber(calculation.zakatSilver, isPersian)}</span>
                </div>
              </div>
            </Card>
          </div>

          {calculation.total > 0 && (
            <Card className="p-5 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800">
              <div className="text-center">
                <div className="text-xs text-amber-700 dark:text-amber-300 mb-1">
                  {isPersian ? 'مجموع زکات واجب' : 'Total Zakat Due'}
                </div>
                <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                  {formatNumber(calculation.total, isPersian)}
                </div>
                <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  {isPersian ? 'ریال' : 'IRR'}
                </div>
              </div>
            </Card>
          )}

          {!calculation.goldMeetsNisab && !calculation.silverMeetsNisab && (
            <FiqhNote variant="success" title={isPersian ? 'زکات واجب نیست' : 'No Zakat Due'}>
              {isPersian
                ? 'طلا یا نقره‌ات به نصاب نرسیده، پس زکات واجب نیست.'
                : 'Your gold or silver has not reached Nisab.'}
            </FiqhNote>
          )}
        </>
      )}
    </div>
  )
})

ZakatTab.displayName = 'ZakatTab'

export default ZakatTab