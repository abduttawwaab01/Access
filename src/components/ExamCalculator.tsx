"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Calculator, X, Sigma, FunctionSquare } from "lucide-react"

function factorial(n: number): number {
  if (n < 0) return NaN
  if (n === 0 || n === 1) return 1
  if (n > 170) return Infinity
  if (!Number.isInteger(n)) return gamma(n + 1)
  let r = 1
  for (let i = 2; i <= n; i++) r *= i
  return r
}

function gamma(z: number): number {
  if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z))
  z -= 1
  let x = 0.99999999999980993
  const g = [676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7]
  for (let i = 0; i < g.length; i++) x += g[i] / (z + i + 1)
  const t = z + g.length - 0.5
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x
}

function formatResult(n: number): string {
  if (isNaN(n)) return "Error"
  if (!isFinite(n) && n > 0) return "Infinity"
  if (!isFinite(n) && n < 0) return "-Infinity"
  if (Number.isInteger(n) && Math.abs(n) < 1e15) return n.toString()
  const s = n.toPrecision(10)
  const parsed = parseFloat(s)
  if (Number.isInteger(parsed) && Math.abs(parsed) < 1e15) return parsed.toString()
  return s.replace(/\.?0+$/, "")
}

function tokenize(expr: string): string[] {
  const tokens: string[] = []
  let i = 0
  while (i < expr.length) {
    if (expr[i] === " ") { i++; continue }
    if ("+-*/()%^".includes(expr[i])) { tokens.push(expr[i]); i++; continue }
    if (expr[i] === "." || (expr[i] >= "0" && expr[i] <= "9")) {
      let num = ""
      while (i < expr.length && (expr[i] >= "0" && expr[i] <= "9" || expr[i] === ".")) { num += expr[i]; i++ }
      if (expr[i] === "e" && (expr[i + 1] === "+" || expr[i + 1] === "-" || (expr[i + 1] >= "0" && expr[i + 1] <= "9"))) {
        num += "e"; i++
        if (expr[i] === "+" || expr[i] === "-") { num += expr[i]; i++ }
        while (i < expr.length && expr[i] >= "0" && expr[i] <= "9") { num += expr[i]; i++ }
      }
      tokens.push(num); continue
    }
    if ("πe".includes(expr[i])) { tokens.push(expr[i]); i++; continue }
    if (expr[i] === "s" && expr.slice(i, i + 4) === "sin(") { tokens.push("sin("); i += 4; continue }
    if (expr[i] === "c" && expr.slice(i, i + 4) === "cos(") { tokens.push("cos("); i += 4; continue }
    if (expr[i] === "t" && expr.slice(i, i + 4) === "tan(") { tokens.push("tan("); i += 4; continue }
    if (expr[i] === "l" && expr.slice(i, i + 3) === "ln(") { tokens.push("ln("); i += 3; continue }
    if (expr[i] === "l" && expr.slice(i, i + 5) === "log(") { tokens.push("log("); i += 5; continue }
    if (expr[i] === "s" && expr.slice(i, i + 5) === "sqrt(") { tokens.push("sqrt("); i += 5; continue }
    if (expr[i] === "c" && expr.slice(i, i + 5) === "cbrt(") { tokens.push("cbrt("); i += 5; continue }
    if (expr[i] === "a" && expr.slice(i, i + 6) === "asin(") { tokens.push("asin("); i += 6; continue }
    if (expr[i] === "a" && expr.slice(i, i + 6) === "acos(") { tokens.push("acos("); i += 6; continue }
    if (expr[i] === "a" && expr.slice(i, i + 6) === "atan(") { tokens.push("atan("); i += 6; continue }
    break
  }
  return tokens
}

function parseExpression(tokens: string[], pos: { i: number }): number {
  let left = parseFactor(tokens, pos)
  while (pos.i < tokens.length && (tokens[pos.i] === "+" || tokens[pos.i] === "-")) {
    const op = tokens[pos.i]; pos.i++
    const right = parseFactor(tokens, pos)
    left = op === "+" ? left + right : left - right
  }
  return left
}

function parseFactor(tokens: string[], pos: { i: number }): number {
  let left = parsePower(tokens, pos)
  while (pos.i < tokens.length && (tokens[pos.i] === "*" || tokens[pos.i] === "/" || tokens[pos.i] === "%")) {
    const op = tokens[pos.i]; pos.i++
    const right = parsePower(tokens, pos)
    if (op === "*") left = left * right
    else if (op === "/") left = right !== 0 ? left / right : NaN
    else left = left * (right / 100)
  }
  return left
}

function parsePower(tokens: string[], pos: { i: number }): number {
  let left = parseUnary(tokens, pos)
  if (pos.i < tokens.length && tokens[pos.i] === "^") {
    pos.i++
    const right = parsePower(tokens, pos)
    left = Math.pow(left, right)
  }
  return left
}

function parseUnary(tokens: string[], pos: { i: number }): number {
  if (pos.i < tokens.length && tokens[pos.i] === "-") {
    pos.i++
    return -parseUnary(tokens, pos)
  }
  if (pos.i < tokens.length && tokens[pos.i] === "+") {
    pos.i++
    return parseUnary(tokens, pos)
  }
  return parseAtom(tokens, pos)
}

function parseAtom(tokens: string[], pos: { i: number }): number {
  if (pos.i >= tokens.length) return NaN

  const t = tokens[pos.i]

  if (t === "(") { pos.i++; const v = parseExpression(tokens, pos); if (pos.i < tokens.length && tokens[pos.i] === ")") pos.i++; return v }
  if (t === "π") { pos.i++; return Math.PI }
  if (t === "e") { pos.i++; return Math.E }

  if (t.endsWith("(")) {
    const fn = t.slice(0, -1)
    pos.i++
    const arg = parseExpression(tokens, pos)
    if (pos.i < tokens.length && tokens[pos.i] === ")") pos.i++
    switch (fn) {
      case "sin": return Math.sin(arg * Math.PI / 180)
      case "cos": return Math.cos(arg * Math.PI / 180)
      case "tan": return Math.tan(arg * Math.PI / 180)
      case "asin": return Math.asin(arg) * 180 / Math.PI
      case "acos": return Math.acos(arg) * 180 / Math.PI
      case "atan": return Math.atan(arg) * 180 / Math.PI
      case "ln": return Math.log(arg)
      case "log": return Math.log10(arg)
      case "sqrt": return Math.sqrt(arg)
      case "cbrt": return Math.cbrt(arg)
      default: return NaN
    }
  }

  if (t.endsWith("!")) {
    const n = parseFloat(t.slice(0, -1))
    pos.i++
    return factorial(n)
  }

  pos.i++
  return parseFloat(t)
}

function evaluate(expr: string): number {
  const cleaned = expr
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/\u00f7/g, "/")
  const tokens = tokenize(cleaned)
  if (tokens.length === 0) return 0
  try {
    return parseExpression(tokens, { i: 0 })
  } catch {
    return NaN
  }
}

const SCIENTIFIC_MODE = true

interface CalcBtnProps {
  label: string
  onClick: () => void
  span?: boolean
  variant?: "number" | "op" | "fn" | "util" | "equals"
  size?: "sm" | "md"
}

function CalcBtn({ label, onClick, span, variant = "number", size = "md" }: CalcBtnProps) {
  const base = "rounded-xl font-medium transition-all active:scale-95 select-none touch-none"
  const spanClass = span ? "col-span-2" : ""
  const sizeClass = size === "sm" ? "h-9 text-xs" : "h-11 text-sm"
  let variantClass = ""
  switch (variant) {
    case "number": variantClass = "bg-muted hover:bg-muted/80 text-foreground"; break
    case "op": variantClass = "bg-primary/15 hover:bg-primary/25 text-primary"; break
    case "fn": variantClass = "bg-secondary/30 hover:bg-secondary/50 text-muted-foreground"; break
    case "util": variantClass = "bg-muted/50 hover:bg-muted/70 text-muted-foreground"; break
    case "equals": variantClass = "animated-gradient text-white border-0"; break
  }
  return (
    <button
      type="button"
      className={`${base} ${spanClass} ${sizeClass} ${variantClass}`}
      onClick={onClick}
    >
      {label}
    </button>
  )
}

export function ExamCalculator() {
  const [open, setOpen] = useState(false)
  const [expr, setExpr] = useState("")
  const [result, setResult] = useState<string>("")
  const [showResult, setShowResult] = useState(false)
  const [scientific, setScientific] = useState(false)
  const [isSmall, setIsSmall] = useState(false)
  const [showExpr, setShowExpr] = useState("")
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)")
    setIsSmall(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsSmall(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  const append = useCallback((val: string) => {
    setExpr((prev) => {
      if (showResult) {
        setShowResult(false)
        return val
      }
      return prev + val
    })
    setShowResult(false)
  }, [showResult])

  const clear = useCallback(() => {
    setExpr("")
    setResult("")
    setShowResult(false)
  }, [])

  const clearEntry = useCallback(() => {
    setExpr("")
  }, [])

  const backspace = useCallback(() => {
    setExpr((prev) => prev.slice(0, -1))
    setShowResult(false)
  }, [])

  const negate = useCallback(() => {
    if (!expr) return
    if (expr.startsWith("-")) setExpr(expr.slice(1))
    else setExpr("-" + expr)
  }, [expr])

  const percent = useCallback(() => {
    append("%")
  }, [append])

  const calcResult = useCallback(() => {
    try {
      const v = evaluate(expr)
      const f = formatResult(v)
      setResult(f)
      setShowResult(true)
      setShowExpr(expr)
      setExpr(f)
    } catch {
      setResult("Error")
      setShowResult(true)
    }
  }, [expr])

  const insertFn = useCallback((fn: string) => {
    append(fn + "(")
  }, [append])

  const insertConstant = useCallback((c: string) => {
    append(c)
  }, [append])

  const factorial_ = useCallback(() => {
    append("!")
  }, [append])

  const keyboardHandler = useCallback((e: React.KeyboardEvent) => {
    if (e.key >= "0" && e.key <= "9") append(e.key)
    else if (e.key === ".") append(".")
    else if (e.key === "+") append("+")
    else if (e.key === "-") append("-")
    else if (e.key === "*" || e.key === "x") append("×")
    else if (e.key === "/") append("÷")
    else if (e.key === "%") append("%")
    else if (e.key === "^") append("^")
    else if (e.key === "(") append("(")
    else if (e.key === ")") append(")")
    else if (e.key === "Enter" || e.key === "=") calcResult()
    else if (e.key === "Backspace") backspace()
    else if (e.key === "Escape") clear()
    else if (e.key === "Delete") clearEntry()
  }, [append, calcResult, backspace, clear, clearEntry])

  const basicKeys = [
    [ { l: "C", v: "util", a: clear }, { l: "CE", v: "util", a: clearEntry }, { l: "⌫", v: "util", a: backspace }, { l: "÷", v: "op", a: () => append("÷") } ],
    [ { l: "7", v: "number", a: () => append("7") }, { l: "8", v: "number", a: () => append("8") }, { l: "9", v: "number", a: () => append("9") }, { l: "×", v: "op", a: () => append("×") } ],
    [ { l: "4", v: "number", a: () => append("4") }, { l: "5", v: "number", a: () => append("5") }, { l: "6", v: "number", a: () => append("6") }, { l: "-", v: "op", a: () => append("-") } ],
    [ { l: "1", v: "number", a: () => append("1") }, { l: "2", v: "number", a: () => append("2") }, { l: "3", v: "number", a: () => append("3") }, { l: "+", v: "op", a: () => append("+") } ],
    [ { l: "±", v: "util", a: negate }, { l: "0", v: "number", a: () => append("0") }, { l: ".", v: "number", a: () => append(".") }, { l: "=", v: "equals", a: calcResult } ],
  ]

  const sciKeys = [
    [ { l: "(", v: "fn", a: () => append("(") }, { l: ")", v: "fn", a: () => append(")") }, { l: "π", v: "fn", a: () => insertConstant("π") }, { l: "e", v: "fn", a: () => insertConstant("e") }, { l: "n!", v: "fn", a: factorial_ } ],
    [ { l: "x²", v: "fn", a: () => append("^2") }, { l: "x³", v: "fn", a: () => append("^3") }, { l: "xʸ", v: "fn", a: () => append("^") }, { l: "√", v: "fn", a: () => insertFn("sqrt") }, { l: "∛", v: "fn", a: () => insertFn("cbrt") } ],
    [ { l: "sin", v: "fn", a: () => insertFn("sin") }, { l: "cos", v: "fn", a: () => insertFn("cos") }, { l: "tan", v: "fn", a: () => insertFn("tan") }, { l: "log₁₀", v: "fn", a: () => insertFn("log") }, { l: "ln", v: "fn", a: () => insertFn("ln") } ],
    [ { l: "sin⁻¹", v: "fn", a: () => insertFn("asin") }, { l: "cos⁻¹", v: "fn", a: () => insertFn("acos") }, { l: "tan⁻¹", v: "fn", a: () => insertFn("atan") }, { l: "%", v: "fn", a: () => append("%") }, { l: "±", v: "util", a: negate } ],
  ]

  if (!open) {
    return (
      <motion.button
        type="button"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-2xl animated-gradient text-white shadow-lg shadow-primary/25 cursor-pointer border-0"
        aria-label="Open calculator"
      >
        <Calculator className="h-5 w-5" />
      </motion.button>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        ref={panelRef}
        initial={isSmall ? { y: 300, opacity: 0 } : { scale: 0.8, opacity: 0 }}
        animate={isSmall ? { y: 0, opacity: 1 } : { scale: 1, opacity: 1 }}
        exit={isSmall ? { y: 300, opacity: 0 } : { scale: 0.8, opacity: 0 }}
        drag={!isSmall}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.05}
        onKeyDown={keyboardHandler}
        tabIndex={0}
        className={
          isSmall
            ? "fixed bottom-0 left-0 right-0 z-40 rounded-t-2xl bg-card border shadow-2xl p-3 pb-6 outline-none"
            : "fixed bottom-20 right-6 z-40 w-[340px] rounded-2xl bg-card border shadow-2xl p-3 outline-none cursor-grab active:cursor-grabbing"
        }
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2 px-1">
          <button
            type="button"
            onClick={() => setScientific(!scientific)}
            className={`flex items-center gap-1.5 text-xs font-medium rounded-lg px-2 py-1 transition-all ${scientific ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted/50"}`}
          >
            <Sigma className="h-3.5 w-3.5" />
            {scientific ? "Scientific" : "Basic"}
          </button>
          <button
            type="button"
            onClick={() => { setOpen(false); clear(); setScientific(false) }}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/50 transition-all"
            aria-label="Close calculator"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Display */}
        <div className="mb-3 rounded-xl bg-muted/40 p-3 text-right min-h-[72px]">
          <div className="text-xs text-muted-foreground font-mono truncate">
            {showResult ? showExpr : expr || "\u00A0"}
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight mt-0.5">
            {result || expr || "0"}
          </div>
        </div>

        {/* Scientific grid */}
        {scientific && (
          <div className="grid grid-cols-5 gap-1 mb-2">
            {sciKeys.flat().map((k, i) => (
              <CalcBtn key={`sci-${i}`} label={k.l} onClick={k.a} variant={k.v as any} size="sm" />
            ))}
          </div>
        )}

        {/* Basic grid */}
        <div className="grid grid-cols-4 gap-1.5">
          {basicKeys.flat().map((k, i) => (
            <CalcBtn key={`basic-${i}`} label={k.l} onClick={k.a} variant={k.v as any} />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
