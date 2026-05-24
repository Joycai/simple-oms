'use client'

import { useRef, useState, useCallback } from 'react'
import Cropper, { type Area } from 'react-easy-crop'

export interface ImageData {
  id: number | null
  data: string
}

async function canvasCrop(imgSrc: string, crop: Area): Promise<string> {
  const img = new Image()
  return new Promise((resolve) => {
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = crop.width
      canvas.height = crop.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height)
      canvas.toBlob((blob) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(blob!)
      }, 'image/webp', 0.85)
    }
    img.src = imgSrc
  })
}

export function useImageUpload(limitMB = 5) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [images, setImages] = useState<ImageData[]>([])
  const [error, setError] = useState('')
  const [croppingFile, setCroppingFile] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedArea, setCroppedArea] = useState<Area | null>(null)

  function trigger() { inputRef.current?.click() }

  function handleFiles(files: FileList) {
    setError('')
    for (const file of Array.from(files)) {
      if (file.size > limitMB * 1024 * 1024) { setError(`Image too large (max ${limitMB}MB)`); return }
      if (!file.type.startsWith('image/')) { setError('Only images allowed'); return }
      setCroppingFile(URL.createObjectURL(file))
      break
    }
    if (inputRef.current) inputRef.current.value = ''
  }

  const onCropComplete = useCallback((_: Area, cropped: Area) => setCroppedArea(cropped), [])

  async function confirmCrop() {
    if (!croppingFile || !croppedArea) return
    const result = await canvasCrop(croppingFile, croppedArea)
    setImages(prev => [...prev, { id: null, data: result }])
    URL.revokeObjectURL(croppingFile)
    setCroppingFile(null)
    setCrop({ x: 0, y: 0 }); setZoom(1); setCroppedArea(null)
  }

  function cancelCrop() {
    if (croppingFile) URL.revokeObjectURL(croppingFile)
    setCroppingFile(null)
    setCrop({ x: 0, y: 0 }); setZoom(1); setCroppedArea(null)
  }

  function remove(index: number) { setImages(prev => prev.filter((_, i) => i !== index)) }
  function move(from: number, to: number) {
    setImages(prev => { const n = [...prev]; const [x] = n.splice(from, 1); n.splice(to, 0, x); return n })
  }

  return {
    inputRef, images, error, trigger, setImages, croppingFile, crop, setCrop, zoom, setZoom, onCropComplete,
    handleFiles: (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files) handleFiles(e.target.files) },
    confirmCrop, cancelCrop, remove,
    moveUp: (i: number) => { if (i > 0) move(i, i - 1) },
    moveDown: (i: number) => move(i, i + 1),
  }
}

export function ImageCropModal({ upload }: { upload: ReturnType<typeof useImageUpload> }) {
  if (!upload.croppingFile) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
        <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-slate-50">Crop Your Illustration</h3>
        <p className="mt-1 text-xs text-slate-500 mb-4">Adjust the selection to fit the library's gallery standards.</p>
        <div className="relative h-72 w-full bg-slate-200 dark:bg-slate-800 rounded-xl overflow-hidden">
          <Cropper image={upload.croppingFile} crop={upload.crop} zoom={upload.zoom}
            aspect={1} cropShape="rect" onCropChange={upload.setCrop}
            onZoomChange={upload.setZoom} onCropComplete={upload.onCropComplete} />
        </div>
        <div className="mt-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
             <span className="text-xs text-slate-400">Zoom</span>
             <input type="range" min={1} max={3} step={0.1} value={upload.zoom}    
               onChange={e => upload.setZoom(Number(e.target.value))}
               className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
          </div>
          <div className="flex gap-3">
            <button onClick={upload.confirmCrop}
              className="flex-1 rounded-xl bg-indigo-950 py-2.5 text-sm font-bold text-white hover:bg-indigo-900">Confirm</button>
            <button onClick={upload.cancelCrop}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ImageInput({ upload }: { upload: ReturnType<typeof useImageUpload> }) {
  return (
    <input ref={upload.inputRef} type="file" accept="image/*" multiple
      onChange={upload.handleFiles} className="hidden" />
  )
}