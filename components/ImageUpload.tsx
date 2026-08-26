import { useCallback, useState } from 'react'

interface ImageUploadProps {
  onImageSelect: (file: File) => void
  imagePreview: string | null
  selectedImage: File | null
}

export default function ImageUpload({ onImageSelect, imagePreview, selectedImage }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        onImageSelect(file)
      }
    }
  }, [onImageSelect])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      onImageSelect(files[0])
    }
  }, [onImageSelect])

  const handleClick = useCallback(() => {
    const input = document.getElementById('file-input') as HTMLInputElement
    input?.click()
  }, [])

  return (
    <div>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          relative border-2 border-dashed rounded-xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-200
          ${isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.01]'
            : imagePreview
              ? 'border-emerald-400 dark:border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-900/10'
              : 'border-gray-200 dark:border-gray-600/50 hover:border-gray-300 dark:hover:border-gray-500/50 hover:bg-gray-50 dark:hover:bg-gray-700/20'
          }
        `}
      >
        <input
          id="file-input"
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
        <div className="space-y-4">
          <div className={`
            mx-auto w-14 h-14 rounded-2xl flex items-center justify-center transition-colors
            ${isDragging
              ? 'bg-blue-100 dark:bg-blue-800/30'
              : imagePreview
                ? 'bg-emerald-100 dark:bg-emerald-800/30'
                : 'bg-gray-100 dark:bg-gray-700/50'
            }
          `}>
            {imagePreview ? (
              <svg className="w-7 h-7 text-emerald-500 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg
                className={`w-7 h-7 ${isDragging ? 'text-blue-500 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            )}
          </div>
          <div>
            <p className="text-base font-medium text-gray-700 dark:text-gray-300">
              {imagePreview || selectedImage ? (
                <span className="text-emerald-600 dark:text-emerald-400">File ready</span>
              ) : isDragging ? (
                <span className="text-blue-600 dark:text-blue-400">Drop your file here</span>
              ) : (
                'Drag & drop your file here'
              )}
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1.5">
              {imagePreview || selectedImage ? 'Click to change file' : 'or click to browse'}
            </p>
            {selectedImage && (
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                  {selectedImage.name}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  ({(selectedImage.size / 1024).toFixed(1)} KB)
                </span>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500/70">
            JPEG, PNG, WebP, PDF &middot; Max 10MB images, 20MB PDFs
          </p>
        </div>
      </div>
    </div>
  )
}
