import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronDown, 
  ArrowRight, 
  Check, 
  BarChart3, 
  Calendar, 
  CheckSquare, 
  MessageSquare, 
  Bot, 
  Play,
  BookOpen, 
  Mail, 
  FileText,
  Users,
  Menu,
  X
} from 'lucide-react';

export default function RNSStratXLanding() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('features');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVisible, setIsVisible] = useState({});
  const videoRef = useRef(null);
  
    const videoUrl = "PM.mp4";
    const thumbnailUrl = "https://img.freepik.com/premium-vector/illustration-vector-exam-paper-flat-design_485656-146.jpg";
  
    // Handle scroll to top button visibility
    useEffect(() => {
      const handleScroll = () => {
        if (window.scrollY > 500) {
          setShowScrollTop(true);
        } else {
          setShowScrollTop(false);
        }
      };
  
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }, []);
  
    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    };
  
    const handleWatchDemo = () => {
      setIsPlaying(true);
      setShowPlayButton(false);
      if (videoRef.current) {
        videoRef.current.src = videoUrl;
      }
    };
  
    const handleVideoEnd = () => {
      setIsPlaying(false);
      setShowPlayButton(true);
      if (videoRef.current) {
        videoRef.current.src = "";
      }
    };
  
    // Features carousel auto-rotation
    useEffect(() => {
      const interval = setInterval(() => {
        setActiveFeature((prev) => (prev + 1) % 4);
      }, 4000);
  
      return () => clearInterval(interval);
    }, []);
  
    // Testimonials rotation
    useEffect(() => {
      const interval = setInterval(() => {
        setActiveTestimonial((prev) => (prev + 1) % 3);
      }, 5000);
  
      return () => clearInterval(interval);
    }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    const sections = document.querySelectorAll('[data-animate]');
    sections.forEach(section => {
      observer.observe(section);
    });

    return () => {
      sections.forEach(section => {
        observer.unobserve(section);
      });
    };
  }, []);

  const features = [
    {
      title: "Report Automation",
      description: "Generate comprehensive reports automatically with real-time data visualization and export capabilities.",
      icon: <BarChart3 className="h-6 w-6 text-blue-600" />
    },
    {
      title: "Attendance Management",
      description: "Track team presence, working hours, and availability with automated notifications.",
      icon: <Calendar className="h-6 w-6 text-blue-600" />
    },
    {
      title: "Task Management",
      description: "Organize, prioritize, and track tasks with customizable workflows and deadlines.",
      icon: <CheckSquare className="h-6 w-6 text-blue-600" />
    },
    {
      title: "Communication Channels",
      description: "Collaborate through dedicated channels for teams, projects, and topics.",
      icon: <MessageSquare className="h-6 w-6 text-blue-600" />
    },
    {
      title: "Intelligent Chatbot",
      description: "Get instant answers and assistance through our AI-powered chatbot.",
      icon: <Bot className="h-6 w-6 text-blue-600" />
    },
    {
      title: "User Story Creator",
      description: "Develop and manage user stories with templates and acceptance criteria.",
      icon: <BookOpen className="h-6 w-6 text-blue-600" />
    },
    {
      title: "Mail Drafter",
      description: "Create professional emails with templates and scheduling options.",
      icon: <Mail className="h-6 w-6 text-blue-600" />
    },
    {
      title: "Text Tools Suite",
      description: "Access advanced text editing, formatting, and analysis tools.",
      icon: <FileText className="h-6 w-6 text-blue-600" />
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "$9.99",
      period: "per user/month",
      description: "Perfect for small teams just getting started",
      features: [
        "Up to 10 users",
        "Basic reporting",
        "Task management",
        "Communication channels",
        "24/7 support"
      ]
    },
    {
      name: "Professional",
      price: "$24.99",
      period: "per user/month",
      description: "Ideal for growing teams that need more power",
      features: [
        "Up to 50 users",
        "Advanced reporting",
        "Full task management suite",
        "AI chatbot assistance",
        "User story creator",
        "Mail drafting tools",
        "Priority support"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "tailored pricing",
      description: "For organizations requiring complete solutions",
      features: [
        "Unlimited users",
        "Custom report automation",
        "Advanced analytics",
        "All premium features",
        "API access",
        "Dedicated account manager",
        "Custom integrations"
      ]
    }
  ];

  const testimonials = [
    {
      quote: "RNS StratX transformed how our team collaborates. The report automation alone saved us countless hours every month.",
      author: "Sarah Johnson",
      position: "Project Director, TechInnovate"
    },
    {
      quote: "The user story creator and task management features help us stay organized and on track with our agile methodology.",
      author: "Michael Chen",
      position: "Scrum Master, DevSolutions"
    },
    {
      quote: "We've seen a 40% increase in productivity since implementing RNS StratX across our organization.",
      author: "Elena Rodriguez",
      position: "COO, GlobalTech Systems"
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navigation */}
      <nav className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-xl font-bold">RNS StratX</span>
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  <a href="#home" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-500 transition-colors">Home</a>
                  <a href="#features" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-500 transition-colors">Features</a>
                  <a href="#pricing" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-500 transition-colors">Pricing</a>
                  <a href="#testimonials" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-500 transition-colors">Testimonials</a>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6">
                <a href='/login'>
                <button className="ml-3 bg-blue-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">Get Started</button></a>
              </div>
            </div>
            <div className="flex md:hidden">
              <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white hover:bg-blue-500 focus:outline-none"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`${isOpen ? 'block' : 'hidden'} md:hidden`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a href="#home" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-500 transition-colors">Home</a>
            <a href="#features" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-500 transition-colors">Features</a>
            <a href="#pricing" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-500 transition-colors">Pricing</a>
            <a href="#testimonials" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-500 transition-colors">Testimonials</a>
          </div>
          <div className="pt-4 pb-3 border-t border-blue-500">
            <div className="px-2 space-y-1">
            <a href='/login'>
              <button className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white bg-blue-800 hover:bg-blue-700 transition-colors">Get Started</button></a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div id="home" className="bg-gradient-to-b from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div 
              id="hero-text" 
              data-animate="true"
              className={`${isVisible['hero-text'] ? 'animate-fade-in-left' : 'opacity-0'} transition-all duration-1000`}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Revolutionize Your Project Management with RNS StratX
              </h1>
              <p className="text-xl mb-8">
                All-in-one solution for teams to collaborate, automate, and deliver projects with unmatched efficiency.
              </p>
              <div className="flex flex-wrap gap-4">
              <a href='/login'>
                <button className="bg-white text-blue-600 px-6 py-3 rounded-md font-medium hover:bg-blue-50 transition-colors flex items-center">
                  Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                </button></a>
                <a href='#how-it-works'><button className="bg-blue-800 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors">
                  Watch Demo
                </button></a>
              </div>
            </div>
            <div 
              id="hero-image" 
              data-animate="true"
              className={`${isVisible['hero-image'] ? 'animate-fade-in-right' : 'opacity-0'} transition-all duration-1000`}
            >
              <div className="bg-white p-4 rounded-lg shadow-xl">
                <div className="bg-blue-50 rounded-md p-3 mb-3">
                  <div className="h-6 bg-blue-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-blue-100 rounded w-1/2 mb-4"></div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="h-20 bg-blue-100 rounded flex items-center justify-center">
                      <BarChart3 className="h-8 w-8 text-blue-500" />
                    </div>
                    <div className="h-20 bg-blue-100 rounded flex items-center justify-center">
                      <CheckSquare className="h-8 w-8 text-blue-500" />
                    </div>
                    <div className="h-20 bg-blue-100 rounded flex items-center justify-center">
                      <MessageSquare className="h-8 w-8 text-blue-500" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="h-4 bg-blue-50 rounded flex-1"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-blue-50 rounded w-full"></div>
                  <div className="h-3 bg-blue-50 rounded w-5/6"></div>
                  <div className="h-3 bg-blue-50 rounded w-4/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-blue-600">
          <svg className="w-full text-white" viewBox="0 0 1440 100" fill="currentColor">
            <path d="M0,0 C240,70 480,100 720,100 C960,100 1200,70 1440,0 L1440,100 L0,100 Z"></path>
          </svg>
        </div>
      </div>

      {/* Stats Section */}
      <div 
        id="stats-section"
        data-animate="true" 
        className={`${isVisible['stats-section'] ? 'animate-fade-in-up' : 'opacity-0'} transition-all duration-1000 py-16 bg-white`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-6 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">10,000+</div>
              <div className="text-gray-600">Teams Using StratX</div>
            </div>
            <div className="p-6 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">98%</div>
              <div className="text-gray-600">Customer Satisfaction</div>
            </div>
            <div className="p-6 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">35%</div>
              <div className="text-gray-600">Average Productivity Boost</div>
            </div>
            <div className="p-6 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-gray-600">Premium Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 
              id="features-title"
              data-animate="true"
              className={`${isVisible['features-title'] ? 'animate-fade-in-up' : 'opacity-0'} transition-all duration-1000 text-3xl md:text-4xl font-bold text-blue-800 mb-4`}
            >
              Everything You Need in One Place
            </h2>
            <p 
              id="features-desc"
              data-animate="true"
              className={`${isVisible['features-desc'] ? 'animate-fade-in-up' : 'opacity-0'} transition-all duration-1000 max-w-2xl mx-auto text-gray-600 text-lg`}
            >
              RNS StratX combines powerful tools to streamline your project management workflow
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                id={`feature-card-${index}`}
                data-animate="true"
                className={`${isVisible[`feature-card-${index}`] ? 'animate-fade-in-up' : 'opacity-0'} transition-all duration-1000 delay-${index * 100} bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all hover:translate-y-[-5px]`}
              >
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-blue-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 
              id="how-it-works-title"
              data-animate="true"
              className={`${isVisible['how-it-works-title'] ? 'animate-fade-in-up' : 'opacity-0'} transition-all duration-1000 text-3xl md:text-4xl font-bold text-blue-800 mb-4`}
            >
              How RNS StratX Works
            </h2>
            <p 
              id="how-it-works-desc"
              data-animate="true"
              className={`${isVisible['how-it-works-desc'] ? 'animate-fade-in-up' : 'opacity-0'} transition-all duration-1000 max-w-2xl mx-auto text-gray-600 text-lg`}
            >
              Our streamlined approach to project management makes work flow smoother
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div 
              id="how-it-works-1"
              data-animate="true"
              className={`${isVisible['how-it-works-1'] ? 'animate-fade-in-up' : 'opacity-0'} transition-all duration-1000 text-center px-4`}
            >
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                <span className="text-blue-600 font-bold text-xl">1</span>
                <div className="absolute top-2 right-[-120px] hidden md:block border-t-2 border-dashed border-blue-300 w-24"></div>
              </div>
              <h3 className="text-xl font-semibold text-blue-800 mb-2">Plan & Create</h3>
              <p className="text-gray-600">Set up projects, define tasks, and create user stories with clear objectives</p>
            </div>
            <div 
              id="how-it-works-2"
              data-animate="true"
              className={`${isVisible['how-it-works-2'] ? 'animate-fade-in-up' : 'opacity-0'} transition-all duration-1000 text-center px-4`}
            >
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                <span className="text-blue-600 font-bold text-xl">2</span>
                <div className="absolute top-2 right-[-120px] hidden md:block border-t-2 border-dashed border-blue-300 w-24"></div>
              </div>
              <h3 className="text-xl font-semibold text-blue-800 mb-2">Collaborate & Execute</h3>
              <p className="text-gray-600">Work together across channels, track progress, and communicate efficiently</p>
            </div>
            <div 
              id="how-it-works-3"
              data-animate="true"
              className={`${isVisible['how-it-works-3'] ? 'animate-fade-in-up' : 'opacity-0'} transition-all duration-1000 text-center px-4`}
            >
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-semibold text-blue-800 mb-2">Monitor & Report</h3>
              <p className="text-gray-600">Generate automated reports, analyze performance, and make data-driven decisions</p>
            </div>
          </div>
        </div>
      </div>

      <section id="how-it-works" className="py-20 bg-white overflow-hidden">
        <div className="container mx-auto px-4">
          

          
          <div className="mt-0">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-8 md:p-10 shadow-lg">
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
                  <h3 className="text-2xl md:text-3xl font-bold mb-4 text-blue-800">
                    See RNS StratX in Action
                  </h3>
                  <p className="text-gray-700 mb-6 text-lg">
                  All-in-one solution for teams to collaborate, automate, and deliver projects with unmatched efficiency.
                  </p>
                  <button
                    onClick={handleWatchDemo}
                    className="bg-blue-800 text-white px-6 py-3 rounded-lg transition-all duration-300 font-medium inline-flex items-center shadow-md hover:shadow-lg hover:bg-blue-700"
                  >
                    <Play className="mr-2 w-5 h-5" />
                    Watch Demo (Double Tap)
                  </button>
                </div>

                <div className="md:w-1/2">
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">
                    {!isPlaying ? (
                      <div className="relative group cursor-pointer" onClick={handleWatchDemo}>
                        <img
                          src={thumbnailUrl}
                          alt="AssessEngine Demo"
                          className="w-full object-cover rounded-lg transform transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="bg-purple-600 bg-opacity-90 rounded-full w-20 h-20 flex items-center justify-center transform transition-transform duration-300 group-hover:scale-110">
                            <Play className="w-8 h-8 text-white ml-1" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <iframe
                        ref={videoRef}
                        width="560"
                        height="315"
                        src=""
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full aspect-video"
                        onEnded={handleVideoEnd}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Pricing Section */}
      <div id="pricing" className="py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 
              id="pricing-title"
              data-animate="true"
              className={`${isVisible['pricing-title'] ? 'animate-fade-in-up' : 'opacity-0'} transition-all duration-1000 text-3xl md:text-4xl font-bold text-blue-800 mb-4`}
            >
              Simple, Transparent Pricing
            </h2>
            <p 
              id="pricing-desc"
              data-animate="true"
              className={`${isVisible['pricing-desc'] ? 'animate-fade-in-up' : 'opacity-0'} transition-all duration-1000 max-w-2xl mx-auto text-gray-600 text-lg`}
            >
              Choose the plan that works best for your team's needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div 
                key={index}
                id={`pricing-plan-${index}`}
                data-animate="true"
                className={`
                  ${isVisible[`pricing-plan-${index}`] ? 'animate-fade-in-up' : 'opacity-0'} 
                  transition-all duration-1000
                  ${plan.popular ? 'bg-white border-blue-500 border-2 relative transform md:scale-105 shadow-xl' : 'bg-white border border-gray-100 shadow-md'} 
                  rounded-lg overflow-hidden
                `}
              >
                {plan.popular && (
                  <div className="bg-blue-500 text-white text-center py-1 font-medium">
                    Most Popular
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-blue-800 mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-blue-600">{plan.price}</span>
                    <span className="text-gray-500 ml-1">{plan.period}</span>
                  </div>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <Check className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button className={`w-full py-3 rounded-md font-medium transition-colors ${plan.popular ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}>
                    {plan.popular ? 'Start 14-Day Trial' : 'Choose Plan'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div id="testimonials" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 
              id="testimonials-title"
              data-animate="true"
              className={`${isVisible['testimonials-title'] ? 'animate-fade-in-up' : 'opacity-0'} transition-all duration-1000 text-3xl md:text-4xl font-bold text-blue-800 mb-4`}
            >
              What Our Customers Say
            </h2>
            <p 
              id="testimonials-desc"
              data-animate="true"
              className={`${isVisible['testimonials-desc'] ? 'animate-fade-in-up' : 'opacity-0'} transition-all duration-1000 max-w-2xl mx-auto text-gray-600 text-lg`}
            >
              Trusted by thousands of teams worldwide
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                id={`testimonial-${index}`}
                data-animate="true"
                className={`${isVisible[`testimonial-${index}`] ? 'animate-fade-in-up' : 'opacity-0'} transition-all duration-1000 bg-blue-50 p-6 rounded-lg relative`}
              >
                <div className="mb-6 text-blue-600 text-4xl">"</div>
                <p className="text-gray-700 mb-6 italic">{testimonial.quote}</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-200 rounded-full mr-3"></div>
                  <div>
                    <h4 className="font-semibold text-blue-800">{testimonial.author}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.position}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 text-white py-16">
        <div 
          id="cta-section"
          data-animate="true"
          className={`${isVisible['cta-section'] ? 'animate-fade-in-up' : 'opacity-0'} transition-all duration-1000 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center`}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Project Management?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">Join thousands of teams using RNS StratX to streamline their workflows, automate reporting, and boost productivity.</p>
          <div className="flex flex-wrap justify-center gap-4">
          <a href='/login'>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-md font-medium hover:bg-blue-50 transition-colors">
              Start Your Free Trial
            </button></a>
            <a href='#how-it-works'><button className="bg-blue-800 text-white px-8 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors">
              Watch Demo
            </button></a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-blue-800 text-white pt-16 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="text-xl font-bold mb-4">RNS StratX</h3>
              <p className="text-blue-200 mb-6">All-in-one project management solution for modern teams.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-blue-200 hover:text-white transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-blue-200 hover:text-white transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0                    0 24 24">
                    <path d="M22.233 0H1.767C.794 0 0 .794 0 1.767v20.466C0 23.206.794 24 1.767 24h20.466C23.206 24 24 23.206 24 22.233V1.767C24 .794 23.206 0 22.233 0zM7.867 20.789H3.733V9.447h4.134v11.342zm-1.733-13.018c-2.206 0-3.17-1.12-3.17-3.317 0-1.43 1.085-2.19 2.46-2.19 1.085 0 2.205.52 2.887 1.395.19.215.452.39.738.39.25 0 .52-.052.747-.159.52-.262 1.152-1.266 1.152-2.562 0-2.205-1.585-3.258-3.17-3.258-1.395 0-2.46.86-2.46 2.46 0 1.395.86 2.46 2.46 2.46 1.018 0 2.15-.317 2.15-.982 0-.369-.098-.813-.39-1.152-.675-.795-1.898-2.233-1.898-4.202 0-2.982 2.15-5.198 5.198-5.198s5.198 2.216 5.198 5.198c0 1.984-1.223 3.422-1.898 4.202-.29.337-.39.78-.39 1.152 0 .665.982.982 2.15.982 2.205 0 3.17 1.12 3.17 3.317 0 1.43-1.085 2.19-2.46 2.19-1.018 0-2.205-.52-2.887-1.395-.19-.215-.452-.39-.738-.39-.25 0-.52.052-.747.159-.52.262-1.152 1.266-1.152 2.562 0 2.206 1.585 3.258 3.17 3.258 1.394 0 2.46-.86 2.46-2.46 0-1.395-.86-2.46-2.46-2.46zm9.889-3.95h-4.134v11.342h4.134V16.83zm-1.733-13.018c-2.206 0-3.17-1.12-3.17-3.317 0-1.43 1.085-2.19 2.46-2.19 1.085 0 2.205.52 2.887 1.395.19.215.452.39.738.39.25 0 .52-.052.747-.159.52-.262 1.152-1.266 1.152-2.562 0-2.205-1.585-3.258-3.17-3.258-1.395 0-2.46.86-2.46 2.46 0 1.395.86 2.46 2.46 2.46 1.018 0 2.15-.317 2.15-.982 0-.369-.098-.813-.39-1.152-.675-.795-1.898-2.233-1.898-4.202 0-2.982 2.15-5.198 5.198-5.198s5.198 2.216 5.198 5.198c0 1.984-1.223 3.422-1.898 4.202-.29.337-.39.78-.39 1.152 0 .665.982.982 2.15.982 2.205 0 3.17 1.12 3.17 3.317 0 1.43-1.085 2.19-2.46 2.19-1.018 0-2.205-.52-2.887-1.395-.19-.215-.452-.39-.738-.39-.25 0-.52.052-.747.159-.52.262-1.152 1.266-1.152 2.562 0 2.206 1.585 3.258 3.17 3.258 1.394 0 2.46-.86 2.46-2.46 0-1.395-.86-2.46-2.46-2.46z" />
                  </svg>
                </a>
                <a href="#" className="text-blue-200 hover:text-white transition-colors">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.676 0H1.324C.593 0 0 .593 0 1.324v21.352C0 23.407.593 24 1.324 24H12.82v-9.212h-2.914v-3.692h2.914v-2.372c0-2.942 1.529-4.41 4.374-4.41 1.308 0 2.386.044 2.722.073v2.549h-1.979c-1.336 0-1.605.672-1.605 1.507v1.979h3.209l-.469 3.692h-2.74V24h6.116C23.407 24 24 23.407 24 22.676V1.324C24 .593 23.407 0 22.676 0z" />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Resources</h3>
              <ul className="text-blue-200 space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Company</h3>
              <ul className="text-blue-200 space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Partners</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Legal</h3>
              <ul className="text-blue-200 space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-blue-700 pt-6 text-center text-blue-200 text-sm">
            <p>&copy; 2025 RNS StratX. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
