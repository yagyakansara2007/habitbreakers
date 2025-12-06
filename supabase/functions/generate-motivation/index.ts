import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { habits, completedToday, mood, reflection } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const completionRate = habits?.length > 0 
      ? Math.round((completedToday / habits.length) * 100) 
      : 0;

    const habitsList = habits?.map((h: any) => h.title).join(", ") || "No habits yet";

    const systemPrompt = `You are an encouraging habit coach. Generate personalized motivation and tips.
Be warm, supportive, and actionable. Keep responses concise (2-3 sentences max per section).
Use emojis sparingly to add warmth.`;

    const userPrompt = `User's habits: ${habitsList}
Completed today: ${completedToday}/${habits?.length || 0} (${completionRate}%)
User's mood: ${mood || "not specified"}
User's reflection: ${reflection || "none provided"}

Generate a JSON response with these exact fields:
{
  "motivation": "A personalized motivational message based on their progress",
  "tips": ["tip1", "tip2", "tip3"],
  "encouragement": "A brief encouraging closing message"
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI service error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    // Parse JSON from response
    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { 
        motivation: content, 
        tips: ["Keep going!", "Stay consistent!", "Celebrate small wins!"],
        encouragement: "You've got this!" 
      };
    } catch {
      parsed = { 
        motivation: content, 
        tips: ["Keep going!", "Stay consistent!", "Celebrate small wins!"],
        encouragement: "You've got this!" 
      };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-motivation:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error",
      motivation: "Keep building those habits! Every small step counts.",
      tips: ["Start with just 2 minutes", "Stack habits together", "Track your progress"],
      encouragement: "You're doing great!"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
