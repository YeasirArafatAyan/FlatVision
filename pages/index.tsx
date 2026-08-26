import { useState, useCallback } from 'react'
import Head from 'next/head'
import ImageUpload from '@/components/ImageUpload'
import ResultsDisplay from '@/components/ResultsDisplay'
import DarkModeToggle from '@/components/DarkModeToggle'
import axios from 'axios'

interface HomeProps {
  darkMode: boolean
  toggleDarkMode: () => void
}

export default function Home({ darkMode, toggleDarkMode }: HomeProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [extractedText, setExtractedText] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<{
    lines: number
    characters: number
    words: number
    pages?: number
  } | null>(null)

  const handleImageSelect = useCallback((file: File) => {
    setSelectedImage(file)
    setError(null)
    setExtractedText('')
    setStats(null)

    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else if (file.type === 'application/pdf') {
      setImagePreview(null)
    }
  }, [])

  const handleExtractText = async () => {
    if (!selectedImage) {
      setError('Please select an image or PDF first')
      return
    }

    setIsLoading(true)
    setError(null)
    setExtractedText('')
    setStats(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedImage)
      
      const response = await axios.post('/api/ocr', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000,
      })

      setExtractedText(response.data.text || '')
      setStats({
        lines: response.data.lines || 0,
        characters: response.data.characters || 0,
        words: response.data.words || 0,
        pages: response.data.pages || 1,
      })
    } catch (err: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('OCR processing error:', err)
      }
      
      if (err.response) {
        const status = err.response.status
        
        if (status === 400) {
          const errorDetail = err.response.data?.detail || err.response.data?.message
          if (errorDetail && errorDetail.toLowerCase().includes('size')) {
            setError('File is too large. Please upload a smaller file (max 10MB for images, 20MB for PDFs).')
          } else if (errorDetail && errorDetail.toLowerCase().includes('type')) {
            setError('Invalid file type. Please upload JPEG, PNG, WebP images or PDF files.')
          } else {
            setError('The file could not be processed. Please check that it\'s a valid image or PDF file.')
          }
        } else if (status === 404) {
          setError('Service temporarily unavailable. Please try again in a moment.')
        } else if (status === 500) {
          setError('An error occurred while processing your file. Please try again.')
        } else {
          setError('Unable to process your file. Please try again.')
        }
      } else if (err.request) {
        setError('Unable to connect to the service. Please check your internet connection and try again.')
      } else if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError('The request took too long. Please try again with a smaller file.')
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setSelectedImage(null)
    setImagePreview(null)
    setExtractedText('')
    setStats(null)
    setError(null)
  }

  return (
    <>
      <Head>
        <title>FlatVision - Extract Text from Files</title>
        <meta name="description" content="Extract clean, readable text from files using AI-powered OCR" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-6xl">
          {/* Header */}
          <header className="mb-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                    FlatVision
                  </h1>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                  Extract clean, readable text from images and PDFs using AI-powered OCR
                </p>
              </div>
              <DarkModeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            </div>
          </header>

          {/* Cold Start Notice */}
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-800/40 rounded-xl">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-500 dark:text-amber-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                  First extraction may take 30-60 seconds
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400/70 mt-1">
                  The backend server goes to sleep when idle. The first request wakes it up, subsequent extractions will be fast.
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Image Upload */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-black/20 border border-gray-200/60 dark:border-gray-700/50 p-6">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Upload File
                  </h2>
                </div>
                <ImageUpload
                  onImageSelect={handleImageSelect}
                  imagePreview={imagePreview}
                  selectedImage={selectedImage}
                />
              </div>

              {selectedImage && (
                <div className="bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-black/20 border border-gray-200/60 dark:border-gray-700/50 p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedImage.type === 'application/pdf' ? 'PDF File' : 'Preview'}
                      </h2>
                    </div>
                    <button
                      onClick={handleReset}
                      className="px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600/50 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                  {imagePreview ? (
                    <div className="relative w-full h-56 sm:h-64 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-900/50">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : selectedImage.type === 'application/pdf' ? (
                    <div className="relative w-full h-56 sm:h-64 border border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-gray-900/50">
                      <div className="text-center">
                        <div className="mx-auto w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
                          <svg className="h-8 w-8 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 font-medium text-sm">{selectedImage.name}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {(selectedImage.size / 1024).toFixed(1)} KB &middot; PDF Document
                        </p>
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-4 p-3 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Ready to extract</span>
                    </div>
                    <p className="text-xs text-blue-600/70 dark:text-blue-400/60">
                      Click the button below to start OCR processing. The backend may need a moment to wake up on the first request.
                    </p>
                  </div>

                  <button
                    onClick={handleExtractText}
                    disabled={isLoading}
                    className="mt-4 w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-blue-400 disabled:to-indigo-400 text-white font-semibold rounded-xl transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:shadow-none"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Extracting...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Extract Text
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Right Column - Results */}
            <div className="space-y-6">
              <ResultsDisplay
                extractedText={extractedText}
                stats={stats}
                isLoading={isLoading}
                error={error}
              />
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-16 pt-8 border-t border-gray-200/60 dark:border-gray-800/60">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Built by <span className="font-semibold text-gray-600 dark:text-gray-300">Yeasir Arafat Ayan</span>
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-600">
                AI-powered OCR &middot; FlatVision
              </p>
            </div>
          </footer>
        </div>
      </div>
    </>
  )
}
