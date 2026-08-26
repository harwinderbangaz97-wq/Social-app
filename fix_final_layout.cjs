const fs = require('fs');
let content = fs.readFileSync('src/components/ChatView.tsx', 'utf8');

// Replace the Scrollable Body wrapper
const oldWrapperStart = `{/* Scrollable Body */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden no-scrollbar w-full h-full snap-x snap-mandatory">
        <div className="flex flex-row gap-4 h-full w-max min-w-full items-start px-4 py-4 md:justify-center">
          
          {/* Left Column (Messages) */}
          <div className="w-[90vw] sm:w-[450px] md:w-[500px] flex-shrink-0 space-y-4 h-full overflow-y-auto no-scrollbar pb-10 pr-2 snap-center">`;
          
const newWrapperStart = `{/* Scrollable Body - STRICT SIDE-BY-SIDE */}
      <div className="flex-1 flex flex-row overflow-x-auto overflow-y-hidden no-scrollbar w-full h-full snap-x snap-mandatory bg-slate-50/50">
          
          {/* Left Column (Messages) */}
          <div className="w-[92vw] sm:flex-1 sm:max-w-[500px] flex-shrink-0 space-y-4 h-full overflow-y-auto no-scrollbar pb-12 px-4 py-4 snap-center">`;
          
content = content.replace(oldWrapperStart, newWrapperStart);

// Replace the Right Column wrapper
const oldRightWrapperStart = `{/* Right Column (Communities) */}
          <div className="w-[85vw] sm:w-[320px] flex-shrink-0 h-full overflow-y-auto no-scrollbar pb-10 pr-2 snap-center">`;
          
const newRightWrapperStart = `{/* Right Column (Communities) */}
          <div className="w-[92vw] sm:w-[340px] flex-shrink-0 h-full overflow-y-auto no-scrollbar pb-12 px-4 py-4 snap-center border-l border-slate-200/50 bg-white sm:bg-transparent">`;
          
content = content.replace(oldRightWrapperStart, newRightWrapperStart);

// Remove the extra closing divs
const oldEnd = `        </div> {/* End Right Column */}
        </div> {/* End Flex Row Container */}
      </div>`;
const newEnd = `        </div> {/* End Right Column */}
      </div>`;
content = content.replace(oldEnd, newEnd);

fs.writeFileSync('src/components/ChatView.tsx', content);
console.log("Applied final flex layout fix");
