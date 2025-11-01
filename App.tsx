

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat, FunctionDeclaration, Type, GenerateContentResponse } from "@google/genai";
import Header from './components/Header';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import { supabase } from './services/supabaseClient';

declare var mammoth: any;
declare var XLSX: any;

const MAX_DATA_LENGTH = 1_000_000; 

interface Message {
  role: 'user' | 'model' | 'system';
  content: string;
}

const App: React.FC = () => {
  const [dataContext, setDataContext] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dbConnectionStatus, setDbConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  const chatRef = useRef<Chat | null>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const isFirstMessageWithContext = useRef<boolean>(false);
  
  useEffect(() => {
    const fetchMessages = async () => {
        setDbConnectionStatus('connecting');
        const { data, error } = await supabase
            .from('chat_history')
            .select('role, content')
            .order('created_at', { ascending: true });

        if (error) {
            setDbConnectionStatus('error');
            setError('لا يمكن تحميل سجل المحادثات.');
            console.error('Error fetching messages:', JSON.stringify(error, null, 2));
            setMessages([{ 
                role: 'model', 
                content: 'أهلاً بك! أنا مساعدك القانوني الذكي. يمكنك طرح أسئلة قانونية عامة، أو رفع مستند لمناقشته، أو أن تطلب مني البحث في قاعدة البيانات القانونية.' 
            }]);
        } else {
            setDbConnectionStatus('connected');
            if (data && data.length > 0) {
                setMessages(data as Message[]);
            } else {
                const welcomeMessage = { 
                    role: 'model' as const, 
                    content: 'أهلاً بك! أنا مساعدك القانوني الذكي. يمكنك طرح أسئلة قانونية عامة، رفع مستند لمناقشته، أو أن تطلب مني البحث في قاعدة البيانات القانونية.' 
                };
                setMessages([welcomeMessage]);
                await supabase.from('chat_history').insert(welcomeMessage).select();
            }
        }
    };
    fetchMessages();
  }, []);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const processFile = useCallback((file: File) => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    const handleError = (message: string) => {
      setError(message);
      setFileName(null);
      setDataContext('');
    };

    if (fileExtension === 'doc') {
      handleError('ملفات .doc القديمة غير مدعومة. يرجى حفظ الملف بصيغة .docx والمحاولة مرة أخرى.');
      return;
    }

    const supportedExtensions = ['txt', 'csv', 'json', 'docx', 'xlsx', 'xls'];
    if (!supportedExtensions.includes(fileExtension || '')) {
      handleError(`نوع الملف غير مدعوم: .${fileExtension}`);
      return;
    }

    setIsLoading(true);
    setError(null);
    chatRef.current = null;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const fileContent = e.target?.result;
        if (!fileContent) throw new Error("File content could not be read.");
        let text = '';

        switch (fileExtension) {
          case 'txt': case 'csv': case 'json':
            text = fileContent as string;
            break;
          case 'docx':
            const docxResult = await mammoth.extractRawText({ arrayBuffer: fileContent });
            text = docxResult.value;
            break;
          case 'xlsx': case 'xls':
            const workbook = XLSX.read(fileContent, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            if (!sheetName) throw new Error("ملف Excel فارغ.");
            const worksheet = workbook.Sheets[sheetName];
            text = XLSX.utils.sheet_to_csv(worksheet);
            break;
        }

        if (text.length > MAX_DATA_LENGTH) {
            setError(`حجم الملف كبير جدًا. سيتم تحليل أول ${MAX_DATA_LENGTH.toLocaleString('ar-EG')} حرف فقط.`);
            text = text.substring(0, MAX_DATA_LENGTH);
        }

        setDataContext(text);
        setFileName(file.name);
        setMessages(prev => [...prev, { role: 'system', content: `تم رفع ملف "${file.name}". يمكنك الآن طرح الأسئلة حوله.` }]);
        isFirstMessageWithContext.current = true;

      } catch (err: any) {
        handleError(err.message || 'حدث خطأ أثناء معالجة الملف.');
      } finally {
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      handleError('حدث خطأ أثناء قراءة الملف.');
      setIsLoading(false);
    };

    if (['docx', 'xlsx', 'xls'].includes(fileExtension!)) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // Reset file input value to allow re-uploading the same file
    if (event.target) {
        event.target.value = '';
    }
  };

  const handleSendMessage = async () => {
    const userMessage = input.trim();
    if (!userMessage || isLoading) return;

    setError(null);
    setInput('');
    const userMessageObject: Message = { role: 'user', content: userMessage };
    setMessages(prev => [...prev, userMessageObject]);
    setIsLoading(true);

    const { error: userError } = await supabase.from('chat_history').insert(userMessageObject);
    if (userError) {
        console.error("Error saving user message:", JSON.stringify(userError, null, 2));
        setError("فشل في حفظ رسالتك.");
    }

    try {
      if (!chatRef.current) {
        const API_KEY = process.env.API_KEY;
        if (!API_KEY) throw new Error("لم يتم العثور على مفتاح API.");
        const ai = new GoogleGenAI({ apiKey: API_KEY });
        const systemInstruction = `مهمتك الوحيدة والمحددة هي العمل كمساعد قانوني. يجب عليك الإجابة على أسئلة المستخدم بالاعتماد **حصراً وفقط** على المعلومات التي يتم استرجاعها من قاعدة البيانات القانونية عبر أداة 'query_legal_database'. لا تستخدم أي معرفة خارجية أو معلومات عامة. **ممنوع تمامًا** الإجابة بدون استخدام أداة البحث أولاً. إذا لم تسفر نتيجة البحث عن معلومات كافية، يجب أن تكون إجابتك: "لم أجد معلومات كافية في قاعدة البيانات للإجابة على سؤالك." لا تحاول التخمين أو تقديم معلومات غير مؤكدة. **يجب أن تكون إجاباتك حاسمة ويقينية، وتجنب تمامًا استخدام عبارات غير مؤكدة مثل 'أعتقد'، 'غالباً'، أو 'أظن'.** بعد تقديم إجابتك، **يجب عليك** إدراج قائمة بالمصادر التي اعتمدت عليها من النتائج. يجب أن تستخدم عناوين المستندات فقط كمصادر. قم بتنسيق كل مصدر بشكل منفصل على النحو التالي: \`[source: عنوان المستند]\`. عندما يقوم المستخدم بتحميل ملف، استخدم محتواه كمصدر أساسي للمعلومات. يمكنك أيضًا استخدام أداة 'query_legal_database' للمقارنة أو للعثور على معلومات إضافية من قاعدة البيانات. عند الإجابة، وضح ما إذا كانت المعلومة من الملف المرفق أو من قاعدة البيانات.`;
        
        const queryDatabaseTool: FunctionDeclaration = {
            name: 'query_legal_database',
            description: 'للبحث في قاعدة البيانات القانونية عن المستندات أو المواد ذات الصلة بناءً على استعلام البحث.',
            parameters: {
              type: Type.OBJECT,
              properties: {
                query: {
                  type: Type.STRING,
                  description: 'مصطلح البحث أو السؤال للعثور على المعلومات القانونية ذات الصلة.',
                },
              },
              required: ['query'],
            },
        };
        
        chatRef.current = ai.chats.create({
          model: 'gemini-2.5-flash',
          systemInstruction: systemInstruction,
          tools: [{ functionDeclarations: [queryDatabaseTool] }],
        });
      }

      let prompt = userMessage;
      if (dataContext && isFirstMessageWithContext.current) {
        prompt = `هذا هو محتوى الملف الذي تم تحميله: "${fileName}". استخدمه كمصدر أساسي للمعلومات ولكن يمكنك أيضًا استخدام قاعدة البيانات للمقارنة أو البحث عن معلومات إضافية.\n\nمحتوى الملف:\n${dataContext}\n\nسؤالي هو: ${userMessage}`;
        isFirstMessageWithContext.current = false;
      }

      const responseStream = await chatRef.current.sendMessageStream({ message: prompt });

      let aggregatedResponse: GenerateContentResponse | null = null;
      let functionCallDetected = false;
      let fullTextResponse = '';

      setMessages(prev => [...prev, { role: 'model', content: '' }]);

      for await (const chunk of responseStream) {
        if (chunk.functionCalls && chunk.functionCalls.length > 0) {
          functionCallDetected = true;
          aggregatedResponse = chunk;
          break; 
        }
        fullTextResponse += chunk.text;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content = fullTextResponse;
          return newMessages;
        });
      }
      
      if (functionCallDetected && aggregatedResponse?.functionCalls) {
          setMessages(prev => prev.slice(0, -1)); // Remove empty model message
          const functionCall = aggregatedResponse.functionCalls[0];
          const searchQuery = functionCall.args.query as string;
          
          setMessages(prev => [...prev, { role: 'system', content: `جار البحث في قاعدة البيانات عن: "${searchQuery}"` }]);
          
          const { data, error: dbError } = await supabase
            .from('qanon')
            .select('titl, text')
            .or(`text.ilike.%${searchQuery}%,titl.ilike.%${searchQuery}%`)
            .limit(5);

          let toolResponsePayload;
          if (dbError || !data || data.length === 0) {
            console.error('Supabase query error:', JSON.stringify(dbError, null, 2));
            toolResponsePayload = {
              functionResponses: { id: functionCall.id, name: functionCall.name, response: { result: 'لم يتم العثور على نتائج مطابقة في قاعدة البيانات.' } }
            };
          } else {
            const context = data.map(doc => `العنوان: ${doc.titl}\nالنص: ${doc.text}`).join('\n\n---\n\n');
            toolResponsePayload = {
              functionResponses: { id: functionCall.id, name: functionCall.name, response: { result: context } }
            };
          }
          
          const finalResponseStream = await chatRef.current.sendMessageStream(toolResponsePayload);
          let finalFullResponse = '';
          setMessages(prev => [...prev, { role: 'model', content: '' }]);
          
          for await (const chunk of finalResponseStream) {
              finalFullResponse += chunk.text;
              setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1].content = finalFullResponse;
                  return newMessages;
              });
          }
          fullTextResponse = finalFullResponse; // For saving to DB later
      }

      if (fullTextResponse) {
          const { error: modelError } = await supabase.from('chat_history').insert({ role: 'model', content: fullTextResponse });
          if (modelError) {
              console.error("Error saving model response:", JSON.stringify(modelError, null, 2));
              setError("فشل في حفظ رد الذكاء الاصطناعي.");
          }
      }

    } catch (e: any) {
        const errorMessage = e.message || 'حدث خطأ غير متوقع.';
        setError(`حدث خطأ أثناء التواصل مع Gemini API: ${errorMessage}`);
        // Only remove the last message if it's the user's message, not a system message
        setMessages(prev => {
            if (prev.length > 0 && prev[prev.length -1].role === 'user') {
                 return prev.slice(0, -1)
            }
            return prev;
        });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFileClear = () => {
      setDataContext('');
      setFileName(null);
      setMessages(prev => [...prev, { role: 'system', content: `تم إلغاء الملف.` }]);
      isFirstMessageWithContext.current = false;
  }

  const handleNewChat = async () => {
    if(isLoading) return;
    
    const { error } = await supabase.from('chat_history').delete().gt('created_at', '1970-01-01T00:00:00Z');

    if (error) {
        setError('تعذر مسح سجل المحادثات.');
        console.error('Error clearing chat:', JSON.stringify(error, null, 2));
        return;
    }

    const welcomeMessage = { 
        role: 'model' as const, 
        content: 'أهلاً بك! أنا مساعدك القانوني الذكي. كيف يمكنني خدمتك اليوم؟ يمكنك طرح الأسئلة أو طلب البحث في قاعدة البيانات.' 
    };
    setMessages([welcomeMessage]);
    await supabase.from('chat_history').insert(welcomeMessage);
    
    setDataContext('');
    setFileName(null);
    chatRef.current = null;
    setError(null);
}

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300" dir="rtl">
      <Header onNewChat={handleNewChat} dbStatus={dbConnectionStatus} />
      <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto p-4 overflow-hidden">
        <div ref={chatWindowRef} className="flex-1 overflow-y-auto pr-2">
            {messages.map((msg, index) => (
              <ChatMessage key={index} message={msg} />
            ))}
            {isLoading && messages.length > 0 && messages[messages.length -1].role !== 'model' && (
                 <div className="flex items-start gap-4 my-4">
                    <div className="max-w-xl p-4 rounded-2xl bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-0"></span>
                            <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-150"></span>
                            <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-300"></span>
                        </div>
                    </div>
                 </div>
            )}
        </div>
      </div>
      <ChatInput 
        input={input} 
        setInput={setInput} 
        onSendMessage={handleSendMessage} 
        isLoading={isLoading}
        fileName={fileName}
        onFileChange={handleFileChange}
        onFileClear={handleFileClear}
        error={error}
      />
    </div>
  );
};

export default App;