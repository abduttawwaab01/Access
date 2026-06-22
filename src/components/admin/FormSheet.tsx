"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { useMobile } from "@/hooks/useMobile"

interface FormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
}

export function FormSheet({ open, onOpenChange, title, description, children }: FormSheetProps) {
  const { isMobile } = useMobile()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={isMobile ? "h-[85dvh] rounded-t-2xl overflow-y-auto" : "sm:max-w-lg overflow-y-auto"}
      >
        <SheetHeader className="mb-6 text-left">
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <div className="pb-6">{children}</div>
      </SheetContent>
    </Sheet>
  )
}
