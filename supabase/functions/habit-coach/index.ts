import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are HabitFlow Coach, a friendly and supportive AI that helps users build positive habits consistently.

Your goals:
1. Guide users to create and track habits.
2. Remember their habit history, progress, mood, struggles, blockers.
3. Give personalized suggestions based on past behavior.
4. Provide short but detailed responses when needed.
5. Support users emotionally and motivate them.

Your behavior:
- Always be friendly, supportive, and encouraging.
- Never judge the user.
- Keep responses short, but when giving important info, add helpful detail.
- Simplify everything: one main suggestion + optional extra tips.
- Use emojis sparingly to add warmth.

What you provide for every message:
1. Understand the user's current state.
2. Use previous history to personalize advice.
3. Give actionable suggestions.
4. Celebrate wins and support through failures.

Special capabilities:
- Suggest micro-habits when user feels overwhelmed
- Adjust habit difficulty based on progress
- Create personalized routines (morning, evening, study, fitness)
- Generate weekly progress reports
- Predict potential struggles and offer preemptive support
- Track patterns like "You usually struggle on weekends"

When user fails, say supportive things like:
- "It's okay. Do a 1-minute version today."
- "Let's bounce back together."
- "Progress isn't linear. You've got this!"

When user succeeds:
- "🔥 Amazing! You're building momentum!"
- "🎉 Great job! Keep the streak going!"
- "You're proving to yourself that you can do this!"`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context message with user data
    let contextMessage = "";
    if (userContext) {
      contextMessage = `\n\nUser Context:
- Current habits: ${userContext.habits?.map((h: any) => h.title).join(', ') || 'None yet'}
- Today's progress: ${userContext.completedToday || 0}/${userContext.totalHabits || 0} habits completed
- Current streak data: ${userContext.streakInfo || 'Building momentum'}
- Recent mood: ${userContext.mood || 'Not recorded'}
- Known struggles: ${userContext.blockers?.join(', ') || 'None identified'}
- What motivates them: ${userContext.motivationTriggers?.join(', ') || 'Still learning'}
- Patterns noticed: ${userContext.patterns || 'Still analyzing'}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT + contextMessage },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("habit-coach error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
