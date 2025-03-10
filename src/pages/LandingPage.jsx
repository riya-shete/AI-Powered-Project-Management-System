import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import { 
  FaUser, FaSignInAlt, FaSyncAlt, FaChartBar, FaBullseye, 
  FaEnvelope, FaLock, FaExclamationTriangle, FaMapMarkerAlt, FaPhone, FaCheckCircle
} from "react-icons/fa";
import logo from "../assets/logo.png";
import heroAnimation from "../assets/hero.json"; 
import aboutAnimation from "../assets/about.json"; 
import aboutAnimation2 from "../assets/about1.json";
import aboutAnimation3 from "../assets/about2.json";  
import { useNavigate } from "react-router-dom";


export default function LandingPage() {
  const navigate = useNavigate();
  const [showAlert, setShowAlert] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  
  // Animation variants for consistent animations
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setShowAlert(true);
    // Reset form
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: ""
    });
    // Hide alert after 4 seconds
    setTimeout(() => {
      setShowAlert(false);
    }, 4000);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen font-sans">
      
      {/* Navbar */}
      <motion.nav 
        className="fixed w-full flex justify-between items-center px-8 py-4 bg-gradient-to-r from-blue-700 to-blue-500 text-white shadow-lg z-10"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <motion.img 
            src={logo} 
            alt="PMS Logo" 
            className="h-12 w-auto" 
            whileHover={{ rotate: 10, scale: 1.05 }}
          />
          <h1 className="text-2xl font-bold tracking-wide">PMS</h1>
        </div>

        {/* Links & Buttons */}
        <div className="flex items-center space-x-6 text-lg">
          <motion.a 
            href="#about" 
            className="hover:text-gray-200 relative group"
            whileHover={{ scale: 1.05 }}
          >
            About
            <motion.span 
              className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"
            />
          </motion.a>
          <motion.a 
            href="#features" 
            className="hover:text-gray-200 relative group"
            whileHover={{ scale: 1.05 }}
          >
            Features
            <motion.span 
              className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"
            />
          </motion.a>
          <motion.a 
            href="#contact" 
            className="hover:text-gray-200 relative group"
            whileHover={{ scale: 1.05 }}
          >
            Contact
            <motion.span 
              className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"
            />
          </motion.a>
          
          <motion.button
            className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white px-5 py-2 rounded-full font-bold shadow-md transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/Login")}
          >
            <FaSignInAlt />
            <span>Log In</span>
          </motion.button>

          <motion.button
            className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white px-5 py-2 rounded-full font-bold shadow-md transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/SignIn")}
          >
            <FaUser />
            <span>Sign Up</span>
          </motion.button>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.header 
        className="flex flex-col md:flex-row items-center justify-between min-h-screen px-8 md:px-16 pt-28 md:pt-24 max-w-7xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.3
            }
          }
        }}
      >
        {/* Left Side - Hero Text */}
        <div className="md:w-1/2 space-y-8 text-center md:text-left mb-12 md:mb-0">
          <motion.h2 
            className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-700 to-purple-600 text-transparent bg-clip-text leading-tight"
            variants={fadeInUp}
          >
            Elevate Your Project Management
          </motion.h2>
          <motion.p 
            className="text-xl md:text-2xl text-gray-700 max-w-lg mx-auto md:mx-0"
            variants={fadeInUp}
          >
            Streamline workflows, track progress efficiently, and collaborate seamlessly with AI-driven solutions.
          </motion.p>
          <motion.button
            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white text-xl font-bold rounded-full shadow-lg transform transition-all duration-300"
            whileHover={{ scale: 1.05, boxShadow: "0px 10px 25px rgba(79, 70, 229, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/Login")} 
            variants={fadeInUp}
          >
            Get Started
          </motion.button>
        </div>

        {/* Right Side - Lottie Animation */}
        <motion.div 
          className="md:w-1/2 flex justify-center md:justify-end"
          variants={fadeInUp}
        >
          <Lottie 
            animationData={aboutAnimation3} 
            className="w-full max-w-[500px] md:max-w-[600px]" 
          />
        </motion.div>
      </motion.header>

      {/* About Section - Enhanced with larger animations */}
      <motion.section 
        id="about" 
        className="py-20 bg-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-8">
          <motion.h3 
            className="text-4xl md:text-4xl font-bold text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <span className="bg-gradient-to-r from-blue-700 to-purple-600 text-transparent bg-clip-text">ABOUT PMS</span>
          </motion.h3>

          {/* New card-based layout for About section with LARGER animations */}
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div 
              className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="flex flex-col items-center gap-6">
                <div className="w-full">
                  {/* Increased animation size */}
                  <Lottie 
                    animationData={aboutAnimation} 
                    className="w-full h-64 md:h-80 mx-auto" 
                    loop={true}
                  />
                </div>
                <div className="space-y-4 text-center">
                  <h4 className="text-2xl font-bold text-blue-700">AI-Driven Efficiency</h4>
                  <p className="text-lg">
                    Automate tasks, optimize workflows, and boost productivity with AI-powered solutions.
                  </p>
                  <p className="text-lg">
                    PMS helps reduce manual workload, minimize errors, and provide predictive analytics to ensure smooth project execution.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="flex flex-col items-center gap-6">
                <div className="w-full">
                  {/* Increased animation size */}
                  <Lottie 
                    animationData={aboutAnimation2} 
                    className="w-full h-94 md:h-80 mx-auto" 
                    loop={true}
                  />
                </div>
                <div className="space-y-4 text-center">
                  <h4 className="text-2xl font-bold text-purple-700">Smart Analytics & Insights</h4>
                  <p className="text-lg">
                    Leverage data-driven insights for better decision-making and enhanced project tracking.
                  </p>
                  <p className="text-lg">
                    PMS provides smart alerts, resource optimization, and AI-generated reports to maximize efficiency.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Additional descriptive section */}
          <motion.div 
            className="mt-16 text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h4 className="text-2xl font-bold text-gray-800 mb-4">Why Choose PMS?</h4>
            <p className="text-xl text-gray-700">
              Our AI-powered project management system adapts to your team's unique workflow, learning and improving with every project. Experience the future of project management today.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section - Improved UI */}
      <motion.section 
        id="features" 
        className="py-20 bg-gradient-to-b from-gray-50 to-gray-100 text-gray-700"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-8">
          <motion.h3 
            className="text-4xl md:text-4xl font-bold text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <span className="bg-gradient-to-r from-blue-700 to-purple-600 text-transparent bg-clip-text">AI-Powered Features</span>
          </motion.h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { 
                icon: <FaSyncAlt />, 
                title: "Task Automation", 
                desc: "AI assigns tasks & predicts deadlines based on team capacity and project history.",
                color: "from-blue-500 to-cyan-500" 
              },
              { 
                icon: <FaChartBar />, 
                title: "AI-Driven Analytics", 
                desc: "Optimize workload distribution & prevent delays with intelligent resource allocation.",
                color: "from-purple-500 to-pink-500" 
              },
              { 
                icon: <FaBullseye />, 
                title: "Smart Collaboration", 
                desc: "AI chatbots assist teams & automatically generate meeting summaries and action items.",
                color: "from-green-500 to-teal-500" 
              },
              { 
                icon: <FaEnvelope />, 
                title: "Document Management", 
                desc: "Auto-generate reports & track document versions with intelligent content analysis.",
                color: "from-orange-500 to-red-500" 
              },
              { 
                icon: <FaLock />, 
                title: "AI Security", 
                desc: "Detect anomalies in system access patterns & enforce secure permission controls.",
                color: "from-indigo-500 to-blue-500" 
              },
              { 
                icon: <FaExclamationTriangle />, 
                title: "Risk Management", 
                desc: "AI predicts potential project risks & suggests mitigation strategies before issues arise.",
                color: "from-yellow-500 to-amber-500" 
              },
            ].map((feature, index) => (
              <motion.div 
                key={index} 
                className="p-8 rounded-2xl shadow-xl text-center bg-white hover:shadow-2xl transition-all duration-300 border border-gray-100"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ 
                  y: -10, 
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                }}
              >
                <div className={`text-5xl mb-6 mx-auto w-20 h-20 flex items-center justify-center rounded-full text-white bg-gradient-to-r ${feature.color} shadow-lg`}>
                  {feature.icon}
                </div>
                <h4 className="text-2xl font-bold mb-3 text-gray-800">{feature.title}</h4>
                <p className="text-lg text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Contact Us Section - Improved with alert functionality */}
      <motion.section 
        id="contact" 
        className="py-20 bg-white relative"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-8">
          <motion.h3 
            className="text-4xl md:text-4xl font-bold text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <span className="bg-gradient-to-r from-blue-700 to-purple-600 text-transparent bg-clip-text">CONTACT US</span>
          </motion.h3>
          
          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-10">
            {[
              { 
                icon: <FaMapMarkerAlt />, 
                title: "Address", 
                content: "VIIT Pune",
                color: "from-blue-500 to-blue-700" 
              },
              { 
                icon: <FaEnvelope />, 
                title: "Email", 
                content: "contact@pms.com",
                color: "from-purple-500 to-purple-700" 
              },
              { 
                icon: <FaPhone />, 
                title: "Phone", 
                content: "+1 234 567 890",
                color: "from-teal-500 to-teal-700" 
              }
            ].map((item, index) => (
              <motion.div 
                key={index}
                className="p-6 rounded-xl shadow-lg bg-white text-center hover:shadow-xl transition-all duration-300 border border-gray-50"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${item.color} flex items-center justify-center text-white text-3xl shadow-md`}>
                  {item.icon}
                </div>
                <h4 className="text-xl font-bold mb-2 text-gray-800">{item.title}</h4>
                <p className="text-lg text-gray-700">{item.content}</p>
              </motion.div>
            ))}
          </div>
          
          {/* Contact Form with Alert */}
          <motion.div 
            className="mt-16 max-w-2xl mx-auto p-8 bg-gray-50 rounded-2xl shadow-lg border border-gray-100"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h4 className="text-2xl font-bold mb-6 text-center text-gray-800">Send us a message</h4>
            <form className="space-y-6" onSubmit={handleFormSubmit}>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 mb-2">Name</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Email</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Subject</label>
                <input 
                  type="text" 
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Message</label>
                <textarea 
                  rows="4" 
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                ></textarea>
              </div>
              <motion.button 
                type="submit" 
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold rounded-lg shadow-md"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Send Message
              </motion.button>
            </form>
          </motion.div>
        </div>

        {/* Success Alert */}
        <AnimatePresence>
          {showAlert && (
            <motion.div 
              className="fixed bottom-8 right-8 bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg shadow-lg flex items-center space-x-3 z-50"
              initial={{ opacity: 0, y: 50, scale: 0.3 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <FaCheckCircle className="text-2xl" />
              <div>
                <h4 className="font-bold">Message Sent!</h4>
                <p>We'll get back to you soon.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      {/* Footer */}
      <footer className="py-8 bg-gradient-to-r from-blue-800 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <img src={logo} alt="PMS Logo" className="h-10 w-auto" />
            <h2 className="text-xl font-bold">PMS</h2>
          </div>
          <div className="text-center md:text-right">
            <p>© 2025 PMS. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}