import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BANK_PATH = join(__dirname, '..', 'src', 'data', 'questionBank.js')

// Read existing bank
const src = readFileSync(BANK_PATH, 'utf8')
const match = src.match(/export const questionBank = (\{[\s\S]*?\n\});/)
if (!match) throw new Error('Could not parse questionBank')
// Safe: indirect eval on trusted local file (our own questionBank.js, not user input)
const oldBank = (0, eval)('(' + match[1] + ')')

function gcd(a, b) { return b === 0 ? a : gcd(b, a % b) }
function lcm(a, b) { return (a * b) / gcd(a, b) }
function round(n, d = 2) { return Math.round(n * 10 ** d) / 10 ** d }

function distractors(answer) {
  if (Number.isInteger(answer)) return [answer + 1, answer - 1, answer + 2]
  const step = Math.abs(answer) >= 10 ? 1 : 0.5
  return [round(answer + step), round(answer - step), round(answer + step * 2)]
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ============ LEVEL 1: Single-digit +/- ============
function generateLevel1() {
  const questions = []
  const seen = new Set()

  // All 2-operand: a + b (81 combos)
  for (let a = 1; a <= 9; a++) {
    for (let b = 1; b <= 9; b++) {
      const q = `${a} + ${b} = ?`
      if (!seen.has(q)) {
        seen.add(q)
        const ans = a + b
        questions.push({ question: q, answer: ans, answerDisplay: String(ans), distractors: distractors(ans) })
      }
    }
  }

  // All 2-operand: a - b where a > b (36 combos)
  for (let a = 2; a <= 9; a++) {
    for (let b = 1; b < a; b++) {
      const q = `${a} - ${b} = ?`
      if (!seen.has(q)) {
        seen.add(q)
        const ans = a - b
        questions.push({ question: q, answer: ans, answerDisplay: String(ans), distractors: distractors(ans) })
      }
    }
  }

  // Remaining: a - b = c where a in [11,30], c in [1,9], b = a - c
  const extras = []
  for (let a = 11; a <= 30; a++) {
    for (let c = 1; c <= 9; c++) {
      const b = a - c
      if (b > 0) {
        const q = `${a} - ${b} = ?`
        if (!seen.has(q)) {
          extras.push({ question: q, answer: c, answerDisplay: String(c), distractors: distractors(c) })
          seen.add(q)
        }
      }
    }
  }

  const needed = 200 - questions.length
  const picked = shuffle(extras).slice(0, needed)
  questions.push(...picked)

  return shuffle(questions).slice(0, 200).map((q, i) => ({ id: i + 1, ...q }))
}

// ============ LEVEL 2 (old L1): a ± b ± c, small numbers ============
function expandLevel2(existing) {
  const seen = new Set(existing.map(q => q.question))
  const news = []
  let tries = 0
  while (news.length < 100 && tries < 10000) {
    tries++
    const a = Math.floor(Math.random() * 16) + 2
    const b = Math.floor(Math.random() * 9) + 1
    const c = Math.floor(Math.random() * 9) + 1
    const ops = ['+', '-']
    const op1 = ops[Math.floor(Math.random() * 2)]
    const op2 = ops[Math.floor(Math.random() * 2)]
    const ans = (op1 === '+' ? a + b : a - b) + (op2 === '+' ? c : -c)
    if (ans <= 0 || !Number.isInteger(ans)) continue
    const q = `${a} ${op1} ${b} ${op2} ${c} = ?`
    if (seen.has(q)) continue
    seen.add(q)
    news.push({ id: existing.length + news.length + 1, question: q, answer: ans, answerDisplay: String(ans), distractors: distractors(ans) })
  }
  return [...existing, ...news]
}

// ============ LEVEL 3 (old L2): double-digit ± ============
function expandLevel3(existing) {
  const seen = new Set(existing.map(q => q.question))
  const news = []
  let tries = 0
  while (news.length < 100 && tries < 10000) {
    tries++
    const a = Math.floor(Math.random() * 52) + 14
    const b = Math.floor(Math.random() * 8) + 2
    const c = Math.floor(Math.random() * 8) + 2
    const op1 = Math.random() < 0.5 ? '+' : '-'
    const op2 = Math.random() < 0.5 ? '+' : '-'
    const ans = (op1 === '+' ? a + b : a - b) + (op2 === '+' ? c : -c)
    if (ans <= 0 || !Number.isInteger(ans)) continue
    const q = `${a} ${op1} ${b} ${op2} ${c} = ?`
    if (seen.has(q)) continue
    seen.add(q)
    news.push({ id: existing.length + news.length + 1, question: q, answer: ans, answerDisplay: String(ans), distractors: distractors(ans) })
  }
  return [...existing, ...news]
}

// ============ LEVEL 4 (old L3): mixed operations ============
function expandLevel4(existing) {
  const seen = new Set(existing.map(q => q.question))
  const news = []
  const patterns = [
    () => { const b = Math.floor(Math.random()*8)+2; const c = Math.floor(Math.random()*8)+2; const a = Math.floor(Math.random()*30)+5; return { q: `${a} + ${b} × ${c} = ?`, ans: a + b*c }},
    () => { const b = Math.floor(Math.random()*8)+2; const c = Math.floor(Math.random()*8)+2; const a = Math.floor(Math.random()*30)+b*c+1; return { q: `${a} - ${b} × ${c} = ?`, ans: a - b*c }},
    () => { const a = Math.floor(Math.random()*8)+2; const b = Math.floor(Math.random()*8)+2; const c = Math.floor(Math.random()*20)+5; return { q: `${a} × ${b} + ${c} = ?`, ans: a*b + c }},
    () => { const a = Math.floor(Math.random()*8)+2; const b = Math.floor(Math.random()*8)+2; const c = Math.floor(Math.random()*10)+1; if (a*b <= c) return null; return { q: `${a} × ${b} - ${c} = ?`, ans: a*b - c }},
    () => { const b = [2,3,4,5,6,7,8,9][Math.floor(Math.random()*8)]; const m = Math.floor(Math.random()*8)+2; const a = b*m; const c = Math.floor(Math.random()*20)+5; return { q: `${a} ÷ ${b} + ${c} = ?`, ans: a/b + c }},
    () => { const b = [2,3,4,5,6,7,8,9][Math.floor(Math.random()*8)]; const m = Math.floor(Math.random()*8)+2; const a = b*m; const c = Math.floor(Math.random()*5)+1; if (a/b <= c) return null; return { q: `${a} ÷ ${b} - ${c} = ?`, ans: a/b - c }},
  ]
  let tries = 0
  while (news.length < 100 && tries < 10000) {
    tries++
    const fn = patterns[Math.floor(Math.random() * patterns.length)]
    const r = fn()
    if (!r || r.ans <= 0 || !Number.isInteger(r.ans)) continue
    if (seen.has(r.q)) continue
    seen.add(r.q)
    news.push({ id: existing.length + news.length + 1, question: r.q, answer: r.ans, answerDisplay: String(r.ans), distractors: distractors(r.ans) })
  }
  return [...existing, ...news]
}

// ============ LEVEL 5 (old L4): integer + fraction operations ============
function expandLevel5(existing) {
  const seen = new Set(existing.map(q => q.question))
  const news = []
  const fracs = [[1,2],[1,3],[1,4],[1,5],[2,3],[2,5],[3,4],[3,5],[3,8],[4,5],[5,6],[5,8]]
  const patterns = [
    () => { const a = Math.floor(Math.random()*8)+2; const b = Math.floor(Math.random()*8)+2; const c = [1,2,3,4,5,6][Math.floor(Math.random()*6)]; if ((a*b)%c!==0) return null; return { q: `${a} × ${b} ÷ ${c} = ?`, ans: a*b/c, disp: String(a*b/c) }},
    () => { const [n,d] = fracs[Math.floor(Math.random()*fracs.length)]; const m = Math.floor(Math.random()*6)+2; const a = d*m; return { q: `${n}/${d} × ${a} = ?`, ans: round(n*a/d), disp: String(round(n*a/d)) }},
    () => { const [n,d] = fracs[Math.floor(Math.random()*fracs.length)]; const c = Math.floor(Math.random()*8)+2; const [n2,d2] = fracs[Math.floor(Math.random()*fracs.length)]; const ans = round(n/d + n2/d2); if (ans <= 0) return null; return { q: `${n}/${d} + ${n2}/${d2} = ?`, ans, disp: String(ans) }},
    () => { const [n,d] = fracs[Math.floor(Math.random()*fracs.length)]; const a = Math.floor(Math.random()*6)+2; const c = [1,2,3][Math.floor(Math.random()*3)]; const ans = round(n/d * a / c); if (ans <= 0 || !isFinite(ans)) return null; return { q: `${n}/${d} × ${a} ÷ ${c} = ?`, ans, disp: String(ans) }},
  ]
  let tries = 0
  while (news.length < 100 && tries < 15000) {
    tries++
    const fn = patterns[Math.floor(Math.random() * patterns.length)]
    const r = fn()
    if (!r || r.ans <= 0) continue
    if (seen.has(r.q)) continue
    seen.add(r.q)
    news.push({ id: existing.length + news.length + 1, question: r.q, answer: r.ans, answerDisplay: r.disp, distractors: distractors(r.ans) })
  }
  return [...existing, ...news]
}

// ============ LEVEL 6 (old L5): decimal + fraction operations ============
function expandLevel6(existing) {
  const seen = new Set(existing.map(q => q.question))
  const news = []
  const decs = [1.5, 2.5, 3.5, 4.5, 0.5, 1.2, 2.4, 3.6, 4.8, 6.4, 7.2, 8.4, 0.8, 1.6, 2.8, 3.2, 4.2, 5.4, 6.6]
  const fracs = [[1,2],[1,3],[1,4],[2,3],[2,5],[3,4],[3,5],[4,5],[5,6]]
  const patterns = [
    () => { const a = decs[Math.floor(Math.random()*decs.length)]; const b = Math.floor(Math.random()*6)+2; const c = [1,2,4,5][Math.floor(Math.random()*4)]; const ans = round(a*b/c); if (ans<=0||!isFinite(ans)) return null; return { q: `${a} × ${b} ÷ ${c} = ?`, ans, disp: String(ans) }},
    () => { const [n,d] = fracs[Math.floor(Math.random()*fracs.length)]; const a = Math.floor(Math.random()*30)+5; if ((n*a)%d!==0 && round(n*a/d)!==n*a/d) return null; const b = Math.floor(Math.random()*10)+1; const ans = round(n/d*a+b); return { q: `${n}/${d} × ${a} + ${b} = ?`, ans, disp: String(ans) }},
    () => { const a = decs[Math.floor(Math.random()*decs.length)]; const b = decs[Math.floor(Math.random()*decs.length)]; const c = [2,4,5][Math.floor(Math.random()*3)]; const ans = round(a+b/c); if (ans<=0) return null; return { q: `${a} + ${b} ÷ ${c} = ?`, ans, disp: String(ans) }},
    () => { const a = decs[Math.floor(Math.random()*decs.length)]; const b = decs[Math.floor(Math.random()*decs.length)]; if (a<=b) return null; const ans = round(a-b); return { q: `${a} - ${b} = ?`, ans, disp: String(ans) }},
  ]
  let tries = 0
  while (news.length < 100 && tries < 15000) {
    tries++
    const fn = patterns[Math.floor(Math.random() * patterns.length)]
    const r = fn()
    if (!r || r.ans <= 0) continue
    if (seen.has(r.q)) continue
    seen.add(r.q)
    news.push({ id: existing.length + news.length + 1, question: r.q, answer: r.ans, answerDisplay: r.disp, distractors: distractors(r.ans) })
  }
  return [...existing, ...news]
}

// ============ LEVEL 7 (old L6): percentages + decimals + fractions ============
function expandLevel7(existing) {
  const seen = new Set(existing.map(q => q.question))
  const news = []
  const pcts = [5,10,12,15,18,20,22,25,28,30,32,35,38,40,42,45,48,50,55,60,65,70,72,75,78,80,85,88,90,92,95]
  const bases = [20,25,30,40,50,60,75,80,100,120,125,150,160,200,240,250,300,400,500]
  const fracs = [[1,2],[1,4],[2,3],[2,5],[3,4],[3,5],[3,8],[4,5],[5,6],[5,8],[7,8]]
  const patterns = [
    () => { const p = pcts[Math.floor(Math.random()*pcts.length)]; const b = bases[Math.floor(Math.random()*bases.length)]; const ans = round(p*b/100); if (!Number.isInteger(ans) && round(ans,1)!==ans) return null; return { q: `${p}% of ${b} = ?`, ans, disp: String(ans) }},
    () => { const [n,d] = fracs[Math.floor(Math.random()*fracs.length)]; const a = d * (Math.floor(Math.random()*6)+2); const b = Math.floor(Math.random()*10)+1; const ans = round(n/d*a-b); if (ans<=0) return null; return { q: `${n}/${d} × ${a} - ${b} = ?`, ans, disp: String(ans) }},
    () => { const a = round((Math.floor(Math.random()*50)+10)/10); const b = Math.floor(Math.random()*8)+2; const c = Math.floor(Math.random()*10)+1; const ans = round(a*b+c); return { q: `${a} × ${b} + ${c} = ?`, ans, disp: String(ans) }},
  ]
  let tries = 0
  while (news.length < 100 && tries < 15000) {
    tries++
    const fn = patterns[Math.floor(Math.random() * patterns.length)]
    const r = fn()
    if (!r || r.ans <= 0) continue
    if (seen.has(r.q)) continue
    seen.add(r.q)
    news.push({ id: existing.length + news.length + 1, question: r.q, answer: r.ans, answerDisplay: r.disp, distractors: distractors(r.ans) })
  }
  return [...existing, ...news]
}

// ============ LEVEL 8 (old L7): GCD/LCM + fractions + decimals + percentages ============
function expandLevel8(existing) {
  const seen = new Set(existing.map(q => q.question))
  const news = []

  const gcdPairs = [[12,16],[15,20],[18,24],[20,35],[21,35],[24,40],[25,35],[27,36],[28,42],[30,42],[32,40],[33,44],[35,49],[36,48],[40,56],[42,63],[44,66],[48,60],[50,75],[54,81],[56,84],[60,84],[63,84],[66,88],[70,98],[72,96],[75,100],[78,104],[80,100],[84,112]]
  const lcmPairs = [[3,7],[4,9],[5,8],[6,10],[7,9],[8,15],[9,12],[10,14],[11,15],[12,16],[13,20],[14,18],[15,20],[16,24],[18,28],[20,24],[21,28],[22,30],[24,36],[25,30]]
  const pcts = [8,12,15,18,22,28,32,35,38,42,48,52,55,58,62,68,72,78,82,88,92,95]
  const bases = [50,75,100,125,150,200,250,300,350,400,450,500,600]
  const fracs = [[1,3],[1,4],[2,5],[3,7],[3,8],[4,9],[5,6],[5,7],[5,9],[7,8],[7,12],[8,15],[11,12]]

  const patterns = [
    () => {
      const [a,b] = gcdPairs[Math.floor(Math.random()*gcdPairs.length)]
      const ans = gcd(a,b)
      const q = `ห.ร.ม. ของ ${a} และ ${b} = ?`
      const qEn = `GCD of ${a} and ${b} = ?`
      return { q, qEn, ans, disp: String(ans) }
    },
    () => {
      const [a,b] = lcmPairs[Math.floor(Math.random()*lcmPairs.length)]
      const ans = lcm(a,b)
      const q = `ค.ร.น. ของ ${a} และ ${b} = ?`
      const qEn = `LCM of ${a} and ${b} = ?`
      return { q, qEn, ans, disp: String(ans) }
    },
    () => {
      const [n1,d1] = fracs[Math.floor(Math.random()*fracs.length)]
      const [n2,d2] = fracs[Math.floor(Math.random()*fracs.length)]
      const ans = round(n1/d1 + n2/d2)
      if (ans <= 0) return null
      return { q: `${n1}/${d1} + ${n2}/${d2} = ?`, ans, disp: String(ans) }
    },
    () => {
      const [n1,d1] = fracs[Math.floor(Math.random()*fracs.length)]
      const [n2,d2] = fracs[Math.floor(Math.random()*fracs.length)]
      const ans = round(n1/d1 - n2/d2)
      if (ans <= 0) return null
      return { q: `${n1}/${d1} - ${n2}/${d2} = ?`, ans, disp: String(ans) }
    },
    () => {
      const a = round((Math.floor(Math.random()*150)+10)/10)
      const b = round((Math.floor(Math.random()*80)+10)/10)
      const ans = round(a + b)
      return { q: `${a} + ${b} = ?`, ans, disp: String(ans) }
    },
    () => {
      const a = round((Math.floor(Math.random()*150)+50)/10)
      const b = round((Math.floor(Math.random()*40)+10)/10)
      const ans = round(a - b)
      if (ans <= 0) return null
      return { q: `${a} - ${b} = ?`, ans, disp: String(ans) }
    },
    () => {
      const p = pcts[Math.floor(Math.random()*pcts.length)]
      const b = bases[Math.floor(Math.random()*bases.length)]
      const ans = round(p*b/100)
      if (!Number.isInteger(ans) && round(ans,1)!==ans) return null
      const q = `${p}% ของ ${b} = ?`
      const qEn = `${p}% of ${b} = ?`
      return { q, qEn, ans, disp: String(ans) }
    },
  ]

  let tries = 0
  while (news.length < 100 && tries < 20000) {
    tries++
    const fn = patterns[Math.floor(Math.random() * patterns.length)]
    const r = fn()
    if (!r || r.ans <= 0) continue
    if (seen.has(r.q)) continue
    seen.add(r.q)
    const entry = { id: existing.length + news.length + 1, question: r.q, answer: r.ans, answerDisplay: r.disp, distractors: distractors(r.ans) }
    if (r.qEn) entry.questionEn = r.qEn
    news.push(entry)
  }
  return [...existing, ...news]
}

// ============ MAIN ============
console.log('Generating new question bank...')

const level1 = generateLevel1()
console.log(`Level 1 (new): ${level1.length} questions`)

const level2 = expandLevel2(oldBank["1"])
console.log(`Level 2 (old L1): ${level2.length} questions`)

const level3 = expandLevel3(oldBank["2"])
console.log(`Level 3 (old L2): ${level3.length} questions`)

const level4 = expandLevel4(oldBank["3"])
console.log(`Level 4 (old L3): ${level4.length} questions`)

const level5 = expandLevel5(oldBank["4"])
console.log(`Level 5 (old L4): ${level5.length} questions`)

const level6 = expandLevel6(oldBank["5"])
console.log(`Level 6 (old L5): ${level6.length} questions`)

const level7 = expandLevel7(oldBank["6"])
console.log(`Level 7 (old L6): ${level7.length} questions`)

const level8 = expandLevel8(oldBank["7"])
console.log(`Level 8 (old L7): ${level8.length} questions`)

const newBank = { "1": level1, "2": level2, "3": level3, "4": level4, "5": level5, "6": level6, "7": level7, "8": level8 }

// Validate
let total = 0
for (const [k, qs] of Object.entries(newBank)) {
  total += qs.length
  if (qs.length < 200) console.warn(`WARNING: Level ${k} only has ${qs.length} questions`)
  if (k === "1") {
    const bad = qs.filter(q => q.answer <= 0)
    if (bad.length) console.warn(`WARNING: Level 1 has ${bad.length} questions with answer <= 0`)
  }
}
console.log(`Total: ${total} questions across ${Object.keys(newBank).length} levels`)

// Write output
let output = `// Auto-generated question bank - DO NOT EDIT\n// ${total} questions across 8 levels from official competition documents + generated\n\nexport const questionBank = ${JSON.stringify(newBank, null, 2)};\n\nexport function getExamQuestions(level) {\n  const questions = questionBank[level];\n  if (!questions) throw new Error(\`Invalid level: \${level}\`);\n  return questions;\n}\n`

writeFileSync(BANK_PATH, output)
console.log('Written to', BANK_PATH)
