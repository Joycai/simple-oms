'use client'

import { useRef, useState, useCallback } from 'react'
import Cropper, { type Area } from 'react-easy-crop'

function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  return fetch(dataUrl).then(r => r.blob())
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

async function autoResize(file: File, maxW = 800, maxH = 800): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      let w = img.width, h = img.height
      if (w > maxW || h > maxH) {
        const r = Math.min(maxW / w, maxH / h)
        w = Math.round(w * r); h = Math.round(h * r)
      }
      const c = document.createElement('canvas'); c.width = w; c.height = h
      c.getContext('2d')!.drawImage(img, 0, 0, w, h)
      c.toBlob(b => {
        const r = new FileReader()
        r.onloadend = () => resolve(r.result as string)
        r.readAsDataURL(b!)
      }, 'image/webp', 0.8)
    }
    img.src = URL.createObjectURL(file)
  })
}

export function useImageUpload(limitMB = 5) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [previews, setPreviews] = useState<string[]>([])
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
      break // crop one at a time
    }
    if (inputRef.current) inputRef.current.value = ''
  }

  const onCropComplete = useCallback((_: Area, cropped: Area) => setCroppedArea(cropped), [])

  async function confirmCrop() {
    if (!croppingFile || !croppedArea) return
    const result = await canvasCrop(croppingFile, croppedArea)
    setPreviews(prev => [...prev, result])
    URL.revokeObjectURL(croppingFile)
    setCroppingFile(null)
    setCrop({ x: 0, y: 0 }); setZoom(1); setCroppedArea(null)
  }

  function cancelCrop() {
    if (croppingFile) URL.revokeObjectURL(croppingFile)
    setCroppingFile(null)
    setCrop({ x: 0, y: 0 }); setZoom(1); setCroppedArea(null)
  }

  function remove(index: number) { setPreviews(prev => prev.filter((_, i) => i !== index)) }
  function move(from: number, to: number) {
    setPreviews(prev => { const n = [...prev]; const [x] = n.splice(from, 1); n.splice(to, 0, x); return n })
  }

  return {
    inputRef, previews, error, trigger, setPreviews, croppingFile, crop, setCrop, zoom, setZoom, onCropComplete,
    handleFiles: (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files) handleFiles(e.target.files) },
    confirmCrop, cancelCrop, remove,
    moveUp: (i: number) => { if (i > 0) move(i, i - 1) },
    moveDown: (i: number) => move(i, i + 1),
  }
}

export function ImageCropModal({ upload }: { upload: ReturnType<typeof useImageUpload> }) {
  if (!upload.croppingFile) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-lg rounded-xl bg-white p-4 dark:bg-slate-900">
        <h3 className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-300">Crop Image</h3>
        <div className="relative h-64 w-full bg-slate-200 dark:bg-slate-800 rounded-lg overflow-hidden">
          <Cropper image={upload.croppingFile} crop={upload.crop} zoom={upload.zoom}
            aspect={1} cropShape="rect" onCropChange={upload.setCrop}
            onZoomChange={upload.setZoom} onCropComplete={upload.onCropComplete} />
        </div>
        <div className="mt-3 flex items-center gap-3">
          <input type="range" min={1} max={3} step={0.1} value={upload.zoom}
            onChange={e => upload.setZoom(Number(e.target.value))}
            className="flex-1" />
          <button onClick={upload.confirmCrop}
            className="rounded-lg bg-indigo-950 px-4 py-1.5 text-sm text-white hover:bg-indigo-900">Crop</button>
          <button onClick={upload.cancelCrop}
            className="rounded-lg border px-4 py-1.5 text-sm dark:border-slate-700">Cancel</button>
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
