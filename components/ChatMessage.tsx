
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SparklesIcon } from './icons/SparklesIcon';
import { UserIcon } from './icons/UserIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';

interface ChatMessageProps {
  message: {
    role: 'user' | 'model' | 'system';
    content: string;
  };
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { role, content } = message;
  const isModel = role === 'model';
  const isUser = role === 'user';
  const isSystem = role === 'system';

  if (isSystem) {
    return (
      <div className="my-2 text-center text-xs text-gray-500 dark:text-gray-400">
        <p className="bg-gray-200 dark:bg-gray-700/50 px-3 py-1 rounded-full inline-block">{content}</p>
      </div>
    );
  }

  const typingIndicator = isModel && content === '';

  // Extract sources from the content
  const sourceRegex = /\[source:\s*(.*?)\]/g;
  const sources = [...content.matchAll(sourceRegex)].map(match => match[1]);
  const cleanContent = content.replace(sourceRegex, '').trim();

  return (
    <div className={`flex items-start gap-3 my-4 ${isUser ? 'justify-end' : ''}`}>
      {isModel && (
        <div className="w-8 h-8 flex-shrink-0 rounded-full bg-blue-500 flex items-center justify-center text-white">
          <SparklesIcon className="w-5 h-5" />
        </div>
      )}
      <div className={`max-w-xl p-3.5 rounded-2xl shadow-sm ${isUser ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'}`}>
        {typingIndicator ? (
           <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-0"></span>
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-150"></span>
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-300"></span>
            </div>
        ) : (
          <>
            <div className="prose prose-lg max-w-none text-inherit dark:prose-invert prose-p:my-0 prose-headings:my-2" style={{ color: 'inherit' }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{cleanContent}</ReactMarkdown>
            </div>
            {isModel && sources.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                <h4 className="font-bold text-sm mb-2 text-gray-600 dark:text-gray-300">المصادر:</h4>
                <ul className="list-none pl-0">
                  {sources.map((source, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 mb-1">
                      <DocumentTextIcon className="w-4 h-4 flex-shrink-0" />
                      <span>{source}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
      {isUser && (
        <div className="w-8 h-8 flex-shrink-0 rounded-full bg-gray-500 dark:bg-gray-600 flex items-center justify-center text-white">
          <UserIcon className="w-5 h-5" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
