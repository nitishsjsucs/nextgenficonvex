"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SingleFileUploader } from './single-file-uploader';

interface DocumentUploaderProps {
  onFilesChange: (files: { [key: string]: File | null }) => void;
  disabled: boolean;
  files: { [key: string]: File | null };
}

const requiredDocuments = [
  { id: 'id_card', title: "ID Card (Driver's License, State ID, Passport)" },
];

export function FileUploader({ onFilesChange, disabled, files }: DocumentUploaderProps) {
  const handleFileChange = (docId: string, file: File | null) => {
    onFilesChange({ ...files, [docId]: file });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>1. Upload Required Documents</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Please upload all of the following documents.
        </p>
        {requiredDocuments.map(doc => (
          <SingleFileUploader
            key={doc.id}
            title={doc.title}
            file={files[doc.id] || null}
            onFileChange={(file) => handleFileChange(doc.id, file)}
            disabled={disabled}
            required
          />
        ))}
      </CardContent>
    </Card>
  );
}
