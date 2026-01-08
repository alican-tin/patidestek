import React, { useState, useCallback } from 'react';
import { Button, Spinner, Alert } from 'flowbite-react';

interface CloudinaryUploadProps {
  onUpload: (url: string) => void;
  currentUrl?: string;
}

const CloudinaryUpload: React.FC<CloudinaryUploadProps> = ({ onUpload, currentUrl }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(currentUrl || '');

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const handleUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!cloudName || !uploadPreset) {
      setError('Cloudinary yapılandırması eksik. Lütfen .env dosyasını kontrol edin.');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setPreview(data.secure_url);
      onUpload(data.secure_url);
    } catch (err) {
      setError('Görsel yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setUploading(false);
    }
  }, [cloudName, uploadPreset, onUpload]);

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Görsel (Opsiyonel)
      </label>
      
      {error && (
        <Alert color="failure" onDismiss={() => setError('')}>
          {error}
        </Alert>
      )}

      <div className="flex items-center gap-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          disabled={uploading}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {uploading && <Spinner size="sm" />}
      </div>

      {preview && (
        <div className="mt-2">
          <img
            src={preview}
            alt="Preview"
            className="max-w-xs max-h-48 rounded-lg border object-cover"
          />
        </div>
      )}
    </div>
  );
};

export default CloudinaryUpload;
