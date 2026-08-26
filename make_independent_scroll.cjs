const fs = require('fs');
let content = fs.readFileSync('src/components/ChatView.tsx', 'utf8');

// The main body container:
content = content.replace(
  '<div className="flex-1 overflow-y-auto overflow-x-auto no-scrollbar px-3.5 py-4 w-full">',
  '<div className="flex-1 overflow-x-auto overflow-y-hidden no-scrollbar px-3.5 w-full h-full flex flex-col">'
);

// The flex-row container:
content = content.replace(
  '<div className="flex flex-row gap-6 max-w-[1000px] mx-auto items-start justify-center min-w-[700px]">',
  '<div className="flex flex-row gap-6 max-w-[1000px] mx-auto items-start justify-center min-w-[700px] h-full py-4">'
);

// Left Column:
content = content.replace(
  '<div className="flex-1 min-w-[350px] max-w-[500px] space-y-4">',
  '<div className="flex-1 min-w-[350px] max-w-[500px] space-y-4 h-full overflow-y-auto no-scrollbar pb-10 pr-2">'
);

// Right Column:
content = content.replace(
  '<div className="w-[320px] flex-shrink-0 sticky top-0">',
  '<div className="w-[320px] flex-shrink-0 h-full overflow-y-auto no-scrollbar pb-10 pr-2">'
);

fs.writeFileSync('src/components/ChatView.tsx', content);
