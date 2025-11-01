import React, { useState, useEffect } from 'react';

function UserHomePage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const networkOptions = [
    {
      id: 1,
      title: "Image Recognizer NN",
      description: "Build convolutional neural networks for image classification and object detection. Perfect for computer vision projects.",
      status: "active",
      icon: "🖼️",
      href: "/dashboard"
    },
    {
      id: 2,
      title: "Text Prediction NN",
      description: "Create recurrent neural networks for text generation and prediction. Ideal for NLP applications.",
      status: "coming-soon",
      icon: "📝",
      href: "#"
    }
  ];

  return (
    <div className="min-h-screen w-full bg-[#060010] text-white pt-24 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">
            Welcome back!
          </h1>
          <p className="text-gray-400 text-lg text-center mb-12">
            Choose what network to begin with
          </p>
        </div>

        {/* Network Options Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {networkOptions.map((option, idx) => (
            <div
              key={option.id}
              className={`bg-gradient-to-b from-gray-900/50 to-transparent border rounded-xl p-6 transition-all duration-300 cursor-pointer ${
                option.status === 'active' 
                  ? 'border-gray-700 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20' 
                  : 'border-gray-800 opacity-60'
              } ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${200 + idx * 100}ms` }}
              onClick={() => option.status === 'active' && (window.location.href = option.href)}
            >
              <div className="flex items-start gap-4">
                <div className={`text-2xl p-3 rounded-lg ${
                  option.status === 'active' ? 'bg-blue-500/20' : 'bg-gray-700/50'
                }`}>
                  {option.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold">{option.title}</h3>
                    {option.status === 'coming-soon' && (
                      <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 leading-relaxed mb-4">
                    {option.description}
                  </p>
                  {option.status === 'active' ? (
                    <a 
                      href={option.href}
                      className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors"
                    >
                      Start Building →
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-gray-500 font-medium">
                      Available Soon
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div 
          className={`border-t border-gray-800 pt-12 transition-all duration-1000 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ transitionDelay: '500ms' }}
        >
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-2xl font-bold mb-2">0</div>
              <div className="text-gray-400 text-sm">Models Created</div>
            </div>
            <div>
              <div className="text-2xl font-bold mb-2">0</div>
              <div className="text-gray-400 text-sm">Training Jobs</div>
            </div>
            <div>
              <div className="text-2xl font-bold mb-2">1</div>
              <div className="text-gray-400 text-sm">Network Types</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserHomePage;