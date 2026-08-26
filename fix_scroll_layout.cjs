const fs = require('fs');
let content = fs.readFileSync('src/components/ChatView.tsx', 'utf8');

// Replace the Scrollable Body wrapper
const oldWrapperStart = `<div className="flex-1 overflow-x-auto overflow-y-hidden no-scrollbar px-3.5 w-full h-full flex flex-col">
        <div className="flex flex-row gap-6 max-w-[1000px] mx-auto items-start justify-center min-w-[700px] h-full py-4">
          
          {/* Left Column (Messages) */}
          <div className="flex-1 min-w-[350px] max-w-[500px] space-y-4 h-full overflow-y-auto no-scrollbar pb-10 pr-2">`;
          
const newWrapperStart = `<div className="flex-1 overflow-x-auto overflow-y-hidden no-scrollbar w-full h-full snap-x snap-mandatory">
        <div className="flex flex-row gap-4 h-full w-max min-w-full items-start px-4 py-4 md:justify-center">
          
          {/* Left Column (Messages) */}
          <div className="w-[90vw] sm:w-[450px] md:w-[500px] flex-shrink-0 space-y-4 h-full overflow-y-auto no-scrollbar pb-10 pr-2 snap-center">`;
          
content = content.replace(oldWrapperStart, newWrapperStart);

// Replace the Right Column wrapper
const oldRightWrapperStart = `{/* Right Column (Communities) */}
          <div className="w-[320px] flex-shrink-0 h-full overflow-y-auto no-scrollbar pb-10 pr-2">`;
          
const newRightWrapperStart = `{/* Right Column (Communities) */}
          <div className="w-[85vw] sm:w-[320px] flex-shrink-0 h-full overflow-y-auto no-scrollbar pb-10 pr-2 snap-center">`;
          
content = content.replace(oldRightWrapperStart, newRightWrapperStart);

fs.writeFileSync('src/components/ChatView.tsx', content);
console.log("Applied flex layout fix");
