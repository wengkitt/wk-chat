import { createBrowserRouter } from "react-router";
import Chat from "./pages/chat";
import ChatLayout from "./layouts/chat-layout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: ChatLayout,
    children: [{ index: true, Component: Chat }],
  },
]);
