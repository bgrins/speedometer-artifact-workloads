import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Layout, Search, Menu, ChevronDown, ChevronUp, ThumbsUp, MessageCircle, Share2 } from 'lucide-react';

// URL parameters for tuning
const params = new URLSearchParams(window.location.search);
const ITEMS_PER_PAGE = Number(params.get('itemsPerPage')) || 12;
const INITIAL_CATEGORIES = Number(params.get('initialCategories')) || 15;
const COMMENTS_PER_VIDEO = Number(params.get('commentsPerVideo')) || 5;

// Seeded random number generator
class Random {
  constructor(seed = 1) {
    this.seed = seed;
  }
  next() {
    this.seed = (this.seed * 16807) % 2147483647;
    return this.seed / 2147483647;
  }
}

const rand = new Random(42);

// Generate deterministic content
const generateVideo = (id) => ({
  id,
  title: `Video ${id}: ${Array(3).fill().map(() => ['Amazing', 'Ultimate', 'Epic', 'Incredible', 'Best'][Math.floor(rand.next() * 5)]).join(' ')} Content`,
  views: Math.floor(rand.next() * 1000000),
  timestamp: `${Math.floor(rand.next() * 12)} months ago`,
  duration: `${Math.floor(rand.next() * 15)}:${Math.floor(rand.next() * 60).toString().padStart(2, '0')}`,
  creator: `Channel ${Math.floor(rand.next() * 100)}`,
  description: Array(5).fill().map(() => `Description paragraph ${Math.floor(rand.next() * 1000)}`).join('. '),
  likes: Math.floor(rand.next() * 50000),
  comments: Array(COMMENTS_PER_VIDEO).fill().map((_, i) => ({
    id: i,
    author: `User ${Math.floor(rand.next() * 1000)}`,
    text: `Comment ${Math.floor(rand.next() * 10000)}`,
    likes: Math.floor(rand.next() * 1000),
    timestamp: `${Math.floor(rand.next() * 60)} minutes ago`
  }))
});

const categories = Array(INITIAL_CATEGORIES).fill().map((_, i) => ({
  id: i,
  name: ['All', 'Gaming', 'Music', 'Sports', 'News', 'Comedy', 'Education', 'Science', 'Technology', 'Entertainment', 'Lifestyle', 'Travel', 'Food', 'Fashion', 'Art'][i % 15]
}));

const App = () => {
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [videos, setVideos] = useState([]);
  const [expandedVideo, setExpandedVideo] = useState(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState(new Set());
  const [showComments, setShowComments] = useState(new Set());
  
  useEffect(() => {
    setVideos(Array(ITEMS_PER_PAGE).fill().map((_, i) => generateVideo(i)));
  }, [selectedCategory]);

  const loadMore = useCallback(() => {
    const nextId = videos.length;
    setVideos(prev => [...prev, ...Array(ITEMS_PER_PAGE).fill().map((_, i) => generateVideo(nextId + i))]);
  }, [videos.length]);

  // Expose tests for the benchmark runner
  useEffect(() => {
    window.TESTS = [
      {
        name: 'LoadMoreContent',
        test: () => {
          loadMore();
        }
      },
      {
        name: 'SwitchCategories',
        test: () => {
          setSelectedCategory(prev => (prev + 1) % categories.length);
        }
      },
      {
        name: 'ToggleDescriptions',
        test: () => {
          const newExpanded = new Set(expandedDescriptions);
          videos.forEach(v => newExpanded.add(v.id));
          setExpandedDescriptions(newExpanded);
        }
      },
      {
        name: 'ToggleComments',
        test: () => {
          const newShown = new Set(showComments);
          videos.forEach(v => newShown.add(v.id));
          setShowComments(newShown);
        }
      }
    ];

    // Debug mode keyboard shortcuts
    const handleKeyPress = (e) => {
      if (e.shiftKey && e.keyCode >= 49 && e.keyCode <= 52) {
        window.TESTS[e.keyCode - 49].test();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [videos, loadMore]);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="flex items-center p-4">
          <Menu className="h-6 w-6 mr-4" />
          <div className="text-xl font-bold flex-1">VideoTube</div>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
              <Search className="h-5 w-5 text-gray-500" />
              <input className="bg-transparent ml-2 outline-none" placeholder="Search" />
            </div>
          </div>
        </div>
        <div className="flex gap-2 p-2 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-1 rounded-full whitespace-nowrap ${
                selectedCategory === cat.id ? 'bg-gray-900 text-white' : 'bg-gray-100'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {videos.map((video) => (
            <div key={video.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="relative pt-[56.25%] bg-gray-200">
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-sm px-1 rounded">
                  {video.duration}
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-semibold line-clamp-2">{video.title}</h3>
                <div className="text-sm text-gray-600 mt-1">
                  {video.creator}
                  <div>{video.views.toLocaleString()} views • {video.timestamp}</div>
                </div>
                
                <div className="mt-2">
                  <button
                    onClick={() => setExpandedDescriptions(prev => {
                      const next = new Set(prev);
                      prev.has(video.id) ? next.delete(video.id) : next.add(video.id);
                      return next;
                    })}
                    className="text-sm text-gray-600 flex items-center gap-1"
                  >
                    {expandedDescriptions.has(video.id) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    Description
                  </button>
                  
                  {expandedDescriptions.has(video.id) && (
                    <p className="mt-2 text-sm text-gray-600">{video.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-4 mt-3 pt-3 border-t">
                  <button className="flex items-center gap-1 text-sm">
                    <ThumbsUp size={16} />
                    {video.likes.toLocaleString()}
                  </button>
                  <button
                    onClick={() => setShowComments(prev => {
                      const next = new Set(prev);
                      prev.has(video.id) ? next.delete(video.id) : next.add(video.id);
                      return next;
                    })}
                    className="flex items-center gap-1 text-sm"
                  >
                    <MessageCircle size={16} />
                    {video.comments.length}
                  </button>
                  <button className="flex items-center gap-1 text-sm">
                    <Share2 size={16} />
                    Share
                  </button>
                </div>

                {showComments.has(video.id) && (
                  <div className="mt-3 pt-3 border-t">
                    {video.comments.map(comment => (
                      <div key={comment.id} className="mt-2 first:mt-0">
                        <div className="flex items-start gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-200" />
                          <div>
                            <div className="text-sm font-medium">
                              {comment.author} • {comment.timestamp}
                            </div>
                            <div className="text-sm mt-1">{comment.text}</div>
                            <div className="flex items-center gap-2 mt-2">
                              <button className="flex items-center gap-1 text-sm">
                                <ThumbsUp size={14} />
                                {comment.likes}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center mt-8">
          <button
            onClick={loadMore}
            className="bg-gray-900 text-white px-6 py-2 rounded-full"
          >
            Load More
          </button>
        </div>
      </main>
    </div>
  );
};

export default App;