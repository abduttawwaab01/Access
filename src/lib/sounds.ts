let ctx: AudioContext | null = null

function getCtx() {
  if (!ctx) ctx = new AudioContext()
  if (ctx.state === "suspended") ctx.resume()
  return ctx
}

export function playSuccess() {
  const c = getCtx()
  const now = c.currentTime
  const notes = [523.25, 659.25]
  notes.forEach((freq, i) => {
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.type = "sine"
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.3, now + i * 0.12)
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.3)
    osc.connect(gain).connect(c.destination)
    osc.start(now + i * 0.12)
    osc.stop(now + i * 0.12 + 0.3)
  })
}

export function playFailure() {
  const c = getCtx()
  const now = c.currentTime
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = "square"
  osc.frequency.value = 180
  gain.gain.setValueAtTime(0.2, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4)
  osc.connect(gain).connect(c.destination)
  osc.start(now)
  osc.stop(now + 0.4)
}