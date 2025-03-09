import { useState } from "react";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import { 
  FaUser, FaSignInAlt, FaSyncAlt, FaChartBar, FaBullseye, 
  FaEnvelope, FaLock, FaExclamationTriangle 
} from "react-icons/fa";
import logo from "../assets/logo.png";
import heroAnimation from "../assets/hero.json"; 
import aboutAnimation from "../assets/about.json"; 
import aboutAnimation2 from "../assets/effect.json"; 
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-300 text-gray-700 min-h-screen">
      
      {/* Navbar */}
      <nav className="fixed w-full flex justify-between items-center px-8 py-4 bg-blue-600 text-white shadow-md z-10">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <img src={logo} alt="PMS Logo" className="h-12 w-auto" />
          <h1 className="text-2xl font-bold">PMS</h1>
        </div>

        {/* Links & Buttons */}
        <div className="flex items-center space-x-6 text-lg">
          <a href="#about" className="hover:text-gray-300">About</a>
          <a href="#features" className="hover:text-gray-300">Features</a>
          <a href="#contact" className="hover:text-gray-300">Contact</a>
          
          <motion.button
            className="flex items-center space-x-2 bg-orange-500 px-4 py-2 rounded-full font-bold"
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate("/SignIn")}
          >
            <FaSignInAlt />
            <span>Log In</span>
          </motion.button>

          <motion.button
            className="flex items-center space-x-2 bg-orange-500 px-4 py-2 rounded-full font-bold"
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate("/SignIn")}
          >
            <FaUser />
            <span>Sign Up</span>
          </motion.button>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.header 
        className="flex flex-col md:flex-row items-center justify-between text-center md:text-left min-h-screen px-16 pt-[80px]"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <div className="md:w-1/2 space-y-6">
          <h2 className="text-5xl font-bold">Elevate Your Project Management</h2>
          <p className="text-xl text-gray-700">
            Streamline workflows, track progress efficiently, and collaborate seamlessly with AI-driven solutions.
          </p>
          <motion.button
            className="px-8 py-3 bg-orange-500 text-white text-xl font-bold rounded-full shadow-lg"
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate("/SignIn")} 
          >
            Get Started
          </motion.button>
        </div>

        <div className="md:w-1/2 flex justify-end">
          <Lottie animationData={heroAnimation} className="w-[500px] md:w-[550px]" />
        </div>
      </motion.header>

      {/* About Section */}
      <motion.section 
        id="about" 
        className="py-20 bg-white mt-[80px] text-center"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <h3 className="text-5xl font-bold text-center mb-12">ABOUT PMS</h3>

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 px-8 items-center">
          <Lottie animationData={aboutAnimation} className="w-full" />
          <div className="text-left space-y-4">
            <h4 className="text-2xl font-bold">AI-Driven Efficiency</h4>
            <p className="text-lg">
              Automate tasks, optimize workflows, and boost productivity with AI-powered solutions.
            </p>
            <p className="text-lg">
              PMS helps reduce manual workload, minimize errors, and provide predictive analytics to ensure smooth project execution.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        id="features" 
        className="py-20 bg-gray-100 text-gray-900 w-full flex flex-col items-center mt-[80px]"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <h3 className="text-5xl font-bold text-center mb-12">AI-Powered Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 w-full max-w-7xl px-8">
          {[
            { icon: <FaSyncAlt />, title: "Task Automation", desc: "AI assigns tasks & predicts deadlines." },
            { icon: <FaChartBar />, title: "AI-Driven Analytics", desc: "Optimize workload & prevent delays." },
            { icon: <FaBullseye />, title: "Smart Collaboration", desc: "AI chatbots & meeting summaries." },
            { icon: <FaEnvelope />, title: "Document Management", desc: "Auto-reports & version tracking." },
            { icon: <FaLock />, title: "AI Security", desc: "Detect anomalies & secure access." },
            { icon: <FaExclamationTriangle />, title: "Risk Management", desc: "AI predicts risks & suggests fixes." },
          ].map((feature, index) => (
            <motion.div 
              key={index} 
              className="p-8 rounded-2xl shadow-xl text-center transform hover:scale-105 transition-all duration-300 bg-white"
              whileHover={{ rotateY: 10 }}
            >
              <div className="text-5xl mb-4 text-blue-600 flex justify-center">{feature.icon}</div>
              <h4 className="text-2xl font-bold">{feature.title}</h4>
              <p className="text-lg">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
