"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { AlertTriangle, Bell, Info, Megaphone, Send, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

export default function ParentCommunicationPage() {
  const [activeTab, setActiveTab] = useState("announcements")
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [teachers, setTeachers] = useState<any[]>([])
  const [selectedTeacher, setSelectedTeacher] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch("/api/announcements").then((r) => r.json()),
      fetch("/api/staff").then((r) => r.json()),
    ]).then(([ann, staff]) => {
      setAnnouncements(ann.filter((a: any) => a.audience === "all" || a.audience === "parents"))
      setTeachers(staff.filter((s: any) => s.role === "teacher"))
      setLoading(false)
    })
  }, [])

  const priorityIcon: Record<string, any> = { high: AlertTriangle, normal: Bell, low: Info }
  const priorityColor: Record<string, string> = {
    high: "text-danger bg-danger/10 border-danger/20",
    normal: "text-primary bg-primary/10 border-primary/20",
    low: "text-muted-foreground bg-muted border-border/50",
  }

  const sendMessage = async () => {
    if (!selectedTeacher || !subject.trim() || !message.trim()) {
      toast.error("Please fill all fields")
      return
    }
    setSending(true)
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "parent",
        teacherId: selectedTeacher,
        subject: subject.trim(),
        message: message.trim(),
      }),
    })
    if (res.ok) {
      toast.success("Message sent to teacher!")
      setSelectedTeacher("")
      setSubject("")
      setMessage("")
    } else {
      toast.error("Failed to send message")
    }
    setSending(false)
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold">Communication</h2>
        <p className="text-sm text-muted-foreground">School announcements and contact teachers</p>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList className="flex flex-wrap w-full gap-1.5">
          <TabsTrigger value="announcements" className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm">
            <Megaphone className="h-4 w-4 mr-1.5" /> Announcements
          </TabsTrigger>
          <TabsTrigger value="messages" className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm">
            <MessageSquare className="h-4 w-4 mr-1.5" /> Message Teachers
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === "announcements" && (
      <div className="mt-4 space-y-3">
        {loading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}</div>
        ) : announcements.length === 0 ? (
          <Card className="glass-card border-0">
            <CardContent className="p-8 text-center text-muted-foreground">
              <Megaphone className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm font-medium">No announcements</p>
              <p className="text-xs">Check back later for updates.</p>
            </CardContent>
          </Card>
        ) : (
          announcements.map((item, i) => {
            const Icon = priorityIcon[item.priority] || Bell
            return (
              <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="glass-card border-0">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div className={cn("flex h-9 w-9 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-xl", priorityColor[item.priority])}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold">{item.title}</p>
                          <Badge variant="outline" className={cn("shrink-0 text-[10px]", item.priority === "high" ? "border-danger/30 text-danger" : "")}>
                            {item.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.author} &middot; {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">{item.content}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })
        )}
      </div>
      )}

      {activeTab === "messages" && (
      <div className="mt-4">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass-card border-0">
            <CardContent className="p-4 md:p-5 space-y-4">
              <div>
                <h3 className="font-semibold">Send a Message to a Teacher</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Use this form to contact your child&apos;s teacher directly</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Select Teacher</label>
                <Select value={selectedTeacher} onValueChange={(v) => { if (v) setSelectedTeacher(v) }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a teacher..." />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.firstName} {t.lastName} {t.subject ? `- ${t.subject}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Subject</label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Homework question, Progress inquiry..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Message</label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your message here..."
                  rows={5}
                />
              </div>

              <Button
                onClick={sendMessage}
                disabled={sending}
                className="w-full animated-gradient border-0 text-white shadow-lg shadow-primary/25"
              >
                <Send className="h-4 w-4 mr-1.5" />
                {sending ? "Sending..." : "Send Message"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      )}
    </div>
  )
}
