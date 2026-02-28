"use client";

import { useEffect, useRef, useCallback, useState } from "react";

const SAVE_INTERVAL_MS = 60_000; // Save every 60 seconds

// ---- Shared session tracker (module-level, survives re-renders) ----
let _sessionStartedAt: number | null = null; // timestamp when current active session began
let _pausedAccumulatedMs = 0;               // total ms accumulated from previous active segments
let _isPaused = true;

function startSession() {
    if (!_isPaused) return;
    _isPaused = false;
    _sessionStartedAt = Date.now();
}

function pauseSession() {
    if (_isPaused || !_sessionStartedAt) return;
    _pausedAccumulatedMs += Date.now() - _sessionStartedAt;
    _sessionStartedAt = null;
    _isPaused = true;
}

function getSessionSeconds(): number {
    let total = _pausedAccumulatedMs;
    if (!_isPaused && _sessionStartedAt) {
        total += Date.now() - _sessionStartedAt;
    }
    return Math.floor(total / 1000);
}

function resetSession() {
    _pausedAccumulatedMs = 0;
    _sessionStartedAt = _isPaused ? null : Date.now();
}

// ---- Main timer hook (runs in dashboard layout) ----
export function useStudyTimer() {
    const saveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const flush = useCallback(async () => {
        const seconds = getSessionSeconds();
        if (seconds < 5) return;

        resetSession();

        try {
            await fetch("/api/study-time", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ seconds }),
            });
            window.dispatchEvent(new CustomEvent("study-time-saved"));
        } catch {
            // If save fails, add the time back
            _pausedAccumulatedMs += seconds * 1000;
        }
    }, []);

    useEffect(() => {
        startSession();

        const handleVisibilityChange = () => {
            if (document.hidden) {
                pauseSession();
                flush();
            } else {
                startSession();
            }
        };

        const handleFocus = () => startSession();
        const handleBlur = () => {
            pauseSession();
            flush();
        };

        saveIntervalRef.current = setInterval(flush, SAVE_INTERVAL_MS);

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("focus", handleFocus);
        window.addEventListener("blur", handleBlur);

        const handleBeforeUnload = () => {
            const seconds = getSessionSeconds();
            if (seconds >= 5) {
                navigator.sendBeacon(
                    "/api/study-time",
                    new Blob([JSON.stringify({ seconds })], { type: "application/json" })
                );
                resetSession();
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("focus", handleFocus);
            window.removeEventListener("blur", handleBlur);
            window.removeEventListener("beforeunload", handleBeforeUnload);
            flush();
        };
    }, [flush]);
}

// ---- Display hook (runs on profile page for live ticking) ----
export function useLiveSessionSeconds() {
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        // Poll session seconds every second for smooth ticking
        const interval = setInterval(() => {
            setSeconds(getSessionSeconds());
        }, 1000);

        // Also update when time is saved (resets session counter)
        const handleSaved = () => setSeconds(getSessionSeconds());
        window.addEventListener("study-time-saved", handleSaved);

        return () => {
            clearInterval(interval);
            window.removeEventListener("study-time-saved", handleSaved);
        };
    }, []);

    return seconds;
}
