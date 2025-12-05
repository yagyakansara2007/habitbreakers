import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Sun,
  Dumbbell,
  Brain,
  BookOpen,
  Target,
  Droplets,
  Moon,
  GraduationCap,
  Heart,
  ArrowRight,
} from "lucide-react";

const templates = [
  {
    icon: Sun,
    title: "Morning Routine",
    description: "Start your day with energy and intention. Includes wake-up stretches, journaling, and mindful breakfast.",
    habits: 5,
    color: "from-yellow-400 to-orange-400",
  },
  {
    icon: Dumbbell,
    title: "Workout & Running",
    description: "Build strength and endurance with structured exercise habits. From warm-ups to cooldowns.",
    habits: 4,
    color: "from-red-500 to-pink-500",
  },
  {
    icon: Brain,
    title: "Meditation & Mindfulness",
    description: "Cultivate calm and focus. Daily meditation, breathing exercises, and gratitude practices.",
    habits: 4,
    color: "from-purple-500 to-indigo-500",
  },
  {
    icon: BookOpen,
    title: "Reading & Learning",
    description: "Expand your knowledge daily. Reading sessions, note-taking, and learning reviews.",
    habits: 3,
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Target,
    title: "Productivity & Focus",
    description: "Maximize your output with deep work sessions, task planning, and distraction-free blocks.",
    habits: 5,
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Droplets,
    title: "Water & Health",
    description: "Stay hydrated and healthy. Water intake tracking, vitamin reminders, and health checks.",
    habits: 4,
    color: "from-cyan-500 to-blue-400",
  },
  {
    icon: Moon,
    title: "Sleep Improvement",
    description: "Optimize your rest. Evening routines, screen-free time, and sleep quality tracking.",
    habits: 4,
    color: "from-indigo-500 to-purple-600",
  },
  {
    icon: GraduationCap,
    title: "Study & Skill Growth",
    description: "Level up your skills. Structured study sessions, practice time, and progress tracking.",
    habits: 4,
    color: "from-teal-500 to-green-500",
  },
  {
    icon: Heart,
    title: "Personal Development",
    description: "Become your best self. Self-reflection, goal setting, and personal growth activities.",
    habits: 5,
    color: "from-pink-500 to-rose-500",
  },
];

export default function Templates() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-24 bg-gradient-soft overflow-hidden">
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Ready to Start?{" "}
            <span className="text-gradient">Pick a Habit.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose from curated templates designed by habit experts. Each comes with 
            steps, examples, and a simple 7-day starter plan.
          </p>
        </div>
      </section>

      {/* Templates Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div
                key={template.title}
                className="group relative p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${template.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <template.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {template.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {template.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-primary bg-accent px-3 py-1 rounded-full">
                    {template.habits} habits
                  </span>
                  <Button variant="ghost" size="sm" className="text-primary">
                    Use Template
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Can't find what you need?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Create your own custom habits from scratch. It's just as easy!
          </p>
          <Button variant="hero" size="xl" asChild>
            <Link to="/auth?signup=true">
              Create Custom Habit
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
