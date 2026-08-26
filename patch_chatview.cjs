const fs = require('fs');
let content = fs.readFileSync('src/components/ChatView.tsx', 'utf8');

// We need to wrap the IndividualUserMenu at line 1556 with a !activeThread.isGroup check
content = content.replace(
  /\{\/\* Individual Conversation 3-Dot Settings Menu \*\/\}\s*<IndividualUserMenu\s*isOpen=\{showThreadMenu\}\s*onClose=\{.*?\}\s*user=\{activeThread\.participant!\}\s*isFollowing=\{.*?\}\s*onToggleFollow=\{onToggleFollow\}\s*onClearChat=\{onClearChat\}\s*isLocked=\{.*?\}\s*onToggleLockChat=\{onToggleLockChat\}\s*onShowToast=\{onShowToast\}\s*\/>/g,
  `{/* Individual Conversation 3-Dot Settings Menu */}
        {activeThread && !activeThread.isGroup && (
          <IndividualUserMenu
            isOpen={showThreadMenu}
            onClose={() => setShowThreadMenu(false)}
            user={activeThread.participant!}
            isFollowing={activeThread.participant?.isFollowing || false}
            onToggleFollow={onToggleFollow}
            onClearChat={onClearChat}
            isLocked={lockedChatUserIds?.includes(activeThread.participant?.id || '')}
            onToggleLockChat={onToggleLockChat}
            onShowToast={onShowToast}
          />
        )}`
);

// We also need to fix targetUser in UniversalReportModal
content = content.replace(
  /targetUser=\{activeThread\.participant!\}/g,
  `targetUser={activeThread.isGroup ? { id: reportTargetMessage.senderId, name: reportTargetMessage.senderName || 'Group Member', avatar: '' } : activeThread.participant!}`
);

fs.writeFileSync('src/components/ChatView.tsx', content);
