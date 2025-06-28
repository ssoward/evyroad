import React, { useState, useRef } from 'react';
import { Camera, Upload, X, MapPin, FileImage, AlertCircle } from 'lucide-react';

interface PhotoUploadProps {
  tripId: string;
  onPhotoUploaded: (photo: any) => void;
  maxPhotos?: number;
  currentPhotos?: number;
}

interface PhotoFile {
  file: File;
  preview: string;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  caption?: string;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({
  tripId,
  onPhotoUploaded,
  maxPhotos = 10,
  currentPhotos = 0
}) => {
  const [selectedFiles, setSelectedFiles] = useState<PhotoFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const remainingSlots = maxPhotos - currentPhotos - selectedFiles.length;
    
    if (files.length > remainingSlots) {
      setError(`Can only add ${remainingSlots} more photos`);
      return;
    }

    const newPhotoFiles: PhotoFile[] = [];

    files.forEach(file => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select only image files');
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('Images must be smaller than 5MB');
        return;
      }

      const preview = URL.createObjectURL(file);
      const photoFile: PhotoFile = {
        file,
        preview
      };

      // Try to get current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            photoFile.location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
          },
          (error) => {
            console.warn('Could not get location for photo:', error);
          }
        );
      }

      newPhotoFiles.push(photoFile);
    });

    setSelectedFiles(prev => [...prev, ...newPhotoFiles]);
    setError(null);
  };

  const removePhoto = (index: number) => {
    setSelectedFiles(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const updateCaption = (index: number, caption: string) => {
    setSelectedFiles(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], caption };
      return updated;
    });
  };

  const uploadPhotos = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      for (const photoFile of selectedFiles) {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('photo', photoFile.file);
        formData.append('caption', photoFile.caption || '');
        
        if (photoFile.location) {
          formData.append('location', JSON.stringify(photoFile.location));
        }

        // Upload to backend
        const response = await fetch(`/api/v1/trips/${tripId}/photos`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          body: formData
        });

        if (!response.ok) {
          throw new Error(`Failed to upload photo: ${response.statusText}`);
        }

        const result = await response.json();
        
        if (result.success) {
          onPhotoUploaded(result.data.photo);
        } else {
          throw new Error(result.error || 'Failed to upload photo');
        }
      }

      // Clean up and reset
      selectedFiles.forEach(photoFile => {
        URL.revokeObjectURL(photoFile.preview);
      });
      setSelectedFiles([]);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (err) {
      console.error('Photo upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload photos');
    } finally {
      setUploading(false);
    }
  };

  const canAddMore = currentPhotos + selectedFiles.length < maxPhotos;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Camera className="w-5 h-5 mr-2" />
          Trip Photos
        </h3>
        <span className="text-sm text-gray-500">
          {currentPhotos + selectedFiles.length} / {maxPhotos}
        </span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* File Input */}
      {canAddMore && (
        <div className="mb-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 hover:bg-primary-50 transition-colors"
          >
            <FileImage className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 font-medium">Click to select photos</p>
            <p className="text-sm text-gray-500">PNG, JPG up to 5MB each</p>
          </button>
        </div>
      )}

      {/* Selected Photos Preview */}
      {selectedFiles.length > 0 && (
        <div className="space-y-4 mb-4">
          <h4 className="font-medium text-gray-900">Selected Photos</h4>
          <div className="space-y-3">
            {selectedFiles.map((photoFile, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start space-x-4">
                  <img
                    src={photoFile.preview}
                    alt="Photo preview"
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      placeholder="Add a caption..."
                      value={photoFile.caption || ''}
                      onChange={(e) => updateCaption(index, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    {photoFile.location && (
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="w-4 h-4 mr-1" />
                        Location: {photoFile.location.lat.toFixed(6)}, {photoFile.location.lng.toFixed(6)}
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      {photoFile.file.name} ({(photoFile.file.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                  </div>
                  <button
                    onClick={() => removePhoto(index)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      {selectedFiles.length > 0 && (
        <div className="flex space-x-3">
          <button
            onClick={uploadPhotos}
            disabled={uploading}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload {selectedFiles.length} Photo{selectedFiles.length > 1 ? 's' : ''}
              </>
            )}
          </button>
          <button
            onClick={() => {
              selectedFiles.forEach(photoFile => {
                URL.revokeObjectURL(photoFile.preview);
              });
              setSelectedFiles([]);
              setError(null);
            }}
            className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            Clear
          </button>
        </div>
      )}

      {/* Guidelines */}
      <div className="mt-4 text-xs text-gray-500">
        <p className="font-medium mb-1">Photo Guidelines:</p>
        <ul className="space-y-1">
          <li>• Photos are automatically geotagged if location permission is granted</li>
          <li>• Add captions to help document your journey</li>
          <li>• Photos may be used for route certification if applicable</li>
          <li>• High-quality photos enhance your trip memories and sharing</li>
        </ul>
      </div>
    </div>
  );
};

export default PhotoUpload;
