import { consoleError } from '@/utils/helpers/consoleHelper';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { showCapacitorToastMessage } from './index';

export interface FileInfo {
  name: string;
  size: number;
  type: string;
  url: string;
  path?: string;
}

export interface CameraOptions {
  quality?: number;
  allowEditing?: boolean;
  width?: number;
  height?: number;
}

// Generate unique filename with timestamp
const generateFileName = (
  extension: string,
  prefix: string = 'file'
): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${random}.${extension}`;
};

// Get file extension from MIME type
const getExtensionFromMimeType = (mimeType: string): string => {
  const mimeToExt: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/quicktime': 'mov',
    'audio/webm': 'webm',
    'audio/wav': 'wav',
    'audio/mp3': 'mp3',
    'application/pdf': 'pdf',
    'text/plain': 'txt',
  };
  return mimeToExt[mimeType] || 'bin';
};

// Convert data URL to blob
export const dataUrlToBlob = async (dataUrl: string): Promise<Blob> => {
  const response = await fetch(dataUrl);
  return response.blob();
};

// Save blob to device storage using Capacitor Filesystem
export const saveBlobToDevice = async (
  blob: Blob,
  fileName?: string,
  directory: Directory = Directory.Data
): Promise<FileInfo> => {
  try {
    const extension = getExtensionFromMimeType(blob.type);
    const finalFileName = fileName || generateFileName(extension, 'media');

    if (Capacitor.isNativePlatform()) {
      // Convert blob to base64 for native platforms
      const base64Data = await blobToBase64(blob);
      const base64String = base64Data.split(',')[1]; // Remove data:mime;base64, prefix

      const result = await Filesystem.writeFile({
        path: finalFileName,
        data: base64String,
        directory,
      });

      return {
        name: finalFileName,
        size: blob.size,
        type: blob.type,
        url: result.uri,
        path: result.uri,
      };
    } else {
      // For web platform, create object URL
      const url = URL.createObjectURL(blob);
      return {
        name: finalFileName,
        size: blob.size,
        type: blob.type,
        url,
      };
    }
  } catch (error) {
    consoleError('Error saving file to device:', error);
    throw new Error('Failed to save file to device');
  }
};

// Convert blob to base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Take photo using Capacitor Camera API
export const takePhoto = async (
  options: CameraOptions = {}
): Promise<FileInfo> => {
  try {
    const image = await Camera.getPhoto({
      quality: options.quality || 90,
      allowEditing: options.allowEditing || false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
      width: options.width,
      height: options.height,
    });

    if (!image.dataUrl) {
      throw new Error('No image data received');
    }

    // Convert to blob
    const blob = await dataUrlToBlob(image.dataUrl);

    // Save to device storage
    const fileInfo = await saveBlobToDevice(blob, undefined, Directory.Data);

    await showCapacitorToastMessage({
      text: 'Photo captured successfully!',
      duration: 'short',
    });

    return fileInfo;
  } catch (error) {
    consoleError('Error taking photo:', error);
    await showCapacitorToastMessage({
      text: 'Failed to take photo. Please try again.',
      duration: 'short',
    });
    throw error;
  }
};

// Pick image from gallery using Capacitor Camera API
export const pickImageFromGallery = async (
  options: CameraOptions = {}
): Promise<FileInfo> => {
  try {
    const image = await Camera.getPhoto({
      quality: options.quality || 90,
      allowEditing: options.allowEditing || false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Photos,
      width: options.width,
      height: options.height,
    });

    if (!image.dataUrl) {
      throw new Error('No image data received');
    }

    // Convert to blob
    const blob = await dataUrlToBlob(image.dataUrl);

    // Save to device storage
    const fileInfo = await saveBlobToDevice(blob, undefined, Directory.Data);

    await showCapacitorToastMessage({
      text: 'Image selected successfully!',
      duration: 'short',
    });

    return fileInfo;
  } catch (error) {
    consoleError('Error picking image:', error);
    await showCapacitorToastMessage({
      text: 'Failed to select image. Please try again.',
      duration: 'short',
    });
    throw error;
  }
};

// Read file from device storage
export const readFileFromDevice = async (path: string): Promise<string> => {
  try {
    const result = await Filesystem.readFile({
      path,
      directory: Directory.Data,
    });

    if (typeof result.data === 'string') {
      return result.data;
    } else {
      // Convert Blob to base64 string
      const blob = result.data as Blob;
      return await blobToBase64(blob);
    }
  } catch (error) {
    consoleError('Error reading file:', error);
    throw new Error('Failed to read file from device');
  }
};

// Delete file from device storage
export const deleteFileFromDevice = async (path: string): Promise<void> => {
  try {
    await Filesystem.deleteFile({
      path,
      directory: Directory.Data,
    });
  } catch (error) {
    consoleError('Error deleting file:', error);
    throw new Error('Failed to delete file from device');
  }
};

// Handle web file input for browser compatibility
export const handleWebFileInput = async (file: File): Promise<FileInfo> => {
  try {
    const url = URL.createObjectURL(file);

    if (Capacitor.isNativePlatform()) {
      // For native platforms, save to device storage
      return await saveBlobToDevice(file, file.name);
    } else {
      // For web, just return the object URL
      return {
        name: file.name,
        size: file.size,
        type: file.type,
        url,
      };
    }
  } catch (error) {
    consoleError('Error handling web file:', error);
    throw new Error('Failed to process file');
  }
};

// Get file info from path
export const getFileInfo = async (path: string): Promise<unknown> => {
  try {
    return await Filesystem.stat({
      path,
      directory: Directory.Data,
    });
  } catch (error) {
    consoleError('Error getting file info:', error);
    throw new Error('Failed to get file information');
  }
};

// Check if file exists
export const fileExists = async (path: string): Promise<boolean> => {
  try {
    await Filesystem.stat({
      path,
      directory: Directory.Data,
    });
    return true;
  } catch {
    return false;
  }
};
