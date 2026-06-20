"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { User, Mail, Phone, Bell, Shield, Save, Lock } from "lucide-react"
import { cn } from "@/lib/utils"

export default function ParentSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(false)

  useEffect(() => {
    fetch("/api/parents")
      .then((r) => r.json())
      .then((data) => {
        const parent = Array.isArray(data) ? data[0] : data
        if (parent) {
          setName(parent.name || `${parent.firstName || ""} ${parent.lastName || ""}`.trim())
          setEmail(parent.email || "")
          setPhone(parent.phone || "")
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const saveProfile = async () => {
    setSaving(true)
    const res = await fetch("/api/parents", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone }),
    })
    if (res.ok) {
      toast.success("Profile updated successfully")
    } else {
      toast.error("Failed to update profile")
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        {[1, 2, 3].map((i) => <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />)}
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your profile and preferences</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card className="glass-card border-0">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-5 pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Profile Information</h3>
                <p className="text-xs text-muted-foreground">Update your personal details</p>
              </div>
            </div>
          </div>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-medium text-muted-foreground">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="pl-9" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" />
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-medium text-muted-foreground">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-9" />
              </div>
            </div>
            <div className="pt-2">
              <Button onClick={saveProfile} disabled={saving} className="animated-gradient border-0 text-white shadow-lg shadow-primary/25">
                <Save className="h-4 w-4 mr-1.5" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="glass-card border-0">
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-5 pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
                <Bell className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <h3 className="font-semibold">Notification Preferences</h3>
                <p className="text-xs text-muted-foreground">Choose how you receive updates</p>
              </div>
            </div>
          </div>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-border/50 p-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email Notifications</p>
                  <p className="text-xs text-muted-foreground">Receive updates via email</p>
                </div>
              </div>
              <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border/50 p-4">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">SMS Notifications</p>
                  <p className="text-xs text-muted-foreground">Receive updates via text message</p>
                </div>
              </div>
              <Switch checked={smsNotifications} onCheckedChange={setSmsNotifications} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card className="glass-card border-0">
          <div className="bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent p-5 pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
                <Lock className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold">Change Password</h3>
                <p className="text-xs text-muted-foreground">Update your account password</p>
              </div>
            </div>
          </div>
          <CardContent className="p-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="current-password" className="text-xs font-medium text-muted-foreground">Current Password</Label>
              <Input id="current-password" type="password" placeholder="Enter current password" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="new-password" className="text-xs font-medium text-muted-foreground">New Password</Label>
                <Input id="new-password" type="password" placeholder="Enter new password" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm-password" className="text-xs font-medium text-muted-foreground">Confirm Password</Label>
                <Input id="confirm-password" type="password" placeholder="Confirm new password" />
              </div>
            </div>
            <div className="pt-2">
              <Button variant="outline" className="border-red-500/30 text-red-600 hover:bg-red-500/5 hover:text-red-600">
                <Shield className="h-4 w-4 mr-1.5" />
                Update Password
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
