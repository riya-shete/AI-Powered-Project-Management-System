"use client";

import React, { useState } from "react";
import Navbar from '../components/navbar';
import Sidebar from '../components/sidebar';
import {
  Search,
  Filter,
  Star,
  Clock,
  Users,
  ArrowRight,
  Briefcase,
  Calendar,
  BarChart3,
  FileText,
} from "lucide-react";

const ExploreTemplates = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar className="w-64 flex-shrink-0" />
        {/* Wrap MainContent in a flex-1 container so it takes the rest of the space */}
        <div className="flex-1 overflow-auto">
          <MainContent />
        </div>
      </div>
    </div>
  );
};

const MainContent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = [
    { id: "all", name: "All Templates" },
    { id: "project", name: "Project Management" },
    { id: "marketing", name: "Marketing" },
    { id: "hr", name: "HR & Recruiting" },
    { id: "product", name: "Product Development" },
    { id: "operations", name: "Operations" },
  ];

  const templates = [
    {
      id: 1,
      title: "Project Roadmap",
      description: "Plan your project timeline with milestones and deliverables",
      category: "project",
      icon: <Calendar className="h-8 w-8 text-blue-500" />,
      popular: true,
      users: 2345,
    },
    {
      id: 2,
      title: "Marketing Campaign",
      description: "Track and manage your marketing campaigns from start to finish",
      category: "marketing",
      icon: <BarChart3 className="h-8 w-8 text-blue-500" />,
      popular: true,
      users: 1890,
    },
    {
      id: 3,
      title: "Employee Onboarding",
      description: "Streamline your onboarding process for new team members",
      category: "hr",
      icon: <Users className="h-8 w-8 text-blue-500" />,
      popular: false,
      users: 1245,
    },
    {
      id: 4,
      title: "Sprint Planning",
      description: "Organize your agile sprints with this comprehensive template",
      category: "product",
      icon: <Clock className="h-8 w-8 text-blue-500" />,
      popular: true,
      users: 2100,
    },
    {
      id: 5,
      title: "Resource Allocation",
      description: "Manage team resources and track availability",
      category: "operations",
      icon: <Briefcase className="h-8 w-8 text-blue-500" />,
      popular: false,
      users: 980,
    },
    {
      id: 6,
      title: "Content Calendar",
      description: "Plan and schedule your content across multiple channels",
      category: "marketing",
      icon: <FileText className="h-8 w-8 text-blue-500" />,
      popular: false,
      users: 1560,
    },
  ];

  const filteredTemplates = templates.filter(
    (template) =>
      (activeCategory === "all" || template.category === activeCategory) &&
      template.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-gradient-to-b from-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8 rounded-xl">
      {/* Header */}
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
          Explore <span className="text-blue-500">Templates</span>
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Jumpstart your projects with our professionally designed templates. Save time and follow best practices.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 w-full md:w-auto">
            <Filter className="h-5 w-5 text-gray-500 hidden md:block" />
            <span className="text-sm font-medium text-gray-500 hidden md:block">Filter:</span>
            <div className="flex space-x-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
                    activeCategory === category.id
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-600 hover:bg-blue-50 border border-gray-200"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden group"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-blue-50 rounded-lg">{template.icon}</div>
                  {template.popular && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <Star className="h-3.5 w-3.5 mr-1 text-blue-500" />
                      Popular
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.title}</h3>
                <p className="text-gray-600 mb-4">{template.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {template.users.toLocaleString()} users
                  </span>
                  <button className="text-blue-500 font-medium text-sm flex items-center group-hover:text-blue-700 transition-colors">
                    Use template
                    <ArrowRight className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-blue-50 inline-flex rounded-full p-4 mb-4">
              <Search className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No templates found</h3>
            <p className="text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
          </div>
        )}
      </div>

      {/* View All Templates Button */}
      <div className="max-w-7xl mx-auto mt-10 text-center">
        <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
          View all templates
          <ArrowRight className="ml-2 h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default ExploreTemplates;
