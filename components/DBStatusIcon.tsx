import React from 'react';

// Base Database Icon
const DatabaseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
  </svg>
);

interface DBStatusIconProps {
  status: 'connecting' | 'connected' | 'error';
}

const DBStatusIcon: React.FC<DBStatusIconProps> = ({ status }) => {
  switch (status) {
    case 'connecting':
      return (
        <div title="جاري الاتصال بقاعدة البيانات..." className="flex items-center gap-2">
          <DatabaseIcon className="w-5 h-5 text-yellow-500 animate-pulse" />
          <span className="hidden sm:inline text-sm text-yellow-500">جاري الاتصال...</span>
        </div>
      );
    case 'connected':
      return (
        <div title="متصل بقاعدة البيانات" className="flex items-center gap-2">
          <DatabaseIcon className="w-5 h-5 text-green-500" />
           <span className="hidden sm:inline text-sm text-green-500">متصل</span>
        </div>
      );
    case 'error':
      return (
        <div title="فشل الاتصال بقاعدة البيانات" className="flex items-center gap-2">
          <DatabaseIcon className="w-5 h-5 text-red-500" />
           <span className="hidden sm:inline text-sm text-red-500">خطأ بالاتصال</span>
        </div>
      );
    default:
      return null;
  }
};

export default DBStatusIcon;
