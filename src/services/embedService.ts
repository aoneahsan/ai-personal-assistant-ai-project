import { PROJECT_PREFIX_FOR_COLLECTIONS_AND_FOLDERS } from '@/utils/constants/generic/firebase';
import { consoleError, consoleLog } from '@/utils/helpers/consoleHelper';
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
import { nanoid } from 'nanoid';
import { db } from './firebase';

// Embed Configuration Interface
export interface EmbedConfig {
  id?: string;
  userId: string; // Owner of the embed
  userEmail: string;
  title: string;
  description?: string;
  allowedDomains: string[]; // Array of allowed domains/origins
  embedCode: string; // Generated embed code
  isActive: boolean;
  createdAt: any; // Firestore timestamp
  updatedAt: any; // Firestore timestamp

  // Styling options
  style?: {
    primaryColor?: string;
    secondaryColor?: string;
    textColor?: string;
    backgroundColor?: string;
    borderRadius?: string;
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    width?: string;
    height?: string;
  };

  // Behavior options
  behavior?: {
    autoOpen?: boolean;
    showOnlineStatus?: boolean;
    enableFileUpload?: boolean;
    enableAudioMessages?: boolean;
    enableVideoMessages?: boolean;
    maxFileSize?: number; // in MB
    welcomeMessage?: string;
  };
}

// Embedded Chat Conversation Interface
export interface EmbeddedChatConversation {
  id?: string;
  embedId: string;
  websiteUrl: string;
  visitorId: string; // Device fingerprint or provided userId
  visitorMetadata?: {
    userAgent?: string;
    ipAddress?: string;
    referrer?: string;
    timestamp?: any;
  };
  ownerUserId: string; // The user who owns the embed
  ownerEmail: string;
  lastMessage?: string;
  lastMessageTime?: any; // Firestore timestamp
  lastMessageSender?: 'visitor' | 'owner';
  unreadCount?: number;
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
}

// Device Fingerprint Data
export interface DeviceFingerprint {
  id: string;
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
  cookiesEnabled: boolean;
  doNotTrack: boolean;
  canvas?: string;
  hash: string;
}

export class EmbedService {
  private readonly EMBEDS_COLLECTION = `${PROJECT_PREFIX_FOR_COLLECTIONS_AND_FOLDERS}_embeds`;
  private readonly EMBED_CONVERSATIONS_COLLECTION = `${PROJECT_PREFIX_FOR_COLLECTIONS_AND_FOLDERS}_embed_conversations`;
  private readonly EMBED_MESSAGES_COLLECTION = `${PROJECT_PREFIX_FOR_COLLECTIONS_AND_FOLDERS}_embed_messages`;

  // Generate a new embed configuration
  async createEmbedConfig(
    userId: string,
    userEmail: string,
    title: string,
    allowedDomains: string[],
    options?: {
      description?: string;
      style?: EmbedConfig['style'];
      behavior?: EmbedConfig['behavior'];
    }
  ): Promise<EmbedConfig> {
    try {
      consoleLog('🔗 Creating embed configuration...');

      const embedId = nanoid(16);
      const embedCode = this.generateEmbedCode(embedId);

      const embedConfig: EmbedConfig = {
        userId,
        userEmail,
        title,
        description: options?.description || '',
        allowedDomains: allowedDomains.map((domain) => domain.toLowerCase()),
        embedCode,
        isActive: true,
        style: options?.style || {
          primaryColor: '#3b82f6',
          secondaryColor: '#f8fafc',
          textColor: '#1f2937',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          position: 'bottom-right',
          width: '350px',
          height: '500px',
        },
        behavior: options?.behavior || {
          autoOpen: false,
          showOnlineStatus: true,
          enableFileUpload: true,
          enableAudioMessages: true,
          enableVideoMessages: true,
          maxFileSize: 10,
          welcomeMessage: 'Hi! How can I help you today?',
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(
        collection(db, this.EMBEDS_COLLECTION),
        embedConfig
      );

      const createdConfig = { ...embedConfig, id: docRef.id };
      consoleLog('✅ Embed configuration created:', createdConfig.id);
      return createdConfig;
    } catch (error) {
      consoleError('❌ Error creating embed configuration:', error);
      throw error;
    }
  }

  // Generate embed code HTML
  private generateEmbedCode(embedId: string): string {
    const baseUrl = window.location.origin;

    return `<!-- AI Personal Assistant Chat Widget -->
<div id="ai-chat-widget-${embedId}"></div>
<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${baseUrl}/embed/widget.js';
    script.async = true;
    script.onload = function() {
      if (window.AIChatWidget) {
        window.AIChatWidget.init({
          embedId: '${embedId}',
          containerId: 'ai-chat-widget-${embedId}',
          baseUrl: '${baseUrl}'
        });
      }
    };
    document.head.appendChild(script);
  })();
</script>`;
  }

  // Get embed configuration by ID
  async getEmbedConfig(embedId: string): Promise<EmbedConfig | null> {
    try {
      const docRef = doc(db, this.EMBEDS_COLLECTION, embedId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as EmbedConfig;
      }
      return null;
    } catch (error) {
      consoleError('Error getting embed configuration:', error);
      return null;
    }
  }

  // Get all embed configurations for a user
  async getUserEmbedConfigs(userId: string): Promise<EmbedConfig[]> {
    try {
      const q = query(
        collection(db, this.EMBEDS_COLLECTION),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as EmbedConfig[];
    } catch (error) {
      consoleError('Error getting user embed configurations:', error);
      return [];
    }
  }

  // Update embed configuration
  async updateEmbedConfig(
    embedId: string,
    updates: Partial<EmbedConfig>
  ): Promise<void> {
    try {
      const docRef = doc(db, this.EMBEDS_COLLECTION, embedId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      consoleLog('✅ Embed configuration updated:', embedId);
    } catch (error) {
      consoleError('❌ Error updating embed configuration:', error);
      throw error;
    }
  }

  // Validate embed request
  async validateEmbedRequest(
    embedId: string,
    websiteUrl: string,
    origin: string
  ): Promise<{ isValid: boolean; config?: EmbedConfig; error?: string }> {
    try {
      const config = await this.getEmbedConfig(embedId);

      if (!config) {
        return { isValid: false, error: 'Embed configuration not found' };
      }

      if (!config.isActive) {
        return { isValid: false, error: 'Embed is deactivated' };
      }

      // Check if the origin is allowed
      const originDomain = new URL(origin).hostname.toLowerCase();
      const isAllowed = config.allowedDomains.some((domain) => {
        // Allow exact match or subdomain
        return originDomain === domain || originDomain.endsWith(`.${domain}`);
      });

      if (!isAllowed) {
        return { isValid: false, error: 'Domain not authorized' };
      }

      return { isValid: true, config };
    } catch (error) {
      consoleError('Error validating embed request:', error);
      return { isValid: false, error: 'Validation failed' };
    }
  }

  // Create or get embedded chat conversation
  async createOrGetEmbeddedConversation(
    embedId: string,
    websiteUrl: string,
    visitorId: string,
    ownerUserId: string,
    ownerEmail: string,
    visitorMetadata?: EmbeddedChatConversation['visitorMetadata']
  ): Promise<string> {
    try {
      // Check if conversation already exists
      const q = query(
        collection(db, this.EMBED_CONVERSATIONS_COLLECTION),
        where('embedId', '==', embedId),
        where('websiteUrl', '==', websiteUrl),
        where('visitorId', '==', visitorId)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Return existing conversation
        return querySnapshot.docs[0].id;
      }

      // Create new conversation
      const conversation: EmbeddedChatConversation = {
        embedId,
        websiteUrl,
        visitorId,
        visitorMetadata,
        ownerUserId,
        ownerEmail,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(
        collection(db, this.EMBED_CONVERSATIONS_COLLECTION),
        conversation
      );

      consoleLog('✅ Embedded conversation created:', docRef.id);
      return docRef.id;
    } catch (error) {
      consoleError('❌ Error creating embedded conversation:', error);
      throw error;
    }
  }

  // Get embedded conversations for a user
  async getUserEmbeddedConversations(
    userId: string,
    embedId?: string
  ): Promise<EmbeddedChatConversation[]> {
    try {
      let q;

      if (embedId) {
        q = query(
          collection(db, this.EMBED_CONVERSATIONS_COLLECTION),
          where('ownerUserId', '==', userId),
          where('embedId', '==', embedId),
          orderBy('updatedAt', 'desc')
        );
      } else {
        q = query(
          collection(db, this.EMBED_CONVERSATIONS_COLLECTION),
          where('ownerUserId', '==', userId),
          orderBy('updatedAt', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as EmbeddedChatConversation[];
    } catch (error) {
      consoleError('Error getting embedded conversations:', error);
      return [];
    }
  }

  // Subscribe to embedded conversations
  subscribeToEmbeddedConversations(
    userId: string,
    callback: (conversations: EmbeddedChatConversation[]) => void
  ): () => void {
    const q = query(
      collection(db, this.EMBED_CONVERSATIONS_COLLECTION),
      where('ownerUserId', '==', userId),
      orderBy('updatedAt', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const conversations = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as EmbeddedChatConversation[];

      callback(conversations);
    });
  }

  // Generate device fingerprint
  generateDeviceFingerprint(): DeviceFingerprint {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint', 2, 2);
    }

    const fingerprint: DeviceFingerprint = {
      id: nanoid(16),
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
      cookiesEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack === '1',
      canvas: canvas.toDataURL(),
      hash: '',
    };

    // Create a hash from the fingerprint data
    const fingerprintString = JSON.stringify(fingerprint);
    fingerprint.hash = btoa(fingerprintString).slice(0, 32);

    return fingerprint;
  }

  // Get or create visitor ID
  getVisitorId(providedUserId?: string): string {
    if (providedUserId) {
      return providedUserId;
    }

    // Check if we have a stored visitor ID
    const storedVisitorId = localStorage.getItem('ai-chat-visitor-id');
    if (storedVisitorId) {
      return storedVisitorId;
    }

    // Generate new visitor ID based on device fingerprint
    const fingerprint = this.generateDeviceFingerprint();
    const visitorId = `visitor_${fingerprint.hash}`;

    localStorage.setItem('ai-chat-visitor-id', visitorId);
    return visitorId;
  }

  // Delete embed configuration
  async deleteEmbedConfig(embedId: string): Promise<void> {
    try {
      const docRef = doc(db, this.EMBEDS_COLLECTION, embedId);
      await updateDoc(docRef, {
        isActive: false,
        updatedAt: serverTimestamp(),
      });
      consoleLog('✅ Embed configuration deleted:', embedId);
    } catch (error) {
      consoleError('❌ Error deleting embed configuration:', error);
      throw error;
    }
  }
}

export const embedService = new EmbedService();
