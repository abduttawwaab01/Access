"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

export interface ChildInfo {
  id: string
  studentId?: string
  name: string
  firstName: string
  lastName: string
  className: string
  arm?: string
  classId: string
  image?: string
  relationship?: string
  passportPhoto?: string
  gender?: string
  dateOfBirth?: string
}

interface ParentLink {
  id: string
  parentId: string
  studentId: string
  relationship?: string
  schoolId: string
}

interface Student {
  id: string
  firstName: string
  lastName: string
  studentId: string
  classId: string
  passportPhoto?: string
  gender?: string
  dateOfBirth?: string
}

interface Class {
  id: string
  name: string
  arm?: string
}

export function useParentChildren() {
  const { data: session } = useSession()
  const [children, setChildren] = useState<ChildInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeChildId, setActiveChildId] = useState<string>("")

  useEffect(() => {
    const parentId = (session?.user as any)?.id
    if (!parentId) { setLoading(false); return }

    let cancelled = false

    Promise.all([
      fetch("/api/parent-links").then((r) => { if (!r.ok) throw new Error("Failed to fetch links"); return r.json() }),
      fetch("/api/students").then((r) => { if (!r.ok) throw new Error("Failed to fetch students"); return r.json() }),
      fetch("/api/classes").then((r) => { if (!r.ok) throw new Error("Failed to fetch classes"); return r.json() }),
    ]).then(([links, students, classes]) => {
      if (cancelled) return

      const myLinks = (links as ParentLink[]).filter((l) => l.parentId === parentId)
      const studentsMap = new Map<string, Student>((students as Student[]).map((s) => [s.id, s]))
      const classesMap = new Map<string, Class>((classes as Class[]).map((c) => [c.id, c]))

      const childrenList: ChildInfo[] = myLinks
        .map((link) => {
          const student = studentsMap.get(link.studentId)
          if (!student) return null
          const cls = student ? classesMap.get(student.classId) : null
          return {
            id: student.id,
            studentId: student.studentId || "",
            name: `${student.firstName} ${student.lastName}`,
            firstName: student.firstName,
            lastName: student.lastName,
            className: cls ? `${cls.name}${cls.arm ? ` ${cls.arm}` : ""}` : "",
            arm: cls?.arm,
            classId: student.classId,
            image: undefined,
            relationship: link.relationship || undefined,
            passportPhoto: student.passportPhoto || "",
            gender: student.gender || "",
            dateOfBirth: student.dateOfBirth || "",
          }
        })
        .filter((c): c is ChildInfo => c !== null)

      setChildren(childrenList)
      if (childrenList.length > 0 && !activeChildId) {
        setActiveChildId(childrenList[0].id)
      }
      setLoading(false)
    }).catch((err: Error) => {
      if (!cancelled) {
        setError(err.message)
        setLoading(false)
      }
    })

    return () => { cancelled = true }
  }, [session])

  const activeChild = children.find((c) => c.id === activeChildId) || children[0]

  return { children, activeChild, activeChildId, setActiveChildId, loading, error }
}
