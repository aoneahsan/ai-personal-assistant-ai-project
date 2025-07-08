import { PROJECT_PREFIX_FOR_COLLECTIONS_AND_FOLDERS } from '@/utils/constants/generic/firebase';
import { consoleError, consoleLog } from '@/utils/helpers/consoleHelper';
import {
  addDoc,
  collection,
  doc,
  FieldValue,
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
  createdAt: Timestamp | FieldValue; // Firestore timestamp
  updatedAt: Timestamp | FieldValue; // Firestore timestamp

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
    timestamp?: Timestamp | FieldValue;
  };
  ownerUserId: string; // The user who owns the embed
  ownerEmail: string;
  lastMessage?: string;
  lastMessageTime?: Timestamp | FieldValue; // Firestore timestamp
  lastMessageSender?: 'visitor' | 'owner';
  unreadCount?: number;
  isActive: boolean;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
}

// Device fingerprint interface
export interface DeviceFingerprint {
  userAgent: string;
  language: string;
  platform: string;
  screen: {
    width: number;
    height: number;
    colorDepth: number;
  };
  timezone: string;
  cookieEnabled: boolean;
  canvasFingerprint: string;
  hash: string;
}

export class EmbedService {
  private readonly EMBEDS_COLLECTION = `${PROJECT_PREFIX_FOR_COLLECTIONS_AND_FOLDERS}_embeds`;
  private readonly EMBED_CONVERSATIONS_COLLECTION = `${PROJECT_PREFIX_FOR_COLLECTIONS_AND_FOLDERS}_embed_conversations`;
  private readonly EMBED_MESSAGES_COLLECTION = `${PROJECT_PREFIX_FOR_COLLECTIONS_AND_FOLDERS}_embed_messages`;

  // Cache for embed configs to reduce Firebase calls
  private embedConfigCache = new Map<string, EmbedConfig>();
  private cacheExpiry = new Map<string, number>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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

  // Get embed configuration by ID with caching
  async getEmbedConfig(embedId: string): Promise<EmbedConfig | null> {
    try {
      // Check cache first
      const cached = this.embedConfigCache.get(embedId);
      const expiry = this.cacheExpiry.get(embedId);

      if (cached && expiry && Date.now() < expiry) {
        consoleLog('📋 Using cached embed config:', embedId);
        return cached;
      }

      consoleLog('🔍 Fetching embed config from Firebase:', embedId);
      const docRef = doc(db, this.EMBEDS_COLLECTION, embedId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const config = { id: docSnap.id, ...docSnap.data() } as EmbedConfig;

        // Cache the result
        this.embedConfigCache.set(embedId, config);
        this.cacheExpiry.set(embedId, Date.now() + this.CACHE_DURATION);

        return config;
      }
      return null;
    } catch (error) {
      consoleError('❌ Error getting embed configuration:', error);
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

  // Enhanced validation with better error messages
  async validateEmbedRequest(
    embedId: string,
    websiteUrl: string,
    origin: string
  ): Promise<{ isValid: boolean; config?: EmbedConfig; error?: string }> {
    try {
      if (!embedId || !websiteUrl || !origin) {
        return { isValid: false, error: 'Missing required parameters' };
      }

      const config = await this.getEmbedConfig(embedId);

      if (!config) {
        return { isValid: false, error: 'Embed configuration not found' };
      }

      if (!config.isActive) {
        return { isValid: false, error: 'Embed is deactivated' };
      }

      // Validate origin
      try {
        const originDomain = new URL(origin).hostname.toLowerCase();
        const isAllowed = config.allowedDomains.some((domain) => {
          const domainLower = domain.toLowerCase();
          return (
            originDomain === domainLower ||
            originDomain.endsWith(`.${domainLower}`)
          );
        });

        if (!isAllowed) {
          consoleError(
            `❌ Domain not authorized: ${originDomain}. Allowed domains:`,
            config.allowedDomains
          );
          return { isValid: false, error: 'Domain not authorized' };
        }
      } catch {
        consoleError('❌ Invalid origin URL:', origin);
        return { isValid: false, error: 'Invalid origin URL' };
      }

      return { isValid: true, config };
    } catch (error) {
      consoleError('❌ Error validating embed request:', error);
      return { isValid: false, error: 'Validation failed' };
    }
  }

  // Enhanced conversation creation with better error handling
  async createOrGetEmbeddedConversation(
    embedId: string,
    websiteUrl: string,
    visitorId: string,
    ownerUserId: string,
    ownerEmail: string,
    visitorMetadata?: EmbeddedChatConversation['visitorMetadata']
  ): Promise<string> {
    try {
      if (!embedId || !websiteUrl || !visitorId || !ownerUserId) {
        throw new Error(
          'Missing required parameters for conversation creation'
        );
      }

      consoleLog('🔄 Creating/getting embedded conversation:', {
        embedId,
        websiteUrl,
        visitorId,
        ownerUserId,
      });

      // Check if conversation already exists
      const q = query(
        collection(db, this.EMBED_CONVERSATIONS_COLLECTION),
        where('embedId', '==', embedId),
        where('websiteUrl', '==', websiteUrl),
        where('visitorId', '==', visitorId)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const existingConversation = querySnapshot.docs[0];
        consoleLog('✅ Found existing conversation:', existingConversation.id);
        return existingConversation.id;
      }

      // Create new conversation
      const conversation: EmbeddedChatConversation = {
        embedId,
        websiteUrl,
        visitorId,
        visitorMetadata: {
          ...visitorMetadata,
          timestamp: serverTimestamp(),
        },
        ownerUserId,
        ownerEmail,
        isActive: true,
        unreadCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(
        collection(db, this.EMBED_CONVERSATIONS_COLLECTION),
        conversation
      );

      consoleLog('✅ Created new embedded conversation:', docRef.id);
      return docRef.id;
    } catch (error) {
      consoleError('❌ Error creating embedded conversation:', error);
      throw new Error(
        `Failed to create conversation: ${error instanceof Error ? error.message : String(error)}`
      );
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

  // Enhanced device fingerprinting with fallback
  generateDeviceFingerprint(): DeviceFingerprint {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Generate canvas fingerprint
      let canvasFingerprint = '';
      if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Device fingerprint', 2, 2);
        canvasFingerprint = canvas.toDataURL();
      }

      const fingerprint: DeviceFingerprint = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screen: {
          width: screen.width,
          height: screen.height,
          colorDepth: screen.colorDepth,
        },
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        cookieEnabled: navigator.cookieEnabled,
        canvasFingerprint,
        hash: '',
      };

      // Create a simple hash from the fingerprint data
      const dataString = JSON.stringify(fingerprint);
      fingerprint.hash = this.simpleHash(dataString);

      return fingerprint;
    } catch (error) {
      consoleError('❌ Error generating device fingerprint:', error);
      // Fallback fingerprint
      return {
        userAgent: navigator.userAgent || 'unknown',
        language: navigator.language || 'en',
        platform: navigator.platform || 'unknown',
        screen: {
          width: screen.width || 1920,
          height: screen.height || 1080,
          colorDepth: screen.colorDepth || 24,
        },
        timezone: 'UTC',
        cookieEnabled: navigator.cookieEnabled || false,
        canvasFingerprint: '',
        hash: this.simpleHash(Date.now().toString()),
      };
    }
  }

  // Simple hash function for fingerprinting
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  // Enhanced visitor ID generation with better persistence
  getVisitorId(providedUserId?: string): string {
    try {
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
      const visitorId = `visitor_${fingerprint.hash}_${nanoid(8)}`;

      // Store visitor ID with error handling
      try {
        localStorage.setItem('ai-chat-visitor-id', visitorId);
        localStorage.setItem('ai-chat-visitor-created', Date.now().toString());
      } catch (storageError) {
        consoleError('❌ Error storing visitor ID:', storageError);
        // Continue without storage - visitor ID will be regenerated on refresh
      }

      return visitorId;
    } catch (error) {
      consoleError('❌ Error generating visitor ID:', error);
      // Fallback to simple random ID
      return `visitor_fallback_${nanoid(12)}`;
    }
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

  // Clear cache for a specific embed
  clearEmbedCache(embedId: string): void {
    this.embedConfigCache.delete(embedId);
    this.cacheExpiry.delete(embedId);
  }

  // Clear all cache
  clearAllCache(): void {
    this.embedConfigCache.clear();
    this.cacheExpiry.clear();
  }
}

export const embedService = new EmbedService();
