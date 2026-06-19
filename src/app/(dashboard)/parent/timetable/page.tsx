"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00"]
const children = [{ id: "1", name: "Alice Johnson", classId: "1" }, { id: "2", name: "Bob Johnson", classId: "2" }]

const subjectColors: Record<string, string> = {
  Mathematics: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  Physics: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  Chemistry: "bg-green-500/10 text-green-600 border-green-500/20",
  "English Language": "bg-orange-500/10 text-orange-600 border-orange-500/20",
  History: "bg-rose-500/10 text-rose-600 border-rose-500/20",
}

export default function ParentTimetablePage() {
  const [childId, setChildId] = useState("1")
  const [timetable, setTimetable] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/timetable").then((r) => r.json()).then((data) => {
      setTimetable(data)
      setLoading(false)
    })
  }, [])

  const getSlot = (day: string, time: string) => timetable.find((t) => t.day === day && t.time === time)

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div>
        <h2 className="text-2xl font-bold">Class Timetable</h2>
        <p className="text-sm text-muted-foreground">View weekly class schedule</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {children.map((c) => (
          <button key={c.id} onClick={() => setChildId(c.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${childId === c.id ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}
          >{c.name.split(" ")[0]}</button>
        ))}
      </div>

      <Card className="glass-card border-0">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="p-3 text-left font-medium text-muted-foreground text-xs sticky left-0 bg-card">Time</th>
                {days.map((d) => (
                  <th key={d} className="p-3 text-left font-medium text-xs min-w-[100px]">{d.substring(0, 3)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : (
                timeSlots.map((time) => (
                  <tr key={time} className="border-b border-border/20">
                    <td className="p-3 text-xs text-muted-foreground font-medium sticky left-0 bg-card">{time}</td>
                    {days.map((day) => {
                      const slot = getSlot(day, time)
                      return (
                        <td key={day} className="p-1.5">
                          {slot ? (
                            <div className={cn("rounded-lg px-2 py-1.5 text-xs font-medium border", subjectColors[slot.subject] || "bg-primary/10 text-primary border-primary/20")}>
                              {slot.subject}
                              <div className="text-[10px] opacity-70">Rm {slot.room}</div>
                            </div>
                          ) : null}
                        </td>
                      )
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
