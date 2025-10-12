// app/verify/page.tsx
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Paper,
  Stack,
} from "@mui/material";

// جلوگیری از پیش‌رندر و کش
export const dynamic = "force-dynamic";
export const revalidate = 0;

type Status = "idle" | "loading" | "success" | "error";

function VerifyInner() {
  // بالا
  const sp = useSearchParams()!;        // ← non-null assertion
  const token = sp.get("token");        // string | null


  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");

  const verifyUrl = useMemo(() => {
    if (!token) return null;
    return `/api/auth/verify?token=${encodeURIComponent(token)}`;
  }, [token]);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid or missing verification token.");
      return;
    }

    const ac = new AbortController();
    const run = async () => {
      setStatus("loading");
      try {
        const res = await fetch(verifyUrl!, {
          method: "GET",
          signal: ac.signal,
          // اگر کوکی سشن لازم شد:
          credentials: "include",
          headers: { "Accept": "application/json" },
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          setStatus("success");
          setMessage(data?.message || "Email verified successfully.");
        } else {
          setStatus("error");
          setMessage(data?.error || `Verification failed (HTTP ${res.status}).`);
        }
      } catch (e) {
        if (!ac.signal.aborted) {
          setStatus("error");
          setMessage("An unexpected network error occurred.");
        }
      }
    };
    run();
    return () => ac.abort();
  }, [verifyUrl, token]);

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" px={2}>
      <Paper elevation={4} sx={{ p: 4, maxWidth: 480, width: "100%" }}>
        {status === "loading" || status === "idle" ? (
          <Box display="flex" flexDirection="column" alignItems="center">
            <CircularProgress />
            <Typography mt={2}>Verifying your email...</Typography>
          </Box>
        ) : (
          <>
            <Alert severity={status === "success" ? "success" : "error"} sx={{ mb: 3 }}>
              {message}
            </Alert>

            <Stack direction="row" spacing={1}>
              {status === "success" ? (
                <>
                  <Button fullWidth variant="contained" href="/auth/login">
                    Continue to Login
                  </Button>
                  <Button fullWidth variant="outlined" color="inherit" href="/">
                    Home
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => {
                      // ری‌تری ساده
                      if (token) {
                        // تریگر دوباره‌ی افکت
                        const url = new URL(window.location.href);
                        url.searchParams.set("t", Date.now().toString());
                        window.history.replaceState(null, "", url.toString());
                        // تغییر state برای نمایش لودینگ
                        setStatus("loading");
                      }
                    }}
                  >
                    Try Again
                  </Button>
                  <Button fullWidth variant="outlined" color="inherit" href="/register">
                    Re-register
                  </Button>
                </>
              )}
            </Stack>

            {status === "success" && (
              <Typography variant="body2" color="text.secondary" textAlign="center" mt={2}>
                You can now use your account to sign in.
              </Typography>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" px={2}>
          <Paper elevation={4} sx={{ p: 4, maxWidth: 480, width: "100%" }}>
            <Box display="flex" flexDirection="column" alignItems="center">
              <CircularProgress />
              <Typography mt={2}>Loading…</Typography>
            </Box>
          </Paper>
        </Box>
      }
    >
      <VerifyInner />
    </Suspense>
  );
}
