"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { User, Mail, Phone, Lock, Save, Camera, Eye, EyeOff, X } from "lucide-react"

interface UserData {
  id: string
  name: string
  email: string
  phone?: string
  role: string
  avatar?: string
}

interface ProfilePageProps {
  userData: UserData
  onSave: (data: Partial<UserData>) => Promise<void>
  isAdmin?: boolean
}

export default function ProfilePage({ userData, onSave, isAdmin = false }: ProfilePageProps) {
  const [formData, setFormData] = useState<Partial<UserData>>({
    name: userData.name || "",
    email: userData.email || "",
    phone: userData.phone || "",
  })

  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await onSave(formData)
      toast.success("Profile updated successfully")
      setIsEditing(false)
    } catch (error) {
      toast.error("Failed to update profile")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" })
  const [passwordError, setPasswordError] = useState("")

  const handlePasswordChange = async () => {
    if (!isAdmin) return
    setPasswordError("")
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError("All fields are required")
      return
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters")
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Passwords do not match")
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userData.email, currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        setPasswordError(data.error || "Failed to change password")
        return
      }
      toast.success("Password changed successfully")
      setShowPasswordDialog(false)
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch {
      toast.error("Failed to change password")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold">Profile</h2>
          <p className="text-sm text-muted-foreground">Manage your account information</p>
        </div>
        <Badge variant="outline" className="text-xs">
          {userData.role}
        </Badge>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="glass-card border-0 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="relative">
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-2xl font-bold mb-4">
                      {(userData.name || "U").split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-1">{userData.name || "Unknown"}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{userData.email || ""}</p>
                  <Badge variant="outline" className="text-xs">
                    {userData.role}
                  </Badge>
                {isAdmin && (
                  <div className="mt-4 w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => setShowPasswordDialog(true)}
                      disabled={isLoading}
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                  </div>
                )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {showPasswordDialog && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Change Password</h3>
                <button onClick={() => { setShowPasswordDialog(false); setPasswordError(""); setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" }) }} className="p-1 hover:bg-muted rounded-lg">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Current Password</Label>
                  <Input type="password" value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="h-11" />
                </div>
                <div className="space-y-1.5">
                  <Label>New Password</Label>
                  <Input type="password" value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="h-11" placeholder="Min 6 characters" />
                </div>
                <div className="space-y-1.5">
                  <Label>Confirm New Password</Label>
                  <Input type="password" value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="h-11" />
                </div>
                {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
                <Button onClick={handlePasswordChange} disabled={isLoading}
                  className="animated-gradient w-full border-0 text-white shadow-lg shadow-primary/25 h-11">
                  {isLoading ? "Changing..." : "Change Password"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}

        <div className="md:col-span-2">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="glass-card border-0 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name || ""}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!isEditing}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || ""}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!isAdmin}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone || ""}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={!isEditing}
                      className="h-10"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  {isEditing ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="animated-gradient border-0 text-white shadow-lg shadow-primary/25"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {isLoading ? "Saving..." : "Save Changes"}
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="animated-gradient border-0 text-white shadow-lg shadow-primary/25"
                    >
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
