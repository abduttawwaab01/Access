import { Shield, BookOpen, Users, Award, Target, Eye } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="px-6 py-16">
      <div className="mx-auto max-w-3xl space-y-16">
        {/* Hero */}
        <section className="text-center">
          <div className="animated-gradient mx-auto mb-6 inline-flex rounded-xl p-3">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <h1 className="mb-4 text-4xl font-bold">About Access School Academy</h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">Empowering the next generation of leaders through innovative education and comprehensive student development since 2010.</p>
        </section>

        {/* Mission & Vision */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="glass-card rounded-xl p-6">
            <Target className="mb-3 h-6 w-6 text-primary" />
            <h2 className="mb-2 text-lg font-semibold">Our Mission</h2>
            <p className="text-sm text-muted-foreground">To provide a nurturing environment that fosters academic excellence, character development, and lifelong learning in every student.</p>
          </div>
          <div className="glass-card rounded-xl p-6">
            <Eye className="mb-3 h-6 w-6 text-purple-500" />
            <h2 className="mb-2 text-lg font-semibold">Our Vision</h2>
            <p className="text-sm text-muted-foreground">To be a leading educational institution that produces well-rounded, globally competitive graduates equipped with 21st-century skills.</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { icon: Users, label: "Students", value: "500+" },
            { icon: BookOpen, label: "Classes", value: "24" },
            { icon: Award, label: "Years", value: "15+" },
            { icon: Users, label: "Staff", value: "60+" },
          ].map((s) => (
            <div key={s.label} className="glass-card rounded-xl p-4 text-center">
              <s.icon className="mx-auto mb-2 h-5 w-5 text-primary" />
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Facilities */}
        <section>
          <h2 className="mb-6 text-center text-2xl font-bold">Our Facilities</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {["Science Laboratories", "Computer Lab", "Library", "Sports Complex", "Music & Arts Studio", "Smart Classrooms"].map((f) => (
              <div key={f} className="glass-card rounded-xl p-4 text-center text-sm font-medium">{f}</div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="glass-card rounded-xl p-6 text-center">
          <h2 className="mb-2 text-lg font-semibold">Get in Touch</h2>
          <p className="text-sm text-muted-foreground">123 Education Street, Lagos, Nigeria</p>
          <p className="text-sm text-muted-foreground">+234 800 000 0000</p>
          <p className="text-sm text-muted-foreground">info@accessschool.edu</p>
        </section>
      </div>
    </div>
  )
}
