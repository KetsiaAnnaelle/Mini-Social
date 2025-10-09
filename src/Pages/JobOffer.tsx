import Navbar from '@/composant/Navbar';
import SearchResult from '@/composant/SearchResult';
import SidebarJob from '@/composant/SidebarJob';

function JobbOffer() {
 return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <SidebarJob />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="bg-white rounded-lg shadow-md p-6 h-full">
          {/* <h1 className="text-2xl font-bold mb-4 text-primary">All Results (118)</h1>*/}
            <SearchResult />
          </div>
        </main>
      </div>
    </div>

  );
}

export default JobbOffer;