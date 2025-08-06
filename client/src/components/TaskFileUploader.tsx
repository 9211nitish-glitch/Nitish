import { useState } from "react";
import type { ReactNode } from "react";
import Uppy from "@uppy/core";
import { DashboardModal } from "@uppy/react";
import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";
import AwsS3 from "@uppy/aws-s3";
import type { UploadResult } from "@uppy/core";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";

interface TaskFileUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number; // Default 1GB
  onComplete?: (uploadedFiles: string[]) => void;
  buttonClassName?: string;
  children: ReactNode;
}

/**
 * A file upload component for task-related files with 1GB support.
 * 
 * Features:
 * - Supports files up to 1GB (configurable)
 * - Renders as a customizable button that opens a file upload modal
 * - Provides a modal interface for file selection, preview, and upload progress
 * - Returns normalized file paths for storage in database
 * 
 * @param props - Component props
 * @param props.maxNumberOfFiles - Maximum number of files allowed (default: 10)
 * @param props.maxFileSize - Maximum file size in bytes (default: 1GB)
 * @param props.onComplete - Callback with array of uploaded file paths
 * @param props.buttonClassName - Optional CSS class name for the button
 * @param props.children - Content to be rendered inside the button
 */
export function TaskFileUploader({
  maxNumberOfFiles = 10,
  maxFileSize = 1073741824, // 1GB default
  onComplete,
  buttonClassName,
  children,
}: TaskFileUploaderProps) {
  const [showModal, setShowModal] = useState(false);
  const [uppy] = useState(() =>
    new Uppy({
      restrictions: {
        maxNumberOfFiles,
        maxFileSize,
        allowedFileTypes: [
          'image/*', 
          'video/*', 
          '.pdf', 
          '.doc', 
          '.docx', 
          '.txt', 
          '.zip', 
          '.rar',
          '.mp3',
          '.mp4',
          '.mov',
          '.avi'
        ],
      },
      autoProceed: false,
    })
      .use(AwsS3, {
        shouldUseMultipart: false,
        getUploadParameters: async () => {
          const response = await apiRequest('POST', '/api/tasks/upload-url');
          const data = await response.json();
          return {
            method: 'PUT' as const,
            url: data.uploadURL,
          };
        },
      })
      .on("complete", (result) => {
        if (result.successful && result.successful.length > 0) {
          // Extract file paths from upload URLs and normalize them
          const filePaths = result.successful.map(file => {
            if (file.response && file.response.uploadURL) {
              // Extract file path from Google Cloud Storage URL
              const url = new URL(file.response.uploadURL);
              const pathParts = url.pathname.split('/');
              // Get the last part which should be the file ID
              const fileId = pathParts[pathParts.length - 1];
              return `/task-files/${fileId}`;
            }
            return '';
          }).filter(path => path !== '');
          
          onComplete?.(filePaths);
          setShowModal(false);
        }
      })
  );

  return (
    <div>
      <Button 
        onClick={() => setShowModal(true)} 
        className={buttonClassName}
        data-testid="button-upload-files"
      >
        {children}
      </Button>

      <DashboardModal
        uppy={uppy}
        open={showModal}
        onRequestClose={() => setShowModal(false)}
        proudlyDisplayPoweredByUppy={false}
        note="Upload task files (up to 1GB each)"
        metaFields={[
          { id: 'name', name: 'File Name', placeholder: 'Enter file name' },
          { id: 'description', name: 'Description', placeholder: 'Describe this file (optional)' }
        ]}
      />
    </div>
  );
}