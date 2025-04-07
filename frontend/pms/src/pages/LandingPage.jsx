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
import main1 from "../assets/aboutani.json";  
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
        className="fixed w-full flex justify-between items-center px-5 py-2 bg-gradient-to-r from-blue-700 to-blue-500 text-white shadow-lg z-10"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <motion.img 
            src={logo} 
            alt="PMS Logo" 
            className="h-10 w-auto" 
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
            className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white px-2 py-0.5 rounded-full font-bold shadow-md transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/Login")}
          >
            
            <span>Log In</span>
          </motion.button>

          <motion.button
            className="flex items-center space-x-1 bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white px-2 py-0.5 rounded-full font-bold shadow-md transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/SignIn")}
          >
            
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
            className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-700 to-blue-500 text-transparent bg-clip-text leading-tight"
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
                    animationData={main1} 
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
      {/* Enhanced Footer */}
<footer className="py-12 bg-gradient-to-r from-blue-800 to-blue-900 text-white">
  <div className="max-w-7xl mx-auto px-8">
    {/* Main Footer Content */}
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-8">
      {/* Logo and Company Info */}
      <div className="col-span-1">
        <div className="flex items-center space-x-3 mb-4">
          <img src={logo} alt="PMS Logo" className="h-12 w-auto" />
          <h2 className="text-2xl font-bold">PMS</h2>
        </div>
        <p className="text-blue-200 mt-4">
          Providing professional management solutions since 2010.
        </p>
        <div className="mt-6 flex space-x-4">
          <a href="#" className="text-white hover:text-blue-200">
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
            </svg>
          </a>
          <a href="#" className="text-white hover:text-blue-200">
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
            </svg>
          </a>
          <a href="#" className="text-white hover:text-blue-200">
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
            </svg>
          </a>
          <a href="#" className="text-white hover:text-blue-200">
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
      </div>
      
      {/* Quick Links */}
      <div className="col-span-1">
        <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
        <ul className="space-y-2">
          <li><a href="#" className="text-blue-200 hover:text-white transition">Home</a></li>
          <li><a href="#" className="text-blue-200 hover:text-white transition">About Us</a></li>
          <li><a href="#" className="text-blue-200 hover:text-white transition">Services</a></li>
          <li><a href="#" className="text-blue-200 hover:text-white transition">Contact</a></li>
        </ul>
      </div>
      
      {/* Services */}
      <div className="col-span-1">
        <h3 className="text-lg font-semibold mb-4">Our Services</h3>
        <ul className="space-y-2">
          <li><a href="#" className="text-blue-200 hover:text-white transition">Project Management</a></li>
          <li><a href="#" className="text-blue-200 hover:text-white transition">Business Consulting</a></li>
          <li><a href="#" className="text-blue-200 hover:text-white transition">Strategic Planning</a></li>
          <li><a href="#" className="text-blue-200 hover:text-white transition">Risk Assessment</a></li>
          <li><a href="#" className="text-blue-200 hover:text-white transition">Team Building</a></li>
        </ul>
      </div>
      
      {/* Contact Info */}
      <div className="col-span-1">
        <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
        <div className="space-y-3">
          <p className="flex items-start">
            <svg className="h-5 w-5 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            <span>123 Business Avenue, Suite 100<br />New York, NY 10001</span>
          </p>
          <p className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
            </svg>
            <span>(555) 123-4567</span>
          </p>
          <p className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
            <span>info@pmscompany.com</span>
          </p>
        </div>
      </div>
    </div>
    
    {/* Newsletter Signup */}
    <div className="border-t border-blue-700 pt-8 pb-4">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <h3 className="text-lg font-semibold mb-2">Subscribe to Our Newsletter</h3>
          <p className="text-blue-200">Stay updated with our latest news and offers</p>
        </div>
        <div className="flex w-full md:w-auto">
          <input 
            type="email" 
            placeholder="Your email address" 
            className="px-4 py-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 w-full md:w-64"
          />
          <button className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-r-md font-medium transition">
            Subscribe
          </button>
        </div>
      </div>
    </div>
    
    {/* Bottom Copyright */}
    <div className="border-t border-blue-700 pt-6 mt-4 flex flex-col md:flex-row justify-between items-center">
      <div className="text-blue-200 mb-4 md:mb-0">
        © 2025 PMS. All Rights Reserved.
      </div>
      <div className="flex space-x-6">
        <a href="#" className="text-blue-200 hover:text-white transition">Privacy Policy</a>
        <a href="#" className="text-blue-200 hover:text-white transition">Terms of Service</a>
        <a href="#" className="text-blue-200 hover:text-white transition">Cookie Policy</a>
      </div>
    </div>
  </div>
</footer>
    </div>
  );
}