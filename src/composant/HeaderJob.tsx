import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ModeToggle } from '@/components/mode-toggle';
//import { useAuthStore } from '../../store/useAuthStore';
import { FaUserGraduate } from "react-icons/fa";
import { useAuthStore } from '@/store/useAuthStore';
import { useState } from 'react';


function HeaderJob() {
  const { user } = useAuthStore();
  
  
  const [open, setOpen] = useState(false);

  const navItems = [
    { label: 'Offre de Stage', href: '/offers' },
    { label: 'API Marketplace', href: '/api-marketplace' },
    { label: 'Organisations', href: '/orgs' },
    { label: 'Studio', href: '/studio' },
    { label: 'Applications', href: '/apps' },
  ];

  return (
    <header className="bg-gradient-to-r from-white via-blue-50 to-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-3">
          <img src="../../public/img/Image1.png" alt="Logo" className="h-9" />
          <span className="text-2xl font-semibold tracking-tight text-blue-800">Mini Social Media</span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8">
          {navItems.map(({ label, href }) => (
            <Link
              key={label}
              to={href}
              className="text-gray-700 hover:text-blue-600 text-sm font-medium transition duration-200"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* User + Mobile Toggle */}
        <div className="flex items-center gap-4">
          <div className="text-blue-500 border-b-fuchsia-700">

            <ModeToggle/>
          </div>

          {/* Avatar */}
          <div className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-800 font-bold text-lg hover:ring-2 hover:ring-blue-500 transition-all">
            {user ? user.name[0].toUpperCase() : <FaUserGraduate />}

          </div> 
          <p className='text-purple-700'>{user?.name}</p>
          <p className="text-sm text-gray-600">{user?.role}</p>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-800"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white shadow-md px-6 pb-4 space-y-3">
          {navItems.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="block text-gray-700 hover:text-blue-600 font-medium text-base transition"
            >
              {label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}

export default HeaderJob;
