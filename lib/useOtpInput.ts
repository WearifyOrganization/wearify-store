"use client";

import { useCallback, useRef, useState } from "react";

type Options = {
  length?: number;
  /** Fires once the last empty box is filled. Receives the digits in order. */
  onComplete?: (digits: string[]) => void;
  /** Fires on every edit — used to clear a stale error message. */
  onEdit?: () => void;
};

/* Six-box OTP entry: advances focus on input, steps back on backspace over an
   empty box, spreads a pasted/autofilled code across the boxes, and reports
   completion. The caller owns what "complete" does.
 *
 * Two things here are load-bearing and easy to undo by accident:
 *
 * 1. `digitsRef` — every handler reads the CURRENT digits from the ref, never
 *    from the render closure. Two input events in one tick (fast typing, or a
 *    keypad the user taps quicker than React re-renders) both used to build
 *    their `next` from the same stale array, so the first digit was silently
 *    overwritten by the second.
 *
 * 2. `handlePaste` exists SEPARATELY from handleInput because the boxes carry
 *    maxLength={1}: the browser truncates pasted text before onChange ever
 *    sees it, so a pasted 6-digit code arrived as a single character and the
 *    user got told to "enter all 6 digits" of the code they had just pasted.
 *    handleInput's multi-digit branch covers the other route in — SMS autofill,
 *    which sets .value programmatically and bypasses maxLength.
 */
export function useOtpInput({ length = 6, onComplete, onEdit }: Options = {}) {
  const [digits, setDigits] = useState<string[]>(() => Array(length).fill(""));
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digitsRef = useRef(digits);

  // Single write path, so digitsRef can never drift from state.
  const commit = useCallback(
    (next: string[]) => {
      digitsRef.current = next;
      setDigits(next);
    },
    [],
  );

  const focusFirst = useCallback((delayMs = 80) => {
    setTimeout(() => refs.current[0]?.focus(), delayMs);
  }, []);

  const reset = useCallback(() => {
    commit(Array(length).fill(""));
  }, [commit, length]);

  /** Write `raw`'s digits into the boxes from `index` on. Returns the result. */
  const fillFrom = useCallback(
    (index: number, raw: string): string[] => {
      const incoming = raw.replace(/\D/g, "");
      const next = [...digitsRef.current];
      if (incoming.length === 0) {
        // A cleared or non-numeric entry blanks just this box.
        next[index] = "";
        commit(next);
        return next;
      }
      const room = Math.min(incoming.length, length - index);
      for (let i = 0; i < room; i++) next[index + i] = incoming[i];
      commit(next);
      // Land on the first still-empty box, or the last one we filled.
      const nextEmpty = next.findIndex((d) => d === "");
      refs.current[nextEmpty === -1 ? length - 1 : nextEmpty]?.focus();
      return next;
    },
    [commit, length],
  );

  const handleInput = useCallback(
    (index: number, value: string): string[] => {
      const next = fillFrom(index, value);
      onEdit?.();
      if (next.every((d) => d !== "")) onComplete?.(next);
      return next;
    },
    [fillFrom, onComplete, onEdit],
  );

  const handlePaste = useCallback(
    (index: number, e: React.ClipboardEvent): string[] | null => {
      const text = e.clipboardData.getData("text");
      if (!/\d/.test(text)) return null; // let the browser handle non-numeric pastes
      e.preventDefault();
      const next = fillFrom(index, text);
      onEdit?.();
      if (next.every((d) => d !== "")) onComplete?.(next);
      return next;
    },
    [fillFrom, onComplete, onEdit],
  );

  /* Keypad entry, for surfaces with no <input> behind the boxes — the customer
     app draws them as divs and drives them from an on-screen pad. Fills the
     first empty box / clears the last filled one, reading through digitsRef
     for the same reason handleInput does: a pad the user taps faster than
     React re-renders used to collapse two taps into one digit.
   *
     Like handleInput and handlePaste it returns the resulting digits, so a
     caller can auto-submit from the return value instead of onComplete. That
     matters because a submit handler that resets the boxes on failure needs
     `reset` from this hook, so wiring it as onComplete would need the callback
     declared before the hook it depends on. Use one route or the other — a
     caller that passes onComplete AND submits off the return will fire twice. */
  const pressDigit = useCallback(
    (d: string): string[] | null => {
      const digit = d.replace(/\D/g, "").slice(0, 1);
      if (!digit) return null;
      const index = digitsRef.current.findIndex((x) => x === "");
      if (index === -1) return null; // already full
      const next = [...digitsRef.current];
      next[index] = digit;
      commit(next);
      onEdit?.();
      if (next.every((x) => x !== "")) onComplete?.(next);
      return next;
    },
    [commit, onComplete, onEdit],
  );

  const pressBackspace = useCallback((): string[] | null => {
    const current = digitsRef.current;
    let index = -1;
    for (let i = current.length - 1; i >= 0; i--) {
      if (current[i] !== "") { index = i; break; }
    }
    if (index === -1) return null;
    const next = [...current];
    next[index] = "";
    commit(next);
    onEdit?.();
    return next;
  }, [commit, onEdit]);

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent) => {
      if (e.key === "Backspace" && !digitsRef.current[index] && index > 0) {
        const next = [...digitsRef.current];
        next[index - 1] = "";
        commit(next);
        refs.current[index - 1]?.focus();
      }
    },
    [commit],
  );

  return {
    digits,
    setDigits: commit,
    refs,
    handleInput,
    handlePaste,
    handleKeyDown,
    pressDigit,
    pressBackspace,
    focusFirst,
    reset,
    code: digits.join(""),
    isComplete: digits.every((d) => d !== ""),
  };
}
