import { describe, expect, it } from "vitest";
import { newCardState, reviewCard, SM2_MIN_EASE, type SrsState } from "./srs";

const now = new Date("2026-08-10T00:00:00Z");

function daysFromNow(n: number): Date {
  return new Date(now.getTime() + n * 24 * 60 * 60 * 1000);
}

describe("reviewCard", () => {
  it("starts a fresh card", () => {
    const s = newCardState(now);
    expect(s.status).toBe(0);
    expect(s.ease).toBe(2.5);
    expect(s.interval).toBe(0);
    expect(s.reps).toBe(0);
    expect(s.due).toEqual(now);
  });

  it("good on a new card schedules 1 day out", () => {
    const r = reviewCard(newCardState(now), "good", now);
    expect(r.correct).toBe(true);
    expect(r.state.interval).toBe(1);
    expect(r.state.reps).toBe(1);
    expect(r.state.status).toBe(2);
    expect(r.state.due).toEqual(daysFromNow(1));
  });

  it("second good review schedules 6 days out", () => {
    const first = reviewCard(newCardState(now), "good", now).state;
    const second = reviewCard(first, "good", now);
    expect(second.state.interval).toBe(6);
    expect(second.state.due).toEqual(daysFromNow(6));
  });

  it("third good review multiplies by ease", () => {
    let s = newCardState(now);
    s = reviewCard(s, "good", now).state;
    s = reviewCard(s, "good", now).state;
    const third = reviewCard(s, "good", now);
    expect(third.state.interval).toBe(Math.round(6 * 2.5));
    expect(third.state.due).toEqual(daysFromNow(15));
  });

  it("easy increases ease and good keeps it", () => {
    const easy = reviewCard(newCardState(now), "easy", now).state;
    const good = reviewCard(newCardState(now), "good", now).state;
    expect(easy.ease).toBeGreaterThan(2.5);
    expect(good.ease).toBe(2.5);
  });

  it("hard grows interval slower", () => {
    let s = newCardState(now);
    s = reviewCard(s, "good", now).state;
    s = reviewCard(s, "good", now).state;
    const hard = reviewCard(s, "hard", now);
    expect(hard.state.interval).toBe(Math.max(1, Math.round(15 * 0.8)));
  });

  it("again resets reps and schedules 1 day", () => {
    let s = newCardState(now);
    s = reviewCard(s, "good", now).state;
    s = reviewCard(s, "good", now).state;
    const again = reviewCard(s, "again", now);
    expect(again.correct).toBe(false);
    expect(again.state.reps).toBe(0);
    expect(again.state.lapses).toBe(1);
    expect(again.state.interval).toBe(1);
    expect(again.state.status).toBe(1);
    expect(again.state.due).toEqual(daysFromNow(1));
  });

  it("ease never drops below the floor", () => {
    let s: SrsState = { ...newCardState(now), ease: 1.35 };
    for (let i = 0; i < 20; i++) {
      s = reviewCard(s, "again", now).state;
    }
    expect(s.ease).toBe(SM2_MIN_EASE);
  });
});
