"use client";

// Reactive auth for the token-based modules (store / tailor / customer / staff).
//
// Replaces the hand-rolled block that appeared in ~50 components:
//
//   const [token, setToken] = useState<string | null>(null);
//   const [ready, setReady] = useState(false);
//   useEffect(() => {
//     const t = localStorage.getItem("wearify_auth_token");
//     if (!t) { router.replace("/x/login"); return; }
//     setToken(t);
//     try { const u = JSON.parse(localStorage.getItem("wearify_auth_user") || "{}"); ... } catch {}
//     setReady(true);
//   }, [...]);
//   const session = useQuery(api.phoneAuth.validateSession, token ? { token } : "skip");
//
// Auth state is read during render (via lib/clientStore's useSyncExternalStore),
// so there is no setState-in-effect, no cascading render, and no stale-token
// race between what React holds and what localStorage actually contains — the
// exact class of bug documented in app/c/layout.tsx.
//
// NOTE ON TRUST: none of this is a security boundary. The Convex functions
// authorize every call server-side (convex/authz.ts). These hooks only decide
// what to render and where to send an unauthenticated browser.

import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@wearify/shared/api";
import { StoreKeys, useStoredJson, useStoredString } from "./clientStore";
import { AuthUser, clearToken } from "./phoneAuth";

// The role strings minted by convex/phoneAuth.ts into userSessions.role.
export type AuthRole = "store_owner" | "customer" | "tailor" | "staff";

// The projection convex/phoneAuth.ts:validateSession returns.
export type ValidatedSession = {
  phone: string;
  name: string;
  role: string;
  storeId?: string;
  tailorId?: string;
};

export type AuthStatus =
  | "loading" // hydrating, or the session query is still in flight
  | "authenticated" // live token whose session validated against the server
  | "unauthenticated"; // no token, or the server rejected it

// ---------------------------------------------------------------------------
// Hydration
// ---------------------------------------------------------------------------

const noopSubscribe = () => () => {};

// False on the server and for the hydrating render, true from the first
// client-only render onward. Guards let us distinguish "storage not read yet"
// from "genuinely signed out" — without it, every guard would redirect on the
// first paint of a perfectly valid session.
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

// ---------------------------------------------------------------------------
// Primitive reads
// ---------------------------------------------------------------------------

// The raw session token, or null. Re-renders on login/logout in this tab or any
// other. Use this to build Convex args: `token ? { token } : "skip"`.
export function useAuthToken(): string | null {
  return useStoredString(StoreKeys.AUTH_TOKEN);
}

// The cached user profile written at login. This is a client-side convenience
// copy for instant first paint (store name in a header, etc.) — never a source
// of authority. Anything that matters is re-derived server-side.
export function useAuthUser(): AuthUser | null {
  return useStoredJson<AuthUser>(StoreKeys.AUTH_USER);
}

// ---------------------------------------------------------------------------
// Session validation
// ---------------------------------------------------------------------------

export type UseAuthResult = {
  status: AuthStatus;
  token: string | null;
  /** Cached client-side profile. Present before the server confirms. */
  user: AuthUser | null;
  /** Server-validated identity. undefined while the query is in flight. */
  session: ValidatedSession | null | undefined;
  /** True once hydrated AND the session query has settled. */
  ready: boolean;
};

// Reads the token and validates it against the server. This is the building
// block; most callers want useRequireRole below, which adds the redirect.
export function useAuth(): UseAuthResult {
  const hydrated = useHydrated();
  const token = useAuthToken();
  const user = useAuthUser();

  const session = useQuery(
    api.phoneAuth.validateSession,
    hydrated && token ? { token } : "skip",
  );

  let status: AuthStatus;
  if (!hydrated) {
    status = "loading";
  } else if (!token) {
    status = "unauthenticated";
  } else if (session === undefined) {
    status = "loading";
  } else if (session === null) {
    status = "unauthenticated";
  } else {
    status = "authenticated";
  }

  return {
    status,
    token,
    user,
    session,
    ready: status !== "loading",
  };
}

// ---------------------------------------------------------------------------
// Logout
// ---------------------------------------------------------------------------

// Returns a logout callback that revokes the session server-side (so the
// userSessions row is actually deleted, not just forgotten locally), clears
// local storage, and navigates to `redirectTo`.
//
// The server call is best-effort: if it fails (offline kiosk, expired token)
// we still clear locally, because the user's intent was to sign out.
export function useLogout(redirectTo: string): () => Promise<void> {
  const router = useRouter();
  const token = useAuthToken();
  const logoutMutation = useMutation(api.phoneAuth.logout);

  return useCallback(async () => {
    if (token) {
      try {
        await logoutMutation({ token });
      } catch {
        /* best-effort — clear locally regardless */
      }
    }
    clearToken();
    router.replace(redirectTo);
  }, [token, logoutMutation, router, redirectTo]);
}

// ---------------------------------------------------------------------------
// Route guard
// ---------------------------------------------------------------------------

export type UseRequireRoleResult = UseAuthResult & {
  /** True when the caller should render a loading state instead of children. */
  isPending: boolean;
};

// Guard a subtree to a single role. Redirects to `loginPath` when there is no
// token, when the server rejects it, or when the session belongs to a
// different role (e.g. a tailor token on a /store route).
//
// Callers render their own loading UI while `isPending` is true.
//
// The redirect runs in an effect (navigation is a side effect and must not
// happen during render) and is latched by a ref so it fires exactly once.
// Without the latch, clearing the token would flip the inputs and re-trigger
// the effect, re-issuing router.replace on every pass.
export function useRequireRole(
  role: AuthRole,
  loginPath: string,
  options: { enabled?: boolean } = {},
): UseRequireRoleResult {
  const { enabled = true } = options;
  const router = useRouter();
  const auth = useAuth();
  const redirectedRef = useRef(false);

  const wrongRole = auth.session != null && auth.session.role !== role;
  const rejected = enabled && (auth.status === "unauthenticated" || wrongRole);
  const hadToken = auth.token != null;

  useEffect(() => {
    if (!rejected || redirectedRef.current) return;
    redirectedRef.current = true;
    // A rejected token must not linger in storage, or the next mount would
    // re-issue the same doomed validateSession query.
    if (hadToken) clearToken();
    router.replace(loginPath);
  }, [rejected, hadToken, router, loginPath]);

  return {
    ...auth,
    isPending: enabled && (auth.status !== "authenticated" || wrongRole),
  };
}
