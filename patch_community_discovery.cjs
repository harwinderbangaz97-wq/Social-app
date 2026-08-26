const fs = require('fs');
let content = fs.readFileSync('src/components/CommunityDiscoveryView.tsx', 'utf8');

// Add import for CreateCommunityModal
content = content.replace(
  "import { Search, Globe, Users, TrendingUp, Plus, Check } from 'lucide-react';",
  "import { Search, Globe, Users, TrendingUp, Plus, Check } from 'lucide-react';\nimport { CreateCommunityModal } from './CreateCommunityModal';"
);

// Add state for modal
content = content.replace(
  "const [joinedCommunities, setJoinedCommunities] = useState<string[]>([]);",
  "const [joinedCommunities, setJoinedCommunities] = useState<string[]>([]);\n  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);"
);

// Add onClick to Plus button
content = content.replace(
  /<button className="w-10 h-10 rounded-full neu-raised flex items-center justify-center text-\[\#5B9DFF\]">/,
  '<button onClick={() => setIsCreateModalOpen(true)} className="w-10 h-10 rounded-full neu-raised flex items-center justify-center text-[#5B9DFF] hover:scale-105 transition-transform">'
);

// Add modal component before closing motion.div
content = content.replace(
  "    </motion.div>",
  "      {/* Create Modal */}\n      <CreateCommunityModal \n        isOpen={isCreateModalOpen} \n        onClose={() => setIsCreateModalOpen(false)} \n      />\n    </motion.div>"
);

fs.writeFileSync('src/components/CommunityDiscoveryView.tsx', content);
