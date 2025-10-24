import React, { useState } from "react";
import BuildView from "../components/views/build-view";
import TrainView from "../components/views/train-view";
import TestView from "../components/views/test-view";
import Navbar from "../components/header/Navbar";

export default function Dashboard() {
  const [tab, setTab] = useState<"build" | "train" | "test">("build");

  const handleTabChange = (newTab: "build" | "train" | "test") => {
    setTab(newTab);
  };

  return (
    <div className="min-h-screen bg-[#0f172a]">
      {/* Add padding-top to account for fixed navbar */}
      <div className="pt-16">
        {/* Tab Navigation */}
        <div className="sticky top-14 z-40 bg-[#1e293b]/95 backdrop-blur-md border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex gap-1">
              <button
                className={`px-6 py-3.5 text-sm font-medium relative
                           transition-all duration-200 ease-out
                           ${tab === "build"
                             ? "text-white"
                             : "text-white hover:text-white"
                           }`}
                onClick={() => handleTabChange("build")}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  Build
                </div>
                {tab === "build" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"></div>
                )}
              </button>
              
              <button
                className={`px-6 py-3.5 text-sm font-medium relative
                           transition-all duration-200 ease-out
                           ${tab === "train"
                             ? "text-white"
                             : "text-gray-400 hover:text-white"
                           }`}
                onClick={() => handleTabChange("train")}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Train
                </div>
                {tab === "train" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"></div>
                )}
              </button>
              
              <button
                className={`px-6 py-3.5 text-sm font-medium relative
                           transition-all duration-200 ease-out
                           ${tab === "test"
                             ? "text-white"
                             : "text-gray-400 hover:text-white"
                           }`}
                onClick={() => handleTabChange("test")}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Test
                </div>
                {tab === "test" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"></div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div style={{ display: tab === "build" ? "block" : "none" }}>
            <BuildView />
          </div>
          <div style={{ display: tab === "train" ? "block" : "none" }}>
            <TrainView />
          </div>
          <div style={{ display: tab === "test" ? "block" : "none" }}>
            <TestView />
          </div>
        </div>
      </div>
    </div>
  );
}