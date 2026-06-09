import { useState } from 'react';
  import { Outlet } from 'react-router-dom';
  import Sidebar from './Sidebar.jsx';
  import Header from './Header.jsx';

  export default function Layout() {
      const [sidebarExpanded, setSidebarExpanded] = useState(false);

      return (
          <div className="flex h-screen overflow-hidden">
              <Sidebar
                  expanded={sidebarExpanded}
                  onToggle={() => setSidebarExpanded(prev => !prev)}
              />
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                  <Header />
                  <div className="flex-1 overflow-y-auto">
                      <Outlet />
                  </div>
              </div>
          </div>
      );
  }