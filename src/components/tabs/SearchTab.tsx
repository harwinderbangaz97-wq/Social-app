import React from 'react';
import { SearchPeopleView } from '../SearchPeopleView';
import { User } from '../../types';

interface SearchTabProps {
  users: User[];
  onToggleFollow: (userId: string) => void;
  onOpenDirectChat: (user: User) => void;
  onUserSelect: (user: User) => void;
  onShowToast: (msg: string) => void;
}

export const SearchTab: React.FC<SearchTabProps> = ({
  users,
  onToggleFollow,
  onOpenDirectChat,
  onUserSelect,
  onShowToast,
}) => {
  return (
    <SearchPeopleView
      users={users}
      onToggleFollow={onToggleFollow}
      onOpenDirectChat={onOpenDirectChat}
      onUserSelect={onUserSelect}
      onShowToast={onShowToast}
    />
  );
};
