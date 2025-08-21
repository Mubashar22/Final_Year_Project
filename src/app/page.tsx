'use client';

import { useRouter } from 'next/navigation';
import { FaHome, FaUsers, FaChartLine, FaStar, FaBuilding, FaHandshake } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  // Removed unused scrollY state
  const [isVisible, setIsVisible] = useState({
    hero: false,
    cards: false,
    stats: false,
    testimonials: false,
    mobileMenu: false
  });
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        const mostVisible = entries.reduce((prev, current) =>
          (current.intersectionRatio > prev.intersectionRatio) ? current : prev
        );

        if (mostVisible.isIntersecting && mostVisible.intersectionRatio > 0.3) {
          const target = mostVisible.target.getAttribute('data-section');
          if (target) {
            setIsVisible(prev => ({ ...prev, [target]: true }));
            setActiveSection(target);
          }
        }
      },
      {
        threshold: [0.1, 0.3, 0.5, 0.7],
        rootMargin: '-50px 0px -50px 0px'
      }
    );

    const sections = document.querySelectorAll('[data-section]');
    sections.forEach(section => observer.observe(section));

    return () => {
      observer.disconnect();
    };
  }, []);

  // Rest of your code remains unchanged...
  const handleRoleSelect = (role: 'owner' | 'tenant') => {
    if (role === 'owner') {
      router.push('/auth/owner-login');
    } else {
      router.push('/auth/signin');
    }
  };

  const handleFloatingElementClick = (element: string) => {
    const ripple = document.createElement('div');
    ripple.className = 'absolute inset-0 bg-white/30 rounded-full animate-ping';

    switch (element) {
      case 'blue':
        document.body.style.background = 'linear-gradient(45deg, #3b82f6, #1d4ed8)';
        setTimeout(() => document.body.style.background = '', 1000);
        break;
      case 'purple':
        document.body.style.background = 'linear-gradient(45deg, #8b5cf6, #7c3aed)';
        setTimeout(() => document.body.style.background = '', 1000);
        break;
      case 'teal':
        document.body.style.background = 'linear-gradient(45deg, #14b8a6, #0d9488)';
        setTimeout(() => document.body.style.background = '', 1000);
        break;
    }
  };

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });

    if (sectionId === 'hero') {
      setActiveSection('hero');
    } else if (sectionId === 'role-selection') {
      setActiveSection('cards');
    } else if (sectionId === 'stats') {
      setActiveSection('stats');
    } else if (sectionId === 'testimonials') {
      setActiveSection('testimonials');
    }
  };

  const stats = [
    { icon: FaBuilding, label: 'Properties Listed', value: '500+', color: 'text-blue-600' },
    { icon: FaUsers, label: 'Happy Tenants', value: '1200+', color: 'text-green-600' },
    { icon: FaHandshake, label: 'Successful Deals', value: '800+', color: 'text-purple-600' },
    { icon: FaChartLine, label: 'Growth Rate', value: '95%', color: 'text-orange-600' }
  ];

  const testimonials = [
    {
      name: "Ahmed Hassan",
      role: "Property Owner",
      text: "This platform made managing my properties so much easier. Highly recommended!",
      rating: 5,
      avatar: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      name: "Fatima Khan",
      role: "Tenant",
      text: "Found my dream apartment within days. The process was smooth and transparent.",
      rating: 5,
      avatar: "https://randomuser.me/api/portraits/women/44.jpg"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Floating Navbar */}
      <nav className="fixed top-4 left-4 right-4 z-50 max-w-7xl mx-auto">
        <div className="bg-white/70 backdrop-blur-2xl border border-white/30 shadow-2xl rounded-2xl px-6 py-3">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href={"/"} className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300">
                <FaBuilding color="white" size="1.25em" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  RMS
                </h1>
                <p className="text-xs text-gray-500 -mt-1">Faisalabad</p>
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              <button
                onClick={() => scrollToSection('hero')}
                className={`text-gray-700 hover:text-blue-600 font-medium transition-all duration-300 hover:scale-105 transform px-3 py-2 rounded-lg hover:bg-blue-50 cursor-pointer ${activeSection === 'hero' ? 'bg-blue-50 text-blue-600' : ''}`}
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection('role-selection')}
                className={`text-gray-700 hover:text-blue-600 font-medium transition-all duration-300 hover:scale-105 transform px-3 py-2 rounded-lg hover:bg-blue-50 cursor-pointer ${activeSection === 'cards' ? 'bg-blue-50 text-blue-600' : ''}`}
              >
                node
              </button>
              <button
                onClick={() => scrollToSection('stats')}
                className={`text-gray-700 hover:text-blue-600 font-medium transition-all duration-300 hover:scale-105 transform px-3 py-2 rounded-lg hover:bg-blue-50 cursor-pointer ${activeSection === 'stats' ? 'bg-blue-50 text-blue-600' : ''}`}
              >
                Stats
              </button>
              <button
                onClick={() => scrollToSection('testimonials')}
                className={`text-gray-700 hover:text-blue-600 font-medium transition-all duration-300 hover:scale-105 transform px-3 py-2 rounded-lg hover:bg-blue-50 cursor-pointer ${activeSection === 'testimonials' ? 'bg-blue-50 text-blue-600' : ''}`}
              >
                Reviews
              </button>
              <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200">
                <button
                  onClick={() => handleRoleSelect('tenant')}
                  className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium transition-all duration-300 rounded-lg hover:bg-blue-50 cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleRoleSelect('owner')}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                >
                  Get Started
                </button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsVisible(prev => ({ ...prev, mobileMenu: !prev.mobileMenu }))}
                className="text-gray-700 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-all duration-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isVisible.mobileMenu && (
            <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => {
                    scrollToSection('hero');
                    setIsVisible(prev => ({ ...prev, mobileMenu: false }));
                  }}
                  className={`text-left text-gray-700 hover:text-blue-600 font-medium py-3 px-3 rounded-lg hover:bg-blue-50 transition-all duration-300 ${activeSection === 'hero' ? 'bg-blue-50 text-blue-600' : ''}`}
                >
                  Home
                </button>
                <button
                  onClick={() => {
                    scrollToSection('role-selection');
                    setIsVisible(prev => ({ ...prev, mobileMenu: false }));
                  }}
                  className={`text-left text-gray-700 hover:text-blue-600 font-medium py-3 px-3 rounded-lg hover:bg-blue-50 transition-all duration-300 ${activeSection === 'cards' ? 'bg-blue-50 text-blue-600' : ''}`}
                >
                  Services
                </button>
                <button
                  onClick={() => {
                    scrollToSection('stats');
                    setIsVisible(prev => ({ ...prev, mobileMenu: false }));
                  }}
                  className={`text-left text-gray-700 hover:text-blue-600 font-medium py-3 px-3 rounded-lg hover:bg-blue-50 transition-all duration-300 ${activeSection === 'stats' ? 'bg-blue-50 text-blue-600' : ''}`}
                >
                  Stats
                </button>
                <button
                  onClick={() => {
                    scrollToSection('testimonials');
                    setIsVisible(prev => ({ ...prev, mobileMenu: false }));
                  }}
                  className={`text-left text-gray-700 hover:text-blue-600 font-medium py-3 px-3 rounded-lg hover:bg-blue-50 transition-all duration-300 ${activeSection === 'testimonials' ? 'bg-blue-50 text-blue-600' : ''}`}
                >
                  Reviews
                </button>
                <div className="flex flex-col space-y-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleRoleSelect('tenant')}
                    className="text-left text-blue-600 hover:text-blue-700 font-medium py-3 px-3 rounded-lg hover:bg-blue-50 transition-all duration-300"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleRoleSelect('owner')}
                    className="text-left bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                  >
                    Get Started
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section with Background Image */}
      <div
        className="relative overflow-hidden min-h-screen pt-16"
        data-section="hero"
        id="hero"
      >
        {/* Background Image - Fixed */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2075&q=80')`
          }}
        ></div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-purple-900/70 to-blue-900/80"></div>

        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 flex items-center min-h-screen">
          <div className={`text-center space-y-8 w-full transition-all duration-1000 ${isVisible.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white drop-shadow-2xl animate-fade-in-up">
                <span className="bg-gradient-to-r from-blue-200 via-purple-200 to-blue-200 bg-clip-text text-transparent">
                  Rental Management
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-200 via-purple-200 to-blue-200 bg-clip-text text-transparent">
                  System
                </span>
              </h1>
              <p className="max-w-2xl mx-auto text-xl md:text-2xl text-blue-300 font-medium leading-relaxed animate-fade-in-up animation-delay-200">
              
                Welcome to <span className="text-blue-500 font-semibold">Faisalabad&apos;s Premier</span> Rental Management Platform
              </p>
              <p className="max-w-xl mx-auto text-lg text-blue-400 animate-fade-in-up animation-delay-400">
                Connecting property owners and tenants with seamless, modern solutions
              </p>
            </div>

            {/* Enhanced Scroll Indicator */}
            <div
              className="mt-12 cursor-pointer hover:scale-110 transition-transform duration-300"
              onClick={() => scrollToSection('role-selection')}
              title="Scroll to explore"
            >
              <div className="w-6 h-10 border-2 border-blue-200/50 rounded-full flex justify-center hover:border-blue-200/80 transition-colors duration-300 mx-auto animate-bounce">
                <div className="w-1 h-3 bg-blue-200/70 rounded-full mt-2 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Interactive Floating Elements - Positioned after content */}
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute top-1/4 left-8 w-20 h-20 bg-blue-400/20 rounded-full opacity-40 animate-pulse cursor-pointer hover:scale-110 transition-transform duration-300 hover:bg-blue-400/40 pointer-events-auto"
              onClick={() => handleFloatingElementClick('blue')}
              title="Click to view Services"
            ></div>
            <div
              className="absolute bottom-1/4 right-8 w-24 h-24 bg-blue-400/20 rounded-full opacity-40 animate-pulse delay-1000 cursor-pointer hover:scale-110 transition-transform duration-300 hover:bg-blue-400/40 pointer-events-auto"
              onClick={() => handleFloatingElementClick('purple')}
              title="Click to view Stats"
            ></div>
            <div
              className="absolute top-1/3 right-16 w-16 h-16 bg-blue-400/20 rounded-full opacity-40 animate-pulse delay-500 cursor-pointer hover:scale-110 transition-transform duration-300 hover:bg-blue-400/40 pointer-events-auto"
              onClick={() => handleFloatingElementClick('teal')}
              title="Click to view Reviews"
            ></div>
          </div>
        </div>
      </div>

      {/* Role Selection Cards with Background */}
      <div
        className="relative py-20"
        data-section="cards"
        id="role-selection"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1486406147304-fd86f028f716?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm"></div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-1000 ${isVisible.cards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">
              Choose Your Journey
            </h2>
            <p className="text-lg text-blue-600 max-w-2xl mx-auto">
              Whether you&apos;re a property owner or looking for your next home, we&apos;ve got you covered
            </p>
          </div>

          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto transition-all duration-1000 ${isVisible.cards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Owner Card */}
            <div className="group relative animate-slide-in-left">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-800 to-purple-800 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl transform transition-all duration-300 hover:scale-105 border border-blue-200/20">
                <div className="text-center space-y-6">
                  <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-300 shadow-lg">
                    <FaBuilding color="white" size="2em" />
                  </div>

                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-blue-900 mb-3">
                      Property Owner
                    </h3>
                    <p className="text-blue-600 leading-relaxed text-lg">
                      Manage your properties effortlessly, handle tenant relationships, and maximize your rental income
                    </p>
                  </div>

                  <div className="space-y-3 text-sm text-blue-500">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Property Management Dashboard</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Tenant Communication Tools</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Payment Tracking & Analytics</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRoleSelect('owner')}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 text-lg"
                  >
                    Continue as Owner
                  </button>
                </div>
              </div>
            </div>

            {/* Tenant Card */}
            <div className="group relative animate-slide-in-right">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-800 to-purple-800 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl transform transition-all duration-300 hover:scale-105 border border-blue-200/20">
                <div className="text-center space-y-6">
                  <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-300 shadow-lg">
                    <FaHome color="white" size="2em" />
                  </div>

                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-blue-900 mb-3">
                      Tenant
                    </h3>
                    <p className="text-blue-600 leading-relaxed text-lg">
                      Discover your perfect home, manage your rental experience, and connect with trusted property owners
                    </p>
                  </div>

                  <div className="space-y-3 text-sm text-blue-500">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Advanced Property Search</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Direct Owner Communication</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Rental History & Documents</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRoleSelect('tenant')}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 text-lg"
                  >
                    Continue as Tenant
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section with Background */}
      <div
        className="relative py-20"
        data-section="stats"
        id="stats"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2126&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-purple-900/90"></div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-12 transition-all duration-1000 ${isVisible.stats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Trusted by Thousands
            </h2>
            <p className="text-lg text-blue-300">
              Join our growing community of satisfied users
            </p>
          </div>

          <div className={`grid grid-cols-2 lg:grid-cols-4 gap-8 transition-all duration-1000 ${isVisible.stats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {stats.map((stat, index) => (
              <div key={index} className={`text-center group animate-fade-in-up`} style={{ animationDelay: `${index * 200}ms` }}>
                <div className="mx-auto w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border border-blue-200/20">
                  <stat.icon color="white" size="2em" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-blue-300 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials with Background */}
      <div
        className="relative py-20"
        data-section="testimonials"
        id="testimonials"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1582407947304-fd86f028f716?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2096&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Light Overlay */}
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm"></div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-12 transition-all duration-1000 ${isVisible.testimonials ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-lg text-blue-600">
              Real experiences from real people
            </p>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto transition-all duration-1000 ${isVisible.testimonials ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {testimonials.map((testimonial, index) => (
              <div key={index} className={`bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow duration-300 border border-blue-200/50 animate-slide-in-up`} style={{ animationDelay: `${index * 300}ms` }}>
                {/* User Profile Section */}
                <div className="flex items-start mb-6">
                  <div className="relative flex-shrink-0">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=3b82f6&color=fff&size=64`;
                      }}
                      className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="font-bold text-blue-900 text-lg">{testimonial.name}</div>
                    <div className="text-blue-600 text-sm font-medium mb-2">{testimonial.role}</div>
                    {/* Star Rating */}
                    <div className="flex items-center">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <FaStar key={i} color="#facc15" size="1em" />
                      ))}
                      <span className="text-blue-500 text-sm ml-2">({testimonial.rating}.0)</span>
                    </div>
                  </div>
                </div>

                {/* Testimonial Text */}
                <div className="relative">
                  <div className="absolute -top-2 -left-2 text-4xl text-blue-300 opacity-30 font-serif leading-none">&quot;</div>
                  <p className="text-blue-700 leading-relaxed text-base italic pl-6 pr-6">
                    {testimonial.text.replace(/"/g, "&quot;")}
                  </p>
                  <div className="absolute -bottom-2 -right-2 text-4xl text-blue-300 opacity-30 font-serif leading-none rotate-180">&quot;</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer with Background */}
      <footer className="relative" style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/95 to-purple-900/95"></div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h3 className="text-3xl font-bold mb-4 text-white">Rental Management System</h3>
          <p className="text-blue-400 mb-6 text-lg">
            Faisalabad&apos;s most trusted platform for rental management
          </p>
          <div className="text-blue-500 text-sm">
            2024 Rental Management System. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slide-in-up {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }

        .animate-slide-in-left {
          animation: slide-in-left 0.8s ease-out forwards;
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.8s ease-out forwards;
        }

        .animate-slide-in-up {
          animation: slide-in-up 0.8s ease-out forwards;
        }

        .animation-delay-200 {
          animation-delay: 200ms;
        }

        .animation-delay-400 {
          animation-delay: 400ms;
        }
      `}</style>
    </div>
  );
}
