// ✅ پاک کردن کامنت‌های فارسی و استفاده از انگلیسی برای جلوگیری از مشکل Unicode
import { addDays, format } from 'date-fns'

const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

const toEnglishDigits = (str) => {
  if (!str) return str
  return str.replace(/[۰-۹]/g, d => englishDigits[persianDigits.indexOf(d)])
}

const PERSIAN_WEEKDAYS = {
  'شنبه': 6,
  'یکشنبه': 0,
  'دوشنبه': 1,
  'سه‌شنبه': 2,
  'چهارشنبه': 3,
  'پنجشنبه': 4,
  'جمعه': 5
}

const ENGLISH_WEEKDAYS = {
  'sunday': 0, 'sun': 0,
  'monday': 1, 'mon': 1,
  'tuesday': 2, 'tue': 2,
  'wednesday': 3, 'wed': 3,
  'thursday': 4, 'thu': 4,
  'friday': 5, 'fri': 5,
  'saturday': 6, 'sat': 6
}

const parseDate = (text) => {
  const lower = text.toLowerCase()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (text.indexOf('امروز') !== -1 || lower.indexOf('today') !== -1) {
    return { date: today, matched: true }
  }

  if (text.indexOf('فردا') !== -1 || lower.indexOf('tomorrow') !== -1) {
    return { date: addDays(today, 1), matched: true }
  }

  if (text.indexOf('پس فردا') !== -1 || text.indexOf('پس‌فردا') !== -1) {
    return { date: addDays(today, 2), matched: true }
  }

  if (text.indexOf('هفته دیگه') !== -1 || lower.indexOf('next week') !== -1) {
    return { date: addDays(today, 7), matched: true }
  }

  if (text.indexOf('ماه دیگه') !== -1 || lower.indexOf('next month') !== -1) {
    return { date: addDays(today, 30), matched: true }
  }

  for (const dayName in PERSIAN_WEEKDAYS) {
    if (text.indexOf(dayName) !== -1) {
      const dayNum = PERSIAN_WEEKDAYS[dayName]
      const currentDay = today.getDay()
      let daysUntil = dayNum - currentDay
      if (daysUntil <= 0) daysUntil += 7
      return { date: addDays(today, daysUntil), matched: true }
    }
  }

  for (const dayName in ENGLISH_WEEKDAYS) {
    if (lower.indexOf(dayName) !== -1) {
      const dayNum = ENGLISH_WEEKDAYS[dayName]
      const currentDay = today.getDay()
      let daysUntil = dayNum - currentDay
      if (daysUntil <= 0) daysUntil += 7
      return { date: addDays(today, daysUntil), matched: true }
    }
  }

  return { date: null, matched: false }
}

const parseTime = (text) => {
  const lower = text.toLowerCase()

  // HH:MM format
  const colonMatch = text.match(/(\d{1,2}):(\d{2})/)
  if (colonMatch) {
    const hours = parseInt(toEnglishDigits(colonMatch[1]))
    const minutes = parseInt(toEnglishDigits(colonMatch[2]))
    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      return { hour: hours, minute: minutes, matched: true }
    }
  }

  // "ساعت ۳" or "at 3"
  const hourMatch = text.match(/(?:ساعت|at)\s*(\d{1,2})/i)
  if (hourMatch) {
    let hour = parseInt(toEnglishDigits(hourMatch[1]))
    
    const context = text.substring(Math.max(0, hourMatch.index - 15), hourMatch.index + hourMatch[0].length + 15)
    
    if (context.indexOf('صبح') !== -1 || context.indexOf('morning') !== -1) {
      if (hour === 12) hour = 0
    } else if (context.indexOf('عصر') !== -1 || context.indexOf('afternoon') !== -1) {
      if (hour < 12) hour += 12
    } else if (context.indexOf('شب') !== -1 || context.indexOf('evening') !== -1 || context.indexOf('night') !== -1) {
      if (hour >= 6 && hour < 12) hour += 12
    } else {
      if (hour >= 1 && hour <= 7) hour += 12
    }
    
    if (hour >= 0 && hour <= 23) {
      return { hour, minute: 0, matched: true }
    }
  }

  // English 3pm format
  const englishTimeMatch = lower.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i)
  if (englishTimeMatch) {
    let hour = parseInt(englishTimeMatch[1])
    const minute = englishTimeMatch[2] ? parseInt(englishTimeMatch[2]) : 0
    const ampm = englishTimeMatch[3].toLowerCase()
    
    if (ampm === 'pm' && hour < 12) hour += 12
    if (ampm === 'am' && hour === 12) hour = 0
    
    return { hour, minute, matched: true }
  }

  return { hour: null, minute: null, matched: false }
}

const parsePriority = (text) => {
  if (text.indexOf('!بالا') !== -1 || text.indexOf('!high') !== -1 || text.indexOf('!urgent') !== -1) {
    return { priority: 'high', matched: true }
  }
  if (text.indexOf('!متوسط') !== -1 || text.indexOf('!medium') !== -1) {
    return { priority: 'medium', matched: true }
  }
  if (text.indexOf('!کم') !== -1 || text.indexOf('!low') !== -1) {
    return { priority: 'low', matched: true }
  }
  return { priority: null, matched: false }
}

const parseTags = (text) => {
  const tags = []
  const parts = text.split(' ')
  
  for (let i = 0; i < parts.length; i++) {
    if (parts[i].startsWith('#')) {
      const tag = parts[i].substring(1)
      if (tag) tags.push(tag)
    }
  }
  
  return { tags, matched: tags.length > 0 }
}

const parseProject = (text) => {
  const parts = text.split(' ')
  
  for (let i = 0; i < parts.length; i++) {
    if (parts[i].startsWith('@')) {
      return { projectName: parts[i].substring(1), matched: true }
    }
  }
  
  return { projectName: null, matched: false }
}

const parseRecurring = (text) => {
  if (text.indexOf('هر روز') !== -1 || text.indexOf('روزانه') !== -1 || text.indexOf('daily') !== -1) {
    return { recurring: 'daily', matched: true }
  }
  if (text.indexOf('هر هفته') !== -1 || text.indexOf('هفتگی') !== -1 || text.indexOf('weekly') !== -1) {
    return { recurring: 'weekly', matched: true }
  }
  if (text.indexOf('هر ماه') !== -1 || text.indexOf('ماهانه') !== -1 || text.indexOf('monthly') !== -1) {
    return { recurring: 'monthly', matched: true }
  }
  return { recurring: null, matched: false }
}

const parseDuration = (text) => {
  // 30 دقیقه or 30 min
  const minMatch = text.match(/(\d+)\s*(دقیقه|min|m)/i)
  if (minMatch) {
    const minutes = parseInt(toEnglishDigits(minMatch[1]))
    return { duration: minutes, matched: true, matchedText: minMatch[0] }
  }
  
  // 2 ساعت or 2 hour
  const hourMatch = text.match(/(\d+)\s*(ساعت|hour|h)/i)
  if (hourMatch) {
    const hours = parseInt(toEnglishDigits(hourMatch[1]))
    return { duration: hours * 60, matched: true, matchedText: hourMatch[0] }
  }
  
  return { duration: null, matched: false, matchedText: null }
}

export const parseNaturalLanguage = (input, existingProjects = []) => {
  if (!input || !input.trim()) {
    return {
      title: '',
      dueDate: null,
      dueTime: null,
      priority: null,
      tags: [],
      projectId: null,
      recurring: null,
      timeEstimate: null,
      matched: false
    }
  }

  let workingText = input
  const matchedItems = []

  // 1. Project
  const projectResult = parseProject(workingText)
  let projectId = null
  if (projectResult.matched) {
    const parts = workingText.split(' ')
    workingText = parts.filter(p => !p.startsWith('@')).join(' ')
    matchedItems.push('project')
    
    const foundProject = existingProjects.find(p => 
      p.name.toLowerCase().indexOf(projectResult.projectName.toLowerCase()) !== -1
    )
    if (foundProject) projectId = foundProject.id
  }

  // 2. Tags
  const tagsResult = parseTags(workingText)
  if (tagsResult.matched) {
    const parts = workingText.split(' ')
    workingText = parts.filter(p => !p.startsWith('#')).join(' ')
    matchedItems.push('tags')
  }

  // 3. Priority
  const priorityResult = parsePriority(workingText)
  if (priorityResult.matched) {
    workingText = workingText.replace(/!(بالا|متوسط|کم|high|medium|low|urgent)/gi, '')
    matchedItems.push('priority')
  }

  // 4. Recurring
  const recurringResult = parseRecurring(workingText)
  if (recurringResult.matched) {
    workingText = workingText.replace(/هر روز|روزانه|daily/gi, '')
    workingText = workingText.replace(/هر هفته|هفتگی|weekly/gi, '')
    workingText = workingText.replace(/هر ماه|ماهانه|monthly/gi, '')
    matchedItems.push('recurring')
  }

  // 5. Duration
  const durationResult = parseDuration(workingText)
  if (durationResult.matched) {
    workingText = workingText.replace(durationResult.matchedText, '')
    matchedItems.push('duration')
  }

  // 6. Time
  const timeResult = parseTime(workingText)
  if (timeResult.matched) {
    // Remove time from text
    workingText = workingText.replace(/\d{1,2}:\d{2}/, '')
    workingText = workingText.replace(/(?:ساعت|at)\s*\d{1,2}/i, '')
    workingText = workingText.replace(/\d{1,2}(?::\d{2})?\s*(am|pm)/gi, '')
    matchedItems.push('time')
  }

  // 7. Date
  const dateResult = parseDate(workingText)
  if (dateResult.matched) {
    workingText = workingText.replace(/امروز|today/gi, '')
    workingText = workingText.replace(/فردا|tomorrow/gi, '')
    workingText = workingText.replace(/پس فردا|پس‌فردا/gi, '')
    workingText = workingText.replace(/هفته دیگه|next week/gi, '')
    workingText = workingText.replace(/ماه دیگه|next month/gi, '')
    
    for (const dayName in PERSIAN_WEEKDAYS) {
      workingText = workingText.replace(dayName, '')
    }
    for (const dayName in ENGLISH_WEEKDAYS) {
      const regex = new RegExp(dayName, 'gi')
      workingText = workingText.replace(regex, '')
    }
    matchedItems.push('date')
  }

  // 8. Title
  const title = workingText
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^[،,.\-]+|[،,.\-]+$/g, '')
    .trim()

  let dueDate = null
  if (dateResult.date) {
    dueDate = format(dateResult.date, 'yyyy-MM-dd')
  }

  return {
    title: title || input.trim(),
    dueDate,
    dueTime: timeResult.matched ? timeResult.hour : null,
    priority: priorityResult.priority,
    tags: tagsResult.tags,
    projectId,
    recurring: recurringResult.recurring,
    timeEstimate: durationResult.duration,
    matched: matchedItems.length > 0,
    matchedItems
  }
}

export const getNLPExamples = (isPersian = true) => {
  if (isPersian) {
    return [
      'جلسه با تیم فردا ساعت ۳ #کاری !بالا',
      'خرید نان امروز',
      'ورزش هر روز صبح ۶ ۳۰ دقیقه',
      'مطالعه کتاب پس فردا ۱۵:۰۰ #شخصی',
      'پرداخت قبض @مالی ماهانه'
    ]
  }
  return [
    'Team meeting tomorrow at 3pm #work !high',
    'Buy bread today',
    'Exercise daily at 6am 30min',
    'Study book in 2 days #personal',
    'Pay bills @finance monthly'
  ]
}

export default {
  parseNaturalLanguage,
  getNLPExamples
}