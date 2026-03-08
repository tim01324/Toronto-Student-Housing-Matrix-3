import { createBrowserRouter } from "react-router";
import { Landing } from "./pages/Landing";
import { Results } from "./pages/Results";
import { ListingDetail } from "./pages/ListingDetail";
import { Compare } from "./pages/Compare";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Landing,
  },
  {
    path: "/results",
    Component: Results,
  },
  {
    path: "/listing/:id",
    Component: ListingDetail,
  },
  {
    path: "/compare",
    Component: Compare,
  },
]);
