const fs = require('fs');
let content = fs.readFileSync('src/components/ChatView.tsx', 'utf8');

// Replace activeThread.participant!.something -> helpers
content = content.replace(/activeThread\.participant!\.id/g, "(activeThread.isGroup ? activeThread.id : activeThread.participant?.id || '')");
content = content.replace(/activeThread\.participant!\.name/g, "(activeThread.isGroup ? activeThread.groupName || '' : activeThread.participant?.name || '')");
content = content.replace(/activeThread\.participant!\.avatar/g, "(activeThread.isGroup ? activeThread.groupAvatar || '' : activeThread.participant?.avatar || '')");
content = content.replace(/activeThread\.participant!\.isOnline/g, "(activeThread.isGroup ? true : activeThread.participant?.isOnline)");
content = content.replace(/activeThread\.participant!\.isFollowing/g, "(activeThread.isGroup ? false : activeThread.participant?.isFollowing)");

// Replace thread.participant!.something -> helpers
content = content.replace(/thread\.participant!\.id/g, "(thread.isGroup ? thread.id : thread.participant?.id || '')");
content = content.replace(/thread\.participant!\.name/g, "(thread.isGroup ? thread.groupName || '' : thread.participant?.name || '')");
content = content.replace(/thread\.participant!\.avatar/g, "(thread.isGroup ? thread.groupAvatar || '' : thread.participant?.avatar || '')");
content = content.replace(/thread\.participant!\.isOnline/g, "(thread.isGroup ? true : thread.participant?.isOnline)");
content = content.replace(/thread\.participant!\.isFollowing/g, "(thread.isGroup ? false : thread.participant?.isFollowing)");

content = content.replace(/thread\.participant\.id/g, "(thread.isGroup ? thread.id : thread.participant?.id || '')");
content = content.replace(/thread\.participant\.name/g, "(thread.isGroup ? thread.groupName || '' : thread.participant?.name || '')");
content = content.replace(/thread\.participant\.avatar/g, "(thread.isGroup ? thread.groupAvatar || '' : thread.participant?.avatar || '')");
content = content.replace(/thread\.participant\.isOnline/g, "(thread.isGroup ? true : thread.participant?.isOnline)");
content = content.replace(/thread\.participant\.isFollowing/g, "(thread.isGroup ? false : thread.participant?.isFollowing)");

content = content.replace(/thread\.participant\.username/g, "(thread.isGroup ? thread.groupName || '' : thread.participant?.username || '')");
content = content.replace(/thread\.participant\.bio/g, "(thread.isGroup ? thread.groupDescription || '' : thread.participant?.bio || '')");

// Re-write back
fs.writeFileSync('src/components/ChatView.tsx', content);
