import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Heart, Users, TrendingUp, CheckCircle, ArrowRight, Target, BarChart3, Shield, Bot, ClipboardList, Bell, Zap } from 'lucide-react';
import { AnimateOnScroll } from '@/components/animate-on-scroll';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/60 bg-background/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Heart className="h-5 w-5 text-purple-600" />
            <span className="text-lg font-semibold tracking-tight">MissionMatch</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/volunteer/login">
              <Button variant="ghost" size="sm">Volunteer Sign In</Button>
            </Link>
            <Link href="/volunteer/signup">
              <Button variant="ghost" size="sm">Volunteer Sign Up</Button>
            </Link>
            <Link href="/coordinator/login">
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white border-0">Coordinator Login</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-24 lg:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <AnimateOnScroll animation="fade-up">
                <p className="text-sm font-medium text-purple-600 mb-4 tracking-wide uppercase">
                  Volunteer Management Platform
                </p>
              </AnimateOnScroll>
              <AnimateOnScroll animation="fade-up" delay={120}>
                <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-6 leading-[1.15]">
                  Keep every volunteer matched, active, and retained
                </h1>
              </AnimateOnScroll>
              <AnimateOnScroll animation="fade-up" delay={240}>
                <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                  The all-in-one platform for advocacy organizations to onboard volunteers, match them to the right campaigns, and track engagement over time.
                </p>
              </AnimateOnScroll>
              <AnimateOnScroll animation="fade-up" delay={360}>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/coordinator/login">
                    <Button size="lg" className="gap-2 w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white border-0 px-6">
                      <Shield className="h-4 w-4" />
                      Open Dashboard
                    </Button>
                  </Link>
                  <Link href="#how-it-works">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto px-6">
                      See How It Works
                    </Button>
                  </Link>
                </div>
              </AnimateOnScroll>
            </div>
            <AnimateOnScroll animation="fade-left" delay={200}>
              <div className="relative aspect-square lg:aspect-auto lg:h-[500px] rounded-2xl overflow-hidden">
                <Image
                src="/VolunteerManager Landing Page Image 1.png"
                alt="Volunteer management platform hero image"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="h-px bg-border" />
      </div>

      {/* Stats */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <AnimateOnScroll animation="fade-up" delay={0}>
              <div>
                <div className="text-3xl font-bold text-foreground mb-1">20–2,000</div>
                <div className="text-sm text-muted-foreground">Volunteers per organization</div>
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll animation="fade-up" delay={150}>
              <div>
                <div className="text-3xl font-bold text-foreground mb-1">AI-Powered</div>
                <div className="text-sm text-muted-foreground">Skill-to-campaign matching</div>
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll animation="fade-up" delay={300}>
              <div>
                <div className="text-3xl font-bold text-foreground mb-1">Real-Time</div>
                <div className="text-sm text-muted-foreground">Engagement scoring &amp; alerts</div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* The Challenge */}
      <section className="py-24 text-zinc-50" style={{ backgroundColor: '#09090b' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <AnimateOnScroll animation="fade-right" delay={100}>
              <div className="relative aspect-video lg:aspect-auto lg:h-[500px] rounded-2xl overflow-hidden">
                <Image
                  src="/bigstock-Volunteers-With-Homeless-Dog-A-330224209.jpg"
                  alt="Volunteers helping a homeless dog at an animal shelter"
                  fill
                  className="object-cover"
                />
              </div>
            </AnimateOnScroll>
            <div>
              <AnimateOnScroll animation="fade-left" delay={0}>
                <p className="text-sm font-medium text-purple-400 mb-3 tracking-wide uppercase">The challenge</p>
              </AnimateOnScroll>
              <AnimateOnScroll animation="fade-left" delay={120}>
                <h2 className="text-3xl lg:text-4xl font-bold mb-6 leading-tight">
                  Great volunteers need great management
                </h2>
              </AnimateOnScroll>
              <AnimateOnScroll animation="fade-left" delay={240}>
                <p className="text-lg text-zinc-300 mb-8 leading-relaxed">
                  Advocacy organizations onboard passionate people every week—but without the right tools, it&apos;s nearly impossible to keep everyone matched, engaged, and growing.
                </p>
              </AnimateOnScroll>
              <div className="space-y-5 mb-10">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <ClipboardList className="h-4 w-4 text-purple-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-50 mb-1.5">Scattered onboarding</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      Skills and availability live in forms, emails, and spreadsheets that no one has time to cross-reference.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <Target className="h-4 w-4 text-amber-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-50 mb-1.5">Manual task matching</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      Coordinators spend hours guessing who fits which campaign instead of running them.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <BarChart3 className="h-4 w-4 text-blue-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-50 mb-1.5">Zero engagement visibility</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      No way to see who&apos;s thriving, who needs support, or where to focus your energy.
                    </p>
                  </div>
                </div>
              </div>
              <Link href="/coordinator/login">
                <Button size="lg" className="gap-2 bg-purple-600 hover:bg-purple-700 text-white border-0 px-6">
                  <Shield className="h-4 w-4" />
                  See the Solution
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Four Pillars */}
      <section id="how-it-works" className="py-24 bg-zinc-900 text-zinc-50">
        <div className="max-w-6xl mx-auto px-6">
          <AnimateOnScroll animation="fade-up">
            <p className="text-sm font-medium text-purple-400 mb-3 tracking-wide uppercase">Platform features</p>
            <h2 className="text-3xl font-bold tracking-tight text-zinc-50 mb-4">
              Everything you need to manage volunteers at scale
            </h2>
            <p className="text-zinc-400 mb-14 max-w-xl">
              Four integrated tools that replace your spreadsheets, guesswork, and manual follow-ups.
            </p>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <AnimateOnScroll animation="fade-up" delay={0}>
              <div className="border-l-3 border-l-purple-500 pl-6">
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                  <ClipboardList className="h-5 w-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-50 mb-2">Smart Intake</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Intake forms that capture skills, availability, and interests—structured for instant matching.
                </p>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll animation="fade-up" delay={100}>
              <div className="border-l-3 border-l-purple-500 pl-6">
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                  <Zap className="h-5 w-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-50 mb-2">AI Matching</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  A routing engine that matches volunteers to tasks based on their skills, interests, and availability.
                </p>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll animation="fade-up" delay={200}>
              <div className="border-l-3 border-l-purple-500 pl-6">
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                  <TrendingUp className="h-5 w-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-50 mb-2">Engagement Scoring</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Track each volunteer&apos;s activity over time with a real-time engagement score you can act on.
                </p>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll animation="fade-up" delay={300}>
              <div className="border-l-3 border-l-purple-500 pl-6">
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                  <Bell className="h-5 w-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-50 mb-2">Retention Alerts</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Automatic flags when a volunteer&apos;s engagement drops, so you can reach out before they drift away.
                </p>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* How Coordinators Use It */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <AnimateOnScroll animation="fade-right">
                <p className="text-sm font-medium text-purple-600 mb-3 tracking-wide uppercase">Coordinator workflow</p>
                <h2 className="text-3xl font-bold tracking-tight text-foreground mb-6">
                  Up and running in minutes
                </h2>
              </AnimateOnScroll>

              <div className="space-y-8">
                <AnimateOnScroll animation="fade-right" delay={100}>
                  <div className="flex gap-5">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold">1</div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Create campaigns &amp; tasks</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Set up your advocacy campaigns with the skills and availability you need. The platform handles the rest.
                      </p>
                    </div>
                  </div>
                </AnimateOnScroll>

                <AnimateOnScroll animation="fade-right" delay={250}>
                  <div className="flex gap-5">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold">2</div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Volunteers get matched automatically</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        As volunteers sign up, AI matches them to campaigns that fit their skills and interests—no manual sorting.
                      </p>
                    </div>
                  </div>
                </AnimateOnScroll>

                <AnimateOnScroll animation="fade-right" delay={400}>
                  <div className="flex gap-5">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold">3</div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Monitor engagement &amp; act on alerts</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Track engagement scores across your roster. Get flagged when someone needs attention, and reach out with one click.
                      </p>
                    </div>
                  </div>
                </AnimateOnScroll>
              </div>
            </div>
            <AnimateOnScroll animation="fade-left" delay={200}>
              <div className="relative aspect-video lg:aspect-auto lg:h-[400px] rounded-2xl overflow-hidden">
                <Image
                  src="/VolunteerManager Landing Page Image 3.webp"
                  alt="Volunteer coordinator managing team"
                  fill
                  className="object-cover"
                />
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Coordinator Benefits */}
      <section className="py-24 section-alt">
        <div className="max-w-6xl mx-auto px-6">
          <AnimateOnScroll animation="fade-up">
            <p className="text-sm font-medium text-purple-600 mb-3 tracking-wide uppercase">Why coordinators choose us</p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-12">
              Built for organizations managing 20 to 2,000 volunteers
            </h2>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex gap-4">
              <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Replace spreadsheets</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  One dashboard instead of a dozen tabs. See every volunteer, campaign, and engagement score in one place.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Save hours every week</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  AI does the matching so you can focus on running campaigns, not sorting sign-up forms.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Keep volunteers engaged</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Engagement scoring and retention alerts help you support people before they disengage.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Better task matching</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Volunteers get matched to work they actually care about—which means better outcomes for everyone.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Scale without chaos</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Whether you have 20 volunteers or 2,000, the platform grows with your organization.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Data-driven decisions</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  See which campaigns attract the most engagement and where your organization can improve.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Heart className="h-4 w-4 text-purple-600" />
                <span className="font-semibold">MissionMatch</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                AI-powered volunteer management for animal advocacy organizations.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3">For Coordinators</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/coordinator/login" className="hover:text-foreground transition-colors">Login</Link></li>
                <li><Link href="/coordinator/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3">For Volunteers</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/volunteer/signup" className="hover:text-foreground transition-colors">Sign Up</Link></li>
                <li><Link href="/volunteer/login" className="hover:text-foreground transition-colors">Sign In</Link></li>
              </ul>
            </div>
          </div>

          <div className="h-px bg-border/60 mt-10 mb-8" />
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              &copy; 2026 MissionMatch
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              Made with <Heart className="h-3 w-3 text-purple-600 inline" /> by Aranck Jomraj
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
