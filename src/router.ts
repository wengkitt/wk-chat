import { createBrowserRouter } from "react-router-dom"; // Use react-router-dom
import ChatPage from "./pages/chat"; // Renamed for clarity if needed, or use Chat
import ApiKeysPage from "./pages/api-keys"; // Renamed for clarity
import ChatLayout from "./layouts/chat-layout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <ChatLayout />, // Use element prop for components
    children: [
      {
        index: true, // Default route for "/", renders ChatPage via ChatLayout's Outlet
        element: <ChatPage />,
      },
      {
        path: "chat/:chatId?", // Optional chatId parameter
        element: <ChatPage />, // Renders ChatPage via ChatLayout's Outlet
      },
      // Example: Keep API keys page if it exists and is used
      // {
      //   path: "api-keys",
      //   element: <ApiKeysPage />, // This would render within ChatLayout if nested
      //                            // or define it as a top-level route if it has its own layout
      // },
    ],
  },
  // If ApiKeysPage should have its own layout or no layout:
  {
    path: "/api-keys",
    element: <ApiKeysPage />,
  }
]);
