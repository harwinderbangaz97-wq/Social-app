const fs = require('fs');
let content = fs.readFileSync('src/components/BottomNavigation.tsx', 'utf8');

// import Globe or Users
content = content.replace(
  "import { Home, Search, Plus, MessageCircle, User as UserIcon } from 'lucide-react';",
  "import { Home, Search, Plus, MessageCircle, User as UserIcon, Globe } from 'lucide-react';"
);

const communitiesBtn = `
          {/* Communities Button */}
          <motion.button
            id="nav-communities-btn"
            type="button"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => onTabChange('communities')}
            aria-label="Communities"
            title="Communities"
            className={\`relative flex flex-col items-center justify-center w-12 h-12 rounded-full cursor-pointer select-none touch-manipulation transition-all duration-300 \${
              activeTab === 'communities'
                ? 'neu-active-blue-soft text-[#5B9DFF] ring-2 ring-[#5B9DFF]/30'
                : 'neu-raised text-slate-500 hover:text-[#5B9DFF]'
            }\`}
          >
            <Globe
              className={\`w-5.5 h-5.5 pointer-events-none transition-transform \${
                activeTab === 'communities' ? 'stroke-[2.5] scale-105' : ''
              }\`}
            />
            {activeTab === 'communities' && (
              <motion.span
                layoutId="activeDot"
                className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-[#5B9DFF] pointer-events-none"
              />
            )}
          </motion.button>
`;

content = content.replace(
  /\{\/\* 4\. Chat Button \*\/\}/,
  communitiesBtn + '\n          {/* 4. Chat Button */}'
);

fs.writeFileSync('src/components/BottomNavigation.tsx', content);
