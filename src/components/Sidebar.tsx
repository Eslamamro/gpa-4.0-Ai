
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, BookOpen, Target, Brain, Settings } from 'lucide-react';

const navigationItems = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'My Notes', href: '/notes', icon: BookOpen },
  { name: 'Flashcards', href: '/flashcards', icon: Target },
  { name: 'Quizzes', href: '/quiz', icon: Brain },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200">
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <Brain className="h-8 w-8 text-purple-600" />
          <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            StudyMate AI
          </span>
        </div>
      </div>
      
      <nav className="px-3 pb-6">
        <ul className="space-y-1">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={cn(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border-r-2 border-purple-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};
