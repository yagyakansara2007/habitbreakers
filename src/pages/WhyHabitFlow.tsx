import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { X, Check, ArrowRight } from "lucide-react";

const problems = [
  { problem: "No structure", solution: "Clear daily plans" },
  { problem: "Low motivation", solution: "Gamified rewards" },
  { problem: "Hard to track", solution: "One-tap logging" },
  { problem: "No accountability", solution: "Streak systems" },
  { problem: "No feedback", solution: "Weekly insights" },
];

export default function WhyHabitFlow() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-24 bg-gradient-soft overflow-hidden">
        <div className="absolute top-20 right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Why <span className="text-gradient">HabitFlow</span>?
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Because habits shape who we become — yet most people struggle for reasons 
            that shouldn't exist anymore.
          </p>
        </div>
      </section>

      {/* Problems vs Solutions */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              The struggle is real. We fixed it.
            </h2>
          </div>

          <div className="space-y-4">
            {problems.map((item, index) => (
              <div
                key={item.problem}
                className="flex items-center gap-4 p-6 rounded-2xl bg-card border border-border hover:border-primary/20 transition-all"
              >
                <div className="flex-1 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                    <X className="w-5 h-5 text-destructive" />
                  </div>
                  <span className="text-muted-foreground line-through">
                    {item.problem}
                  </span>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-500" />
                  </div>
                  <span className="font-medium text-foreground">
                    {item.solution}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* When to Use */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Start Anytime. Stay Consistent Forever.
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            HabitFlow works daily — perfect for starting new routines, restarting old ones, 
            or maintaining long-term consistency.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {["New Year Goals", "Career Growth", "Health Journey", "Learning Path", "Daily Wellness"].map((tag) => (
              <span
                key={tag}
                className="px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6">
            Ready to stop struggling?
          </h2>
          <Button variant="hero" size="xl" asChild>
            <Link to="/auth?signup=true">
              Start Your Journey
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
