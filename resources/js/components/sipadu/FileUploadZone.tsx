import { useCallback, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { formatFileSize } from '@/lib/sipadu-utils';
import { Button } from '@/components/ui/button';
import { UploadIcon, XIcon, FileIcon, AlertCircleIcon } from 'lucide-react';

/** Tipe file yang diperbolehkan */
const ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 5;

interface FileUploadZoneProps {
    /** File yang sudah dipilih */
    files: File[];
    /** Callback ketika file berubah */
    onChange: (files: File[]) => void;
    /** Pesan error dari server */
    error?: string;
    /** Apakah komponen disabled */
    disabled?: boolean;
}

/**
 * Zona upload file dengan drag-and-drop.
 * Mendukung: klik untuk browse, drag-and-drop, validasi tipe dan ukuran file.
 */
export function FileUploadZone({ files, onChange, error, disabled = false }: FileUploadZoneProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [localErrors, setLocalErrors] = useState<string[]>([]);

    const validateAndAddFiles = useCallback(
        (newFiles: FileList | File[]) => {
            const errors: string[] = [];
            const validFiles: File[] = [];
            const currentCount = files.length;

            for (const file of Array.from(newFiles)) {
                // Cek jumlah maksimal
                if (currentCount + validFiles.length >= MAX_FILES) {
                    errors.push(`Maksimal ${MAX_FILES} file yang diperbolehkan.`);
                    break;
                }

                // Cek tipe file
                if (!ALLOWED_TYPES.includes(file.type)) {
                    errors.push(
                        `"${file.name}" — tipe file tidak didukung. Format yang diperbolehkan: ${ALLOWED_EXTENSIONS.join(', ')}.`,
                    );
                    continue;
                }

                // Cek ukuran file
                if (file.size > MAX_FILE_SIZE) {
                    errors.push(
                        `"${file.name}" — ukuran file melebihi batas ${formatFileSize(MAX_FILE_SIZE)}.`,
                    );
                    continue;
                }

                validFiles.push(file);
            }

            setLocalErrors(errors);
            if (validFiles.length > 0) {
                onChange([...files, ...validFiles]);
            }
        },
        [files, onChange],
    );

    const removeFile = (index: number) => {
        const updated = files.filter((_, i) => i !== index);
        onChange(updated);
        setLocalErrors([]);
    };

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            if (!disabled) {
                validateAndAddFiles(e.dataTransfer.files);
            }
        },
        [disabled, validateAndAddFiles],
    );

    return (
        <div className="space-y-3">
            {/* Zona drag-and-drop */}
            <div
                className={cn(
                    'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors',
                    isDragging
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50',
                    disabled && 'opacity-50 cursor-not-allowed',
                    error && 'border-red-500',
                )}
                onDragOver={(e) => {
                    e.preventDefault();
                    if (!disabled) setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                role="button"
                tabIndex={disabled ? -1 : 0}
                onClick={() => !disabled && inputRef.current?.click()}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        if (!disabled) inputRef.current?.click();
                    }
                }}
                aria-label="Area upload file. Klik atau seret file ke sini."
            >
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    multiple
                    accept={ALLOWED_EXTENSIONS.map((ext) => `.${ext}`).join(',')}
                    onChange={(e) => {
                        if (e.target.files) {
                            validateAndAddFiles(e.target.files);
                            e.target.value = '';
                        }
                    }}
                    disabled={disabled}
                />
                <UploadIcon className="h-8 w-8 text-muted-foreground mb-2" aria-hidden="true" />
                <p className="text-sm text-muted-foreground text-center">
                    <span className="font-medium text-primary">Klik untuk pilih file</span>
                    {' '}atau seret file ke sini
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                    Format: JPG, PNG, PDF, DOC, DOCX. Maks {formatFileSize(MAX_FILE_SIZE)} per file. Maks {MAX_FILES} file.
                </p>
            </div>

            {/* Daftar file */}
            {files.length > 0 && (
                <ul className="space-y-2" aria-label="File yang dipilih">
                    {files.map((file, index) => (
                        <li
                            key={`${file.name}-${index}`}
                            className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
                        >
                            <div className="flex items-center gap-2 min-w-0">
                                <FileIcon className="h-4 w-4 flex-shrink-0 text-muted-foreground" aria-hidden="true" />
                                <div className="min-w-0">
                                    <p className="text-sm font-medium truncate">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 flex-shrink-0"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeFile(index);
                                }}
                                aria-label={`Hapus file ${file.name}`}
                            >
                                <XIcon className="h-4 w-4" />
                            </Button>
                        </li>
                    ))}
                </ul>
            )}

            {/* Error */}
            {(localErrors.length > 0 || error) && (
                <div className="space-y-1">
                    {error && (
                        <p className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                            <AlertCircleIcon className="h-4 w-4" />
                            {error}
                        </p>
                    )}
                    {localErrors.map((err, i) => (
                        <p key={i} className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                            <AlertCircleIcon className="h-4 w-4" />
                            {err}
                        </p>
                    ))}
                </div>
            )}
        </div>
    );
}
