"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

export interface ChildInfo {
  id: string
  name: string
  firstName: string
  lastName: string
  className: string
  arm?: string
  classId: string
  image?: string
  relationship?: string
}

export function useParentChildren() {
  const { data: session } = useSession()
  const [children, setChildren] = useState<ChildInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [activeChildId, setActiveChildId] = useState<string>("")

  useEffect(() => {
    const parentId = (session?.user as any)?.id
    if (!parentId) { setLoading(false); return }

    Promise.all([
      fetch("/api/parent-links").then((r) => r.json()),
      fetch("/api/students").then((r) => r.json()),
      fetch("/api/classes").then((r) => r.json()),
    ]).then(([links, students, classes]) => {
      const myLinks = links.filter((l: any) => l.parentId === parentId)
      const childrenList = myLinks.map((link: any) => {
        const student = students.find((s: any) => s.id === link.studentId)
        const cls = student ? classes.find((c: any) => c.id === student.classId) : null
        if (!student) return null
        return {
          id: student.id,
          name: `${student.firstName} ${student.lastName}`,
          firstName: student.firstName,
          lastName: student.lastName,
          className: cls ? `${cls.name}${cls.arm ? ` ${cls.arm}` : ""}` : "",
          arm: cls?.arm,
          classId: student.classId,
          image: student.image,
          relationship: link.relationship,
        }
      }).filter(Boolean) as ChildInfo[]

      setChildren(childrenList)
      if (childrenList.length > 0 && !activeChildId) {
        setActiveChildId(childrenList[0].id)
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [session])

  const activeChild = children.find((c) => c.id === activeChildId) || children[0]

  return { children, activeChild, activeChildId, setActiveChildId, loading }
}
