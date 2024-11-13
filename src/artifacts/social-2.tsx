import React, { useState, useEffect } from 'react';
import { Bell, MessageSquare, Search, Home, Users, Briefcase, Grid, ChevronDown, Plus, ThumbsUp, MessageCircle, Share2, Send } from 'lucide-react';

const NUM_CONNECTIONS = new URLSearchParams(window.location.search).get('connections') || 50;
const NUM_SKILLS = new URLSearchParams(window.location.search).get('skills') || 15;
const NUM_POSTS = new URLSearchParams(window.location.search).get('posts') || 5;

// Seeded random for consistent data
class Random {
  constructor(seed = 1) {
    this.seed = seed;
  }
  next() {
    this.seed = (this.seed * 16807) % 2147483647;
    return this.seed / 2147483647;
  }
}

const random = new Random(123);

const generateSkills = (count) => {
  const skills = ['JavaScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'SQL', 'MongoDB', 'AWS', 'Docker', 'Kubernetes', 'Machine Learning', 'Data Science', 'Product Management', 'Leadership', 'Strategy', 'Marketing', 'Sales', 'Design', 'UX'];
  return skills.slice(0, count).map(skill => ({
    name: skill,
    endorsements: Math.floor(random.next() * 500)
  }));
};

const generateConnections = (count) => {
  const titles = ['Software Engineer', 'Product Manager', 'Data Scientist', 'UX Designer', 'Marketing Manager'];
  const companies = ['Google', 'Microsoft', 'Amazon', 'Apple', 'Meta'];
  
  return Array.from({length: count}, (_, i) => ({
    id: i,
    name: `User ${i}`,
    title: titles[Math.floor(random.next() * titles.length)],
    company: companies[Math.floor(random.next() * companies.length)],
    connected: false
  }));
};

const App = () => {
  const [skills, setSkills] = useState(generateSkills(NUM_SKILLS));
  const [connections, setConnections] = useState(generateConnections(NUM_CONNECTIONS));
  const [posts, setPosts] = useState(Array.from({length: NUM_POSTS}, (_, i) => ({
    id: i,
    liked: false,
    likes: Math.floor(random.next() * 1000),
    comments: Math.floor(random.next() * 100),
    shares: Math.floor(random.next() * 50)
  })));

  const connectWithUser = (id) => {
    setConnections(prev => prev.map(conn => 
      conn.id === id ? {...conn, connected: !conn.connected} : conn
    ));
  };

  const endorseSkill = (skillName) => {
    setSkills(prev => prev.map(skill =>
      skill.name === skillName 
        ? {...skill, endorsements: skill.endorsements + 1}
        : skill
    ));
  };

  const toggleLike = (postId) => {
    setPosts(prev => prev.map(post =>
      post.id === postId 
        ? {...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1}
        : post
    ));
  };

  // Expose TESTS object for benchmark
  useEffect(() => {
    window.TESTS = [
      {
        name: "ConnectWithUsers",
        test: () => {
          const unconnectedUsers = connections.filter(c => !c.connected);
          for (let i = 0; i < Math.min(10, unconnectedUsers.length); i++) {
            connectWithUser(unconnectedUsers[i].id);
          }
        }
      },
      {
        name: "EndorseSkills",
        test: () => {
          for (let skill of skills.slice(0, 5)) {
            endorseSkill(skill.name);
          }
        }
      },
      {
        name: "EngageWithPosts",
        test: () => {
          for (let post of posts) {
            if (!post.liked) toggleLike(post.id);
          }
        }
      }
    ];

    // Debug mode keyboard shortcuts
    const handleKeyUp = (e) => {
      if (e.shiftKey && e.keyCode >= 49 && e.keyCode <= 51) {
        window.TESTS[e.keyCode - 49].test();
      }
    };
    document.addEventListener('keyup', handleKeyUp);
    return () => document.removeEventListener('keyup', handleKeyUp);
  }, [connections, skills, posts]);

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white border-b border-gray-200 fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="text-blue-600 text-2xl font-bold">in</div>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
                  className="pl-10 pr-4 py-2 bg-gray-100 rounded-md w-64"
                />
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <button className="text-gray-500 hover:text-gray-900">
                <Home className="h-6 w-6" />
              </button>
              <button className="text-gray-500 hover:text-gray-900">
                <Users className="h-6 w-6" />
              </button>
              <button className="text-gray-500 hover:text-gray-900">
                <Briefcase className="h-6 w-6" />
              </button>
              <button className="text-gray-500 hover:text-gray-900">
                <MessageSquare className="h-6 w-6" />
              </button>
              <button className="text-gray-500 hover:text-gray-900">
                <Bell className="h-6 w-6" />
              </button>
              <button className="text-gray-500 hover:text-gray-900">
                <Grid className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6">
            <div className="w-3/4 space-y-6">
              <div className="bg-white rounded-lg shadow">
                <div className="h-48 bg-blue-100 rounded-t-lg"></div>
                <div className="px-6 pb-6">
                  <div className="-mt-16 flex justify-between items-end mb-4">
                    <div className="h-32 w-32 rounded-full bg-gray-300 border-4 border-white"></div>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-full">
                      Open to
                      <ChevronDown className="h-4 w-4 inline ml-1" />
                    </button>
                  </div>
                  <h1 className="text-2xl font-bold">John Doe</h1>
                  <p className="text-gray-600">Senior Software Engineer at Tech Corp</p>
                  <p className="text-sm text-gray-500">San Francisco Bay Area · 500+ connections</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Skills & Endorsements</h2>
                <div className="grid grid-cols-2 gap-4">
                  {skills.map(skill => (
                    <div key={skill.name} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{skill.name}</h3>
                          <p className="text-sm text-gray-500">{skill.endorsements} endorsements</p>
                        </div>
                        <button
                          onClick={() => endorseSkill(skill.name)}
                          className="text-blue-600 hover:bg-blue-50 p-2 rounded-full"
                        >
                          <Plus className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {posts.map(post => (
                <div key={post.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="h-12 w-12 rounded-full bg-gray-300"></div>
                    <div>
                      <h3 className="font-medium">John Doe</h3>
                      <p className="text-sm text-gray-500">Senior Software Engineer at Tech Corp</p>
                    </div>
                  </div>
                  <p className="mb-4">Exciting news! Just launched a new feature that will revolutionize how we handle state management...</p>
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <button
                        onClick={() => toggleLike(post.id)}
                        className={`flex items-center space-x-1 ${post.liked ? 'text-blue-600' : 'text-gray-500'} hover:bg-gray-100 px-3 py-2 rounded`}
                      >
                        <ThumbsUp className="h-5 w-5" />
                        <span>{post.likes}</span>
                      </button>
                      <button className="flex items-center space-x-1 text-gray-500 hover:bg-gray-100 px-3 py-2 rounded">
                        <MessageCircle className="h-5 w-5" />
                        <span>{post.comments}</span>
                      </button>
                      <button className="flex items-center space-x-1 text-gray-500 hover:bg-gray-100 px-3 py-2 rounded">
                        <Share2 className="h-5 w-5" />
                        <span>{post.shares}</span>
                      </button>
                      <button className="flex items-center space-x-1 text-gray-500 hover:bg-gray-100 px-3 py-2 rounded">
                        <Send className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="w-1/4">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium mb-4">People you may know</h2>
                <div className="space-y-4">
                  {connections.filter(c => !c.connected).slice(0, 5).map(connection => (
                    <div key={connection.id} className="flex items-start space-x-3">
                      <div className="h-12 w-12 rounded-full bg-gray-300"></div>
                      <div className="flex-1">
                        <h3 className="font-medium">{connection.name}</h3>
                        <p className="text-sm text-gray-500">{connection.title} at {connection.company}</p>
                        <button
                          onClick={() => connectWithUser(connection.id)}
                          className="mt-2 text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-full border border-blue-600"
                        >
                          Connect
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;