"use client";

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, File as FileIcon, X, CheckCircle, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CameraComponent } from './camera-component';

interface SingleFileUploaderProps {
  onFileChange: (file: File | null) => void;
  disabled: boolean;
  file: File | null;
  title: string;
  required?: boolean;
}

export function SingleFileUploader({ onFileChange, disabled, file, title, required }: SingleFileUploaderProps) {
  const [showCamera, setShowCamera] = useState(false);
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileChange(acceptedFiles[0]);
    }
  }, [onFileChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
    },
    disabled,
    multiple: false,
  });

  const removeFile = () => {
    onFileChange(null);
  };

  const handleCameraCapture = () => {
    setShowCamera(true);
  };

  const handleCameraPhoto = (capturedFile: File) => {
    onFileChange(capturedFile);
    setShowCamera(false);
  };

  const handleCameraClose = () => {
    setShowCamera(false);
  };

  return (
    <div>
      <h4 className="font-medium mb-2 text-sm flex items-center">
        {title}
        {required && <span className="text-red-500 ml-1">*</span>}
        {file && <CheckCircle className="h-4 w-4 text-green-500 ml-2" />}
      </h4>
      {file ? (
        <div className="flex items-center justify-between p-2 pl-3 pr-1 bg-muted rounded-md h-14">
          <div className="flex items-center gap-2 overflow-hidden">
            <FileIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <span className="text-sm font-medium truncate">{file.name}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={removeFile}
            disabled={disabled}
            className="h-8 w-8 flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors h-14 flex items-center justify-center',
              isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50',
              disabled ? 'cursor-not-allowed opacity-50' : ''
            )}
          >
            <input {...getInputProps()} />
            <div className="flex items-center gap-2 text-muted-foreground">
              <UploadCloud className="h-5 w-5" />
              <p className="text-sm">
                {isDragActive ? 'Drop file here...' : 'Drag & drop or click'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex-1 border-t border-border"></div>
            <span className="text-xs text-muted-foreground px-2">or</span>
            <div className="flex-1 border-t border-border"></div>
          </div>
          
          <Button
            type="button"
            variant="outline"
            onClick={handleCameraCapture}
            disabled={disabled}
            className="w-full h-10"
          >
            <Camera className="h-4 w-4 mr-2" />
            Take Photo
          </Button>
        </div>
      )}
      
      {showCamera && (
        <CameraComponent
          onCapture={handleCameraPhoto}
          onClose={handleCameraClose}
        />
      )}
    </div>
  );
}
