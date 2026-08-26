const fs = require('fs');
let content = fs.readFileSync('src/components/ChatView.tsx', 'utf8');

// Container
content = content.replace(
  '<div className="flex flex-col lg:flex-row gap-6 max-w-[900px] mx-auto items-start">',
  '<div className="flex flex-row gap-6 max-w-[1000px] mx-auto items-start justify-center min-w-[700px]">' // min-w ensures it doesn't wrap/crush too much, can scroll horizontally if the parent has overflow-x-auto
);

// Left Column
content = content.replace(
  '<div className="flex-1 w-full space-y-4 max-w-xl mx-auto lg:mx-0">',
  '<div className="flex-1 min-w-[350px] max-w-[500px] space-y-4">'
);

// Right Column
content = content.replace(
  '<div className="w-full lg:w-[320px] flex-shrink-0 mt-2 lg:mt-0 lg:sticky lg:top-4">',
  '<div className="w-[320px] flex-shrink-0 sticky top-0">'
);
content = content.replace(
  '<div className="pt-6 border-t border-slate-200/50 lg:pt-0 lg:border-t-0">',
  '<div>'
);

fs.writeFileSync('src/components/ChatView.tsx', content);
