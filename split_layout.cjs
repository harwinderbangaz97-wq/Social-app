const fs = require('fs');
let content = fs.readFileSync('src/components/ChatView.tsx', 'utf8');

// 1. Replace Scrollable Body wrapper
const oldWrapperStart = '<div className="flex-1 overflow-y-auto no-scrollbar px-3.5 py-3 space-y-4 max-w-xl mx-auto w-full">';
const newWrapperStart = `<div className="flex-1 overflow-y-auto no-scrollbar px-3.5 py-4 w-full">
        <div className="flex flex-col md:flex-row gap-6 max-w-[900px] mx-auto items-start">
          
          {/* Left Column (Messages) */}
          <div className="flex-1 w-full space-y-4 max-w-xl mx-auto md:mx-0">`;
content = content.replace(oldWrapperStart, newWrapperStart);

// 2. Replace Communities Section start
const oldCommunitiesStart = `        {/* Communities Section */}
        <div className="mt-8 pt-6 border-t border-slate-200/50">`;
const newCommunitiesStart = `          </div> {/* End Left Column */}

          {/* Right Column (Communities) */}
          <div className="w-full md:w-[320px] flex-shrink-0 mt-2 md:mt-0 lg:sticky lg:top-4">
            {/* Communities Section */}
            <div className="pt-6 border-t border-slate-200/50 md:pt-0 md:border-t-0">`;
content = content.replace(oldCommunitiesStart, newCommunitiesStart);

// 3. Add closing div at the end of the Communities block
// We'll search for the Discover More Communities button end.
const oldEnd = `            Discover More Communities
          </button>
        </div>
      </div>`;
const newEnd = `            Discover More Communities
          </button>
        </div>
        </div> {/* End Right Column */}
        </div> {/* End Flex Row Container */}
      </div>`;
content = content.replace(oldEnd, newEnd);

fs.writeFileSync('src/components/ChatView.tsx', content);
console.log("Replaced layout successfully.");
