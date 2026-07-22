import { useState } from 'react';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import NewsList from '@/pages/NewsList';
import Analytics from '@/pages/Analytics';
import Settings from '@/pages/Settings';

function App() {
  const [currentPage, setCurrentPage] = useState('/');

  const renderPage = () => {
    switch (currentPage) {
      case '/':
        return <Dashboard />;
      case '/news':
        return <NewsList />;
      case '/analytics':
        return <Analytics />;
      case '/settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

export default App;