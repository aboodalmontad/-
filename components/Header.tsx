import React from 'react';
import DBStatusIcon from './DBStatusIcon';

const LegalIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 16.5l4-4" />
    <path d="M20 12.5l-4 4" />
    <path d="M4 21.5V14l-2.5-2.5 2.5-2.5V2" />
    <path d="M18 21.5V14l2.5-2.5-2.5-2.5V2" />
    <path d="M12 22V2" />
    <path d="M4.5 12H18" />
  </svg>
);

interface HeaderProps {
    onNewChat: () => void;
    dbStatus: 'connecting' | 'connected' | 'error';
}

const Header: React.FC<HeaderProps> = ({ onNewChat, dbStatus }) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md flex-shrink-0">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LegalIcon className="w-8 h-8 text-blue-600 dark:text-blue-500" />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
            المساعد القانوني الذكي
          </h1>
        </div>
        <div className="flex items-center gap-4">
            <p className="hidden sm:block text-gray-500 dark:text-gray-400">
                مدعوم بواسطة Gemini AI
            </p>
            <DBStatusIcon status={dbStatus} />
            <button
              onClick={onNewChat}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              aria-label="بدء محادثة جديدة"
            >
                محادثة جديدة
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;