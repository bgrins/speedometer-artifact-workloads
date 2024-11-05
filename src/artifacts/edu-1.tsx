import React, { useState, useEffect } from 'react';
import { Menu, ChevronDown, ChevronRight, Search, BookOpen, Clock, Award, Play } from 'lucide-react';

// URL parameters for easy tuning
const urlParams = new URLSearchParams(window.location.search);
const NUM_COURSES = parseInt(urlParams.get('numCourses')) || 50;
const NUM_SECTIONS = parseInt(urlParams.get('numSections')) || 8;
const NUM_LESSONS = parseInt(urlParams.get('numLessons')) || 6;
const ITEMS_PER_PAGE = parseInt(urlParams.get('itemsPerPage')) || 10;

// Seeded random number generator
class Random {
  constructor(seed = 123) {
    this.seed = seed;
  }
  next() {
    this.seed = (this.seed * 16807) % 2147483647;
    return this.seed / 2147483647;
  }
}

const rand = new Random();

// Generate course data
const subjects = ['Math', 'Science', 'Computing', 'Economics'];
const topics = ['Algebra', 'Biology', 'Programming', 'Finance', 'Physics', 'Statistics'];
const levels = ['Beginner', 'Intermediate', 'Advanced'];

const generateCourseData = () => {
  const courses = [];
  for (let i = 0; i < NUM_COURSES; i++) {
    const subject = subjects[Math.floor(rand.next() * subjects.length)];
    const topic = topics[Math.floor(rand.next() * topics.length)];
    const level = levels[Math.floor(rand.next() * levels.length)];
    
    const sections = [];
    for (let j = 0; j < NUM_SECTIONS; j++) {
      const lessons = [];
      for (let k = 0; k < NUM_LESSONS; k++) {
        lessons.push({
          id: `lesson-${i}-${j}-${k}`,
          title: `Lesson ${k + 1}: ${topic} Concepts ${k + 1}`,
          duration: Math.floor(rand.next() * 20 + 10),
          completed: rand.next() > 0.7
        });
      }
      sections.push({
        id: `section-${i}-${j}`,
        title: `Section ${j + 1}: ${topic} Fundamentals ${j + 1}`,
        lessons,
        expanded: false
      });
    }
    
    courses.push({
      id: `course-${i}`,
      title: `${subject} ${level}: ${topic}`,
      subject,
      level,
      progress: Math.floor(rand.next() * 100),
      sections,
      expanded: false
    });
  }
  return courses;
};

const MathVisualization = ({ seed = 1 }) => {
  const r = new Random(seed);
  const points = Array.from({ length: 20 }, () => ({
    x: r.next() * 180 + 10,
    y: r.next() * 180 + 10
  }));

  return (
    <svg viewBox="0 0 200 200" className="w-full h-64 bg-gray-50">
      <path
        d={`M 10 100 Q ${100 + r.next() * 50} ${150 + r.next() * 30} 190 100`}
        stroke="blue"
        fill="none"
        strokeWidth="2"
      />
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="3"
          fill={r.next() > 0.5 ? "red" : "blue"}
        />
      ))}
    </svg>
  );
};

const App = () => {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [visualizationSeed, setVisualizationSeed] = useState(1);

  useEffect(() => {
    setCourses(generateCourseData());
  }, []);

  const toggleCourse = (courseId) => {
    setCourses(courses.map(course => ({
      ...course,
      expanded: course.id === courseId ? !course.expanded : course.expanded
    })));
  };

  const toggleSection = (courseId, sectionId) => {
    setCourses(courses.map(course => {
      if (course.id === courseId) {
        return {
          ...course,
          sections: course.sections.map(section => ({
            ...section,
            expanded: section.id === sectionId ? !section.expanded : section.expanded
          }))
        };
      }
      return course;
    }));
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'All' || course.subject === selectedSubject;
    const matchesLevel = selectedLevel === 'All' || course.level === selectedLevel;
    return matchesSearch && matchesSubject && matchesLevel;
  });

  const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE);
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Expose test functions
  window.TESTS = [
    {
      name: "ExpandAllCourses",
      test: () => {
        courses.forEach(course => {
          if (!course.expanded) {
            toggleCourse(course.id);
          }
        });
      }
    },
    {
      name: "ExpandAllSections",
      test: () => {
        courses.forEach(course => {
          course.sections.forEach(section => {
            if (!section.expanded) {
              toggleSection(course.id, section.id);
            }
          });
        });
      }
    },
    {
      name: "FilterAndSearch",
      test: () => {
        setSearchTerm("Algebra");
        setSelectedSubject("Math");
        setSelectedLevel("Intermediate");
        setCurrentPage(1);
      }
    },
    {
      name: "UpdateVisualization",
      test: () => {
        for (let i = 0; i < 5; i++) {
          setVisualizationSeed(prev => prev + 1);
        }
      }
    }
  ];

  // Debug mode keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.shiftKey && e.keyCode >= 49 && e.keyCode <= 52) {
        window.TESTS[e.keyCode - 49].test();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [courses]);

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 text-white p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <Menu className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Learning Platform</h1>
          </div>
          <div className="flex items-center space-x-4">
            <BookOpen className="h-5 w-5" />
            <Clock className="h-5 w-5" />
            <Award className="h-5 w-5" />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4">
        <div className="mb-8">
          <MathVisualization seed={visualizationSeed} />
        </div>

        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <select
              className="border rounded-lg px-4 py-2"
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
            >
              <option>All</option>
              {subjects.map(subject => (
                <option key={subject}>{subject}</option>
              ))}
            </select>
            <select
              className="border rounded-lg px-4 py-2"
              value={selectedLevel}
              onChange={e => setSelectedLevel(e.target.value)}
            >
              <option>All</option>
              {levels.map(level => (
                <option key={level}>{level}</option>
              ))}
            </select>
          </div>

          {paginatedCourses.map(course => (
            <div key={course.id} className="border rounded-lg mb-4">
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleCourse(course.id)}
              >
                <div className="flex items-center space-x-4">
                  {course.expanded ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                  <h3 className="font-medium">{course.title}</h3>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-500">{course.progress}% complete</div>
                  <div className="w-32 h-2 bg-gray-200 rounded">
                    <div
                      className="h-full bg-green-500 rounded"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {course.expanded && (
                <div className="p-4 pt-0">
                  {course.sections.map(section => (
                    <div key={section.id} className="ml-6 border-l">
                      <div
                        className="flex items-center space-x-4 p-2 cursor-pointer hover:bg-gray-50"
                        onClick={() => toggleSection(course.id, section.id)}
                      >
                        {section.expanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <h4>{section.title}</h4>
                      </div>

                      {section.expanded && (
                        <div className="ml-6">
                          {section.lessons.map(lesson => (
                            <div
                              key={lesson.id}
                              className="flex items-center space-x-4 p-2 hover:bg-gray-50"
                            >
                              <Play className="h-4 w-4" />
                              <span>{lesson.title}</span>
                              <span className="text-sm text-gray-500">
                                {lesson.duration} min
                              </span>
                              {lesson.completed && (
                                <Award className="h-4 w-4 text-green-500" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {totalPages > 1 && (
            <div className="flex justify-center space-x-2 mt-4">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  className={`px-3 py-1 rounded ${
                    currentPage === i + 1
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200'
                  }`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;