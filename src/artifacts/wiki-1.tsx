import React, { useState, useEffect } from 'react';
import { Menu, Moon, Sun, Globe, ChevronDown, ChevronRight } from 'lucide-react';

// URL parameters for tuning
const params = new URLSearchParams(window.location.search);
const NUM_REFERENCES = parseInt(params.get('numRefs')) || 50;
const NUM_SECTIONS = parseInt(params.get('numSections')) || 8;
const NUM_PARAGRAPHS = parseInt(params.get('numParagraphs')) || 4;

// Seeded random for consistent content
class Random {
  constructor(seed = 1) {
    this.seed = seed;
  }
  next() {
    this.seed = (this.seed * 16807) % 2147483647;
    return this.seed / 2147483647;
  }
}
const rng = new Random(12345);

const generateParagraph = () => {
  const words = ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'I', 
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at'];
  let text = '';
  const len = Math.floor(rng.next() * 60) + 40;
  for (let i = 0; i < len; i++) {
    text += words[Math.floor(rng.next() * words.length)] + ' ';
  }
  return text.trim();
};

const generateSection = (index) => ({
  id: `section-${index}`,
  title: `Section ${index + 1}`,
  content: Array(NUM_PARAGRAPHS).fill(0).map(() => generateParagraph())
});

const generateReference = (index) => ({
  id: index,
  authors: `Author ${index}`,
  title: generateParagraph().slice(0, 50),
  year: 1950 + Math.floor(rng.next() * 73),
  journal: `Journal of ${['Science', 'Nature', 'Research', 'Studies'][Math.floor(rng.next() * 4)]}`
});

const WikiPage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('en');
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [showReferences, setShowReferences] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const sections = Array(NUM_SECTIONS).fill(0).map((_, i) => generateSection(i));
  const references = Array(NUM_REFERENCES).fill(0).map((_, i) => generateReference(i));

  const toggleSection = (id) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpandedSections(newExpanded);
  };

  // Expose test functions
  useEffect(() => {
    window.TESTS = [
      {
        name: 'ExpandAllSections',
        test: () => {
          sections.forEach(s => {
            if (!expandedSections.has(s.id)) {
              document.querySelector(`#${s.id}-toggle`).click();
            }
          });
        }
      },
      {
        name: 'CollapseAllSections',
        test: () => {
          sections.forEach(s => {
            if (expandedSections.has(s.id)) {
              document.querySelector(`#${s.id}-toggle`).click();
            }
          });
        }
      },
      {
        name: 'ToggleReferences',
        test: () => {
          document.querySelector('#references-toggle').click();
        }
      },
      {
        name: 'SwitchLanguageAndTheme',
        test: () => {
          document.querySelector('#language-toggle').click();
          document.querySelector('#theme-toggle').click();
        }
      }
    ];

    const handleKeyDown = (e) => {
      if (e.shiftKey && e.keyCode >= 49 && e.keyCode <= 52) {
        window.TESTS[e.keyCode - 49].test();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [expandedSections]);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
      <header className="sticky top-0 z-50 border-b shadow-sm bg-opacity-90 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 hover:bg-gray-100 rounded-lg">
              <Menu size={24} />
            </button>
            <h1 className="text-2xl font-serif">Encyclopedia</h1>
          </div>
          <div className="flex items-center gap-2">
            <button id="language-toggle" 
              onClick={() => setLanguage(l => l === 'en' ? 'es' : 'en')}
              className="p-2 hover:bg-gray-100 rounded-lg">
              <Globe size={24} />
            </button>
            <button id="theme-toggle"
              onClick={() => setDarkMode(d => !d)}
              className="p-2 hover:bg-gray-100 rounded-lg">
              {darkMode ? <Sun size={24} /> : <Moon size={24} />}
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <aside className={`fixed inset-y-0 left-0 w-64 transform ${menuOpen ? 'translate-x-0' : '-translate-x-full'} 
          transition-transform duration-200 ease-in-out z-40 
          ${darkMode ? 'bg-gray-800' : 'bg-white'} border-r p-4`}>
          <nav className="space-y-2">
            {sections.map((section, i) => (
              <a key={i} href={`#${section.id}`} 
                onClick={() => setMenuOpen(false)}
                className="block p-2 hover:bg-gray-100 rounded">
                {section.title}
              </a>
            ))}
          </nav>
        </aside>

        <main className="max-w-3xl mx-auto">
          <article className="prose lg:prose-xl dark:prose-invert">
            <h1 className="text-4xl font-serif mb-8">Article Title</h1>
            
            {sections.map((section, i) => (
              <section key={i} id={section.id} className="mb-8">
                <div className="flex items-center gap-2">
                  <button id={`${section.id}-toggle`}
                    onClick={() => toggleSection(section.id)}
                    className="p-1 hover:bg-gray-100 rounded">
                    {expandedSections.has(section.id) ? 
                      <ChevronDown size={20} /> : 
                      <ChevronRight size={20} />}
                  </button>
                  <h2 className="text-2xl font-serif">{section.title}</h2>
                </div>
                
                {expandedSections.has(section.id) && (
                  <div className="mt-4 space-y-4">
                    {section.content.map((p, j) => (
                      <p key={j} className="leading-relaxed">{p}</p>
                    ))}
                  </div>
                )}
              </section>
            ))}

            <section id="references" className="mt-12">
              <button id="references-toggle"
                onClick={() => setShowReferences(s => !s)}
                className="flex items-center gap-2 w-full p-2 hover:bg-gray-100 rounded">
                <h2 className="text-2xl font-serif">References</h2>
                {showReferences ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
              </button>
              
              {showReferences && (
                <ol className="mt-4 space-y-4 list-decimal list-inside">
                  {references.map((ref, i) => (
                    <li key={i} className="text-sm">
                      {ref.authors} ({ref.year}). "{ref.title}." 
                      <em>{ref.journal}</em>.
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </article>
        </main>
      </div>
    </div>
  );
};

export default WikiPage;