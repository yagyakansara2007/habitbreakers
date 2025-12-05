import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Target, Eye, Users, ArrowRight } from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Our Mission",
    description:
      "To make habit-building simple, enjoyable, and achievable for everyone. We believe small, consistent actions lead to extraordinary results.",
  },
  {
    icon: Eye,
    title: "Our Vision",
    description:
      "Millions of people improving their lives, one tiny habit at a time. A world where building good habits feels natural and rewarding.",
  },
  {
    icon: Users,
    title: "Who We Are",
    description:
      "A team of creators, builders, and behavior enthusiasts focused on real-life improvement through habits. We use HabitFlow every day.",
  },
];

export default function About() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-24 bg-gradient-soft overflow-hidden">
        <div className="absolute top-20 left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            About <span className="text-gradient">HabitFlow</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We're on a mission to help people build better habits and unlock their 
            full potential through simplicity and consistency.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value) => (
              <div
                key={value.title}
                className="text-center p-8 rounded-3xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-hero mx-auto flex items-center justify-center mb-6">
                  <value.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  {value.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground mb-8">Our Story</h2>
            <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
              <p>
                HabitFlow started from a simple frustration: existing habit apps were 
                either too complicated or too basic. We wanted something that was 
                beautiful, powerful, and actually enjoyable to use.
              </p>
              <p>
                We believe that building habits shouldn't feel like a chore. 
                It should feel like a game — one where you're always leveling up 
                and becoming a better version of yourself.
              </p>
              <p>
                Today, HabitFlow helps thousands of people around the world build 
                better routines and achieve their goals. And we're just getting started.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6">
            Join the HabitFlow community
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Start building better habits today. It's free to get started.
          </p>
          <Button variant="hero" size="xl" asChild>
            <Link to="/auth?signup=true">
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
