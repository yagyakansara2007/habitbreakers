import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
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
  Loader2,
} from "lucide-react";
import { useTemplates } from "@/hooks/useTemplates";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "☀️": Sun,
  "💪": Dumbbell,
  "🧘": Brain,
  "📚": BookOpen,
  "🎯": Target,
  "💧": Droplets,
  "🌙": Moon,
  "🎓": GraduationCap,
  "❤️": Heart,
};

const colorMap: Record<string, string> = {
  "#F59E0B": "from-yellow-400 to-orange-400",
  "#EF4444": "from-red-500 to-pink-500",
  "#8B5CF6": "from-purple-500 to-indigo-500",
  "#3B82F6": "from-blue-500 to-cyan-500",
  "#10B981": "from-green-500 to-emerald-500",
  "#06B6D4": "from-cyan-500 to-blue-400",
  "#6366F1": "from-indigo-500 to-purple-600",
  "#14B8A6": "from-teal-500 to-green-500",
  "#EC4899": "from-pink-500 to-rose-500",
};

export default function Templates() {
  const { templates, loading, useTemplate } = useTemplates();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleUseTemplate = async (template: any) => {
    if (!user) {
      toast.error("Please sign in to use templates");
      navigate("/auth?signup=true");
      return;
    }

    const success = await useTemplate(template);
    if (success) {
      navigate("/dashboard");
    }
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-24 bg-gradient-soft overflow-hidden">
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-20 right-20 w-64 h-64 bg-accent/30 rounded-full blur-3xl" />
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
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => {
                const IconComponent = iconMap[template.icon] || Target;
                const gradientColor = colorMap[template.color] || "from-purple-500 to-indigo-500";
                
                return (
                  <div
                    key={template.id}
                    className="group relative p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                  >
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradientColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                    >
                      <IconComponent className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {template.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {template.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-primary bg-accent px-3 py-1 rounded-full">
                        {template.habits?.length || 0} habits
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-primary"
                        onClick={() => handleUseTemplate(template)}
                      >
                        Use Template
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
