
export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }

    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({ message: "ORION AI is online." }),
        {
          headers: { ...cors, "Content-Type": "application/json; charset=utf-8" },
        }
      );
    }

    try {
      const body = await request.json();
      const messages = body.messages;

      if (!Array.isArray(messages) || messages.length === 0) {
        return new Response(
          JSON.stringify({ error: "messages が必要です。" }),
          {
            status: 400,
            headers: { ...cors, "Content-Type": "application/json; charset=utf-8" },
          }
        );
      }

      const result = await env.AI.run(
        "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
        {
          messages: [
            {
              role: "system",
              content:
                "あなたはORION。ユーザー専用のAIアシスタントとして、日本語で自然に、親しみやすく、正確に答えてください。分からないことは分からないと伝えてください。",
            },
            ...messages
              .filter(
                (m) =>
                  m &&
                  ["user", "assistant"].includes(m.role) &&
                  typeof m.content === "string"
              )
              .slice(-20)
              .map((m) => ({ role: m.role, content: m.content })),
          ],
        }
      );

      return new Response(JSON.stringify({ result }), {
        headers: {
          ...cors,
          "Content-Type": "application/json; charset=utf-8",
        },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({ error: "AIの処理に失敗しました。設定を確認してください。" }),
        {
          status: 500,
          headers: { ...cors, "Content-Type": "application/json; charset=utf-8" },
        }
      );
    }
  },
};
