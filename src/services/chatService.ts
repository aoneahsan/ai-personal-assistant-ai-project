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
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase';

// Message types
export interface FirestoreMessage {
  id?: string;
  chatId: string;
  senderId: string;
  senderEmail: string;
  text?: string;
  type: 'text' | 'audio' | 'image' | 'file' | 'video';
  timestamp: any; // Firestore timestamp
  status: 'sent' | 'delivered' | 'read';
  fileData?: {
    name: string;
    size: number;
    type: string;
    url: string;
  };
  audioDuration?: number;
  videoDuration?: number;
  videoThumbnail?: string;
  quickTranscript?: string;
  transcript?: Array<{
    text: string;
    startTime: number;
    endTime: number;
    confidence: number;
  }>;
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

export class ChatService {
  private readonly MESSAGES_COLLECTION = `${PROJECT_PREFIX_FOR_COLLECTIONS_AND_FOLDERS}_messages`;
  private readonly CONVERSATIONS_COLLECTION = `${PROJECT_PREFIX_FOR_COLLECTIONS_AND_FOLDERS}_conversations`;
  private readonly USERS_COLLECTION = `${PROJECT_PREFIX_FOR_COLLECTIONS_AND_FOLDERS}_users`;

  // Send a message
  async sendMessage(
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
      await this.updateConversationLastMessage(
        chatId,
        messageData.text || 'Media message',
        senderId
      );

      console.log('✅ Message sent successfully:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error sending message:', error);
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
      console.log('🔍 Searching for user by email:', email);

      const q = query(
        collection(db, this.USERS_COLLECTION),
        where('email', '==', email.toLowerCase().trim())
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log('❌ User not found:', email);
        return {
          id: '',
          email,
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
  }> {
    return [
      {
        title: 'User Search Limitation',
        description:
          'You can only find users by typing their complete email address. Partial email search is not available yet.',
        icon: '🔍',
      },
      {
        title: 'Text Messages Only',
        description:
          'Currently, only text-based messages are stored in the database. Media messages (images, videos, audio) are handled locally.',
        icon: '📝',
      },
      {
        title: 'Basic Chat Features',
        description:
          'Advanced features like message editing, deletion, and forwarding are not implemented yet.',
        icon: '⚙️',
      },
      {
        title: 'Real-time Sync',
        description:
          'Messages sync in real-time, but message status updates (delivered/read) are simulated for now.',
        icon: '🔄',
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
