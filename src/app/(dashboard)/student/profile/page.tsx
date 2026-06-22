"use client"

import { useState, useEffect } from "react"
import { ProfilePage } from "@/components/profile/ProfilePage"

export default function StudentProfilePage() {
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch student user data from API
    fetch("/api/student/profile")
      .then((res) => res.json())
      .then((data) => {
        setUserData(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Failed to fetch student profile:", error)
        setLoading(false)
      })
  }, [])

  const handleSave = async (data: any) => {
    // Call API to update student profile
    const response = await fetch("/api/student/profile", {
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
        <div className="text-center py-8">
          <h3 className="text-lg font-semibold">Profile not found</h3>
          <p className="text-sm text-muted-foreground mt-2">Unable to load profile data</p>
        </div>
      </div>
    )
  }

  return <ProfilePage userData={userData} onSave={handleSave} isAdmin={false} />
}