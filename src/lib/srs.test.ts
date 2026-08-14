import { describe, expect, it } from "vitest";
import { gradeToQ, newCardState, reviewCard, SM2_MIN_EASE, type SrsState } from "./srs";

const now = new Date("2026-08-10T00:00:00Z");

function daysFromNow(n: number): Date {
  return new Date(now.getTime() + n * 24 * 60 * 60 * 1000);
}

function runSequence(grades: ("again" | "hard" | "good" | "easy")[]): SrsState {
  let s = newCardState(now);
  for (const g of grades) s = reviewCard(s, g, now).state;
  return s;
}

describe("gradeToQ", () => {
  it("maps grades to SM-2 quality", () => {
    expect(gradeToQ("again")).toBe(1);
    expect(gradeToQ("hard")).toBe(3);
    expect(gradeToQ("good")).toBe(4);
    expect(gradeToQ("easy")).toBe(5);
  });
});

describe("newCardState", () => {
  it("starts a fresh card", () => {
    const s = newCardState(now);
    expect(s.status).toBe(0);
    expect(s.ease).toBe(2.5);
    expect(s.interval).toBe(0);
    expect(s.reps).toBe(0);
    expect(s.lapses).toBe(0);
    expect(s.due).toEqual(now);
  });
});

describe("new card first grade", () => {
  it("new → again: lapse, 1-day interval, learning status", () => {
    const r = reviewCard(newCardState(now), "again", now);
    expect(r.correct).toBe(false);
    expect(r.state).toMatchObject({
      status: 1,
      interval: 1,
      reps: 0,
      lapses: 1,
      due: daysFromNow(1),
    });
  });

  it("new → hard: 1-day interval, reps 1", () => {
    const r = reviewCard(newCardState(now), "hard", now);
    expect(r.correct).toBe(true);
    expect(r.state).toMatchObject({ interval: 1, reps: 1, status: 2 });
    expect(r.state.due).toEqual(daysFromNow(1));
  });

  it("new → good: 1-day interval", () => {
    const r = reviewCard(newCardState(now), "good", now);
    expect(r.state).toMatchObject({ interval: 1, reps: 1, status: 2 });
  });

  it("new → easy: larger interval and higher ease", () => {
    const r = reviewCard(newCardState(now), "easy", now);
    expect(r.state.reps).toBe(1);
    expect(r.state.ease).toBeGreaterThan(2.5);
  });
});

describe("grade sequences", () => {
  it("good → good → good ramps 1, 6, ease-multiplied", () => {
    const s = runSequence(["good", "good", "good"]);
    expect(s.interval).toBe(Math.round(6 * 2.5));
    expect(s.due).toEqual(daysFromNow(Math.round(6 * 2.5)));
  });

  it("good → good → hard grows slower", () => {
    const s = runSequence(["good", "good", "hard"]);
    expect(s.interval).toBe(Math.max(1, Math.round(Math.round(6 * 2.5) * 0.8)));
  });

  it("good → again resets reps and lapses", () => {
    const s = runSequence(["good", "again"]);
    expect(s).toMatchObject({ reps: 0, lapses: 1, interval: 1, status: 1 });
  });

  it("good → easy keeps the 1→6 ramp and grows ease", () => {
    const first = reviewCard(newCardState(now), "good", now).state;
    const second = reviewCard(first, "easy", now);
    expect(second.state.interval).toBe(6);
    expect(second.state.ease).toBeGreaterThan(first.ease);
  });

  it("hard → hard grows at 0.8x of the 6-day step", () => {
    let s = newCardState(now);
    s = reviewCard(s, "hard", now).state;
    const second = reviewCard(s, "hard", now);
    expect(second.state.interval).toBe(Math.max(1, Math.round(6 * 0.8)));
    expect(second.state.reps).toBe(2);
  });

  it("easy → easy compounds", () => {
    const first = reviewCard(newCardState(now), "easy", now).state;
    const second = reviewCard(first, "easy", now);
    expect(second.state.interval).toBeGreaterThan(first.interval);
    expect(second.state.ease).toBeGreaterThan(first.ease);
  });
});

describe("lapses and ease floor", () => {
  it("multiple consecutive lapses accumulate", () => {
    const s = runSequence(["again", "again", "again"]);
    expect(s.lapses).toBe(3);
    expect(s.reps).toBe(0);
    expect(s.interval).toBe(1);
  });

  it("ease never drops below the floor", () => {
    let s: SrsState = { ...newCardState(now), ease: 1.35 };
    for (let i = 0; i < 50; i++) {
      s = reviewCard(s, "again", now).state;
    }
    expect(s.ease).toBe(SM2_MIN_EASE);
  });

  it("recovery after lapse grows from 1 again", () => {
    let s = runSequence(["good", "again", "good"]);
    expect(s.interval).toBe(1);
    s = reviewCard(s, "good", now).state;
    expect(s.interval).toBe(6);
  });
});

describe("due dates", () => {
  it("due dates are deterministic from the provided clock", () => {
    const t = new Date("2026-01-31T23:30:00Z");
    const r = reviewCard(newCardState(t), "good", t);
    expect(r.state.due.getTime()).toBe(t.getTime() + 24 * 60 * 60 * 1000);
  });

  it("interval of zero still schedules one day out", () => {
    const r = reviewCard(newCardState(now), "again", now);
    expect(r.state.due.getTime()).toBeGreaterThan(now.getTime());
  });
});
