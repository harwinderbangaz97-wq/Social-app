import React from 'react';
import { UploadMediaModal } from '../UploadMediaModal';
import { User, Post } from '../../types';

interface UploadTabProps {
  currentUser: User;
  onClose: () => void;
  onPublishPost: (postData: any) => void;
}

export const UploadTab: React.FC<UploadTabProps> = ({
  currentUser,
  onClose,
  onPublishPost,
}) => {
  return (
    <UploadMediaModal
      currentUser={currentUser}
      onClose={onClose}
      onPublishPost={onPublishPost}
    />
  );
};
