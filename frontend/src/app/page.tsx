import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Sparkles,
  Users,
  Play,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: BookOpen,
    title: "Expert-Led Courses",
    description:
      "Learn from industry professionals with proven track records and real-world experience.",
  },
  {
    icon: Users,
    title: "Personal Coaching",
    description:
      "Book one-on-one sessions with coaches who can guide your personal growth journey.",
  },
  {
    icon: Sparkles,
    title: "Premium Content",
    description:
      "Access exclusive articles, tutorials, and insights written by our community of experts.",
  },
];

const stats = [
  { value: "10K+", label: "Active Learners" },
  { value: "500+", label: "Expert Coaches" },
  { value: "1,000+", label: "Courses Available" },
  { value: "98%", label: "Satisfaction Rate" },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.15),transparent)]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_50%_50%_at_80%_50%,rgba(120,119,198,0.1),transparent)]" />

        <div className="container mx-auto px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="mx-auto max-w-4xl text-center">
            <Badge
              variant="outline"
              className="mb-6 px-4 py-1.5 text-sm font-medium border-primary/20 bg-primary/5"
            >
              <Sparkles className="mr-2 h-3.5 w-3.5 text-primary" />
              <span>New courses added weekly</span>
            </Badge>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Transform Your Career with{" "}
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Expert Guidance
              </span>
            </h1>

            <p className="mt-6 text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto leading-relaxed">
              Join thousands of learners accessing premium courses, insightful
              content, and personalized coaching from industry-leading experts.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="h-12 px-8 text-base shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
              >
                <Link href="/courses">
                  Explore Courses
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 px-8 text-base group"
              >
                <Link href="/blog">
                  <Play className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                  Read Latest Posts
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border/40 bg-muted/30">
        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="mb-4">
              Why Choose Pathway
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to succeed
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              We provide the tools, content, and connections to help you reach
              your goals.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-8 md:grid-cols-3">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="group relative overflow-hidden border-border/50 bg-gradient-to-b from-background to-muted/20 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                <CardContent className="p-6">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 transition-transform group-hover:scale-110">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden border-t border-border/40">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-muted/50 to-background" />

        <div className="container mx-auto px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-xl shadow-primary/25 mb-6">
              <GraduationCap className="h-8 w-8 text-primary-foreground" />
            </div>

            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to start your learning journey?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join our community of learners and get access to exclusive content
              and coaching sessions.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
                {[
                  "Unlimited course access",
                  "1-on-1 coaching sessions",
                  "Exclusive community",
                ].map((benefit) => (
                  <div
                    key={benefit}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    {benefit}
                  </div>
                ))}
              </div>

              <Button
                asChild
                size="lg"
                className="mt-6 h-12 px-10 text-base shadow-lg shadow-primary/25"
              >
                <Link href="/register">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
