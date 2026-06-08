import React from 'react';
import { Outlet } from 'react-router-dom';
import { 
  ChevronDown, 
  Moon
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export function DashboardLayout() {
  const location = useLocation();

  const navLink = (path: string, label: string) => {
    const isActive = location.pathname === path;
    return (
      <Link 
        to={path} 
        className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
          isActive 
            ? 'border-feather-green text-feather-green' 
            : 'border-transparent text-gray-500 hover:text-gray-700'
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="font-sans antialiased min-h-screen bg-snow text-eel flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/dashboard" className="flex-shrink-0 flex items-center gap-2">
                <div className="w-8 h-8 bg-feather-green text-white flex items-center justify-center rounded text-xl">
                   <Moon className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <span className="text-xl font-bold text-gray-900 leading-tight block">Sadaqa Box</span>
                  <span className="text-xs text-gray-500 block">Small change. Lasting impact.</span>
                </div>
              </Link>
            </div>
            
            {/* Navigation Links */}
            <nav className="hidden md:flex space-x-8 h-full">
              {navLink('/dashboard', 'Dashboard')}
              {navLink('/roundups', 'Round-Ups')}
              {navLink('/goals', 'Goals')}
              {navLink('/donations', 'Donations')}
              {navLink('/impact', 'Impact')}
              {navLink('/profile', 'Profile')}
            </nav>
            
            {/* Right Actions */}
            <div className="flex items-center gap-4">
              {/* Profile Dropdown */}
              <div className="flex items-center gap-3 pl-4 cursor-pointer">
                <div className="h-8 w-8 rounded-full bg-feather-green text-white flex items-center justify-center font-semibold text-sm">
                  AA
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-700 leading-none">As-Salaam</p>
                  <p className="text-xs text-gray-500 mt-1">Welcome back!</p>
                </div>
                <ChevronDown className="w-3 h-3 text-gray-400 ml-1" />
              </div>
            </div>
          </div>
        </div>
      </header>
      <div className="flex-1">
         <Outlet />
      </div>
    </div>
  );
}
