import { FirestoreMessage } from '@/services/chatService';
import { featureFlagService } from '@/services/featureFlagService';
import { IPCAUser } from '@/types/user';
import { ChatFeatureFlag } from '@/types/user/subscription';
import { Menu } from 'primereact/menu';
import { MenuItem } from 'primereact/menuitem';
import { Toast } from 'primereact/toast';
import React, { useRef } from 'react';

interface MessageContextMenuProps {
  message: FirestoreMessage;
  currentUser: IPCAUser | null;
  onEdit: (message: FirestoreMessage) => void;
  onDelete: (message: FirestoreMessage) => void;
  onViewHistory: (message: FirestoreMessage) => void;
  onUpgrade: (feature: ChatFeatureFlag) => void;
}

const MessageContextMenu: React.FC<MessageContextMenuProps> = ({
  message,
  currentUser,
  onEdit,
  onDelete,
  onViewHistory,
  onUpgrade,
}) => {
  const menuRef = useRef<Menu>(null);
  const toastRef = useRef<Toast>(null);

  const canEdit = featureFlagService.canEditMessages(currentUser);
  const canDelete = featureFlagService.canDeleteMessages(currentUser);
  const canViewHistory = featureFlagService.canViewMessageHistory(currentUser);

  const canUserEdit =
    message && currentUser
      ? canEdit &&
        message.senderId === currentUser.id &&
        !message.isDeleted &&
        message.type === 'text'
      : false;

  const canUserDelete =
    message && currentUser
      ? canDelete && message.senderId === currentUser.id && !message.isDeleted
      : false;

  const canUserViewHistory =
    message && currentUser ? canViewHistory && message.isEdited : false;

  const showUpgradeToast = (
    feature: ChatFeatureFlag,
    upgradeMessage: string
  ) => {
    toastRef.current?.show({
      severity: 'info',
      summary: 'Upgrade Required',
      detail: upgradeMessage,
      life: 5000,
      closable: true,
    });
  };

  const handleEditClick = () => {
    if (!canEdit) {
      showUpgradeToast(
        ChatFeatureFlag.MESSAGE_EDITING,
        'Upgrade to Pro to edit messages'
      );
      onUpgrade(ChatFeatureFlag.MESSAGE_EDITING);
      return;
    }

    if (canUserEdit) {
      onEdit(message);
    }
  };

  const handleDeleteClick = () => {
    if (!canDelete) {
      showUpgradeToast(
        ChatFeatureFlag.MESSAGE_DELETION,
        'Upgrade to Pro to delete messages'
      );
      onUpgrade(ChatFeatureFlag.MESSAGE_DELETION);
      return;
    }

    if (canUserDelete) {
      onDelete(message);
    }
  };

  const handleViewHistoryClick = () => {
    if (!canViewHistory) {
      showUpgradeToast(
        ChatFeatureFlag.MESSAGE_HISTORY,
        'Upgrade to Premium to view message history'
      );
      onUpgrade(ChatFeatureFlag.MESSAGE_HISTORY);
      return;
    }

    if (canUserViewHistory) {
      onViewHistory(message);
    }
  };

  const menuItems: MenuItem[] = [
    {
      label: 'Edit Message',
      icon: 'pi pi-pencil',
      disabled: !canUserEdit && canEdit,
      className: !canEdit ? 'p-menuitem-premium' : '',
      command: handleEditClick,
    },
    {
      label: 'Delete Message',
      icon: 'pi pi-trash',
      disabled: !canUserDelete && canDelete,
      className: !canDelete ? 'p-menuitem-premium' : '',
      command: handleDeleteClick,
    },
    {
      label: 'View Edit History',
      icon: 'pi pi-history',
      disabled: !canUserViewHistory && canViewHistory,
      className: !canViewHistory ? 'p-menuitem-premium' : '',
      command: handleViewHistoryClick,
    },
    {
      separator: true,
    },
    {
      label: 'Copy Message',
      icon: 'pi pi-copy',
      disabled: message.isDeleted,
      command: () => {
        if (message.text) {
          navigator.clipboard.writeText(message.text);
          toastRef.current?.show({
            severity: 'success',
            summary: 'Copied',
            detail: 'Message copied to clipboard',
            life: 2000,
          });
        }
      },
    },
  ];

  return (
    <>
      <Menu
        ref={menuRef}
        model={menuItems}
        popup
      />
      <Toast ref={toastRef} />
    </>
  );
};

export default MessageContextMenu;
