import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Calendar, Book, FileText, Users, Settings, Bell, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

// URL parameters for tuning
const params = new URLSearchParams(window.location.search);
const NUM_COURSES = parseInt(params.get('numCourses')) || 6;
const ASSIGNMENTS_PER_COURSE = parseInt(params.get('assignmentsPerCourse')) || 8;
const MODULES_PER_COURSE = parseInt(params.get('modulesPerCourse')) || 5;
const FILES_PER_MODULE = parseInt(params.get('filesPerModule')) || 4;

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

const generateCourseData = () => {
  const courses = [];
  const subjects = ['Computer Science', 'Mathematics', 'Physics', 'Biology', 'History', 'Literature'];
  const levels = ['101', '201', '301', '401'];
  
  for (let i = 0; i < NUM_COURSES; i++) {
    const subject = subjects[Math.floor(rand.next() * subjects.length)];
    const level = levels[Math.floor(rand.next() * levels.length)];
    const modules = [];
    
    for (let j = 0; j < MODULES_PER_COURSE; j++) {
      const files = [];
      for (let k = 0; k < FILES_PER_MODULE; k++) {
        files.push({
          id: `file-${i}-${j}-${k}`,
          name: `Lecture ${k + 1} Materials`,
          type: rand.next() > 0.5 ? 'pdf' : 'doc',
          size: Math.floor(rand.next() * 5000) + 500
        });
      }
      
      modules.push({
        id: `module-${i}-${j}`,
        name: `Week ${j + 1}`,
        files,
        expanded: false
      });
    }
    
    const assignments = [];
    for (let j = 0; j < ASSIGNMENTS_PER_COURSE; j++) {
      assignments.push({
        id: `assignment-${i}-${j}`,
        name: `Assignment ${j + 1}`,
        dueDate: new Date(2024, Math.floor(rand.next() * 12), Math.floor(rand.next() * 28)),
        status: rand.next() > 0.7 ? 'submitted' : 'pending'
      });
    }
    
    courses.push({
      id: `course-${i}`,
      code: `${subject.substring(0, 4).toUpperCase()}${level}`,
      name: `${subject} ${level}`,
      modules,
      assignments,
      unread: Math.floor(rand.next() * 5)
    });
  }
  return courses;
};

const App = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [view, setView] = useState('modules'); // modules, assignments
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedModules, setExpandedModules] = useState(new Set());
  
  useEffect(() => {
    setCourses(generateCourseData());
  }, []);

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const filteredCourses = courses.filter(course => 
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-600 text-white p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="text-xl font-bold">Virtual LMS</div>
          <div className="flex items-center gap-4">
            <Bell className="w-5 h-5" />
            <Settings className="w-5 h-5" />
          </div>
        </div>
      </nav>
      
      <div className="max-w-7xl mx-auto mt-6 px-4 flex gap-6">
        <aside className="w-64 flex-shrink-0">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search courses..."
              className="w-full p-2 border rounded"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            {filteredCourses.map(course => (
              <Card 
                key={course.id}
                className={`cursor-pointer hover:bg-gray-50 ${selectedCourse?.id === course.id ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => setSelectedCourse(course)}
              >
                <CardContent className="p-3">
                  <div className="font-medium">{course.code}</div>
                  <div className="text-sm text-gray-600">{course.name}</div>
                  {course.unread > 0 && (
                    <div className="mt-1 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full inline-block">
                      {course.unread} new
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </aside>
        
        <main className="flex-1">
          {selectedCourse ? (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">{selectedCourse.name}</h1>
                <div className="flex gap-4">
                  <button
                    className={`px-4 py-2 rounded ${view === 'modules' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}
                    onClick={() => setView('modules')}
                  >
                    <Book className="w-4 h-4 inline-block mr-2" />
                    Modules
                  </button>
                  <button
                    className={`px-4 py-2 rounded ${view === 'assignments' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}
                    onClick={() => setView('assignments')}
                  >
                    <FileText className="w-4 h-4 inline-block mr-2" />
                    Assignments
                  </button>
                </div>
              </div>
              
              {view === 'modules' ? (
                <div className="space-y-4">
                  {selectedCourse.modules.map(module => (
                    <Card key={module.id}>
                      <CardContent className="p-4">
                        <div
                          className="flex items-center cursor-pointer"
                          onClick={() => toggleModule(module.id)}
                        >
                          {expandedModules.has(module.id) ? (
                            <ChevronDown className="w-5 h-5 mr-2" />
                          ) : (
                            <ChevronRight className="w-5 h-5 mr-2" />
                          )}
                          <h3 className="text-lg font-medium">{module.name}</h3>
                        </div>
                        
                        {expandedModules.has(module.id) && (
                          <div className="mt-4 pl-7 space-y-3">
                            {module.files.map(file => (
                              <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div className="flex items-center">
                                  <FileText className="w-4 h-4 mr-2 text-gray-500" />
                                  <span>{file.name}</span>
                                </div>
                                <span className="text-sm text-gray-500">{file.size}KB</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedCourse.assignments.map(assignment => (
                    <Card key={assignment.id}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{assignment.name}</h3>
                          <div className="text-sm text-gray-500">
                            Due: {assignment.dueDate.toLocaleDateString()}
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm ${
                          assignment.status === 'submitted' 
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {assignment.status === 'submitted' ? 'Submitted' : 'Pending'}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-gray-500 mt-12">
              Select a course to view its content
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// Tests for benchmark runner
window.TESTS = [
  {
    name: 'ExpandAllModules',
    test: () => {
      const firstCourse = document.querySelector('.cursor-pointer');
      if (firstCourse) firstCourse.click();
      
      const moduleToggles = document.querySelectorAll('[class*="flex items-center cursor-pointer"]');
      moduleToggles.forEach(toggle => toggle.click());
    }
  },
  {
    name: 'CollapseAllModules',
    test: () => {
      const moduleToggles = document.querySelectorAll('[class*="flex items-center cursor-pointer"]');
      moduleToggles.forEach(toggle => toggle.click());
    }
  },
  {
    name: 'SwitchAllCoursesAndViews',
    test: () => {
      const courses = document.querySelectorAll('.cursor-pointer');
      const viewToggle = document.querySelector('button:last-of-type');
      
      courses.forEach(course => {
        course.click();
        viewToggle.click();
        viewToggle.click();
      });
    }
  },
  {
    name: 'SearchAndFilter',
    test: () => {
      const searchInput = document.querySelector('input[type="text"]');
      ['CS', 'MATH', 'PHYS', '101', '201'].forEach(term => {
        searchInput.value = term;
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      });
      searchInput.value = '';
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
];

// Debug mode keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.shiftKey && e.keyCode >= 49 && e.keyCode <= 52) {
    const testIndex = e.keyCode - 49;
    if (window.TESTS[testIndex]) {
      window.TESTS[testIndex].test();
    }
  }
});

export default App;