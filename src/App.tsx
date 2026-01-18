import { Route, Routes } from 'react-router';
import { Shell } from './components/Shell';
import { UserProvider } from './contexts/UserContext';
import { DynamicPage } from './pages/DynamicPage';

const App = () => (
  <UserProvider>
    <Routes>
      <Route element={<Shell />}>
        {/* Home route */}
        <Route path="/" element={<DynamicPage />} />

        {/* Dynamic route for all other pages and catch-all for 404s */}
        <Route path="/:slug" element={<DynamicPage />} />
        <Route path="*" element={<DynamicPage />} />
      </Route>
    </Routes>
  </UserProvider>
);

export default App;