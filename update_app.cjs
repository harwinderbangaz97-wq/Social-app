const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const communitiesTab = `
            {/* Tab: Communities */}
            {activeTab === 'communities' && (
              <CommunityDiscoveryView />
            )}
`;

content = content.replace(
  /\{\/\* Tab 5: Profile \*\/\}/,
  communitiesTab + '\n            {/* Tab 5: Profile */}'
);

fs.writeFileSync('src/App.tsx', content);
