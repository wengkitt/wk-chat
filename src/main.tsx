import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";
import { RouterProvider } from "react-router";
import { router } from "./router";
import { ConvexReactClient, ConvexProvider } from "convex/react";

// Initialize Convex client
const convexUrl = import.meta.env.VITE_CONVEX_URL;
if (!convexUrl) {
  throw new Error(
    "VITE_CONVEX_URL is not set. Add it to .env.local or run `npx convex dev --once` to create it."
  );
}
const convex = new ConvexReactClient(convexUrl);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConvexProvider client={convex}>
      <RouterProvider router={router} />
    </ConvexProvider>
  </StrictMode>
);
