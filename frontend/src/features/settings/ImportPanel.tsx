import React, { useState, useRef, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import {
  FiUpload, FiCheckCircle, FiAlertTriangle, FiInfo, FiFileText,
} from 'react-icons/fi'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { addTask } from '../tasks/tasksSlice'
import { addProject } from '../projects/projectsSlice'

interface ParsedRow {
  title: string
  description?: string
  priority?: 'low' | 'medium' | 'high'
  dueDate?: string | null
  projectName?: string
}

const PRIORITY_MAP: Record<string, 'low' | 'medium' | 'high'> = {
  '1': 'high', '2': 'high', '3': 'medium', '4': 'low',
  p1: 'high', p2: 'high', p3: 'medium', p4: 'low',
  high: 'high', medium: 'medium', low: 'low',
  urgent: 'high',
}

// ═══════════════════════════════════════════════
// ✅ Todoist CSV Parser
// ═══════════════════════════════════════════════
const parseTodoistCSV = (text: string): ParsedRow[] => {
  const lines = text.split(/\r?\n/).filter((l) => l.trim())
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/^"|"$/g, ''))
  const idx = {
    content: headers.indexOf('content'),
    description: headers.indexOf('description'),
    priority: headers.indexOf('priority'),
    date: headers.indexOf('date'),
    project: headers.indexOf('project'),
  }
  if (idx.content === -1) throw new Error('ستون Content در فایل پیدا نشد')

  const result: ParsedRow[] = []
  for (let i = 1; i < lines.length; i++) {
    // split با احترام به "..." — ساده‌شده
    const cells: string[] = []
    let cur = ''
    let inQuotes = false
    for (const ch of lines[i]) {
      if (ch === '"') inQuotes = !inQuotes
      else if (ch === ',' && !inQuotes) {
        cells.push(cur)
        cur = ''
      } else cur += ch
    }
    cells.push(cur)

    const content = (cells[idx.content] || '').replace(/^"|"$/g, '').trim()
    if (!content) continue

    result.push({
      title: content,
      description: idx.description >= 0 ? (cells[idx.description] || '').replace(/^"|"$/g, '').trim() : '',
      priority: idx.priority >= 0 ? PRIORITY_MAP[(cells[idx.priority] || '').toLowerCase()] || 'medium' : 'medium',
      dueDate: idx.date >= 0 ? (cells[idx.date] || '').replace(/^"|"$/g, '').trim().split('T')[0] || null : null,
      projectName: idx.project >= 0 ? (cells[idx.project] || '').replace(/^"|"$/g, '').trim() : undefined,
    })
  }
  return result
}

// ═══════════════════════════════════════════════
// ✅ Notion JSON Parser (خروجی Pages با tasks)
// ═══════════════════════════════════════════════
const parseNotionJSON = (json: any): ParsedRow[] => {
  const pages = Array.isArray(json) ? json : json.pages || json.results || []
  if (!Array.isArray(pages)) throw new Error('فرمت Notion نامعتبر است')

  const result: ParsedRow[] = []
  for (const page of pages) {
    const props = page.properties || page
    const title = props?.Name?.title?.[0]?.plain_text
      || props?.Title?.title?.[0]?.plain_text
      || props?.title?.title?.[0]?.plain_text
      || props?.name?.title?.[0]?.plain_text

    if (!title) continue

    result.push({
      title,
      description: props?.Description?.rich_text?.[0]?.plain_text || '',
      priority: PRIORITY_MAP[(props?.Priority?.select?.name || '').toLowerCase()] || 'medium',
      dueDate: props?.Date?.date?.start?.split('T')[0] || null,
      projectName: props?.Project?.select?.name || props?.Project?.rich_text?.[0]?.plain_text,
    })
  }
  return result
}

// ═══════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════
const ImportPanel: React.FC = () => {
  const { i18n } = useTranslation()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')
  const dispatch = useDispatch()
  const fileRef = useRef<HTMLInputElement>(null)

  const [importing, setImporting] = useState(false)
  const [preview, setPreview] = useState<ParsedRow[]>([])
  const [source, setSource] = useState<'todoist' | 'notion' | null>(null)

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    const isCSV = file.name.toLowerCase().endsWith('.csv')
    const isJSON = file.name.toLowerCase().endsWith('.json')

    if (!isCSV && !isJSON) {
      toast.error(isPersian ? 'فقط CSV یا JSON مجاز است' : 'Only CSV or JSON')
      return
    }

    try {
      const text = await file.text()
      let rows: ParsedRow[] = []

      if (isCSV) {
        rows = parseTodoistCSV(text)
        setSource('todoist')
      } else {
        const json = JSON.parse(text)
        rows = parseNotionJSON(json)
        setSource('notion')
      }

      if (rows.length === 0) {
        toast.warning(isPersian ? 'هیچ کاری پیدا نشد' : 'No tasks found')
        return
      }

      setPreview(rows)
      toast.success(
        isPersian
          ? `${rows.length} کار پیدا شد — پیش‌نمایش را بررسی کن`
          : `${rows.length} tasks found — review preview`,
        { position: 'bottom-left' }
      )
    } catch (err: any) {
      toast.error(`${isPersian ? 'خطا:' : 'Error:'} ${err.message}`)
    }
  }, [isPersian])

  const handleConfirmImport = useCallback(() => {
    if (preview.length === 0) return
    setImporting(true)
    try {
      // ✅ ۱. پروژه‌های یکتا
      const projectNames = Array.from(
        new Set(preview.map((r) => r.projectName).filter(Boolean) as string[])
      )
      const projectMap: Record<string, string> = {}
      for (const name of projectNames) {
        const id = crypto.randomUUID()
        dispatch(addProject({ id, name, description: '', color: '#3b82f6' } as any))
        projectMap[name] = id
      }

      // ✅ ۲. اگر پروژه‌ای نبود، یک پروژه پیش‌فرض
      const fallbackProjectId = projectNames.length === 0
        ? (() => {
            const id = crypto.randomUUID()
            dispatch(addProject({ id, name: isPersian ? 'واردشده' : 'Imported', description: '', color: '#10b981' } as any))
            return id
          })()
        : null

      // ✅ ۳. تسک‌ها
      for (const row of preview) {
        const projectId = (row.projectName && projectMap[row.projectName]) || fallbackProjectId || Object.values(projectMap)[0]
        if (!projectId) continue
        dispatch(addTask({
          id: crypto.randomUUID(),
          title: row.title,
          description: row.description || '',
          projectId,
          priority: row.priority || 'medium',
          dueDate: row.dueDate || null,
          dueTime: null,
          timeEstimate: null,
          tags: [],
          subtasks: [],
          recurring: null,
          recurringEndDate: null,
        } as any))
      }

      toast.success(
        isPersian
          ? `${preview.length} کار وارد شد — صفحه بارگذاری می‌شود`
          : `${preview.length} tasks imported`,
        { position: 'bottom-left', autoClose: 3000 }
      )
      setPreview([])
      setSource(null)
      setTimeout(() => window.location.reload(), 1500)
    } finally {
      setImporting(false)
    }
  }, [preview, dispatch, isPersian])

  return (
    <Card className="p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
          <FiUpload size={18} className="text-purple-600 dark:text-purple-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
            {isPersian ? 'وارد کردن از Todoist / Notion' : 'Import from Todoist / Notion'}
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
            {isPersian
              ? 'فایل CSV از Todoist یا JSON از Notion را انتخاب کن'
              : 'Choose a Todoist CSV or Notion JSON'}
          </p>
        </div>
      </div>

      {preview.length === 0 && (
        <>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-3">
            <div className="flex items-start gap-2">
              <FiInfo size={14} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                <strong className="block mb-1">
                  {isPersian ? 'چطور خروجی بگیرم؟' : 'How to export?'}
                </strong>
                {isPersian
                  ? 'Todoist: Settings → Export → CSV | Notion: ... → Export → JSON'
                  : 'Todoist: Settings → Export → CSV | Notion: ... → Export → JSON'}
              </div>
            </div>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept=".csv,.json"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            onClick={() => fileRef.current?.click()}
            className="w-full !bg-purple-600 hover:!bg-purple-700"
          >
            <FiUpload size={16} />
            <span>{isPersian ? 'انتخاب فایل' : 'Choose File'}</span>
          </Button>
        </>
      )}

      {preview.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FiFileText size={14} className="text-gray-500" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {isPersian ? 'پیش‌نمایش' : 'Preview'} ({preview.length})
            </span>
            <span className="text-[10px] bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded-full">
              {source === 'todoist' ? 'Todoist' : 'Notion'}
            </span>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-1.5">
            {preview.slice(0, 20).map((row, i) => (
              <div key={i} className="p-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg text-xs">
                <div className="font-medium text-gray-900 dark:text-white truncate">
                  {row.title}
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-500">
                  {row.projectName && <span>📁 {row.projectName}</span>}
                  {row.dueDate && <span>📅 {row.dueDate}</span>}
                  {row.priority && <span>⚡ {row.priority}</span>}
                </div>
              </div>
            ))}
            {preview.length > 20 && (
              <div className="text-[10px] text-gray-400 text-center py-1">
                +{preview.length - 20} {isPersian ? 'مورد دیگر' : 'more'}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleConfirmImport}
              loading={importing}
              className="flex-1 !bg-emerald-600 hover:!bg-emerald-700"
            >
              <FiCheckCircle size={16} />
              <span>{isPersian ? `وارد کن (${preview.length})` : `Import (${preview.length})`}</span>
            </Button>
            <Button
              variant="secondary"
              onClick={() => { setPreview([]); setSource(null) }}
              disabled={importing}
            >
              {isPersian ? 'انصراف' : 'Cancel'}
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}

export default ImportPanel