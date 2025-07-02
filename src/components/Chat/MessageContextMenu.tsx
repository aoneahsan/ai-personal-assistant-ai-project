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

  const canEditAccess = featureFlagService.canEditMessages(currentUser);
  const canDeleteAccess = featureFlagService.canDeleteMessages(currentUser);
  const canViewHistoryAccess =
    featureFlagService.canViewMessageHistory(currentUser);

  const canUserEdit =
    message && currentUser
      ? canEditAccess.hasAccess &&
        message.senderId === currentUser.id &&
        !message.isDeleted &&
        message.type === 'text'
      : false;

  const canUserDelete =
    message && currentUser
      ? canDeleteAccess.hasAccess &&
        message.senderId === currentUser.id &&
        !message.isDeleted
      : false;

  const canUserViewHistory =
    message && currentUser
      ? canViewHistoryAccess.hasAccess && message.isEdited
      : false;

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
    if (!canEditAccess.hasAccess) {
      showUpgradeToast(
        ChatFeatureFlag.MESSAGE_EDITING,
        canEditAccess.upgradeMessage || ''
      );
      onUpgrade(ChatFeatureFlag.MESSAGE_EDITING);
      return;
    }

    if (canUserEdit) {
      onEdit(message);
    }
  };

  const handleDeleteClick = () => {
    if (!canDeleteAccess.hasAccess) {
      showUpgradeToast(
        ChatFeatureFlag.MESSAGE_DELETION,
        canDeleteAccess.upgradeMessage || ''
      );
      onUpgrade(ChatFeatureFlag.MESSAGE_DELETION);
      return;
    }

    if (canUserDelete) {
      onDelete(message);
    }
  };

  const handleViewHistoryClick = () => {
    if (!canViewHistoryAccess.hasAccess) {
      showUpgradeToast(
        ChatFeatureFlag.MESSAGE_HISTORY,
        canViewHistoryAccess.upgradeMessage || ''
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
      disabled: !canUserEdit && canEditAccess.hasAccess,
      className: !canEditAccess.hasAccess ? 'p-menuitem-premium' : '',
      command: handleEditClick,
    },
    {
      label: 'Delete Message',
      icon: 'pi pi-trash',
      disabled: !canUserDelete && canDeleteAccess.hasAccess,
      className: !canDeleteAccess.hasAccess ? 'p-menuitem-premium' : '',
      command: handleDeleteClick,
    },
    {
      label: 'View Edit History',
      icon: 'pi pi-history',
      disabled: !canUserViewHistory && canViewHistoryAccess.hasAccess,
      className: !canViewHistoryAccess.hasAccess ? 'p-menuitem-premium' : '',
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

  const show = (event: React.MouseEvent) => {
    if (menuRef.current) {
      menuRef.current.show(event);
    }
  };

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
