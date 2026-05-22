import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Shield,
  ArrowRight,
  CheckCircle,
  Lock,
  Zap,
  Users,
  FileCheck,
  Globe,
  ChevronRight,
} from "lucide-react";

const features = [
  {
    icon: Lock,
    title: "Blockchain Verification",
    desc: "Every credential is cryptographically secured and immutably stored on the blockchain.",
  },
  {
    icon: Users,
    title: "Student Ownership",
    desc: "Students fully own and control their academic credentials — no intermediaries needed.",
  },
  {
    icon: Shield,
    title: "Fraud Prevention",
    desc: "Tamper-proof records eliminate credential fraud and forgery across institutions.",
  },
  {
    icon: Zap,
    title: "Instant Verification",
    desc: "Employers verify credentials in seconds, not weeks. One click, fully verified.",
  },
];

const steps = [
  { num: "01", title: "Institution Issues", desc: "University uploads the credential and it's hashed onto the blockchain." },
  { num: "02", title: "Student Receives", desc: "The student receives and owns a verifiable digital credential in their wallet." },
  { num: "03", title: "Employer Verifies", desc: "Any verifier can instantly confirm authenticity through the verification portal." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-7 w-7 text-primary" />
            <span className="font-heading text-xl font-bold text-foreground">CertChain</span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
            <a href="#benefits" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Benefits</a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="text-muted-foreground">
              <Link to="/login">Sign In</Link>
            </Button>
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link to="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden py-24 lg:py-36">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(239_84%_67%/0.08),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 text-center lg:px-8">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            <FileCheck className="h-4 w-4" />
            Blockchain-Powered Credentials
          </div>
          <h1 className="mx-auto mt-6 max-w-4xl font-heading text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Decentralized Digital
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> Credential Verification</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Secure, tamper-proof academic credentials powered by blockchain. Issue, manage, and verify digital certificates with complete trust and transparency.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" asChild className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-8">
              <Link to="/register">
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="gap-2 px-8">
              <Link to="/verify">
                Verify Credential <CheckCircle className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center">
            <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
              Built for Trust & Transparency
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              A comprehensive credential management system designed for the modern academic ecosystem.
            </p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-xl border border-border bg-card p-6 card-shadow transition-all hover:card-shadow-hover hover:-translate-y-1"
              >
                <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-y border-border bg-card py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center">
            <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">How It Works</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">Three simple steps to secure credential verification.</p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.num} className="relative rounded-xl border border-border bg-background p-8">
                <span className="font-heading text-5xl font-extrabold text-primary/10">{s.num}</span>
                <h3 className="mt-4 font-heading text-xl font-semibold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
                Why Choose CertChain?
              </h2>
              <p className="mt-4 text-muted-foreground">
                Our decentralized platform brings transparency, security, and efficiency to credential management.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  "Immutable records that cannot be altered or forged",
                  "Instant verification reducing hiring timelines",
                  "Global accessibility without geographic barriers",
                  "Cost-effective alternative to traditional verification",
                  "Full GDPR and privacy compliance built-in",
                ].map((b) => (
                  <div key={b} className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                    <p className="text-sm text-foreground">{b}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: Globe, label: "Global Reach", value: "150+ Countries" },
                { icon: Shield, label: "Credentials Issued", value: "500K+" },
                { icon: Zap, label: "Verification Time", value: "< 3 sec" },
                { icon: Users, label: "Institutions", value: "200+" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-border bg-card p-6 card-shadow text-center">
                  <s.icon className="mx-auto h-8 w-8 text-primary" />
                  <p className="mt-3 font-heading text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-card py-24 lg:py-32">
        <div className="mx-auto max-w-3xl px-4 text-center lg:px-8">
          <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
            Ready to Get Started?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Join hundreds of institutions already using CertChain for secure credential management.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" asChild className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-8">
              <Link to="/register">Create Account <ChevronRight className="h-4 w-4" /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="px-8">
              <Link to="/verify">Verify a Credential</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-heading font-bold text-foreground">CertChain</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 CertChain. Decentralized credential verification.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
