import { RouterProvider } from 'react-router';
import { router } from './routes';
import { useTTCStops } from './hooks/useTTCStops';

/**
 * Initialises TTC GTFS live data on app startup.
 * The hook populates transitData.ts with real stops from the City of Toronto
 * Open Data API (cached in localStorage for 7 days).
 */
function TTCDataLoader() {
  useTTCStops(); // side-effect only → loads and caches TTC stops
  return null;
}

export default function App() {
  return (
    <>
      <TTCDataLoader />
      <RouterProvider router={router} />
    </>
  );
}
