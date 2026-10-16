// ═══════════════════════════════════════════════
// ✅ Simple Logger (رنگی در dev)
// ═══════════════════════════════════════════════
import config from '../config/env.js'

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
}

const timestamp = () => new Date().toISOString()

export const logger = {
  info: (...args) => {
    const prefix = config.isDev
      ? `${colors.cyan}[INFO]${colors.reset} ${colors.gray}${timestamp()}${colors.reset}`
      : `[INFO] ${timestamp()}`
    console.log(prefix, ...args)
  },

  warn: (...args) => {
    const prefix = config.isDev
      ? `${colors.yellow}[WARN]${colors.reset} ${colors.gray}${timestamp()}${colors.reset}`
      : `[WARN] ${timestamp()}`
    console.warn(prefix, ...args)
  },

  error: (...args) => {
    const prefix = config.isDev
      ? `${colors.red}[ERROR]${colors.reset} ${colors.gray}${timestamp()}${colors.reset}`
      : `[ERROR] ${timestamp()}`
    console.error(prefix, ...args)
  },

  success: (...args) => {
    const prefix = config.isDev
      ? `${colors.green}[OK]${colors.reset} ${colors.gray}${timestamp()}${colors.reset}`
      : `[OK] ${timestamp()}`
    console.log(prefix, ...args)
  },

  request: (method, path, status, duration) => {
    const statusColor = status >= 500 ? colors.red
                      : status >= 400 ? colors.yellow
                      : colors.green
    const prefix = config.isDev
      ? `${colors.gray}${timestamp()}${colors.reset} ${method.padEnd(6)} ${path} ${statusColor}${status}${colors.reset} ${colors.gray}${duration}ms${colors.reset}`
      : `${timestamp()} ${method} ${path} ${status} ${duration}ms`
    console.log(prefix)
  }
}

export default logger