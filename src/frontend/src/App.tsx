import { Layout } from "@/components/Layout";
import OrdersPage from "@/pages/OrdersPage";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

function RootLayout() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

const rootRoute = createRootRoute({ component: RootLayout });

const ordersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: OrdersPage,
});

const routeTree = rootRoute.addChildren([ordersRoute]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
