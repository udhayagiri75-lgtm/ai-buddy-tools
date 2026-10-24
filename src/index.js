export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/health") {
      return Response.json({
        status: "ok",
        message: "AI Buddy Tools backend is working!"
      });
    }

    return env.ASSETS.fetch(request);
  }
};
