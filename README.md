# FlatVision

A web app that extracts text from images and PDFs using AI powered OCR.

**Live at** https://flatvision.vercel.app/

## What it does

Upload an image or PDF, click extract, and get clean text. You can copy the text or download it as a file.

## How it works

The frontend runs on Vercel and connects to an external OCR engine for text extraction.

## Run it locally

You need Node.js 18 or newer. This repo is just the frontend UI. You will need your own OCR backend API to make it work.

```
git clone https://github.com/YeasirArafatAyan/FlatVision.git
cd FlatVision/FlatVision
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

## Tech stack

Next.js 14, React 18, TypeScript, Tailwind CSS, Axios

## License

MIT
