import { generateArt } from '@/services/generateArt'
import axios from 'axios'
import { useState, useCallback, useRef, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { useForm } from 'react-hook-form'
import { QrCode } from './QrCode'

export const PixelArtGenerate = () => {
  const [preview, setPreview] = useState<string | null>(null)
  const [dimensions, setDimensions] = useState<{
    width: number
    height: number
  } | null>(null)
  const [pixelSize, setPixelSize] = useState<number>(1)
  const [prompt, setPrompt] = useState<string>(
    'make this a good pixel art, no change the context of the image',
  )
  const [widthSize, setWidthSize] = useState<number>(512)
  const [heightSize, setHeightSize] = useState<number>(512)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const objectUrl = URL.createObjectURL(file)
      setPreview(objectUrl)

      const img = new window.Image()
      img.src = objectUrl
      img.onload = () => {
        setDimensions({ width: img.width, height: img.height })
      }
    }
  }, [])

  useEffect(() => {
    if (!preview || !dimensions) return

    const img = new window.Image()
    img.src = preview
    img.onload = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      canvas.width = dimensions.width
      canvas.height = dimensions.height

      ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height)
    }
  }, [preview, dimensions])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
  })

  const handleGenerate = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const base64Image = canvas.toDataURL('image/jpeg').split(',')[1]

    const payload = {
      prompt: prompt,
      width: widthSize,
      height: heightSize,
      num_images: 1,
      seed: 1,
      prompt_style: 'rd_plus__default',
      tile_x: false,
      tile_y: false,
      input_image: base64Image,
      remove_bg: false,
      strength: 0.45,
    }

    const response = await generateArt(payload)

    const newBase64 = response.base64_images[0]

    if (newBase64) {
      const img = new window.Image()
      img.src = `data:image/jpeg;base64,${newBase64}`

      img.onload = () => {
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        canvas.width = img.width
        canvas.height = img.height

        ctx.drawImage(img, 0, 0, img.width, img.height)
      }
    }
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = 'pixelated-image.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <div className="w-full grid min-[950px]:grid-cols-[60fr_40fr] gap-4 max-w-[1280px] ml-auto mr-auto p-6">
      <div className="bg-white shadow-xl border-[1px] p-2 rounded-xl flex">
        <div
          {...getRootProps()}
          className={`rounded-xl bg-[#f5f5f5] flex-1 p-6 flex items-center justify-center border-2 border-dashed border-[#9da2ad] cursor-pointer text-[#9da2ad]`}
        >
          <input {...getInputProps()} />
          {preview && dimensions ? (
            <canvas ref={canvasRef} className="max-w-[500px] max-h-[500px]" />
          ) : isDragActive ? (
            <p>Solte a imagem aqui...</p>
          ) : (
            <p>Choose a image</p>
          )}
        </div>
      </div>

      <form>
        <div className="flex-1 bg-white border-[1px] rounded-xl shadow-lg">
          <div className="py-3 border-b">
            <p className="text-[#303030] text-center text-xs">
              Configurations Pixel Art
            </p>
          </div>
          {dimensions ? (
            <div className="p-5 text-black grid grid-cols-2 gap-2">
              <div className="col-span-full">
                <p className="text-[11px] font-semibold">Prompt</p>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full px-4 py-2 rounded"
                />
              </div>

              <div>
                <p className="text-[11px] font-semibold">Width</p>
                <input
                  type="number"
                  value={widthSize}
                  onChange={(e) =>
                    +e.target.value !== 0
                      ? setWidthSize(Number(e.target.value))
                      : ''
                  }
                  placeholder="width"
                  className="px-4 py-2 border shadow-sm border-[#ededed] rounded w-full focus:border-[#ededed] focus:outline-none"
                />
              </div>

              <div>
                <p className="text-[11px] font-semibold">Height</p>
                <input
                  type="number"
                  value={heightSize}
                  onChange={(e) =>
                    +e.target.value !== 0
                      ? setHeightSize(Number(e.target.value))
                      : ''
                  }
                  placeholder="heigth"
                  className="px-4 py-2 border shadow-sm border-[#ededed] rounded w-full focus:border-[#ededed] focus:outline-none"
                />
              </div>

              <div className="col-span-full">
                <p className="text-[11px] font-semibold">Pixels rating</p>
                <input
                  type="number"
                  value={pixelSize}
                  onChange={(e) =>
                    +e.target.value !== 0
                      ? setPixelSize(Number(e.target.value))
                      : ''
                  }
                  className="px-4 py-2 border shadow-sm border-[#ededed] rounded w-full focus:border-[#ededed] focus:outline-none"
                />
              </div>
            </div>
          ) : (
            <p className="text-center p-4 text-black">Choose a image</p>
          )}
        </div>

        <div className="rounded-xl shadow-lg border-[1px] mt-4 flex flex-col items-center p-4">
          <div className="flex gap-3">
            <button
              onClick={handleGenerate}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
            >
              Generate Pixel Art
            </button>
            <QrCode />
            <button
              onClick={handleDownload}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
            >
              Download
            </button>
          </div>

          <p className="text-black mt-2 text-sm">
            Clique para salvar sua imagem pixelada
          </p>
        </div>
      </form>
    </div>
  )
}
