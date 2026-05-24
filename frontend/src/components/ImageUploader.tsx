'use client'

import { useRef, useState } from 'react'

async function compressImage(file: File, maxW = 800, maxH = 800, maxKB = 200): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      let { width, height } = img
      if (width > maxW || height > maxH) {
        const ratio = Math.min(maxW / width, maxH / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error('Failed to encode'))
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(blob)
      }, 'image/webp', 0.8)
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

export function useImageUpload(limitMB = 5) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [previews, setPreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  function trigger() { inputRef.current?.click() }

  async function handleFiles(files: FileList) {
    setError('')
    const results: string[] = []
    for (const file of Array.from(files)) {
      if (file.size > limitMB * 1024 * 1024) { setError(`Image exceeds ${limitMB}MB`); return }
      if (!file.type.startsWith('image/')) { setError('Only images allowed'); return }
      try {
        const b64 = await compressImage(file)
        results.push(b64)
      } catch { setError('Failed to process image') }
    }
    setPreviews(prev => [...prev, ...results])
  }

  function remove(index: number) { setPreviews(prev => prev.filter((_, i) => i !== index)) }

  function move(from: number, to: number) {
    setPreviews(prev => {
      const next = [...prev]
      const [item] = next.splice(from, 1)
      next.splice(to, 0, item)
      return next
    })
  }

  return {
    inputRef, previews, uploading, error, trigger, setPreviews,
    handleFiles: (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) handleFiles(e.target.files)
      e.target.value = ''
    },
    remove,
    moveUp: (i: number) => { if (i > 0) move(i, i - 1) },
    moveDown: (i: number) => move(i, i + 1),
  }
}

export function ImageInput({ upload }: { upload: ReturnType<typeof useImageUpload> }) {
  return (
    <input ref={upload.inputRef} type="file" accept="image/*" multiple
      onChange={upload.handleFiles} className="hidden" />
  )
}
