import { useState } from 'react'

interface ResultsDisplayProps {
  extractedText: string
  stats: {
    lines: number
    characters: number
    words: number
    pages?: number
  } | null
  isLoading: boolean
  error: string | null
}

export default function ResultsDisplay({ extractedText, stats, isLoading, error }: ResultsDisplayProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (extractedText) {
      try {
        await navigator.clipboard.writeText(extractedText)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to copy text:', err)
        }
      }
    }
  }

  const handleDownload = () => {
    if (extractedText) {
      const blob = new Blob([extractedText], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'extracted-text.txt'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-black/20 border border-gray-200/60 dark:border-gray-700/50 p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
            <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Extracted Text
          </h2>
        </div>
        {extractedText && (
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700/50 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600/50 transition-colors flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700/50 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600/50 transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-3 text-center border border-gray-100 dark:border-gray-700/50">
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {stats.lines.toLocaleString()}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 mt-1 font-medium">
              Lines
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-3 text-center border border-gray-100 dark:border-gray-700/50">
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {stats.characters.toLocaleString()}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 mt-1 font-medium">
              Characters
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-3 text-center border border-gray-100 dark:border-gray-700/50">
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {stats.words.toLocaleString()}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 mt-1 font-medium">
              Words
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-5 p-4 bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-800/40 rounded-xl">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-red-500 dark:text-red-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex-1 flex items-center justify-center min-h-[384px]">
          <div className="text-center">
            <div className="relative mx-auto w-16 h-16 mb-4">
              <svg className="animate-spin w-16 h-16 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Processing your file...
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
              This may take up to a minute if the server is waking up
            </p>
          </div>
        </div>
      )}

      {/* Text Display */}
      {!isLoading && !error && (
        <div className="relative flex-1">
          <textarea
            readOnly
            value={extractedText || ''}
            className="w-full h-96 p-4 border border-gray-200 dark:border-gray-700/50 rounded-xl bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 resize-none font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            placeholder=""
          />
          {!extractedText && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center px-6">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-400 dark:text-gray-500 text-sm">
                  Upload a file and click &quot;Extract Text&quot; to get started
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
