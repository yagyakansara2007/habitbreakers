import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  PlusCircle,
  Bell,
  CheckCircle,
  Flame,
  BarChart3,
  TrendingUp,
  ArrowRight,
  Laptop,
  Monitor,
  Tablet,
  Smartphone,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: PlusCircle,
    title: "Create a habit",
    description: "Start from scratch or pick from our curated template library.",
  },
  {
    number: "02",
    icon: Bell,
    title: "Set reminders",
    description: "Choose the perfect times to get gentle nudges throughout your day.",
  },
  {
    number: "03",
    icon: CheckCircle,
    title: "Log your progress",
    description: "One tap to mark complete. It takes literally one second.",
  },
  {
    number: "04",
    icon: Flame,
    title: "Track streaks",
    description: "Watch your streaks grow and earn rewards for consistency.",
  },
  {
    number: "05",
    icon: BarChart3,
    title: "View insights",
    description: "Weekly stats and charts show your progress over time.",
  },
  {
    number: "06",
    icon: TrendingUp,
    title: "Grow consistently",
    description: "Build momentum and become the person you want to be.",
  },
];

const devices = [
  { icon: Laptop, name: "Laptop" },
  { icon: Monitor, name: "Desktop" },
  { icon: Tablet, name: "Tablet" },
  { icon: Smartphone, name: "Smartphone" },
];

export default function HowItWorks() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-24 bg-gradient-soft overflow-hidden">
        <div className="absolute top-10 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Simple Steps to a{" "}
            <span className="text-gradient">Better You</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Getting started with HabitFlow takes less than a minute. 
            Here's how it works.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="relative p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                <span className="absolute -top-3 -left-3 w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center text-primary-foreground text-sm font-bold">
                  {step.number}
                </span>
                <div className="pt-4">
                  <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-4">
                    <step.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Where to Use */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Your Habits. Anywhere. Anytime.
          </h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-xl mx-auto">
            HabitFlow is web-based and fully responsive. Perfect for home, office, or travel.
          </p>
          
          <div className="flex justify-center gap-8 flex-wrap">
            {devices.map((device) => (
              <div
                key={device.name}
                className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all"
              >
                <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center">
                  <device.icon className="w-8 h-8 text-primary" />
                </div>
                <span className="font-medium text-foreground">{device.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6">
            Ready to get started?
          </h2>
          <Button variant="hero" size="xl" asChild>
            <Link to="/auth?signup=true">
              Create Your First Habit
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
