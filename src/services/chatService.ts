import { IPCAUser } from '@/types/user';
import { PROJECT_PREFIX_FOR_COLLECTIONS_AND_FOLDERS } from '@/utils/constants/generic/firebase';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db, fileStorageService, FileUploadResult } from './firebase';

// Enhanced transcript structure
export interface TranscriptSegment {
  text: string;
  startTime: number; // seconds
  endTime: number; // seconds
  confidence: number; // 0-1 confidence score
  speakerId?: string; // for multi-speaker scenarios
}

// Enhanced message types with better media support
export interface FirestoreMessage {
  id?: string;
  chatId: string;
  senderId: string;
  senderEmail: string;
  text?: string;
  type: 'text' | 'audio' | 'image' | 'file' | 'video';
  timestamp: any; // Firestore timestamp
  status: 'sent' | 'delivered' | 'read';

  // File data for media messages
  fileData?: {
    name: string;
    size: number;
    type: string;
    url: string;
    uploadedAt: Date;
    expiresAt: Date; // 10 days from upload
    storagePath?: string; // for cleanup purposes
  };

  // Audio-specific data
  audioDuration?: number; // seconds
  transcript?: TranscriptSegment[]; // full transcript with timing
  quickTranscript?: string; // simple text summary for previews

  // Video-specific data
  videoDuration?: number; // seconds
  videoThumbnail?: string; // thumbnail URL

  // Image-specific data
  imageWidth?: number;
  imageHeight?: number;

  // Cleanup tracking
  cleanupScheduled?: boolean;
  cleanupJobId?: string;
}

// Chat conversation
export interface ChatConversation {
  id?: string;
  participants: string[]; // User IDs
  participantEmails: string[]; // User emails for easy searching
  lastMessage?: string;
  lastMessageTime?: any; // Firestore timestamp
  lastMessageSender?: string;
  unreadCount?: { [userId: string]: number };
  createdAt: any;
  updatedAt: any;
}

// User search result
export interface UserSearchResult {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  isFound: boolean;
}

// Media upload options
export interface MediaUploadOptions {
  file: File;
  chatId: string;
  senderId: string;
  senderEmail: string;
  transcript?: TranscriptSegment[]; // for audio files
  quickTranscript?: string; // simple text version
  duration?: number; // for audio/video files
  thumbnail?: string; // for video files
  dimensions?: { width: number; height: number }; // for images
}

export class ChatService {
  private readonly MESSAGES_COLLECTION = `${PROJECT_PREFIX_FOR_COLLECTIONS_AND_FOLDERS}_messages`;
  private readonly CONVERSATIONS_COLLECTION = `${PROJECT_PREFIX_FOR_COLLECTIONS_AND_FOLDERS}_conversations`;
  private readonly USERS_COLLECTION = `${PROJECT_PREFIX_FOR_COLLECTIONS_AND_FOLDERS}_users`;
  private readonly CLEANUP_JOBS_COLLECTION = `${PROJECT_PREFIX_FOR_COLLECTIONS_AND_FOLDERS}_cleanup_jobs`;

  // Send a text message
  async sendTextMessage(
    chatId: string,
    senderId: string,
    senderEmail: string,
    text: string
  ): Promise<string> {
    return this.sendMessage(chatId, senderId, senderEmail, {
      text,
      type: 'text',
    });
  }

  // Send an audio message with transcript
  async sendAudioMessage(options: MediaUploadOptions): Promise<string> {
    try {
      console.log('🎵 Sending audio message...');

      // Upload audio file
      const uploadResult = await fileStorageService.uploadAudio(
        options.file,
        options.chatId,
        options.senderId
      );

      // Schedule cleanup job
      await this.scheduleFileCleanup(uploadResult, options.chatId);

      // Send message with audio data
      return this.sendMessage(
        options.chatId,
        options.senderId,
        options.senderEmail,
        {
          type: 'audio',
          fileData: {
            name: uploadResult.fileName,
            size: uploadResult.size,
            type: uploadResult.type,
            url: uploadResult.url,
            uploadedAt: uploadResult.uploadedAt,
            expiresAt: uploadResult.expiresAt,
          },
          audioDuration: options.duration,
          transcript: options.transcript,
          quickTranscript: options.quickTranscript,
        }
      );
    } catch (error) {
      console.error('❌ Error sending audio message:', error);
      throw error;
    }
  }

  // Send an image message
  async sendImageMessage(options: MediaUploadOptions): Promise<string> {
    try {
      console.log('🖼️ Sending image message...');

      // Upload image file
      const uploadResult = await fileStorageService.uploadImage(
        options.file,
        options.chatId,
        options.senderId
      );

      // Schedule cleanup job
      await this.scheduleFileCleanup(uploadResult, options.chatId);

      // Send message with image data
      return this.sendMessage(
        options.chatId,
        options.senderId,
        options.senderEmail,
        {
          type: 'image',
          fileData: {
            name: uploadResult.fileName,
            size: uploadResult.size,
            type: uploadResult.type,
            url: uploadResult.url,
            uploadedAt: uploadResult.uploadedAt,
            expiresAt: uploadResult.expiresAt,
          },
          imageWidth: options.dimensions?.width,
          imageHeight: options.dimensions?.height,
        }
      );
    } catch (error) {
      console.error('❌ Error sending image message:', error);
      throw error;
    }
  }

  // Send a video message
  async sendVideoMessage(options: MediaUploadOptions): Promise<string> {
    try {
      console.log('🎥 Sending video message...');

      // Upload video file
      const uploadResult = await fileStorageService.uploadVideo(
        options.file,
        options.chatId,
        options.senderId
      );

      // Schedule cleanup job
      await this.scheduleFileCleanup(uploadResult, options.chatId);

      // Send message with video data
      return this.sendMessage(
        options.chatId,
        options.senderId,
        options.senderEmail,
        {
          type: 'video',
          fileData: {
            name: uploadResult.fileName,
            size: uploadResult.size,
            type: uploadResult.type,
            url: uploadResult.url,
            uploadedAt: uploadResult.uploadedAt,
            expiresAt: uploadResult.expiresAt,
          },
          videoDuration: options.duration,
          videoThumbnail: options.thumbnail,
        }
      );
    } catch (error) {
      console.error('❌ Error sending video message:', error);
      throw error;
    }
  }

  // Generic send message method
  private async sendMessage(
    chatId: string,
    senderId: string,
    senderEmail: string,
    messageData: Omit<
      FirestoreMessage,
      'id' | 'chatId' | 'senderId' | 'senderEmail' | 'timestamp' | 'status'
    >
  ): Promise<string> {
    try {
      const message: Omit<FirestoreMessage, 'id'> = {
        chatId,
        senderId,
        senderEmail,
        ...messageData,
        timestamp: serverTimestamp(),
        status: 'sent',
      };

      console.log('💬 Sending message to Firestore:', {
        chatId,
        senderId,
        type: messageData.type,
      });

      const docRef = await addDoc(
        collection(db, this.MESSAGES_COLLECTION),
        message
      );

      // Update conversation last message
      const lastMessageText =
        messageData.text ||
        (messageData.type === 'audio'
          ? '🎵 Audio message'
          : messageData.type === 'image'
            ? '🖼️ Image'
            : messageData.type === 'video'
              ? '🎥 Video'
              : 'Media message');

      await this.updateConversationLastMessage(
        chatId,
        lastMessageText,
        senderId
      );

      console.log('✅ Message sent successfully:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error sending message:', error);
      throw error;
    }
  }

  // Schedule file cleanup after expiration
  private async scheduleFileCleanup(
    uploadResult: FileUploadResult,
    chatId: string
  ): Promise<void> {
    try {
      const cleanupJob = {
        fileUrl: uploadResult.url,
        fileName: uploadResult.fileName,
        chatId,
        scheduledFor: Timestamp.fromDate(uploadResult.expiresAt),
        createdAt: serverTimestamp(),
        status: 'scheduled',
      };

      await addDoc(collection(db, this.CLEANUP_JOBS_COLLECTION), cleanupJob);
      console.log('🗓️ File cleanup scheduled for:', uploadResult.expiresAt);
    } catch (error) {
      console.error('❌ Error scheduling cleanup:', error);
      // Don't throw - cleanup scheduling failure shouldn't block message sending
    }
  }

  // Process expired file cleanups (this would typically run as a Cloud Function)
  async processExpiredFiles(): Promise<void> {
    try {
      console.log('🧹 Processing expired files...');

      const now = Timestamp.now();
      const q = query(
        collection(db, this.CLEANUP_JOBS_COLLECTION),
        where('scheduledFor', '<=', now),
        where('status', '==', 'scheduled')
      );

      const querySnapshot = await getDocs(q);
      console.log(`Found ${querySnapshot.size} files to clean up`);

      for (const doc of querySnapshot.docs) {
        const cleanupJob = doc.data();
        try {
          // Delete file from storage
          await fileStorageService.deleteFile(cleanupJob.fileUrl);

          // Update cleanup job status
          await updateDoc(doc.ref, {
            status: 'completed',
            completedAt: serverTimestamp(),
          });

          console.log('✅ Cleaned up file:', cleanupJob.fileName);
        } catch (error) {
          console.error(
            '❌ Failed to clean up file:',
            cleanupJob.fileName,
            error
          );

          // Update cleanup job status to failed
          await updateDoc(doc.ref, {
            status: 'failed',
            failedAt: serverTimestamp(),
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    } catch (error) {
      console.error('❌ Error processing expired files:', error);
    }
  }

  // Update transcript for an audio message
  async updateMessageTranscript(
    messageId: string,
    transcript: TranscriptSegment[],
    quickTranscript: string
  ): Promise<void> {
    try {
      const messageRef = doc(db, this.MESSAGES_COLLECTION, messageId);
      await updateDoc(messageRef, {
        transcript,
        quickTranscript,
      });
      console.log('✅ Transcript updated for message:', messageId);
    } catch (error) {
      console.error('❌ Error updating transcript:', error);
      throw error;
    }
  }

  // Listen to messages in a chat
  subscribeToMessages(
    chatId: string,
    callback: (messages: FirestoreMessage[]) => void
  ): () => void {
    try {
      console.log('👂 Subscribing to messages for chat:', chatId);

      const q = query(
        collection(db, this.MESSAGES_COLLECTION),
        where('chatId', '==', chatId),
        orderBy('timestamp', 'asc')
      );

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const messages: FirestoreMessage[] = [];
          querySnapshot.forEach((doc) => {
            messages.push({ id: doc.id, ...doc.data() } as FirestoreMessage);
          });

          console.log('📨 Received messages update:', messages.length);
          callback(messages);
        },
        (error) => {
          console.error('❌ Error listening to messages:', error);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('❌ Error subscribing to messages:', error);
      throw error;
    }
  }

  // Find user by email
  async findUserByEmail(email: string): Promise<UserSearchResult> {
    try {
      // Normalize the email to lowercase for consistent searching
      const normalizedEmail = email.toLowerCase().trim();
      console.log('🔍 Searching for user by email:', normalizedEmail);

      // Debug: Let's also check what users exist in the database
      console.log('🔍 Debug: Checking all users in database...');
      const allUsersQuery = collection(db, this.USERS_COLLECTION);
      const allUsersSnapshot = await getDocs(allUsersQuery);

      console.log('📊 Total users in database:', allUsersSnapshot.size);
      allUsersSnapshot.forEach((doc) => {
        const userData = doc.data();
        console.log('👤 User found:', {
          id: doc.id,
          email: userData.email,
          name: userData.name,
          type: userData.type,
        });
      });

      // Now search for the specific user
      const q = query(
        collection(db, this.USERS_COLLECTION),
        where('email', '==', normalizedEmail)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log('❌ User not found with email:', normalizedEmail);

        // Try case-insensitive search by getting all users and filtering
        console.log('🔍 Attempting case-insensitive search...');
        const allUsers = await getDocs(collection(db, this.USERS_COLLECTION));

        for (const doc of allUsers.docs) {
          const userData = doc.data();
          const userEmail = userData.email?.toLowerCase?.() || '';

          if (userEmail === normalizedEmail) {
            console.log(
              '✅ Found user with case-insensitive search:',
              userData.email
            );
            return {
              id: doc.id,
              email: userData.email || normalizedEmail,
              displayName: userData.name || userData.email || 'Unknown User',
              photoURL: undefined,
              isFound: true,
            };
          }
        }

        return {
          id: '',
          email: email, // Return original email for display
          displayName: '',
          isFound: false,
        };
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data() as IPCAUser;

      console.log('✅ User found:', userData.email);
      return {
        id: userDoc.id,
        email: userData.email || email,
        displayName: userData.name || userData.email || 'Unknown User',
        photoURL: undefined, // Not available in current IPCAUser type
        isFound: true,
      };
    } catch (error) {
      console.error('❌ Error finding user by email:', error);
      throw error;
    }
  }

  // Create or get existing conversation
  async createOrGetConversation(
    currentUserId: string,
    currentUserEmail: string,
    targetUserId: string,
    targetUserEmail: string
  ): Promise<string> {
    try {
      console.log(
        '💬 Creating/getting conversation between:',
        currentUserEmail,
        'and',
        targetUserEmail
      );

      // Check if conversation already exists
      const q = query(
        collection(db, this.CONVERSATIONS_COLLECTION),
        where('participants', 'array-contains-any', [currentUserId])
      );

      const querySnapshot = await getDocs(q);

      // Look for existing conversation with both participants
      for (const doc of querySnapshot.docs) {
        const conversation = doc.data() as ChatConversation;
        if (conversation.participants.includes(targetUserId)) {
          console.log('✅ Found existing conversation:', doc.id);
          return doc.id;
        }
      }

      // Create new conversation
      const newConversation: Omit<ChatConversation, 'id'> = {
        participants: [currentUserId, targetUserId],
        participantEmails: [currentUserEmail, targetUserEmail],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        unreadCount: {
          [currentUserId]: 0,
          [targetUserId]: 0,
        },
      };

      const docRef = await addDoc(
        collection(db, this.CONVERSATIONS_COLLECTION),
        newConversation
      );

      console.log('✅ Created new conversation:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating/getting conversation:', error);
      throw error;
    }
  }

  // Get user conversations
  async getUserConversations(userId: string): Promise<ChatConversation[]> {
    try {
      console.log('📋 Getting conversations for user:', userId);

      const q = query(
        collection(db, this.CONVERSATIONS_COLLECTION),
        where('participants', 'array-contains', userId),
        orderBy('updatedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const conversations: ChatConversation[] = [];

      querySnapshot.forEach((doc) => {
        conversations.push({ id: doc.id, ...doc.data() } as ChatConversation);
      });

      console.log('✅ Found conversations:', conversations.length);
      return conversations;
    } catch (error) {
      console.error('❌ Error getting user conversations:', error);
      throw error;
    }
  }

  // Update conversation last message
  private async updateConversationLastMessage(
    chatId: string,
    lastMessage: string,
    senderId: string
  ): Promise<void> {
    try {
      const conversationRef = doc(db, this.CONVERSATIONS_COLLECTION, chatId);

      await updateDoc(conversationRef, {
        lastMessage: lastMessage.substring(0, 100), // Limit length
        lastMessageTime: serverTimestamp(),
        lastMessageSender: senderId,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('❌ Error updating conversation:', error);
      // Don't throw - this is not critical
    }
  }

  // Mark messages as read
  async markMessagesAsRead(chatId: string, userId: string): Promise<void> {
    try {
      console.log('✅ Marking messages as read for chat:', chatId);

      // Update unread count in conversation
      const conversationRef = doc(db, this.CONVERSATIONS_COLLECTION, chatId);
      const conversationDoc = await getDoc(conversationRef);

      if (conversationDoc.exists()) {
        const conversation = conversationDoc.data() as ChatConversation;
        const unreadCount = { ...conversation.unreadCount };
        unreadCount[userId] = 0;

        await updateDoc(conversationRef, {
          unreadCount,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('❌ Error marking messages as read:', error);
      // Don't throw - this is not critical
    }
  }

  // Get chat limitations info
  getChatLimitations(): Array<{
    title: string;
    description: string;
    icon: string;
    isSettingConfigurable?: boolean;
  }> {
    const backupPolicy = fileStorageService.getBackupPolicy();

    return [
      {
        title: 'User Search Limitation',
        description:
          'You can only find users by typing their complete email address. Partial email search is not available yet.',
        icon: '🔍',
      },
      {
        title: `${backupPolicy.days}-Day File Backup Policy`,
        description: `All media files (images, audio, video) are automatically deleted after ${backupPolicy.days} days to save storage space. This setting can be configured in the future.`,
        icon: '🗃️',
        isSettingConfigurable: backupPolicy.configurable,
      },
      {
        title: 'Media Storage & Transcripts',
        description:
          'Images, audio, and video messages are now stored in the database with proper backup management. Audio messages include full transcripts with timing information.',
        icon: '📁',
      },
      {
        title: 'Audio Transcription',
        description:
          'Audio messages support full transcript storage with timing, confidence scores, and speaker identification for better accessibility and searchability.',
        icon: '🎙️',
      },
      {
        title: 'Real-time Sync',
        description:
          'All messages including media sync in real-time across devices. Message status updates (delivered/read) are simulated for now.',
        icon: '🔄',
      },
      {
        title: 'Basic Chat Features',
        description:
          'Advanced features like message editing, deletion, and forwarding are not implemented yet. File cleanup runs automatically.',
        icon: '⚙️',
      },
      {
        title: 'Profile Integration',
        description:
          'User profiles show basic information. Rich profile features and status updates are coming soon.',
        icon: '👤',
      },
    ];
  }
}

// Export singleton instance
export const chatService = new ChatService();
export default chatService;
