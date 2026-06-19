"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Clock, MapPin } from "lucide-react"

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00"]

export default function StudentTimetablePage() {
  const [timetable, setTimetable] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState("Monday")

  useEffect(() => {
    Promise.all([fetch("/api/timetable"), fetch("/api/subjects")]).then(async ([t, s]) => {
      setTimetable(await t.json())
      setSubjects(await s.json())
      setLoading(false)
    })
  }, [])

  const daySlots = timetable.filter((t) => t.day === selectedDay)

  if (loading) return <div className="p-4 md:p-6"><div className="h-64 rounded-xl bg-muted animate-pulse" /></div>

  return (
    <div className="p-4 md:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold">My Timetable</h2>
        <p className="text-sm text-muted-foreground">Weekly class schedule</p>
      </motion.div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {days.map((day) => (
          <button key={day} onClick={() => setSelectedDay(day)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedDay === day ? "animated-gradient text-white shadow-lg" : "bg-muted hover:bg-muted/80"}`}
          >{day}</button>
        ))}
      </div>

      <motion.div key={selectedDay} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        {timeSlots.map((time) => {
          const slot = daySlots.find((s) => s.time === time)
          return (
            <Card key={time} className={`glass-card border-0 ${slot ? "" : "opacity-40"}`}>
              <CardContent className="p-4">
                {slot ? (
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">{slot.subject}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{slot.time}</span>
                        {slot.room && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />Room {slot.room}</span>}
                      </div>
                    </div>
                    {slot.room && <Badge variant="outline">{slot.room}</Badge>}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-2">
                    <p className="text-sm text-muted-foreground">Free Period</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </motion.div>
    </div>
  )
}
