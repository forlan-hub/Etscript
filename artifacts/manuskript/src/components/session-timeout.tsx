import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const TIMEOUT_MS = 30 * 60 * 1000;
const WARNING_BEFORE_MS = 2 * 60 * 1000;
const ACTIVITY_EVENTS = ["mousemove", "keydown", "mousedown", "touchstart", "scroll"] as const;

export function SessionTimeout() {
  const { user, signOut } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(120);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const showWarningRef = useRef(false);

  const clearAllTimers = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  }, []);

  const startTimers = useCallback(() => {
    clearAllTimers();
    showWarningRef.current = false;
    setShowWarning(false);

    warningRef.current = setTimeout(() => {
      showWarningRef.current = true;
      setShowWarning(true);
      setSecondsLeft(120);
      countdownRef.current = setInterval(() => {
        setSecondsLeft((s) => Math.max(0, s - 1));
      }, 1000);
    }, TIMEOUT_MS - WARNING_BEFORE_MS);

    timeoutRef.current = setTimeout(() => {
      showWarningRef.current = false;
      setShowWarning(false);
      clearAllTimers();
      signOut();
    }, TIMEOUT_MS);
  }, [clearAllTimers, signOut]);

  const handleActivity = useCallback(() => {
    if (!showWarningRef.current) {
      startTimers();
    }
  }, [startTimers]);

  useEffect(() => {
    if (!user) {
      clearAllTimers();
      return;
    }

    startTimers();

    ACTIVITY_EVENTS.forEach((e) =>
      window.addEventListener(e, handleActivity, { passive: true }),
    );

    return () => {
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, handleActivity));
      clearAllTimers();
    };
  }, [user, startTimers, handleActivity, clearAllTimers]);

  const handleStaySignedIn = () => {
    startTimers();
  };

  const handleLogOut = () => {
    clearAllTimers();
    signOut();
  };

  if (!user) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeDisplay =
    minutes > 0
      ? `${minutes}:${String(seconds).padStart(2, "0")} minutes`
      : `${seconds} second${seconds !== 1 ? "s" : ""}`;

  return (
    <AlertDialog open={showWarning}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Your session is about to expire</AlertDialogTitle>
          <AlertDialogDescription>
            Your session will expire in{" "}
            <span className="font-semibold text-foreground">{timeDisplay}</span> due to
            inactivity. Would you like to stay signed in?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleLogOut}>Log Out</AlertDialogCancel>
          <AlertDialogAction onClick={handleStaySignedIn}>Stay Signed In</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
