import { router } from '@inertiajs/react';
import { Download, File, FileImage, FileSpreadsheet, FileText, Paperclip, Trash2, Upload, X } from 'lucide-react';
import { useCallback, useState } from 'react';

import { Button } from '@/components/ui/button';
import { TaskAttachment } from '@/types';

interface FileUploadProps {
    taskId: string;
    attachments?: TaskAttachment[];
    onUploadComplete?: () => void;
}

const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return FileImage;
    if (mimeType.includes('pdf')) return FileText;
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType.includes('csv')) return FileSpreadsheet;
    if (mimeType.includes('document') || mimeType.includes('text')) return FileText;
    return File;
};

export function FileUpload({ taskId, attachments = [], onUploadComplete }: FileUploadProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [error, setError] = useState<string | null>(null);

    const maxFileSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/csv',
        'application/zip',
    ];

    const validateFile = useCallback((file: File): string | null => {
        if (file.size > maxFileSize) {
            return `File "${file.name}" exceeds maximum size of 10MB.`;
        }
        if (!allowedTypes.includes(file.type)) {
            return `File "${file.name}" has an unsupported file type.`;
        }
        return null;
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        setError(null);

        const files = Array.from(e.dataTransfer.files);
        const validFiles: File[] = [];
        const errors: string[] = [];

        files.forEach((file) => {
            const validationError = validateFile(file);
            if (validationError) {
                errors.push(validationError);
            } else {
                validFiles.push(file);
            }
        });

        if (errors.length > 0) {
            setError(errors[0]);
        }

        setSelectedFiles((prev) => [...prev, ...validFiles].slice(0, 10));
    }, [validateFile]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        const files = e.target.files ? Array.from(e.target.files) : [];
        const validFiles: File[] = [];
        const errors: string[] = [];

        files.forEach((file) => {
            const validationError = validateFile(file);
            if (validationError) {
                errors.push(validationError);
            } else {
                validFiles.push(file);
            }
        });

        if (errors.length > 0) {
            setError(errors[0]);
        }

        setSelectedFiles((prev) => [...prev, ...validFiles].slice(0, 10));
        e.target.value = ''; // Reset input
    };

    const removeSelectedFile = (index: number) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const uploadFiles = async () => {
        if (selectedFiles.length === 0) return;

        setIsUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('task_id', taskId);
        selectedFiles.forEach((file) => {
            formData.append('files[]', file);
        });

        router.post('/task-attachments', formData, {
            forceFormData: true,
            onSuccess: () => {
                setSelectedFiles([]);
                setIsUploading(false);
                onUploadComplete?.();
            },
            onError: (errors) => {
                setError(Object.values(errors)[0] as string);
                setIsUploading(false);
            },
        });
    };

    const deleteAttachment = (attachmentId: string) => {
        if (!confirm('Are you sure you want to delete this attachment?')) return;

        router.delete(`/task-attachments/${attachmentId}`, {
            preserveScroll: true,
        });
    };

    return (
        <div className="space-y-4">
            {/* Dropzone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    isDragOver
                        ? 'border-primary bg-primary/5'
                        : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                }`}
            >
                <input
                    type="file"
                    id="file-upload"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                        Drag and drop files here, or{' '}
                        <span className="text-primary font-medium">browse</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Max 10MB per file. Supports images, PDFs, documents, and spreadsheets.
                    </p>
                </label>
            </div>

            {/* Error Message */}
            {error && (
                <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                    {error}
                </div>
            )}

            {/* Selected Files Preview */}
            {selectedFiles.length > 0 && (
                <div className="space-y-2">
                    <p className="text-sm font-medium">Selected files ({selectedFiles.length})</p>
                    <div className="space-y-2">
                        {selectedFiles.map((file, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between bg-muted/50 rounded-md p-2"
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    <Paperclip className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span className="text-sm truncate">{file.name}</span>
                                    <span className="text-xs text-muted-foreground shrink-0">
                                        ({(file.size / 1024).toFixed(1)} KB)
                                    </span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeSelectedFile(index)}
                                    className="h-6 w-6 p-0"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                    <Button
                        onClick={uploadFiles}
                        disabled={isUploading}
                        className="w-full"
                    >
                        {isUploading ? (
                            <>Uploading...</>
                        ) : (
                            <>
                                <Upload className="h-4 w-4 mr-2" />
                                Upload {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''}
                            </>
                        )}
                    </Button>
                </div>
            )}

            {/* Existing Attachments */}
            {attachments.length > 0 && (
                <div className="space-y-2">
                    <p className="text-sm font-medium">Attachments ({attachments.length})</p>
                    <div className="grid gap-2">
                        {attachments.map((attachment) => {
                            const FileIcon = getFileIcon(attachment.mime_type);
                            return (
                                <div
                                    key={attachment.id}
                                    className="flex items-center justify-between bg-muted/50 rounded-md p-3"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        {attachment.is_image ? (
                                            <img
                                                src={attachment.url}
                                                alt={attachment.original_filename}
                                                className="h-10 w-10 rounded object-cover"
                                            />
                                        ) : (
                                            <div className="h-10 w-10 rounded bg-background flex items-center justify-center">
                                                <FileIcon className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium truncate">
                                                {attachment.original_filename}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {attachment.formatted_size}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            asChild
                                            className="h-8 w-8 p-0"
                                        >
                                            <a
                                                href={`/task-attachments/${attachment.id}/download`}
                                                download
                                            >
                                                <Download className="h-4 w-4" />
                                            </a>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => deleteAttachment(attachment.id)}
                                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
