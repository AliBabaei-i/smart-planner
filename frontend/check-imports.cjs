// frontend/check-imports.cjs
const fs = require('fs')
const path = require('path')

const SRC = path.join(__dirname, 'src')

function walk(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, files)
    else files.push(full)
  }
  return files
}

const allFiles = walk(SRC)

function extractExports(file) {
  const content = fs.readFileSync(file, 'utf8')
  const exports = new Set()
  let m
  const re1 = /export\s+(?:const|let|var|function|class|type|interface)\s+([A-Za-z_$][\w$]*)/g
  while ((m = re1.exec(content))) exports.add(m[1])
  const re2 = /export\s*\{([^}]+)\}/g
  while ((m = re2.exec(content))) {
    m[1].split(',').forEach(name => {
      const clean = name.trim().split(/\s+as\s+/).pop().trim()
      if (clean) exports.add(clean)
    })
  }
  if (/export\s+default/.test(content)) exports.add('default')
  return exports
}

const sliceFiles = allFiles.filter(f => /Slice\.(ts|tsx|js|jsx)$/.test(f))
const sliceExports = {}
for (const f of sliceFiles) sliceExports[f] = extractExports(f)

const missing = []
for (const file of allFiles) {
  if (!/\.(js|jsx|ts|tsx)$/.test(file)) continue
  if (sliceFiles.includes(file)) continue
  const content = fs.readFileSync(file, 'utf8')
  const importRe = /import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+Slice[^'"]*)['"]/g
  let m
  while ((m = importRe.exec(content))) {
    const names = m[1].split(',').map(n => n.trim().split(/\s+as\s+/)[0].trim()).filter(Boolean)
    const importPath = m[2]
    const dir = path.dirname(file)
    let resolved = path.resolve(dir, importPath)
    if (!/\.[tj]sx?$/.test(resolved)) {
      for (const ext of ['.ts', '.tsx', '.js', '.jsx']) {
        if (fs.existsSync(resolved + ext)) { resolved = resolved + ext; break }
      }
    }
    const set = sliceExports[resolved]
    if (!set) continue
    for (const name of names) {
      if (name === 'default' || name.startsWith('type ')) continue
      if (!set.has(name)) {
        missing.push({ file: path.relative(SRC, file), missing: name, slice: path.relative(SRC, resolved) })
      }
    }
  }
}

const grouped = {}
for (const item of missing) {
  if (!grouped[item.slice]) grouped[item.slice] = []
  grouped[item.slice].push(item)
}

console.log('\n🔍 Missing exports report:\n')
if (Object.keys(grouped).length === 0) {
  console.log('✅ هیچ خطایی پیدا نشد!')
} else {
  for (const [slice, items] of Object.entries(grouped)) {
    const unique = [...new Set(items.map(i => i.missing))]
    const users = [...new Set(items.map(i => i.file))]
    console.log(`\n📦 ${slice}`)
    console.log(`   ❌ Missing: ${unique.join(', ')}`)
    console.log(`   Used by:`)
    for (const u of users) console.log(`     - ${u}`)
  }
  console.log(`\n📊 Total: ${missing.length} missing exports in ${Object.keys(grouped).length} slice(s)\n`)
}