const fs = require('fs');
let content = fs.readFileSync('src/components/ChatView.tsx', 'utf8');

// Replace md: with lg: for the layout
content = content.replace(/md:flex-row/g, 'lg:flex-row');
content = content.replace(/md:mx-0/g, 'lg:mx-0');
content = content.replace(/md:w-\[320px\]/g, 'lg:w-[320px]');
content = content.replace(/md:mt-0/g, 'lg:mt-0');
content = content.replace(/md:pt-0/g, 'lg:pt-0');
content = content.replace(/md:border-t-0/g, 'lg:border-t-0');

fs.writeFileSync('src/components/ChatView.tsx', content);
