const fs = require('fs');

// 1. Update types.ts
let typesContent = fs.readFileSync('src/types.ts', 'utf8');
typesContent = typesContent.replace(
  "export type TabType = 'home' | 'search' | 'upload' | 'chat' | 'communities' | 'profile';",
  "export type TabType = 'home' | 'search' | 'upload' | 'chat' | 'profile';"
);
fs.writeFileSync('src/types.ts', typesContent);

// 2. Update BottomNavigation.tsx
let navContent = fs.readFileSync('src/components/BottomNavigation.tsx', 'utf8');
navContent = navContent.replace(
  "import { Home, Search, Plus, MessageCircle, User as UserIcon, Globe } from 'lucide-react';",
  "import { Home, Search, Plus, MessageCircle, User as UserIcon } from 'lucide-react';"
);

// We need to remove the Communities Button block carefully.
// The block starts with `{/* Communities Button */}` and ends right before `{/* 4. Chat Button */}`.
const startIdx = navContent.indexOf('{/* Communities Button */}');
const endIdx = navContent.indexOf('{/* 4. Chat Button */}');
if (startIdx !== -1 && endIdx !== -1) {
  navContent = navContent.slice(0, startIdx) + navContent.slice(endIdx);
}
fs.writeFileSync('src/components/BottomNavigation.tsx', navContent);

// 3. Update App.tsx
let appContent = fs.readFileSync('src/App.tsx', 'utf8');
const appStartIdx = appContent.indexOf('{/* Tab: Communities */}');
const appEndIdx = appContent.indexOf('{/* Tab 5: Profile */}');
if (appStartIdx !== -1 && appEndIdx !== -1) {
  appContent = appContent.slice(0, appStartIdx) + appContent.slice(appEndIdx);
}
// Remove the import as well
appContent = appContent.replace(
  "import { CommunityDiscoveryView } from './components/CommunityDiscoveryView';\n",
  ""
);
fs.writeFileSync('src/App.tsx', appContent);

console.log("Communities removed from bottom bar and main routing.");
