import React, { useState } from 'react';
import Navbar from '../components/navbar';
import Sidebar from '../components/sidebar';
import { 
  MapPin, 
  Wrench, 
  List, 
  Lightbulb, 
  Shield,
  HelpCircle,
  X 
} from 'lucide-react';

const Help = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCard, setSelectedCard] = useState(null);

  // Help Cards Data with extended dialog content
  const helpCards = [
    {
      icon: <MapPin className="w-10 h-10 text-blue-500" />,
      title: 'Workspaces',
      description: 'Quickly access and manage your project workspaces and team collaborations.',
      dialogContent: {
        title: 'Workspace Management',
        description: `Workspaces are your central hub for project organization and team collaboration.`,
        features: [
          'Create and customize project workspaces',
          'Invite team members with specific roles',
          'Set workspace-level permissions',
          'Track project progress across multiple workspaces',
          'Integrate with communication tools'
        ],
        bestPractices: [
          'Keep workspaces focused on specific projects or departments',
          'Regularly update workspace access and permissions',
          'Use clear, descriptive workspace names'
        ]
      }
    },
    {
      icon: <Wrench className="w-10 h-10 text-green-500" />,
      title: 'Tools & Sprints',
      description: 'Explore project management tools and track your sprint progress efficiently.',
      dialogContent: {
        title: 'Sprint Planning and Tracking',
        description: `Powerful tools to manage your agile development process and sprint workflows.`,
        features: [
          'Create and manage sprint backlogs',
          'Real-time sprint progress tracking',
          'Burndown charts and velocity metrics',
          'Sprint planning poker',
          'Automated sprint retrospective templates'
        ],
        bestPractices: [
          'Set clear sprint goals',
          'Maintain a consistent sprint length',
          'Conduct thorough sprint retrospectives',
          'Continuously refine your backlog'
        ]
      }
    },
    {
      icon: <List className="w-10 h-10 text-purple-500" />,
      title: 'Bugs Queue',
      description: 'Monitor and manage bug reports with our comprehensive tracking system.',
      dialogContent: {
        title: 'Bug Tracking and Management',
        description: `Streamline your bug reporting, prioritization, and resolution process.`,
        features: [
          'Automated bug categorization',
          'Severity and priority tagging',
          'Assignee tracking',
          'Integration with development workflows',
          'Detailed bug history and comments'
        ],
        bestPractices: [
          'Provide clear, reproducible steps',
          'Include environment and version details',
          'Prioritize bugs based on impact',
          'Communicate regularly on bug status'
        ]
      }
    },
    {
      icon: <Lightbulb className="w-10 h-10 text-yellow-500" />,
      title: 'Retrospectives',
      description: 'Conduct insightful team retrospectives to improve project workflows.',
      dialogContent: {
        title: 'Team Retrospective Insights',
        description: `Structured approach to continuous team improvement and learning.`,
        features: [
          'Customizable retrospective templates',
          'Anonymous feedback collection',
          'Action item tracking',
          'Trend analysis across retrospectives',
          'Integration with project management tools'
        ],
        bestPractices: [
          'Create a safe, non-judgmental environment',
          'Focus on actionable improvements',
          'Rotate retrospective facilitators',
          'Follow up on previous action items'
        ]
      }
    },
    {
      icon: <Shield className="w-10 h-10 text-red-500" />,
      title: 'Security & Compliance',
      description: 'Learn about our security measures and compliance standards.',
      dialogContent: {
        title: 'Security and Compliance Framework',
        description: `Comprehensive security measures to protect your project data and ensure regulatory compliance.`,
        features: [
          'Multi-factor authentication',
          'Role-based access control',
          'Data encryption at rest and in transit',
          'Audit logs and activity tracking',
          'Compliance with GDPR, HIPAA, and SOC 2'
        ],
        bestPractices: [
          'Regularly update passwords',
          'Limit access to sensitive information',
          'Conduct periodic security training',
          'Monitor and review access logs'
        ]
      }
    },
    {
      icon: <HelpCircle className="w-10 h-10 text-blue-600" />,
      title: 'Support Center',
      description: 'Get help from our support team and access comprehensive resources.',
      dialogContent: {
        title: 'Customer Support and Resources',
        description: `Dedicated support to ensure you get the most out of our project management system.`,
        features: [
          '24/7 customer support',
          'Comprehensive knowledge base',
          'Video tutorials and webinars',
          'Community forums',
          'Personalized onboarding assistance'
        ],
        bestPractices: [
          'Check knowledge base before contacting support',
          'Provide detailed context in support tickets',
          'Participate in community forums',
          'Attend regular product training sessions'
        ]
      }
    }
  ];

  // Filter cards based on search term
  const filteredCards = helpCards.filter(card => 
    card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Custom Dialog Component
  const CustomDialog = ({ card, onClose }) => {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-[32rem] max-h-[90vh] overflow-y-auto relative">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
          >
            <X className="w-6 h-6" />
          </button>
          
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">{card.dialogContent.title}</h2>
          
          <p className="mb-6 text-gray-600">
            {card.dialogContent.description}
          </p>
          
          <div className="mb-6">
            <h4 className="text-xl font-semibold mb-3 text-gray-800">Key Features:</h4>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {card.dialogContent.features.map((feature, idx) => (
                <li key={idx}>{feature}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-semibold mb-3 text-gray-800">Best Practices:</h4>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {card.dialogContent.bestPractices.map((practice, idx) => (
                <li key={idx}>{practice}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 overflow-auto w-full h-full p-4 bg-white">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                Welcome to PMS Help Center
              </h1>
              <p className="text-xl text-gray-600">
                Find answers, get support, and optimize your project management workflow
              </p>
            </div>

            <div className="search-bar mb-12">
              <div className="relative max-w-xl mx-auto">
                <input 
                  type="text" 
                  placeholder="Search for answers..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {filteredCards.map((card, index) => (
                <div 
                  key={index} 
                  className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer"
                  onClick={() => setSelectedCard(card)}
                >
                  <div className="flex justify-center mb-4">
                    {card.icon}
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-gray-800">
                    {card.title}
                  </h3>
                  <p className="text-gray-600">
                    {card.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Custom Dialog */}
            {selectedCard && (
              <CustomDialog 
                card={selectedCard} 
                onClose={() => setSelectedCard(null)} 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;