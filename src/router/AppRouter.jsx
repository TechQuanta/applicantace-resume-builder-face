// src/router/RouterWithSuspense.jsx
import React, { Suspense } from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import AppRoutes from "./index";
import Loading from "../components/Shared/Loading"; // This path is correct
import InvalidLink from "../pages/invalidlink";

const routes = createRoutesFromElements(
  <Route>
    {AppRoutes}
    <Route path="*" element={<InvalidLink />} />
  </Route>
);

const router = createBrowserRouter(routes);

const RouterWithSuspense = () => (
  <Suspense fallback={<Loading />}> {/* The Loading component will now center itself */}
    <RouterProvider router={router} />
  </Suspense>
);

export default RouterWithSuspense;