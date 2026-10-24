
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/health") {
      return Response.json({
        status: "ok",
        message: "AI Buddy Tools backend is working!"
      });
    }

    if (url.pathname === "/api/study" && request.method === "POST") {
      try {
        const body = await request.json();
        const topic = String(body.topic || "").trim();

        if (!topic) {
          return Response.json(
            { error: "Please enter a study topic." },
            { status: 400 }
          );
        }

        if (topic.length > 500) {
          return Response.json(
            { error: "Topic must be 500 characters or fewer." },
            { status: 400 }
          );
        }

        if (!env.GEMINI_API_KEY) {
          return Response.json(
            { error: "AI service is not configured yet." },
            { status: 500 }
          );
        }

        const aiResponse = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": env.GEMINI_API_KEY
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `Create simple, accurate student revision notes about: ${topic}. Include a short introduction, important points, examples, and a brief conclusion. Use clear headings and simple English. If the topic is unclear, ask for clarification instead of inventing facts.`
                }]
              }]
            })
          }
        );

        const result = await aiResponse.json();

        if (!aiResponse.ok) {
          console.error("Gemini API error:", result);
          return Response.json(
            { error: "The AI service could not complete the request. Check API access and quota." },
            { status: 502 }
          );
        }

        const notes = result.candidates?.[0]?.content?.parts
          ?.map(part => part.text || "")
          .join("\n")
          .trim();

        if (!notes) {
          return Response.json(
            { error: "The AI did not return notes. Please try again." },
            { status: 502 }
          );
        }

        return Response.json({ notes });
      } catch (error) {
        console.error("Study API error:", error);
        return Response.json(
          { error: "Something went wrong. Please try again." },
          { status: 500 }
        );
      }
    }

    return env.ASSETS.fetch(request);
  }
};
