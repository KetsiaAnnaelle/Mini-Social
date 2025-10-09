import EspacePro from '@/composant/EspacePro';
import Navbar from '@/composant/Navbar';
import SidebarJob from '@/composant/SidebarJob';
// import Header from './Header';
// import Sidebar from './Sidebar';
// import SearchResults from './SearchResults';

function ChatOffers() {
 return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <SidebarJob />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50"> 
          <div className="bg-white rounded-lg shadow-md p-6 h-full">
          {/* <h1 className="text-2xl font-bold mb-4 text-primary">All Results (118)</h1>*/}
            <EspacePro />
          </div>
        </main>
      </div>
    </div>

  );
}

export default ChatOffers;