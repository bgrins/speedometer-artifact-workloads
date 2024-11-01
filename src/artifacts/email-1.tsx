import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2, Star, Archive, Mail, Inbox, Trash, Send, AlertCircle, ChevronRight, 
         ChevronDown, MoreVertical, Edit2, X } from 'lucide-react';
import _ from 'lodash';

// Mock data generation
const generateMockEmails = (count) => {
  return _.range(count).map(i => ({
    id: `email-${i}`,
    subject: `Test Email ${i}`,
    sender: `user${i}@example.com`,
    preview: `This is a preview of email ${i}...`,
    isRead: Math.random() > 0.3,
    isStarred: Math.random() > 0.8,
    hasAttachments: Math.random() > 0.7,
    timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    thread: Math.floor(i / 3), // Group every 3 emails into a thread
    content: `
      <div class="email-content">
        <h2>Email Content ${i}</h2>
        <p>This is a complex HTML email with formatting.</p>
        <img src="/api/placeholder/300/200" alt="Placeholder ${i}" />
        <ul>${_.range(5).map(j => `<li>List item ${j}</li>`).join('')}</ul>
      </div>
    `
  }));
};

// Debug Menu Component
const DebugMenu = ({ onRunScenario }) => {
  const scenarios = {
    'scroll': 'Rapid Scroll Test',
    'thread': 'Thread Expansion Test',
    'compose': 'Multiple Compose Windows',
    'select': 'Multi-select Operations',
    'drag': 'Drag and Drop Test',
    'search': 'Search and Filter Test',
    'layout': 'Layout Switch Test',
    'actions': 'Rapid Actions Test'
  };

  return (
    <div className="fixed bottom-0 right-0 bg-white border rounded-tl-lg shadow-lg p-4 z-50">
      <h3 className="font-bold mb-2">Debug Menu</h3>
      <div className="space-y-2">
        {Object.entries(scenarios).map(([key, name]) => (
          <button
            key={key}
            onClick={() => onRunScenario(key)}
            className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
};

// Main Email App Component
const EmailApp = () => {
  const [emails, setEmails] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState(new Set());
  const [activeFolder, setActiveFolder] = useState('inbox');
  const [layout, setLayout] = useState('vertical');
  const [composeWindows, setComposeWindows] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const listRef = useRef(null);
  const dragRef = useRef(null);

  useEffect(() => {
    // Initial load of mock data
    setEmails(generateMockEmails(1000));
    setLoading(false);
  }, []);

  // Virtualized list implementation
  const VirtualizedEmailList = () => {
    const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });
    const itemHeight = 72; // pixels per email row

    const onScroll = useCallback(_.throttle((e) => {
      const scrollTop = e.target.scrollTop;
      const viewportHeight = e.target.clientHeight;
      const start = Math.floor(scrollTop / itemHeight);
      const end = Math.min(start + Math.ceil(viewportHeight / itemHeight) + 5, emails.length);
      setVisibleRange({ start, end });
    }, 100), [emails.length]);

    return (
      <div 
        className="h-full overflow-y-auto"
        onScroll={onScroll}
        ref={listRef}
      >
        <div style={{ height: `${emails.length * itemHeight}px`, position: 'relative' }}>
          {emails.slice(visibleRange.start, visibleRange.end).map((email, idx) => (
            <EmailRow 
              key={email.id}
              email={email}
              style={{
                position: 'absolute',
                top: `${(idx + visibleRange.start) * itemHeight}px`,
                width: '100%'
              }}
              selected={selectedEmails.has(email.id)}
              onSelect={(id) => {
                const newSelected = new Set(selectedEmails);
                if (newSelected.has(id)) {
                  newSelected.delete(id);
                } else {
                  newSelected.add(id);
                }
                setSelectedEmails(newSelected);
              }}
            />
          ))}
        </div>
      </div>
    );
  };

  // Email Row Component
  const EmailRow = ({ email, style, selected, onSelect }) => {
    const [isHovered, setIsHovered] = useState(false);
    
    return (
      <div
        className={`flex items-center p-3 border-b ${
          selected ? 'bg-blue-50' : isHovered ? 'bg-gray-50' : 'bg-white'
        }`}
        style={style}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        draggable
        onDragStart={(e) => {
          dragRef.current = email.id;
          e.dataTransfer.setData('text/plain', email.id);
        }}
      >
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(email.id)}
          className="mr-3"
        />
        <Star
          className={`w-5 h-5 mr-3 cursor-pointer ${
            email.isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
          }`}
        />
        <div className="flex-grow min-w-0">
          <div className="flex items-center">
            <span className={`font-medium ${email.isRead ? 'text-gray-600' : 'text-black'}`}>
              {email.sender}
            </span>
            <span className="ml-auto text-sm text-gray-500">
              {email.timestamp.toLocaleTimeString()}
            </span>
          </div>
          <div className="text-sm text-gray-600 truncate">{email.subject}</div>
          <div className="text-sm text-gray-500 truncate">{email.preview}</div>
        </div>
      </div>
    );
  };

  // Compose Window Component
  const ComposeWindow = ({ id, onClose }) => {
    const [content, setContent] = useState('');
    const [recipients, setRecipients] = useState('');

    return (
      <div className="fixed bottom-0 right-0 w-96 bg-white shadow-lg rounded-t-lg overflow-hidden border"
           style={{ transform: `translateX(-${id * 420}px)` }}>
        <div className="flex items-center justify-between p-3 bg-gray-100 border-b">
          <span className="font-medium">New Message</span>
          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-3">
          <input
            type="text"
            placeholder="Recipients"
            value={recipients}
            onChange={(e) => setRecipients(e.target.value)}
            className="w-full mb-2 p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Subject"
            className="w-full mb-2 p-2 border rounded"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Compose email..."
            className="w-full h-64 p-2 border rounded resize-none"
          />
        </div>
      </div>
    );
  };

  // Benchmark scenario handlers
  const runScenario = async (scenario) => {
    switch (scenario) {
      case 'scroll':
        if (listRef.current) {
          const maxScroll = listRef.current.scrollHeight - listRef.current.clientHeight;
          const steps = 50;
          for (let i = 0; i <= steps; i++) {
            listRef.current.scrollTop = (maxScroll * i) / steps;
            await new Promise(r => setTimeout(r, 100));
          }
        }
        break;
        
      case 'thread':
        // Simulate expanding/collapsing threads
        const threads = _.groupBy(emails, 'thread');
        for (const threadId in threads) {
          if (threads[threadId].length > 1) {
            // Toggle thread expansion
            await new Promise(r => setTimeout(r, 300));
          }
        }
        break;

      case 'compose':
        // Open multiple compose windows
        setComposeWindows(prev => [...prev, Date.now()]);
        await new Promise(r => setTimeout(r, 500));
        setComposeWindows(prev => [...prev, Date.now() + 1]);
        await new Promise(r => setTimeout(r, 500));
        setComposeWindows(prev => [...prev, Date.now() + 2]);
        break;

      case 'select':
        // Perform multi-select operations
        const selections = [];
        for (let i = 0; i < 10; i++) {
          selections.push(emails[i].id);
          setSelectedEmails(new Set(selections));
          await new Promise(r => setTimeout(r, 200));
        }
        break;

      case 'layout':
        // Toggle between layouts
        setLayout('horizontal');
        await new Promise(r => setTimeout(r, 1000));
        setLayout('vertical');
        break;

      default:
        console.log('Unknown scenario:', scenario);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">Email Benchmark</h1>
          <input
            type="text"
            placeholder="Search emails..."
            className="px-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setLayout(l => l === 'vertical' ? 'horizontal' : 'vertical')}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <Mail className="w-5 h-5" />
          </button>
          <button
            onClick={() => setComposeWindows(prev => [...prev, Date.now()])}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Compose
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <nav className="w-48 p-4 border-r">
          {['inbox', 'starred', 'sent', 'trash'].map(folder => (
            <button
              key={folder}
              onClick={() => setActiveFolder(folder)}
              className={`w-full text-left px-3 py-2 rounded ${
                activeFolder === folder ? 'bg-blue-100' : 'hover:bg-gray-100'
              }`}
            >
              {folder.charAt(0).toUpperCase() + folder.slice(1)}
            </button>
          ))}
        </nav>

        {/* Email List */}
        <main className={`flex-1 ${layout === 'vertical' ? 'flex' : 'block'}`}>
          <div className={layout === 'vertical' ? 'w-1/2 border-r' : 'w-full'}>
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : (
              <VirtualizedEmailList />
            )}
          </div>
          
          {/* Reading Pane */}
          {layout === 'vertical' && (
            <div className="w-1/2 p-4">
              {selectedEmails.size === 1 ? (
                <div className="h-full overflow-y-auto">
                  {/* Email content would go here */}
                  <div className="prose max-w-none" 
                       dangerouslySetInnerHTML={{ 
                         __html: emails.find(e => e.id === Array.from(selectedEmails)[0])?.content 
                       }} 
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Select an email to read
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Compose Windows */}
      {composeWindows.map((id, index) => (
        <ComposeWindow
          key={id}
          id={index}
          onClose={() => setComposeWindows(prev => prev.filter(w => w !== id))}
        />
      ))}

      {/* Debug Menu */}
      <DebugMenu onRunScenario={runScenario} />
    </div>
  );
};

export default EmailApp;