import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  CheckCircle,
  Bell,
  Flame,
  BarChart3,
  Library,
  Zap,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: CheckCircle,
    title: "Powerful Daily Habit Tracker",
    description:
      "Stay consistent with a clean, minimal tracker that lets you log progress in seconds. No complicated setup — just tap and go.",
    color: "from-primary to-primary/70",
  },
  {
    icon: Bell,
    title: "Smart Reminders",
    description:
      "Never miss a habit again with perfectly timed reminders that adapt to your schedule and timezone.",
    color: "from-blue-500 to-blue-400",
  },
  {
    icon: Flame,
    title: "Streaks & Levels",
    description:
      "Stay motivated with streaks, points, level-ups, and fun rewards. Watch your progress compound over time.",
    color: "from-orange-500 to-orange-400",
  },
  {
    icon: BarChart3,
    title: "Deep Progress Insights",
    description:
      "Charts, analytics, and weekly reports show exactly how you're improving. Understand your patterns and optimize.",
    color: "from-green-500 to-green-400",
  },
  {
    icon: Library,
    title: "Habit Templates Library",
    description:
      "Pick from 50+ ready-made habits — meditation, fitness, study, reading, productivity, and more. Start in seconds.",
    color: "from-purple-500 to-purple-400",
  },
  {
    icon: Zap,
    title: "Quick Actions",
    description:
      "One-tap logging, keyboard shortcuts, and widgets make tracking effortless. Spend less time tracking, more time doing.",
    color: "from-yellow-500 to-yellow-400",
  },
];

export default function Features() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-24 bg-gradient-soft overflow-hidden">
        <div className="absolute top-10 right-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Powerful Features for{" "}
            <span className="text-gradient">Better Habits</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to build, track, and maintain habits that stick.
            Simple, beautiful, and effective.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group relative p-8 rounded-3xl bg-card border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-500 hover:-translate-y-2"
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6">
            Ready to experience these features?
          </h2>
          <Button variant="hero" size="xl" asChild>
            <Link to="/auth?signup=true">
              Start Free Today
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
