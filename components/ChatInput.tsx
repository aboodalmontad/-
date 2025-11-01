

import React, { useRef, useLayoutEffect } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSendMessage: () => void;
  isLoading: boolean;
  fileName: string | null;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFileClear: () => void;
  error: string | null;
}

const SendIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
);

const CloseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);


const ChatInput: React.FC<ChatInputProps> = ({ input, setInput, onSendMessage, isLoading, fileName, onFileChange, onFileClear, error }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [input]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!isLoading && input.trim()) {
        onSendMessage();
      }
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
      <div className="max-w-4xl mx-auto">
        {error && <p className="text-red-500 text-center text-sm mb-2">{error}</p>}
        {fileName && (
          <div className="mb-2 flex justify-center">
            <div className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-sm font-medium px-3 py-1 rounded-full flex items-center gap-2">
              <span>ملف حالي: {fileName}</span>
              <button onClick={onFileClear} disabled={isLoading} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 disabled:opacity-50" aria-label="إلغاء الملف">
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
        <div className="relative flex items-end gap-2">
            <input
                type="file"
                ref={fileInputRef}
                onChange={onFileChange}
                accept=".txt,.csv,.json,.docx,.xlsx,.xls"
                className="hidden"
                disabled={isLoading}
            />
            <button
                type="button"
                // FIX: Corrected typo from `fileInput-Ref` to `fileInputRef`.
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-50 transition-colors"
                aria-label="رفع ملف"
            >
                <UploadIcon className="w-6 h-6" />
            </button>
            <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="اكتب رسالتك هنا..."
                disabled={isLoading}
                rows={1}
                className="w-full p-3 pr-12 pl-12 border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-full shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300 resize-none overflow-y-auto"
                style={{ maxHeight: '150px' }}
            />
            <button
                onClick={onSendMessage}
                disabled={isLoading || !input.trim()}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                aria-label="إرسال"
            >
                <SendIcon className="w-5 h-5 transform rotate-90" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;