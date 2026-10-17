import React, { useState, useMemo, useCallback, memo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import {
  FiTrendingUp,
  FiBookOpen,
  FiPlus,
  FiSearch,
  FiX,
  FiZap,
  FiAward,
  FiClock
} from 'react-icons/fi'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import JournalForm from './JournalForm'
import JournalCard from './JournalCard'
import SkillForm from './SkillForm'
import SkillCard from './SkillCard'
import { deleteJournal, deleteSkill } from './growthSlice'
import { formatNumber } from '../../utils/formatters'

const GrowthPage = memo(() => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { journals = [], skills = [] } = useSelector(state => state.growth || {})

  const [activeTab, setActiveTab] = useState('journal')
  const [searchTerm, setSearchTerm] = useState('')

  // Journal
  const [showJournalForm, setShowJournalForm] = useState(false)
  const [editingJournal, setEditingJournal] = useState(null)
  const [journalDelete, setJournalDelete] = useState({ isOpen: false, id: null })

  // Skills
  const [showSkillForm, setShowSkillForm] = useState(false)
  const [editingSkill, setEditingSkill] = useState(null)
  const [skillDelete, setSkillDelete] = useState({ isOpen: false, id: null })

  // ✅ useMemo: آمار
  const stats = useMemo(() => {
    let totalMood = 0
    let totalEnergy = 0
    let totalHours = 0
    let totalSessions = 0

    for (const j of journals) {
      totalMood += j.mood || 0
      totalEnergy += j.energy || 0
    }

    for (const sk of skills) {
      totalHours += sk.hours || 0
      totalSessions += sk.sessions?.length || 0
    }

    return {
      journalCount: journals.length,
      skillCount: skills.length,
      avgMood: journals.length > 0 ? (totalMood / journals.length).toFixed(1) : '0',
      avgEnergy: journals.length > 0 ? (totalEnergy / journals.length).toFixed(1) : '0',
      totalHours: Math.round(totalHours * 10) / 10,
      totalSessions
    }
  }, [journals, skills])

  // ✅ useMemo: فیلتر ژورنال‌ها
  const filteredJournals = useMemo(() => {
    if (!searchTerm.trim()) return journals
    const term = searchTerm.toLowerCase()
    return journals.filter(j =>
      j.reflection?.toLowerCase().includes(term) ||
      j.gratitude?.toLowerCase().includes(term) ||
      j.wins?.some(w => w.toLowerCase().includes(term)) ||
      j.challenges?.some(c => c.toLowerCase().includes(term))
    )
  }, [journals, searchTerm])

  // ✅ useMemo: فیلتر مهارت‌ها
  const filteredSkills = useMemo(() => {
    if (!searchTerm.trim()) return skills
    const term = searchTerm.toLowerCase()
    return skills.filter(s =>
      s.name?.toLowerCase().includes(term) ||
      s.description?.toLowerCase().includes(term)
    )
  }, [skills, searchTerm])

  // ✅ useCallback: Journal handlers
  const handleJournalCreate = useCallback(() => {
    setEditingJournal(null)
    setShowJournalForm(true)
  }, [])

  const handleJournalEdit = useCallback((journal) => {
    setEditingJournal(journal)
    setShowJournalForm(true)
  }, [])

  const handleJournalFormClose = useCallback(() => {
    setShowJournalForm(false)
    setEditingJournal(null)
  }, [])

  const openJournalDelete = useCallback((journal) => {
    setJournalDelete({ isOpen: true, id: journal.id })
  }, [])

  const closeJournalDelete = useCallback(() => {
    setJournalDelete({ isOpen: false, id: null })
  }, [])

  const confirmJournalDelete = useCallback(() => {
    dispatch(deleteJournal(journalDelete.id))
    toast.success(t('growth.toast.journalDeleted'), { position: 'bottom-left', autoClose: 2500 })
    setJournalDelete({ isOpen: false, id: null })
  }, [dispatch, journalDelete.id, t])

  // ✅ useCallback: Skill handlers
  const handleSkillCreate = useCallback(() => {
    setEditingSkill(null)
    setShowSkillForm(true)
  }, [])

  const handleSkillEdit = useCallback((skill) => {
    setEditingSkill(skill)
    setShowSkillForm(true)
  }, [])

  const handleSkillFormClose = useCallback(() => {
    setShowSkillForm(false)
    setEditingSkill(null)
  }, [])

  const openSkillDelete = useCallback((skill) => {
    setSkillDelete({ isOpen: true, id: skill.id })
  }, [])

  const closeSkillDelete = useCallback(() => {
    setSkillDelete({ isOpen: false, id: null })
  }, [])

  // ✅ BUGFIX: قبلاً این تابع دو بار تعریف شده بود (confirmDeleteSkill + confirmSkillDelete)
  // الآن فقط یک نسخه وجود داره
  const confirmSkillDelete = useCallback(() => {
    dispatch(deleteSkill(skillDelete.id))
    toast.success(t('growth.toast.skillDeleted'), { position: 'bottom-left', autoClose: 2500 })
    setSkillDelete({ isOpen: false, id: null })
  }, [dispatch, skillDelete.id, t])

  // ✅ useCallback: Tabs
  const switchToJournal = useCallback(() => {
    setActiveTab('journal')
    setSearchTerm('')
  }, [])

  const switchToSkills = useCallback(() => {
    setActiveTab('skills')
    setSearchTerm('')
  }, [])

  const clearSearch = useCallback(() => setSearchTerm(''), [])

  return (
    <div className="space-y-6">
      {/* هدر */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FiTrendingUp className="text-blue-600" size={26} />
            <span>{t('growth.title')}</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('growth.subtitle')}
          </p>
        </div>
        <Button onClick={activeTab === 'journal' ? handleJournalCreate : handleSkillCreate}>
          <FiPlus size={16} />
          <span>{activeTab === 'journal' ? t('growth.newJournal') : t('growth.newSkill')}</span>
        </Button>
      </div>

      {/* آمار کلی */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="w-10 h-10 mx-auto bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center mb-2">
            <FiBookOpen size={20} className="text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {formatNumber(stats.journalCount)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {t('growth.journalEntries')}
          </div>
        </Card>

        <Card className="p-4 text-center">
          <div className="w-10 h-10 mx-auto bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center mb-2">
            <FiAward size={20} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {formatNumber(stats.skillCount)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {t('growth.totalSkills')}
          </div>
        </Card>

        <Card className="p-4 text-center">
          <div className="w-10 h-10 mx-auto bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center mb-2">
            <FiClock size={20} className="text-green-600 dark:text-green-400" />
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {formatNumber(stats.totalHours)}{t('growth.hoursShort')}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {t('growth.totalHours')}
          </div>
        </Card>

        <Card className="p-4 text-center">
          <div className="w-10 h-10 mx-auto bg-orange-100 dark:bg-orange-900/40 rounded-lg flex items-center justify-center mb-2">
            <FiZap size={20} className="text-orange-600 dark:text-orange-400" />
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {formatNumber(stats.totalSessions)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {t('growth.learningSessions')}
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Card className="p-1">
        <div className="flex">
          <button
            onClick={switchToJournal}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === 'journal'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
          >
            <FiBookOpen size={16} />
            <span>{t('growth.journal')}</span>
            {journals.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-white dark:bg-gray-800">
                {formatNumber(journals.length)}
              </span>
            )}
          </button>
          <button
            onClick={switchToSkills}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === 'skills'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
          >
            <FiAward size={16} />
            <span>{t('growth.skills')}</span>
            {skills.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-white dark:bg-gray-800">
                {formatNumber(skills.length)}
              </span>
            )}
          </button>
        </div>
      </Card>

      {/* جستجو */}
      {(journals.length > 0 || skills.length > 0) && (
        <Card className="p-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <FiSearch
                size={16}
                className="absolute end-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <Input
                placeholder={activeTab === 'journal' ? t('growth.searchJournal') : t('growth.searchSkills')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pe-9"
              />
            </div>
            {searchTerm && (
              <Button variant="secondary" onClick={clearSearch}>
                <FiX size={16} />
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* محتوا: Journal */}
      {activeTab === 'journal' && (
        <>
          {filteredJournals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredJournals.map(journal => (
                <JournalCard
                  key={journal.id}
                  journal={journal}
                  onEdit={() => handleJournalEdit(journal)}
                  onDelete={() => openJournalDelete(journal)}
                />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <div className="w-20 h-20 mx-auto bg-purple-50 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
                <FiBookOpen size={40} className="text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {searchTerm ? t('growth.noJournalResults') : t('growth.emptyJournal')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchTerm ? t('growth.noResultsDesc') : t('growth.emptyJournalDesc')}
              </p>
              {!searchTerm && (
                <Button onClick={handleJournalCreate}>
                  <FiPlus size={16} />
                  <span>{t('growth.createFirstJournal')}</span>
                </Button>
              )}
            </Card>
          )}
        </>
      )}

      {/* محتوا: Skills */}
      {activeTab === 'skills' && (
        <>
          {filteredSkills.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSkills.map(skill => (
                <SkillCard
                  key={skill.id}
                  skill={skill}
                  onEdit={() => handleSkillEdit(skill)}
                  onDelete={() => openSkillDelete(skill)}
                />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <div className="w-20 h-20 mx-auto bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                <FiAward size={40} className="text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {searchTerm ? t('growth.noSkillResults') : t('growth.emptySkills')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchTerm ? t('growth.noResultsDesc') : t('growth.emptySkillsDesc')}
              </p>
              {!searchTerm && (
                <Button onClick={handleSkillCreate}>
                  <FiPlus size={16} />
                  <span>{t('growth.createFirstSkill')}</span>
                </Button>
              )}
            </Card>
          )}
        </>
      )}

      {/* Modals */}
      <Modal
        isOpen={showJournalForm}
        onClose={handleJournalFormClose}
        size="xlarge"
        title={editingJournal ? t('growth.form.editJournal') : t('growth.form.newJournal')}
      >
        <JournalForm journal={editingJournal} onClose={handleJournalFormClose} />
      </Modal>

      <Modal
        isOpen={showSkillForm}
        onClose={handleSkillFormClose}
        size="xlarge"
        title={editingSkill ? t('growth.form.editSkill') : t('growth.form.newSkill')}
      >
        <SkillForm skill={editingSkill} onClose={handleSkillFormClose} />
      </Modal>

      <ConfirmDialog
        isOpen={journalDelete.isOpen}
        onClose={closeJournalDelete}
        onConfirm={confirmJournalDelete}
        title={t('actions.delete')}
        message={t('growth.confirmDeleteJournal')}
        confirmText={t('actions.confirm')}
        cancelText={t('actions.cancel')}
        variant="danger"
      />

      <ConfirmDialog
        isOpen={skillDelete.isOpen}
        onClose={closeSkillDelete}
        onConfirm={confirmSkillDelete}
        title={t('actions.delete')}
        message={t('growth.confirmDeleteSkill')}
        confirmText={t('actions.confirm')}
        cancelText={t('actions.cancel')}
        variant="danger"
      />
    </div>
  )
})
GrowthPage.displayName = 'GrowthPage'

export default GrowthPage