"use client"

import { useState, useEffect } from "react"
import ProfilePage from "@/components/profile/ProfilePage"

export default function AdminProfilePage() {
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch admin user data from API
    fetch("/api/admin/profile")
      .then((res) => res.json())
      .then((data) => {
        setUserData(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Failed to fetch admin profile:", error)
        setLoading(false)
      })
  }, [])

  const handleSave = async (data: any) => {
    // Call API to update admin profile
    const response = await fetch("/api/admin/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      throw new Error("Failed to update profile")
    }
    
    const updatedData = await response.json()
    setUserData(updatedData)
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        {["h-24", "h-96", "h-48"].map((h, i) => (
          <div key={i} className={`${h} rounded-xl bg-muted animate-pulse`} />
        ))}
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="p-4 md:p-6">
        <div class.
