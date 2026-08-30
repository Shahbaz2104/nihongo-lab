import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { GET as queueGet } from "@/app/api/review/queue/route";
import { GET as quizGet } from "@/app/api/quiz/route";
import { GET as listeningGet } from "@/app/api/listening/route";
import { POST as reviewPost } from "@/app/api/review/route";

function get(url: string) {
  return new NextRequest(url);
}

describe("GET /api/review/queue — validation", () => {
  it("rejects an invalid type", async () => {
    const res = await queueGet(get("http://localhost/api/review/queue?type=nonsense&level=N5"));
    expect(res.status).toBe(400);
  });

  it("rejects an invalid JLPT level", async () => {
    const res = await queueGet(get("http://localhost/api/review/queue?type=vocab&level=N9"));
    expect(res.status).toBe(400);
  });

  it("rejects a non-numeric limit", async () => {
    const res = await queueGet(get("http://localhost/api/review/queue?type=vocab&level=N5&limit=abc"));
    expect(res.status).toBe(400);
  });

  it("rejects a negative limit", async () => {
    const res = await queueGet(get("http://localhost/api/review/queue?type=vocab&level=N5&limit=-3"));
    expect(res.status).toBe(400);
  });

  it("accepts a valid request", async () => {
    const res = await queueGet(get("http://localhost/api/review/queue?type=vocab&level=N5&limit=3"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.queue)).toBe(true);
    expect(body.queue.length).toBeLessThanOrEqual(3);
  });
});

describe("GET /api/quiz — validation", () => {
  it("rejects invalid params", async () => {
    const res = await quizGet(get("http://localhost/api/quiz?type=vocab&level=N9"));
    expect(res.status).toBe(400);
  });

  it("rejects a non-numeric n", async () => {
    const res = await quizGet(get("http://localhost/api/quiz?type=vocab&level=N5&n=abc"));
    expect(res.status).toBe(400);
  });

  it("serves questions with non-duplicate options", async () => {
    const res = await quizGet(get("http://localhost/api/quiz?type=vocab&level=N5&n=5"));
    expect(res.status).toBe(200);
    const { questions } = await res.json();
    expect(questions.length).toBe(5);
    for (const q of questions) {
      expect(new Set(q.options).size).toBe(q.options.length);
      expect(q.options).toContain(q.answer);
      expect(q.options.filter((o: string) => o === q.answer)).toHaveLength(1);
    }
  });

  it("is deterministic for the same seed", async () => {
    const a = await (await quizGet(get("http://localhost/api/quiz?type=vocab&level=N5&n=6&seed=42"))).json();
    const b = await (await quizGet(get("http://localhost/api/quiz?type=vocab&level=N5&n=6&seed=42"))).json();
    expect(a).toEqual(b);
  });

  it("rejects an invalid direction", async () => {
    const res = await quizGet(get("http://localhost/api/quiz?type=vocab&level=N5&direction=xx"));
    expect(res.status).toBe(400);
  });

  it("rejects a direction not valid for the type", async () => {
    const res = await quizGet(get("http://localhost/api/quiz?type=grammar&level=N5&direction=ej"));
    expect(res.status).toBe(400);
  });

  it("serves english-to-japanese vocab questions", async () => {
    const res = await quizGet(get("http://localhost/api/quiz?type=vocab&level=N5&n=5&direction=ej"));
    expect(res.status).toBe(200);
    const { questions } = await res.json();
    for (const q of questions) {
      expect(q.prompt).not.toMatch(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/);
      expect(q.answer).toMatch(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/);
      expect(q.options).toContain(q.answer);
    }
  });

  it("serves kanji-to-reading questions", async () => {
    const res = await quizGet(get("http://localhost/api/quiz?type=kanji&level=N5&n=5&direction=kr"));
    expect(res.status).toBe(200);
    const { questions } = await res.json();
    for (const q of questions) {
      expect(q.prompt.length).toBeLessThanOrEqual(3);
      expect(q.answer).toMatch(/[\u3040-\u30ff]/);
      expect(q.options).toContain(q.answer);
      expect(new Set(q.options).size).toBe(q.options.length);
    }
  });

  it("serves non-duplicate options for kanji and grammar", async () => {
    for (const type of ["kanji", "grammar"]) {
      const res = await quizGet(get(`http://localhost/api/quiz?type=${type}&level=N5&n=5&seed=7`));
      expect(res.status).toBe(200);
      const { questions } = await res.json();
      for (const q of questions) {
        expect(new Set(q.options).size).toBe(q.options.length);
        expect(q.options.filter((o: string) => o === q.answer)).toHaveLength(1);
      }
    }
  });

  it("normalizes dotted kunyomi in kanji-to-reading options", async () => {
    const res = await quizGet(get("http://localhost/api/quiz?type=kanji&level=N5&n=8&seed=3&direction=kr"));
    expect(res.status).toBe(200);
    const { questions } = await res.json();
    for (const q of questions) {
      expect(q.answer).not.toMatch(/[・.]/);
      for (const o of q.options) {
        expect(o).not.toMatch(/[・.]/);
      }
    }
  });
});

describe("GET /api/listening — validation and generation", () => {
  it("rejects invalid params", async () => {
    const res = await listeningGet(get("http://localhost/api/listening?level=N9"));
    expect(res.status).toBe(400);
  });

  it("rejects a non-numeric n", async () => {
    const res = await listeningGet(get("http://localhost/api/listening?level=N5&n=abc"));
    expect(res.status).toBe(400);
  });

  it("is deterministic for the same seed", async () => {
    const a = await (await listeningGet(get("http://localhost/api/listening?level=N5&n=3&seed=7"))).json();
    const b = await (await listeningGet(get("http://localhost/api/listening?level=N5&n=3&seed=7"))).json();
    expect(a).toEqual(b);
  });

  it("serves questions with unique options and exactly one answer", async () => {
    const res = await listeningGet(get("http://localhost/api/listening?level=N5&n=4&seed=7"));
    expect(res.status).toBe(200);
    const { questions } = await res.json();
    expect(questions.length).toBe(4);
    for (const q of questions) {
      expect(q.options.length).toBe(4);
      expect(new Set(q.options).size).toBe(q.options.length);
      expect(q.options.filter((o: string) => o === q.answer)).toHaveLength(1);
      expect(q.jp).toBe(q.answer);
      expect(Array.isArray(q.tokens)).toBe(true);
      expect(q.tokens.length).toBeGreaterThan(0);
    }
  });

  it("prefers distractors that share vocabulary with the answer", async () => {
    const res = await listeningGet(get("http://localhost/api/listening?level=N5&n=4&seed=3"));
    const { questions } = (await res.json()) as {
      questions: {
        jp: string;
        answer: string;
        options: string[];
        tokens: { text: string; type: string }[];
      }[];
    };
    for (const q of questions) {
      const answerTokens = new Set(q.tokens.filter((t) => t.type !== "char").map((t) => t.text));
      const sharing = q.options.filter((o) => o !== q.answer && [...answerTokens].some((w) => o.includes(w)));
      expect(sharing.length).toBeGreaterThanOrEqual(1);
    }
  });
});

describe("POST /api/review — validation", () => {
  it("rejects malformed JSON", async () => {
    const req = new NextRequest("http://localhost/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{not json",
    });
    const res = await reviewPost(req);
    expect(res.status).toBe(400);
  });

  it("rejects an invalid grade", async () => {
    const req = new NextRequest("http://localhost/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId: "abc", grade: "sometimes" }),
    });
    const res = await reviewPost(req);
    expect(res.status).toBe(400);
  });

  it("returns 404 for an unknown card", async () => {
    const req = new NextRequest("http://localhost/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId: "does-not-exist", grade: "good" }),
    });
    const res = await reviewPost(req);
    expect(res.status).toBe(404);
  });
});
