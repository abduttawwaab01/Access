"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"]
const subjectColors: Record<string, string> = {
  Mathematics: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  Physics: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  Chemistry: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  English: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  History: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
}

export default function TimetablePage() {
  const [timetable, setTimetable] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeDay, setActiveDay] = useState(days[new Date().getDay() - 1] || "Monday")

  useEffect(() => {
    fetch("/api/timetable").then((r) => r.json()).then((data) => {
      setTimetable(data)
      setLoading(false)
    })
  }, [])

  const getSlot = (day: string, time: string) => timetable.find((t) => t.day === day && t.time === time)

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Timetable</h2>
        <p className="text-sm text-muted-foreground">Your weekly class schedule</p>
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {days.map((day) => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all",
              activeDay === day ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {day}
          </button>
        ))}
      </div>

      <Card className="glass-card border-0">
        <CardContent className="p-4">
          <h3 className="mb-4 text-sm font-semibold text-muted-foreground">{activeDay}</h3>
          {loading ? (
            <div className="space-y-3">{[1,2,3,4].map((i) => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}</div>
          ) : (
            <div className="space-y-2">
              {timeSlots.map((time) => {
                const slot = getSlot(activeDay, time)
                return (
                  <motion.div
                    key={time}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      "flex items-center gap-4 rounded-xl border p-3 transition-all",
                      slot ? "border-border/50" : "border-dashed border-border/20"
                    )}
                  >
                    <div className="w-12 text-xs font-medium text-muted-foreground">{time}</div>
                    <div className="h-10 w-1 rounded-full bg-muted-foreground/20" />
                    {slot ? (
                      <div className={cn("flex-1 rounded-lg border px-3 py-2", subjectColors[slot.subject] || "bg-primary/5")}>
                        <p className="text-sm font-semibold">{slot.subject}</p>
                        <p className="text-xs text-muted-foreground">Room {slot.room}</p>
                      </div>
                    ) : (
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground/40 italic">Free period</p>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-4">
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Weekly Overview</h3>
        <div className="overflow-x-auto rounded-xl border border-border/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/50">
                <th className="p-2 text-left font-medium text-muted-foreground">Time</th>
                {days.map((d) => (
                  <th key={d} className={cn("p-2 text-left font-medium text-muted-foreground", d === activeDay && "text-primary")}>{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((time) => (
                <tr key={time} className="border-b border-border/20">
                  <td className="p-2 text-xs text-muted-foreground">{time}</td>
                  {days.map((day) => {
                    const slot = getSlot(day, time)
                    return (
                      <td key={day} className={cn("p-1", day === activeDay && "bg-primary/5")}>
                        {slot ? (
                          <div className={cn("rounded-lg px-2 py-1.5 text-xs font-medium", subjectColors[slot.subject] || "bg-primary/10 text-primary")}>
                            {slot.subject}
                            <div className="text-[10px] opacity-70">Rm {slot.room}</div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground/30">—</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
