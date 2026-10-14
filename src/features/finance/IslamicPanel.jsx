import React, { useState, memo } from 'react'
import { useTranslation } from 'react-i18next'
import { FiPercent, FiPackage, FiSettings } from 'react-icons/fi'
import Card from '../../components/ui/Card'
import FiqhNote from './islamic/FiqhNote'
import KhumsTab from './islamic/KhumsTab'
import ZakatTab from './islamic/ZakatTab'
import IslamicSettingsTab from './islamic/IslamicSettingsTab'

const INNER_TABS = [
  { id: 'khums', labelFa: 'خمس', labelEn: 'Khums', icon: FiPercent },
  { id: 'zakat', labelFa: 'زکات', labelEn: 'Zakat', icon: FiPackage },
  { id: 'settings', labelFa: 'تنظیمات', labelEn: 'Settings', icon: FiSettings }
]

const IslamicPanel = memo(() => {
  const { i18n } = useTranslation()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')

  const [activeTab, setActiveTab] = useState('khums')

  return (
    <div className="space-y-5">
      <Card className="p-1">
        <div className="flex gap-1">
          {INNER_TABS.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex-1 py-2.5 rounded-lg text-sm font-medium
                  transition-colors flex items-center justify-center gap-2
                  ${isActive
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
              >
                <Icon size={14} />
                <span>{isPersian ? tab.labelFa : tab.labelEn}</span>
              </button>
            )
          })}
        </div>
      </Card>

      <Card className="p-5">
        {activeTab === 'khums' && <KhumsTab />}
        {activeTab === 'zakat' && <ZakatTab />}
        {activeTab === 'settings' && <IslamicSettingsTab />}
      </Card>

      <FiqhNote>
        {isPersian
          ? 'توجه: این محاسبات جنبه کمک‌کننده دارد و برای احکام دقیق شرعی، به رساله مرجع تقلید خود مراجعه کنید.'
          : 'Note: These calculations are helpers. For precise rulings, refer to your Marja\'s risalah.'}
      </FiqhNote>
    </div>
  )
})

IslamicPanel.displayName = 'IslamicPanel'

export default IslamicPanel