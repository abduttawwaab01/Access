import Link from "next/link"
import { ClipboardCheck, FileText, GraduationCap, Calendar, ArrowRight } from "lucide-react"

export default function AdmissionsPage() {
  return (
    <div className="px-6 py-16">
      <div className="mx-auto max-w-3xl space-y-12">
        <section className="text-center">
          <div className="animated-gradient mx-auto mb-6 inline-flex rounded-xl p-3">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <h1 className="mb-4 text-4xl font-bold">Admissions</h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">Join Access School Academy — where excellence meets opportunity. We welcome applications for all grade levels.</p>
        </section>

        <section className="grid gap-6 sm:grid-cols-2">
          {[
            { icon: ClipboardCheck, title: "1. Submit Application", desc: "Fill out our online application form with your details and academic history." },
            { icon: FileText, title: "2. Entrance Exam", desc: "Take our computer-based entrance exam to assess your readiness." },
            { icon: Calendar, title: "3. Interview", desc: "Selected candidates are invited for a brief interview with our admissions team." },
            { icon: GraduationCap, title: "4. Enrollment", desc: "Accepted students complete enrollment and begin their journey with us." },
          ].map((step) => (
            <div key={step.title} className="glass-card rounded-xl p-5">
              <step.icon className="mb-3 h-6 w-6 text-primary" />
              <h3 className="mb-1 font-semibold">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </section>

        <section className="glass-card rounded-xl p-6 text-center">
          <h2 className="mb-2 text-xl font-bold">Ready to Apply?</h2>
          <p className="mb-6 text-sm text-muted-foreground">Take the first step towards an exceptional education.</p>
          <Link href="/admissions/apply" className="animated-gradient inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl">
            Apply Now <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </div>
    </div>
  )
}
