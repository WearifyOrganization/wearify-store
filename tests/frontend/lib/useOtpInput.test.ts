import { describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useOtpInput } from "@/lib/useOtpInput";

/* Attaches real inputs to the hook's ref array so focus moves can be asserted. */
function attachInputs(refs: { current: (HTMLInputElement | null)[] }, n = 6) {
  const inputs = Array.from({ length: n }, () => {
    const el = document.createElement("input");
    document.body.appendChild(el);
    return el;
  });
  refs.current = inputs;
  return inputs;
}

describe("useOtpInput", () => {
  it("starts empty and not complete", () => {
    const { result } = renderHook(() => useOtpInput());
    expect(result.current.digits).toEqual(["", "", "", "", "", ""]);
    expect(result.current.code).toBe("");
    expect(result.current.isComplete).toBe(false);
  });

  it("strips non-digits and blanks the box when nothing numeric is left", () => {
    const { result } = renderHook(() => useOtpInput());
    act(() => result.current.handleInput(0, "a7"));
    expect(result.current.digits[0]).toBe("7");
    act(() => result.current.handleInput(1, "xy"));
    expect(result.current.digits[1]).toBe("");
  });

  // The reported bug: a 6-digit code arriving in one box left five boxes empty
  // and the user was told to "enter all 6 digits" of what they had just pasted.
  it("spreads a multi-digit value across the boxes from the target index", () => {
    const { result } = renderHook(() => useOtpInput());
    attachInputs(result.current.refs);
    act(() => result.current.handleInput(0, "123456"));
    expect(result.current.digits).toEqual(["1", "2", "3", "4", "5", "6"]);
    expect(result.current.code).toBe("123456");
  });

  it("spreads a paste and does not overrun the last box", () => {
    const { result } = renderHook(() => useOtpInput());
    attachInputs(result.current.refs);
    act(() =>
      result.current.handlePaste(3, {
        clipboardData: { getData: () => "998877" },
        preventDefault: () => {},
      } as unknown as React.ClipboardEvent),
    );
    expect(result.current.digits).toEqual(["", "", "", "9", "9", "8"]);
  });

  it("fires onComplete when a paste fills every box", () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useOtpInput({ onComplete }));
    attachInputs(result.current.refs);
    act(() =>
      result.current.handlePaste(0, {
        clipboardData: { getData: () => "4 1 5 9 2 6" },
        preventDefault: () => {},
      } as unknown as React.ClipboardEvent),
    );
    expect(onComplete).toHaveBeenCalledWith(["4", "1", "5", "9", "2", "6"]);
  });

  // Two events in one tick used to both read the same render-closure array, so
  // the first digit was overwritten and the tap looked dropped.
  it("does not drop a digit when two entries land without a re-render", () => {
    const { result } = renderHook(() => useOtpInput());
    attachInputs(result.current.refs);
    act(() => {
      result.current.handleInput(0, "1");
      result.current.handleInput(1, "2");
    });
    expect(result.current.digits.slice(0, 2)).toEqual(["1", "2"]);
  });

  it("advances focus on entry and does not overrun the last box", () => {
    const { result } = renderHook(() => useOtpInput());
    const inputs = attachInputs(result.current.refs);
    act(() => result.current.handleInput(0, "1"));
    expect(document.activeElement).toBe(inputs[1]);
    act(() => result.current.handleInput(5, "9"));
    expect(document.activeElement).toBe(inputs[1]); // unchanged — no box 6
  });

  it("steps back and clears the previous box on backspace over an empty one", () => {
    const { result } = renderHook(() => useOtpInput());
    const inputs = attachInputs(result.current.refs);
    act(() => result.current.handleInput(0, "1"));
    act(() =>
      result.current.handleKeyDown(1, {
        key: "Backspace",
      } as React.KeyboardEvent),
    );
    expect(result.current.digits[0]).toBe("");
    expect(document.activeElement).toBe(inputs[0]);
  });

  it("does not step back when the current box has a digit", () => {
    const { result } = renderHook(() => useOtpInput());
    attachInputs(result.current.refs);
    act(() => result.current.handleInput(0, "1"));
    act(() => result.current.handleInput(1, "2"));
    act(() =>
      result.current.handleKeyDown(1, {
        key: "Backspace",
      } as React.KeyboardEvent),
    );
    expect(result.current.digits[0]).toBe("1");
  });

  it("fires onComplete once every box is filled, with the digits in order", () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useOtpInput({ onComplete }));
    attachInputs(result.current.refs);
    for (let i = 0; i < 5; i++) {
      act(() => result.current.handleInput(i, String(i + 1)));
    }
    expect(onComplete).not.toHaveBeenCalled();
    act(() => result.current.handleInput(5, "6"));
    expect(onComplete).toHaveBeenCalledOnce();
    expect(onComplete).toHaveBeenCalledWith(["1", "2", "3", "4", "5", "6"]);
    expect(result.current.isComplete).toBe(true);
    expect(result.current.code).toBe("123456");
  });

  it("fires onEdit on every edit", () => {
    const onEdit = vi.fn();
    const { result } = renderHook(() => useOtpInput({ onEdit }));
    act(() => result.current.handleInput(0, "1"));
    act(() => result.current.handleInput(1, "2"));
    expect(onEdit).toHaveBeenCalledTimes(2);
  });

  it("reset clears every box", () => {
    const { result } = renderHook(() => useOtpInput());
    act(() => result.current.handleInput(0, "1"));
    act(() => result.current.reset());
    expect(result.current.digits).toEqual(["", "", "", "", "", ""]);
  });

  it("focusFirst focuses box 0", async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useOtpInput());
    const inputs = attachInputs(result.current.refs);
    act(() => result.current.focusFirst());
    act(() => void vi.advanceTimersByTime(100));
    expect(document.activeElement).toBe(inputs[0]);
    vi.useRealTimers();
  });

  /* Keypad path — the /c login + register screens draw the boxes as divs and
     drive them from an on-screen pad, so none of the input handlers apply. */
  describe("keypad entry", () => {
    it("fills the boxes left to right", () => {
      const { result } = renderHook(() => useOtpInput());
      act(() => void result.current.pressDigit("4"));
      act(() => void result.current.pressDigit("2"));
      expect(result.current.digits).toEqual(["4", "2", "", "", "", ""]);
    });

    // The reported bug: both handlers built `next` from the render closure, so
    // two taps landing in one tick wrote to the same index and the first digit
    // was lost. Two presses inside ONE act() is that race.
    it("keeps both digits when two taps land in the same tick", () => {
      const { result } = renderHook(() => useOtpInput());
      act(() => {
        result.current.pressDigit("1");
        result.current.pressDigit("2");
      });
      expect(result.current.digits).toEqual(["1", "2", "", "", "", ""]);
    });

    it("does not lose digits across a full six-tap burst in one tick", () => {
      const { result } = renderHook(() => useOtpInput());
      act(() => {
        for (const d of "135790") result.current.pressDigit(d);
      });
      expect(result.current.code).toBe("135790");
    });

    it("ignores taps once every box is filled", () => {
      const { result } = renderHook(() => useOtpInput());
      act(() => {
        for (const d of "123456") result.current.pressDigit(d);
      });
      let overflow: string[] | null = null;
      act(() => { overflow = result.current.pressDigit("9"); });
      expect(overflow).toBeNull();
      expect(result.current.code).toBe("123456");
    });

    it("ignores a non-digit tap", () => {
      const { result } = renderHook(() => useOtpInput());
      act(() => void result.current.pressDigit("x"));
      expect(result.current.digits).toEqual(["", "", "", "", "", ""]);
    });

    it("returns the resulting digits so the caller can auto-submit", () => {
      const { result } = renderHook(() => useOtpInput());
      act(() => {
        for (const d of "12345") result.current.pressDigit(d);
      });
      let last: string[] | null = null;
      act(() => { last = result.current.pressDigit("6"); });
      expect(last).toEqual(["1", "2", "3", "4", "5", "6"]);
    });

    it("backspace clears the last filled box, and no-ops when empty", () => {
      const { result } = renderHook(() => useOtpInput());
      act(() => {
        result.current.pressDigit("7");
        result.current.pressDigit("8");
      });
      act(() => void result.current.pressBackspace());
      expect(result.current.digits).toEqual(["7", "", "", "", "", ""]);
      act(() => void result.current.pressBackspace());
      let empty: string[] | null = null;
      act(() => { empty = result.current.pressBackspace(); });
      expect(empty).toBeNull();
      expect(result.current.digits).toEqual(["", "", "", "", "", ""]);
    });

    it("fires onEdit per tap and onComplete once the last box lands", () => {
      const onEdit = vi.fn();
      const onComplete = vi.fn();
      const { result } = renderHook(() => useOtpInput({ onEdit, onComplete }));
      act(() => {
        for (const d of "123456") result.current.pressDigit(d);
      });
      expect(onEdit).toHaveBeenCalledTimes(6);
      expect(onComplete).toHaveBeenCalledOnce();
      expect(onComplete).toHaveBeenCalledWith(["1", "2", "3", "4", "5", "6"]);
    });

    it("interoperates with reset", () => {
      const { result } = renderHook(() => useOtpInput());
      act(() => void result.current.pressDigit("5"));
      act(() => result.current.reset());
      act(() => void result.current.pressDigit("9"));
      expect(result.current.digits).toEqual(["9", "", "", "", "", ""]);
    });
  });

  /* The /c screens submit off the return value rather than onComplete, because
     their submit handler needs reset() from this same hook. */
  it("handleInput and handlePaste return the resulting digits", () => {
    const { result } = renderHook(() => useOtpInput());
    attachInputs(result.current.refs);
    let typed: string[] | null = null;
    act(() => { typed = result.current.handleInput(0, "7"); });
    expect(typed).toEqual(["7", "", "", "", "", ""]);

    let pasted: string[] | null = null;
    act(() => {
      pasted = result.current.handlePaste(1, {
        clipboardData: { getData: () => "23456" },
        preventDefault: () => {},
      } as unknown as React.ClipboardEvent);
    });
    expect(pasted).toEqual(["7", "2", "3", "4", "5", "6"]);
  });

  it("handlePaste returns null for a non-numeric paste and leaves the boxes alone", () => {
    const { result } = renderHook(() => useOtpInput());
    let out: string[] | null = null;
    act(() => {
      out = result.current.handlePaste(0, {
        clipboardData: { getData: () => "hello" },
        preventDefault: () => {},
      } as unknown as React.ClipboardEvent);
    });
    expect(out).toBeNull();
    expect(result.current.digits).toEqual(["", "", "", "", "", ""]);
  });

  // iOS/Android autofill sets .value programmatically with the whole code,
  // which bypasses maxLength=1 — this is the shape that reaches onChange.
  it("absorbs an SMS autofill that drops all six digits into box 0", () => {
    const { result } = renderHook(() => useOtpInput());
    attachInputs(result.current.refs);
    let next: string[] | null = null;
    act(() => { next = result.current.handleInput(0, "419526"); });
    expect(next).toEqual(["4", "1", "9", "5", "2", "6"]);
    expect(result.current.isComplete).toBe(true);
  });
});
