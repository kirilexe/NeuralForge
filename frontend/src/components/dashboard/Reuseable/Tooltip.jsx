export default function Tooltip({
  title,
  type,
  explanation,
  smaller,
  bigger,
  recommendation,
  position = "top", // default position
}) {
  const positionClasses = {
    top: "bottom-full mb-3 left-1/2 -translate-x-1/2",
    bottom: "top-full mt-3 left-1/2 -translate-x-1/2",
    left: "right-full mr-3 top-1/2 -translate-y-1/2",
    right: "left-full ml-3 top-1/2 -translate-y-1/2",
  };

  return (
    <div className="relative group inline-block cursor-pointer select-none">
      <div className="flex items-center justify-center w-3.5 h-3.5 text-[10px] font-semibold text-gray-500 rounded-full 
                      border border-gray-600/70 /* Added subtle gray border */
                      hover:text-blue-400 hover:bg-gray-800 hover:border-blue-500 /* Hover effects */
                      transition-colors duration-200">
        i
      </div>

      <div
        className={`
          absolute z-50 
          group-hover:block 
          w-80 p-4 
          bg-gray-800/95 
          backdrop-blur-sm 
          border border-purple-700/50 
          rounded-xl 
          shadow-2xl shadow-blue-900/40
          ${positionClasses[position]} 
          
          opacity-0 group-hover:opacity-100 
          scale-0 group-hover:scale-100 
          transition-all duration-300 origin-center
        `}
      >
        <h3 className="font-bold text-gray-100 text-lg mb-2 pb-1 border-b border-purple-600/50">
          {title}
        </h3>
        <p className="text-xs text-gray-400 mb-2">
          Type: 
          <span className="font-medium text-blue-400 ml-1 border-b border-purple-400/50">
            {type}
          </span>
        </p>

        <p className="text-sm text-gray-300 mb-3">{explanation}</p>
        
        <div className="text-xs text-gray-200 space-y-1 mb-3 bg-gray-700/50 p-2 rounded-lg">
          <p>
            <b className="text-blue-300">Smaller value:</b> {smaller}
          </p>
          <p>
            <b className="text-blue-300">Bigger value:</b> {bigger}
          </p>
        </div>

        <p className="text-sm text-gray-100 border-t border-purple-600/50 pt-2">
          <b className="text-blue-400">Recommended approach:</b> {recommendation}
        </p>
      </div>
    </div>
  );
}