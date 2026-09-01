/**
 * Centralized Client-Side Logout Engine
 * Clears all user session, voting, and verified state from cookies, localStorage, and triggers app-wide sync
 */
export async function performClientLogout(): Promise<void> {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch {
    // ignore
  }

  if (typeof window !== "undefined") {
    // 1. Clear all client-accessible cookies
    document.cookie.split(";").forEach((cookie) => {
      const name = cookie.split("=")[0].trim();
      if (name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
      }
    });

    // 2. Clear known localStorage keys
    const keysToRemove = [
      "coroast_user",
      "coroast_voter_session",
      "coroast_has_voted",
      "coroast_joined_battle",
      "coroast_verified",
      "coroast_votes",
      "coroast_brand_partner",
      "coroast_merch_cart",
    ];
    for (const key of keysToRemove) {
      localStorage.removeItem(key);
    }

    // 3. Clear dynamic battle voting/joined keys
    Object.keys(localStorage).forEach((k) => {
      if (
        k.startsWith("coroast_vote_") ||
        k.startsWith("coroast_has_voted") ||
        k.startsWith("coroast_joined_")
      ) {
        localStorage.removeItem(k);
      }
    });

    // 4. Clear sessionStorage as well
    try {
      sessionStorage.clear();
    } catch {}

    // 5. Dispatch global sync events
    window.dispatchEvent(new CustomEvent("arena_logout"));
    window.dispatchEvent(new Event("storage"));
  }
}
