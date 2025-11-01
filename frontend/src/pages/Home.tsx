import React, { useState, useEffect } from 'react';
//@ts-ignore
function TextType({ text, typingSpeed = 75, pauseDuration = 1500, showCursor = true, cursorCharacter = "_" }) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [textArrayIndex, setTextArrayIndex] = useState(0);

  useEffect(() => {
    const currentText = text[textArrayIndex];
    
    const timer = setTimeout(() => {
      if (!isDeleting) {
        if (currentIndex < currentText.length) {
          setDisplayText(currentText.substring(0, currentIndex + 1));
          setCurrentIndex(currentIndex + 1);
        } else {
          setTimeout(() => setIsDeleting(true), pauseDuration);
        }
      } else {
        if (currentIndex > 0) {
          setDisplayText(currentText.substring(0, currentIndex - 1));
          setCurrentIndex(currentIndex - 1);
        } else {
          setIsDeleting(false);
          setTextArrayIndex((textArrayIndex + 1) % text.length);
        }
      }
    }, isDeleting ? typingSpeed / 2 : typingSpeed);

    return () => clearTimeout(timer);
  }, [currentIndex, isDeleting, textArrayIndex, text, typingSpeed, pauseDuration]);

  return (
    <span className="font-mono">
      {displayText}
      {showCursor && <span className="animate-pulse">{cursorCharacter}</span>}
    </span>
  );
}

function HomePage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      title: "Rapid Prototyping",
      description: "Build and iterate on ML neural networks in minutes with our intuitive interface."
    },
    {
      title: "Learn & Create",
      description: "On-hands learning with real time feedback, hyperparameter tuning and detailed explanations on everything you can change."
    },
    {
      title: "Save time & Resources",
      description: "Build, train and test models faster with no code required, all in the interface."
    }
  ];

  return (
    <div className="min-h-screen w-full bg-[#060010] text-white pt-24 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            <TextType 
              text={["Welcome to Neuralforge!", "Build and deploy ML models with ease."]}
              typingSpeed={75}
              pauseDuration={1500}
              showCursor={true}
              cursorCharacter="_"
            />
          </h1>
          
          <p className="text-gray-400 text-lg md:text-xl mb-12 max-w-2xl leading-relaxed">
            A modern platform for machine learning engineers of all kinds who want to build and prototype models faster than ever before.
          </p>

          <div className="flex gap-4 mb-20">
            <button className="bg-white text-black px-8 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200">
              Get Started
            </button>
            <button className="border border-gray-700 px-8 py-3 rounded-lg font-medium hover:border-gray-500 transition-colors duration-200">
              View Docs
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className={`bg-gradient-to-b from-gray-900/50 to-transparent border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all duration-300 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${200 + idx * 100}ms` }}
            >
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div 
          className={`border-t border-gray-800 pt-12 pb-20 transition-all duration-1000 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ transitionDelay: '500ms' }}
        >
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="text-gray-400 text-sm">Uptime</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">&lt;100ms</div>
              <div className="text-gray-400 text-sm">Latency</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10k+</div>
              <div className="text-gray-400 text-sm">Models Deployed</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div 
          className={`text-center pb-20 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '700ms' }}
        >
          <h2 className="text-3xl font-bold mb-4">Ready to build something amazing?</h2>
          <p className="text-gray-400 mb-8">Join thousands of developers already using NeuralForge.</p>
          <a href="/register">
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 px-10 py-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg">
              Sign up for free.
            </button>
          </a> 
        </div>
      </div>
    </div>
  );
}

export default HomePage;