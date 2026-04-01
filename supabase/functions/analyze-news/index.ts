import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { text } = await req.json();
    if (!text || text.trim().length < 10) {
      return new Response(JSON.stringify({ error: "Please provide more text for analysis." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a fake news detection AI. Analyze the given news text and determine if it is likely REAL or FAKE news.

You MUST respond with valid JSON matching this exact structure:
{
  "verdict": "real" | "fake" | "uncertain",
  "confidence": <number 0-100>,
  "summary": "<brief explanation of your verdict>",
  "factors": [
    {
      "name": "<factor name>",
      "score": <number -1 to 1, negative=fake signal, positive=real signal>,
      "description": "<explanation>"
    }
  ]
}

Analyze these aspects:
1. Source Attribution - Does it cite credible sources, studies, or experts?
2. Emotional Language - Does it use sensationalist or emotionally manipulative language?
3. Clickbait Patterns - Does it use clickbait headlines or phrases?
4. Writing Quality - Is the writing professional and well-structured?
5. Factual Consistency - Are the claims internally consistent and plausible?
6. Bias Detection - Does the content show strong political or ideological bias?

Be thorough but fair. Not all emotionally written content is fake, and not all dry content is real.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze this news text:\n\n${text}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "report_analysis",
              description: "Report the fake news analysis result",
              parameters: {
                type: "object",
                properties: {
                  verdict: { type: "string", enum: ["real", "fake", "uncertain"] },
                  confidence: { type: "number" },
                  summary: { type: "string" },
                  factors: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        score: { type: "number" },
                        description: { type: "string" },
                      },
                      required: ["name", "score", "description"],
                    },
                  },
                },
                required: ["verdict", "confidence", "summary", "factors"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "report_analysis" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI analysis failed");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    let result;
    if (toolCall?.function?.arguments) {
      result = typeof toolCall.function.arguments === "string" 
        ? JSON.parse(toolCall.function.arguments)
        : toolCall.function.arguments;
    } else {
      // Fallback: try parsing the content directly
      const content = data.choices?.[0]?.message?.content || "";
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not parse AI response");
      }
    }

    // Clamp values
    result.confidence = Math.max(0, Math.min(100, Math.round(result.confidence)));
    result.factors = (result.factors || []).map((f: any) => ({
      ...f,
      score: Math.max(-1, Math.min(1, f.score)),
    }));

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-news error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
