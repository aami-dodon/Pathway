import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Sparkles,
  Users,
  Play,
  CheckCircle2,
  Star,
  Quote,
  LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CourseCard } from "@/components/courses/CourseCard";
import { PostCard } from "@/components/blog/PostCard";
import { ContactForm } from "@/components/home/ContactForm";
import { ScrollAnimation } from "@/components/ui/scroll-animation";
import { TextReveal } from "@/components/ui/text-reveal";
import { API_BASE_URL, PaginatedResponse, Course, Post, HomePageData, api } from "@/lib/api";

const iconMap: Record<string, LucideIcon> = {
  BookOpen,
  Users,
  Sparkles,
  GraduationCap,
};

async function getFeaturedCourses(): Promise<Course[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/courses?where[status][equals]=published&depth=2&limit=3`,
      { next: { revalidate: 60 } }
    );
    if (!response.ok) return [];
    const data: PaginatedResponse<Course> = await response.json();
    return data.docs;
  } catch (error) {
    console.error("Failed to fetch featured courses:", error);
    return [];
  }
}

async function getFeaturedPosts(): Promise<Post[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/posts?where[status][equals]=published&limit=3`,
      { next: { revalidate: 60 } }
    );
    if (!response.ok) return [];
    const data: PaginatedResponse<Post> = await response.json();
    return data.docs;
  } catch (error) {
    console.error("Failed to fetch featured posts:", error);
    return [];
  }
}

async function getHomePageData(): Promise<HomePageData | null> {
  try {
    return await api.getGlobal<HomePageData>('home-page', { cache: 'no-store' });
  } catch (error) {
    console.error("Failed to fetch home page data:", error);
    return null;
  }
}

// Fallback data in case CMS is empty or fails
const fallbackData: HomePageData = {
  hero: {
    badge: "New courses added weekly",
    title: "Transform Your Career with",
    highlightedText: "Expert Guidance",
    description: "Join thousands of learners accessing premium courses, insightful content, and personalized coaching from industry-leading experts.",
    primaryButtonText: "Explore Courses",
    primaryButtonLink: "/courses",
    secondaryButtonText: "Read Latest Posts",
    secondaryButtonLink: "/blog",
  },
  stats: [
    { value: "10K+", label: "Active Learners" },
    { value: "500+", label: "Expert Coaches" },
    { value: "1,000+", label: "Courses Available" },
    { value: "98%", label: "Satisfaction Rate" },
  ],
  featuresHeader: {
    badge: "Why Choose Pathway",
    title: "Everything you need to succeed",
    description: "We provide the tools, content, and connections to help you reach your goals.",
  },
  features: [
    {
      icon: "BookOpen",
      title: "Expert-Led Courses",
      description: "Learn from industry professionals with proven track records and real-world experience.",
    },
    {
      icon: "Users",
      title: "Personal Coaching",
      description: "Book one-on-one sessions with coaches who can guide your personal growth journey.",
    },
    {
      icon: "Sparkles",
      title: "Premium Content",
      description: "Access exclusive articles, tutorials, and insights written by our community of experts.",
    },
    {
      icon: "Users",
      title: "Community Access",
      description: "Join a vibrant community of learners and mentors to share knowledge and grow together.",
    }
  ],
  testimonialsHeader: {
    badge: "Testimonials",
    title: "Loved by learners everywhere",
  },
  reviews: [
    {
      name: "Sarah Johnson",
      role: "Software Engineer",
      content: "Pathway has completely transformed my career. The courses are practical and the coaching sessions provided me with the guidance I needed to land my dream job.",
      avatar: "SJ"
    },
    {
      name: "Michael Chen",
      role: "Product Manager",
      content: "The quality of content here is unmatched. I've taken several courses and read countless articles. Each one has added real value to my professional life.",
      avatar: "MC"
    },
    {
      name: "Emily Rodriguez",
      role: "UX Designer",
      content: "I love the community aspect. Connecting with other learners and mentors has opened so many doors for collaboration and growth.",
      avatar: "ER"
    }
  ],
  cta: {
    title: "Ready to start your learning journey?",
    description: "Join our community of learners and get access to exclusive content and coaching sessions.",
    buttonText: "Get Started Free",
    buttonLink: "/register",
    benefits: [
      { text: "Unlimited course access" },
      { text: "1-on-1 coaching sessions" },
      { text: "Exclusive community" },
    ]
  }
};

export default async function HomePage() {
  const [courses, posts, cmsData] = await Promise.all([
    getFeaturedCourses(),
    getFeaturedPosts(),
    getHomePageData(),
  ]);

  const data = cmsData || fallbackData;

  return (
    <div className="flex flex-col home-page-wrapper">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.15),transparent)]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_50%_50%_at_80%_50%,hsl(var(--primary)/0.1),transparent)]" />

        <div className="container mx-auto px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="mx-auto max-w-4xl text-center">
            <ScrollAnimation delay={0.2}>
              <Badge
                variant="outline"
                className="mb-6 px-4 py-1.5 text-sm font-medium border-primary/20 bg-primary/5"
              >
                <Sparkles className="mr-2 h-3.5 w-3.5 text-primary" />
                <span>{data.hero.badge}</span>
              </Badge>
            </ScrollAnimation>

            <ScrollAnimation delay={0.3}>
              <div className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-6">
                <TextReveal text={data.hero.title} className="inline" />{" "}
                <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                  {data.hero.highlightedText}
                </span>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.4}>
              <p className="mt-6 text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto leading-relaxed">
                {data.hero.description}
              </p>
            </ScrollAnimation>

            <ScrollAnimation delay={0.5}>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  asChild
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <Link href={data.hero.primaryButtonLink}>
                    {data.hero.primaryButtonText}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <Link href={data.hero.secondaryButtonLink}>
                    <Play className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                    {data.hero.secondaryButtonText}
                  </Link>
                </Button>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border/40 bg-muted/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <ScrollAnimation>
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {data.stats.map((stat) => (
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
          </ScrollAnimation>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <ScrollAnimation>
              <Badge variant="secondary" className="mb-4">
                {data.featuresHeader.badge}
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                <TextReveal text={data.featuresHeader.title} />
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {data.featuresHeader.description}
              </p>
            </ScrollAnimation>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-8 md:grid-cols-2 lg:grid-cols-4">
            {data.features.map((feature, index) => {
              const Icon = iconMap[feature.icon] || BookOpen;
              return (
                <ScrollAnimation key={feature.title} delay={index * 0.1}>
                  <Card
                    className="group relative overflow-hidden border-border/50 bg-gradient-to-b from-background to-muted/20 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 h-full"
                  >
                    <CardContent className="p-6">
                      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 transition-transform group-hover:scale-110">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold">{feature.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </ScrollAnimation>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      {courses.length > 0 && (
        <section className="py-24 sm:py-32 bg-muted/30 border-y border-border/40 backdrop-blur-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollAnimation>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-12">
                <div className="text-center sm:text-left">
                  <Badge variant="secondary" className="mb-3">Courses</Badge>
                  <h2 className="text-3xl font-bold tracking-tight">Popular Courses</h2>
                </div>
                <Button asChild variant="ghost" size="sm" className="group">
                  <Link href="/courses">
                    View All Courses
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </ScrollAnimation>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course, index) => (
                <ScrollAnimation key={course.id} delay={index * 0.1}>
                  <CourseCard course={course} />
                </ScrollAnimation>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Blogs Section */}
      {posts.length > 0 && (
        <section className="py-24 sm:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollAnimation>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-12">
                <div className="text-center sm:text-left">
                  <Badge variant="secondary" className="mb-3">Blog</Badge>
                  <h2 className="text-3xl font-bold tracking-tight">Latest Insights</h2>
                </div>
                <Button asChild variant="ghost" size="sm" className="group">
                  <Link href="/blog">
                    Read More Articles
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </ScrollAnimation>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post, index) => (
                <ScrollAnimation key={post.id} delay={index * 0.1}>
                  <PostCard post={post} />
                </ScrollAnimation>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      <section className="py-24 sm:py-32 bg-muted/30 border-y border-border/40 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation>
            <div className="mx-auto max-w-2xl text-center mb-16">
              <Badge variant="secondary" className="mb-4">{data.testimonialsHeader.badge}</Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                <TextReveal text={data.testimonialsHeader.title} />
              </h2>
            </div>
          </ScrollAnimation>

          <div className="grid gap-8 md:grid-cols-3">
            {data.reviews.map((review, i) => (
              <ScrollAnimation key={i} delay={i * 0.1}>
                <Card className="border-border bg-card h-full">
                  <CardContent className="p-6">
                    <Quote className="h-8 w-8 text-primary/20 mb-4" />
                    <div className="mb-6 flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      "{review.content}"
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                        {review.avatar}
                      </div>
                      <div>
                        <p className="font-semibold">{review.name}</p>
                        <p className="text-sm text-muted-foreground">{review.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation>
            <div className="mx-auto max-w-2xl text-center mb-16">
              <Badge variant="secondary" className="mb-4">Contact Us</Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                <TextReveal text="We're here to help" />
              </h2>
            </div>
          </ScrollAnimation>

          <ScrollAnimation delay={0.2}>
            <ContactForm />
          </ScrollAnimation>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden border-t border-border/40">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-muted/50 to-background" />

        <div className="container mx-auto px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <ScrollAnimation>
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-xl shadow-primary/25 mb-6">
                <GraduationCap className="h-8 w-8 text-primary-foreground" />
              </div>

              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                <TextReveal text={data.cta.title} />
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {data.cta.description}
              </p>
            </ScrollAnimation>

            <ScrollAnimation delay={0.2}>
              <div className="mt-8 space-y-4">
                <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
                  {data.cta.benefits.map((benefit) => (
                    <div
                      key={benefit.text}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      {benefit.text}
                    </div>
                  ))}
                </div>

                <Button
                  asChild
                  size="lg"
                  className="mt-6"
                >
                  <Link href={data.cta.buttonLink}>
                    {data.cta.buttonText}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>
    </div>
  );
}
