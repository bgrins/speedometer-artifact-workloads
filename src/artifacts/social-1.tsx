import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, MessageSquare, Share2, Award, BookmarkPlus, MoreHorizontal } from 'lucide-react';

// URL Parameters for tuning
const params = new URLSearchParams(window.location.search);
const NUM_POSTS = parseInt(params.get('numPosts')) || 25;
const COMMENTS_PER_POST = parseInt(params.get('commentsPerPost')) || 50;
const MAX_COMMENT_DEPTH = parseInt(params.get('maxCommentDepth')) || 8;

// Seeded random number generator
class Random {
  constructor(seed = 1234) {
    this.seed = seed;
  }
  next() {
    this.seed = (this.seed * 16807) % 2147483647;
    return this.seed / 2147483647;
  }
}

const rand = new Random();

// Generate mock data
const generateComment = (depth = 0) => {
  const length = Math.floor(rand.next() * 200) + 50;
  const words = [];
  for (let i = 0; i < length; i++) {
    words.push('lorem' + Math.floor(rand.next() * 100));
  }
  
  const children = depth < MAX_COMMENT_DEPTH && rand.next() > 0.5 
    ? Array.from({length: Math.floor(rand.next() * 3) + 1}, () => generateComment(depth + 1))
    : [];

  return {
    id: Math.floor(rand.next() * 1000000),
    author: `user${Math.floor(rand.next() * 1000)}`,
    content: words.join(' '),
    score: Math.floor(rand.next() * 1000),
    time: Math.floor(rand.next() * 12) + 1,
    children,
    collapsed: false
  };
};

const generatePost = (index) => ({
  id: index,
  title: `Post ${index}: ${Array.from({length: 10}, () => 'lorem' + Math.floor(rand.next() * 100)).join(' ')}`,
  author: `user${Math.floor(rand.next() * 1000)}`,
  score: Math.floor(rand.next() * 50000),
  commentCount: COMMENTS_PER_POST,
  time: Math.floor(rand.next() * 24),
  comments: Array.from({length: COMMENTS_PER_POST}, () => generateComment())
});

const posts = Array.from({length: NUM_POSTS}, (_, i) => generatePost(i));

const Comment = ({ comment, depth = 0, onToggle }) => {
  const bgColor = depth % 2 === 0 ? 'bg-gray-50' : 'bg-white';
  
  return (
    <div className={`pl-4 ${bgColor} border-l border-gray-200`}>
      <div className="p-2">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <button className="flex items-center gap-1">
            <ChevronUp size={16} />
          </button>
          <span>{comment.score}</span>
          <button className="flex items-center gap-1">
            <ChevronDown size={16} />
          </button>
          <span className="font-medium text-gray-700">{comment.author}</span>
          <span>{comment.time}h ago</span>
          <button onClick={() => onToggle(comment.id)}>
            {comment.collapsed ? '[+]' : '[-]'}
          </button>
        </div>
        {!comment.collapsed && (
          <>
            <div className="py-2 text-sm">{comment.content}</div>
            <div className="flex gap-4 text-xs text-gray-500">
              <button className="flex items-center gap-1">
                <MessageSquare size={12} />
                Reply
              </button>
              <button className="flex items-center gap-1">
                <Share2 size={12} />
                Share
              </button>
              <button className="flex items-center gap-1">
                <Award size={12} />
                Award
              </button>
              <button>
                <MoreHorizontal size={12} />
              </button>
            </div>
          </>
        )}
      </div>
      {!comment.collapsed && comment.children && (
        <div className="comments-container">
          {comment.children.map((child) => (
            <Comment 
              key={child.id} 
              comment={child} 
              depth={depth + 1}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Post = ({ post, expanded, onToggle }) => {
  const [commentData, setCommentData] = useState(post.comments);
  const [sortOrder, setSortOrder] = useState('best');

  const toggleComment = (id) => {
    setCommentData(prevComments => {
      const updateComment = (comments) => 
        comments.map(comment => {
          if (comment.id === id) {
            return { ...comment, collapsed: !comment.collapsed };
          }
          if (comment.children) {
            return { ...comment, children: updateComment(comment.children) };
          }
          return comment;
        });
      return updateComment(prevComments);
    });
  };

  const sortComments = (order) => {
    setSortOrder(order);
    setCommentData(prevComments => {
      const sort = (comments) => 
        [...comments].sort((a, b) => {
          if (order === 'new') return b.time - a.time;
          if (order === 'old') return a.time - b.time;
          return b.score - a.score;
        }).map(comment => ({
          ...comment,
          children: comment.children ? sort(comment.children) : []
        }));
      return sort(prevComments);
    });
  };

  return (
    <div className="border border-gray-200 rounded-md mb-4 bg-white">
      <div className="p-4">
        <div className="flex gap-2">
          <div className="flex flex-col items-center gap-1">
            <button className="text-gray-400 hover:text-orange-500">
              <ChevronUp size={24} />
            </button>
            <span className="text-sm font-medium">{post.score}</span>
            <button className="text-gray-400 hover:text-blue-500">
              <ChevronDown size={24} />
            </button>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-medium mb-2">{post.title}</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Posted by u/{post.author}</span>
              <span>{post.time}h ago</span>
            </div>
          </div>
        </div>
        <div className="flex gap-4 mt-4 text-sm text-gray-500">
          <button onClick={() => onToggle(post.id)} className="flex items-center gap-1">
            <MessageSquare size={16} />
            {post.commentCount} Comments
          </button>
          <button className="flex items-center gap-1">
            <Share2 size={16} />
            Share
          </button>
          <button className="flex items-center gap-1">
            <BookmarkPlus size={16} />
            Save
          </button>
          <button>
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>
      {expanded && (
        <div className="border-t border-gray-200">
          <div className="p-4 bg-gray-50">
            <div className="flex gap-4 text-sm">
              <select 
                value={sortOrder}
                onChange={(e) => sortComments(e.target.value)}
                className="bg-transparent"
              >
                <option value="best">Sort by: Best</option>
                <option value="new">New</option>
                <option value="old">Old</option>
              </select>
            </div>
          </div>
          <div className="comments-section">
            {commentData.map((comment) => (
              <Comment 
                key={comment.id} 
                comment={comment}
                onToggle={toggleComment}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const App = () => {
  const [expandedPost, setExpandedPost] = useState(null);
  const [sortOrder, setSortOrder] = useState('hot');
  const [postsData, setPostsData] = useState(posts);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.shiftKey && e.keyCode >= 49 && e.keyCode <= 52) {
        window.TESTS[e.keyCode - 49].test();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const sortPosts = (order) => {
    setSortOrder(order);
    setPostsData(prev => [...prev].sort((a, b) => {
      if (order === 'new') return b.time - a.time;
      if (order === 'top') return b.score - a.score;
      return (b.score / (b.time + 2)) - (a.score / (a.time + 2));
    }));
  };

  const togglePost = (id) => {
    setExpandedPost(expandedPost === id ? null : id);
  };

  window.TESTS = [
    {
      name: "ExpandAllComments",
      test: () => {
        const firstPost = postsData[0];
        setExpandedPost(firstPost.id);
      }
    },
    {
      name: "CollapseAllComments",
      test: () => {
        setExpandedPost(null);
      }
    },
    {
      name: "SortByNew",
      test: () => {
        sortPosts('new');
      }
    },
    {
      name: "SortByTop",
      test: () => {
        sortPosts('top');
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">reddit</h1>
            <div className="flex gap-4">
              <select 
                value={sortOrder}
                onChange={(e) => sortPosts(e.target.value)}
                className="bg-transparent"
              >
                <option value="hot">Hot</option>
                <option value="new">New</option>
                <option value="top">Top</option>
              </select>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-4">
        {postsData.map((post) => (
          <Post
            key={post.id}
            post={post}
            expanded={expandedPost === post.id}
            onToggle={togglePost}
          />
        ))}
      </main>
    </div>
  );
};

export default App;