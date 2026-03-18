import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { HomePage } from "./pages/HomePage";
import { ProfilePage } from "./pages/ProfilePage";
import { VegaKoanBrowserPage } from "./pages/VegaKoanBrowserPage";
import { VegaKoanPage } from "./pages/VegaKoanPage";
import { VegaLandingPage } from "./pages/VegaLandingPage";
import "./styles.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "vega",
        element: <VegaLandingPage />,
      },
      {
        path: "vega/koans",
        element: <VegaKoanBrowserPage />,
      },
      {
        path: "vega/koans/:koanId",
        element: <VegaKoanPage />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
