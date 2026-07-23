import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { getDataFromCookie } from "./Actions/cookies-session";

// Reads the JWT from the current request's session cookie on every call
// instead of a module-level variable - this module is instantiated once
// per Next.js server process and shared across concurrent requests, so a
// process-global token would leak one user's Bearer token onto another
// user's concurrent Server Action call.
export async function buildAuthHeaders(existingHeaders: Record<string, string> = {}) {
  const session = await getDataFromCookie();
  return {
    ...existingHeaders,
    Authorization: `Bearer ${session?.jwt || ""}`,
  };
}

// No timeout existed before - fetch() has none by default, so a hung
// backend request (Doc 8) would hang whatever Server Action/page render
// called it indefinitely instead of failing fast with a clear error.
const GRAPHQL_REQUEST_TIMEOUT_MS = 10_000;

const createApolloClient = () => {
  const httpLink = new HttpLink({
    // Every caller of getClient() is a "use server" Server Action - this never
    // runs in the browser. NEXT_PUBLIC_GRAPHQL_URL is "localhost:8080" for
    // local dev (correct there - backend runs on the same host), but inside
    // Docker "localhost" from the frontend container's own network namespace
    // never reaches the backend container. GRAPHQL_URL lets docker-compose
    // override with the internal service name (http://backend:8080/graphql)
    // without touching the local-dev default.
    uri: process.env.GRAPHQL_URL || process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:8080/graphql",
    // A custom fetch, not a static fetchOptions.signal - AbortSignal.timeout()
    // starts counting the moment it's created, so a signal built once here
    // (HttpLink construction, i.e. once per Apollo Client instance) would
    // fire after 10s and then stay aborted for every request after that,
    // not just the one that took too long. Building it fresh inside the
    // fetch call gives every individual request its own 10s budget.
    fetch: (uri, options) =>
      fetch(uri, { ...options, signal: AbortSignal.timeout(GRAPHQL_REQUEST_TIMEOUT_MS) }),
  });

  const authLink = setContext(async (_, { headers }) => ({
    headers: await buildAuthHeaders(headers),
  }));

  return new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
  });
};

export const getClient = createApolloClient;
