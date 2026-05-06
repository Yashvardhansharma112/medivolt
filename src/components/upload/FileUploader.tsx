import React, { useRef, useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileUploaderProps {
  onFileSelect: (file: File | null) => void;
  acceptedFileTypes?: string[];
  maxFileSizeMB?: number;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelect,
  acceptedFileTypes = ['*/*'],
  maxFileSizeMB = 10,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (files: FileList | null) => {
    if (!files || files.length === 0) {
      onFileSelect(null);
      return;
    }

    const file = files[0];
    
    // Validate file type
    if (acceptedFileTypes[0] !== '*/*') {
      const fileType = file.type;
      const isValidType = acceptedFileTypes.some(type => {
        if (type.includes('*')) {
          // Handle wildcards like 'image/*'
          return fileType.startsWith(type.split('/')[0]);
        }
        return type === fileType;
      });

      if (!isValidType) {
        setError(`File type not supported. Please upload: ${acceptedFileTypes.join(', ')}`);
        return;
      }
    }
    
    // Validate file size
    if (file.size > maxFileSizeMB * 1024 * 1024) {
      setError(`File too large. Maximum size is ${maxFileSizeMB}MB.`);
      return;
    }
    
    setError(null);
    onFileSelect(file);
  };
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    handleFileChange(e.dataTransfer.files);
  };
  
  const clearFile = () => {
    onFileSelect(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="mx-auto h-10 w-10 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          Drag and drop your file here, or click to browse
        </p>
        <input
          type="file"
          ref={inputRef}
          onChange={(e) => handleFileChange(e.target.files)}
          className="hidden"
          accept={acceptedFileTypes.join(',')}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={(e) => {
            e.stopPropagation();
            inputRef.current?.click();
          }}
        >
          <FileText className="mr-2 h-4 w-4" />
          Select File
        </Button>
      </div>
      
      {error && (
        <div className="mt-2 text-sm text-red-600 flex items-center">
          <X className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}
    </div>
  );
};
