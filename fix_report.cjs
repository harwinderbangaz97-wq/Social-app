const fs = require('fs');
let content = fs.readFileSync('src/components/ChatView.tsx', 'utf8');

content = content.replace(
  /targetUser=\{activeThread\.isGroup \? \{ id: reportTargetMessage\.senderId, name: reportTargetMessage\.senderName \|\| 'Group Member', avatar: '' \} : activeThread\.participant!\}/g,
  `targetUser={activeThread.isGroup ? { id: reportTargetMessage.senderId, name: reportTargetMessage.senderName || 'Group Member', username: 'group', avatar: '' } : activeThread.participant!}`
);

fs.writeFileSync('src/components/ChatView.tsx', content);
