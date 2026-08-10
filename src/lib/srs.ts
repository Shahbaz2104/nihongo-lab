export type Grade = "again" | "hard" | "good" | "easy";

export interface SrsState {
  /** 0 = new, 1 = learning, 2 = review */
  status: number;
  /** Ease factor (SM-2 EF), starts at 2.5, floor 1.3 */
  ease: number;
  /** Current interval in days */
  interval: number;
  /** Consecutive correct reviews */
  reps: number;
  /** Total failed reviews */
  lapses: number;
  /** Next review date */
  due: Date;
}

export interface SrsReview {
  state: SrsState;
  /** SM-2 grade 1-5 (again=1, hard=3, good=4, easy=5) */
  q: number;
  correct: boolean;
}

export const SM2_MIN_EASE = 1.3;
export const DAY_MS = 24 * 60 * 60 * 1000;

export function gradeToQ(grade: Grade): number {
  switch (grade) {
    case "again":
      return 1;
    case "hard":
      return 3;
    case "good":
      return 4;
    case "easy":
      return 5;
  }
}

export function newCardState(now = new Date()): SrsState {
  return {
    status: 0,
    ease: 2.5,
    interval: 0,
    reps: 0,
    lapses: 0,
    due: now,
  };
}

/**
 * SM-2 spaced repetition.
 *
 * - q >= 3 is a correct answer. Intervals ramp 1 -> 6 -> round(interval * ease),
 *   capped by ease floor and clamped to 1 day minimum.
 * - q < 3 resets reps and drops the interval back to 1 day; each lapse raises
 *   the lapse counter so stats can flag struggling cards.
 * - Ease adjusts per SM-2: EF' = EF + (0.1 - (5-q)(0.08 + (5-q)0.02)), floor 1.3.
 * - "hard" answers grow the interval at 0.8x to avoid over-scheduling.
 */
export function reviewCard(state: SrsState, grade: Grade, now = new Date()): SrsReview {
  const q = gradeToQ(grade);
  const correct = q >= 3;

  const ease = Math.max(
    SM2_MIN_EASE,
    state.ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)),
  );

  let interval: number;
  let reps = state.reps;
  let lapses = state.lapses;

  if (correct) {
    reps += 1;
    if (reps === 1) interval = 1;
    else if (reps === 2) interval = 6;
    else interval = Math.max(1, Math.round(state.interval * state.ease));

    if (grade === "hard") interval = Math.max(1, Math.round(interval * 0.8));
  } else {
    reps = 0;
    lapses += 1;
    interval = 1;
  }

  const due = new Date(now.getTime() + interval * DAY_MS);

  return {
    q,
    correct,
    state: {
      status: correct ? 2 : 1,
      ease,
      interval,
      reps,
      lapses,
      due,
    },
  };
}
