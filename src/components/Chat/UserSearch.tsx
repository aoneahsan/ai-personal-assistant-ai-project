import { unifiedAuthService } from '@/services/authService';
import { chatService, UserSearchResult } from '@/services/chatService';
import { consoleError } from '@/utils/helpers/consoleHelper';
import { useUserDataZState } from '@/zustandStates/userState';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';
import React, { useState } from 'react';
import { toast } from 'react-toastify';

interface UserSearchProps {
  visible: boolean;
  onHide: () => void;
  onUserFound: (user: UserSearchResult, chatId: string) => void;
}

const UserSearch: React.FC<UserSearchProps> = ({
  visible,
  onHide,
  onUserFound,
}) => {
  const [searchEmail, setSearchEmail] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<UserSearchResult | null>(
    null
  );
  const [hasSearched, setHasSearched] = useState(false);
  const currentUser = useUserDataZState((state) => state.data);

  const handleSearch = async () => {
    if (!searchEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    if (!currentUser) {
      toast.error('You must be logged in to search for users');
      return;
    }

    // Check if trying to search for own email
    if (searchEmail.toLowerCase().trim() === currentUser.email?.toLowerCase()) {
      toast.error('You cannot start a chat with yourself');
      return;
    }

    setIsSearching(true);
    setHasSearched(false);
    setSearchResult(null);

    try {
      const result = await chatService.findUserByEmail(searchEmail.trim());

      if (result.isFound && result.id && result.email) {
        // Create or get conversation with the found user
        const currentUser = unifiedAuthService.getCurrentUserData();
        if (!currentUser) {
          throw new Error('No current user found');
        }

        const chatId = await chatService.createOrGetConversation(
          currentUser.id!,
          currentUser.email!,
          result.id as string,
          result.email as string
        );

        onUserFound(result, chatId);
        onHide();
        setSearchEmail('');
      } else {
        toast.error(`No user found with email: ${searchEmail}`);
      }
    } catch (error) {
      consoleError('Search error:', error);
      toast.error('Failed to search for user. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleStartChat = async () => {
    if (!searchResult || !searchResult.id || !searchResult.email) return;

    setIsSearching(true);
    try {
      const currentUser = unifiedAuthService.getCurrentUserData();
      if (!currentUser) {
        throw new Error('No current user found');
      }

      const chatId = await chatService.createOrGetConversation(
        currentUser.id!,
        currentUser.email!,
        searchResult.id as string,
        searchResult.email as string
      );

      onUserFound(searchResult, chatId);
      onHide();
      setSearchEmail('');
      setSearchResult(null);
    } catch (error) {
      consoleError('Error starting chat:', error);
      toast.error('Failed to start chat. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleClose = () => {
    setSearchEmail('');
    setSearchResult(null);
    setHasSearched(false);
    setIsSearching(false);
    onHide();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSearching) {
      handleSearch();
    }
  };

  return (
    <Dialog
      visible={visible}
      onHide={handleClose}
      header='Find User'
      modal
      style={{ width: '90vw', maxWidth: '500px' }}
      className='user-search-dialog'
    >
      <div className='flex flex-column gap-4 p-4'>
        {/* Search Instructions */}
        <div className='mb-3'>
          <Message
            severity='info'
            text='Enter the complete email address of the user you want to chat with.'
            className='w-full'
          />
        </div>

        {/* Search Input */}
        <div className='field'>
          <label
            htmlFor='search-email'
            className='block text-900 font-medium mb-2'
          >
            User Email Address
          </label>
          <div className='p-inputgroup'>
            <span className='p-inputgroup-addon'>
              <i className='pi pi-envelope'></i>
            </span>
            <InputText
              id='search-email'
              placeholder='Enter complete email address...'
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isSearching}
              className='w-full'
            />
            <Button
              icon={isSearching ? 'pi pi-spin pi-spinner' : 'pi pi-search'}
              onClick={handleSearch}
              disabled={isSearching || !searchEmail.trim()}
              className='p-button-primary'
            />
          </div>
        </div>

        {/* Loading State */}
        {isSearching && (
          <div className='flex align-items-center justify-content-center p-4'>
            <ProgressSpinner
              style={{ width: '30px', height: '30px' }}
              strokeWidth='4'
            />
            <span className='ml-3 text-600'>Searching for user...</span>
          </div>
        )}

        {/* Search Results */}
        {hasSearched && searchResult && (
          <div className='search-results'>
            {searchResult.isFound ? (
              <div className='border-1 border-300 border-round p-3 bg-green-50'>
                <div className='flex align-items-center justify-content-between'>
                  <div className='flex align-items-center gap-3'>
                    <div className='w-3rem h-3rem bg-primary border-circle flex align-items-center justify-content-center'>
                      <i className='pi pi-user text-white text-xl'></i>
                    </div>
                    <div>
                      <div className='font-medium text-900'>
                        {searchResult.displayName}
                      </div>
                      <div className='text-600 text-sm'>
                        {searchResult.email}
                      </div>
                    </div>
                  </div>
                  <Button
                    label='Start Chat'
                    icon='pi pi-comments'
                    className='p-button-success p-button-sm'
                    onClick={handleStartChat}
                  />
                </div>
              </div>
            ) : (
              <div className='border-1 border-300 border-round p-3 bg-red-50'>
                <div className='flex align-items-center gap-3'>
                  <i className='pi pi-exclamation-triangle text-red-500 text-xl'></i>
                  <div>
                    <div className='font-medium text-900'>User Not Found</div>
                    <div className='text-600 text-sm'>
                      No user found with email: {searchEmail}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className='flex justify-content-end gap-2 pt-3 border-top-1 border-300'>
          <Button
            label='Cancel'
            icon='pi pi-times'
            onClick={handleClose}
            className='p-button-text'
          />
        </div>
      </div>
    </Dialog>
  );
};

export default UserSearch;
