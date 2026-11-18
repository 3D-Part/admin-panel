'use client'
import { tx } from '@/shared/i18n'

import { Button } from 'flowbite-react'
import React, { useEffect, useRef, useState } from 'react'

type CameraScannerProps = {
  onDetected: (code: string) => void
  onClose: () => void
}

// how often a frame is read; each read takes a few milliseconds
const SCAN_EVERY_MS = 120

/**
 * Reads a barcode with the device camera and stops after the first code, so
 * one scan is one lookup. The camera only works over https or on localhost;
 * browsers refuse it on plain http.
 *
 * Laptop and desk cameras give a small, soft picture in which a barcode is
 * only a few pixels wide, so the reader is fed the middle band of the picture
 * (where the frame shows it) at full resolution, then the whole picture, then
 * the band turned upright for a code held sideways. Browsers with a built-in
 * barcode reader use that instead.
 */
const CameraScanner: React.FC<CameraScannerProps> = ({
  onDetected,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [resolution, setResolution] = useState('')
  const detectedRef = useRef(onDetected)
  detectedRef.current = onDetected

  useEffect(() => {
    let stream: MediaStream | null = null
    let timer: ReturnType<typeof setTimeout> | null = null
    let stopped = false

    const stop = () => {
      stopped = true
      if (timer) clearTimeout(timer)
      stream?.getTracks().forEach((track) => track.stop())
    }

    const found = (code: string) => {
      if (stopped || !code) return
      stop()
      detectedRef.current(code)
    }

    const start = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError(
          tx('Camera unavailable. The browser only allows it over https or on localhost.')
        )
        return
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        })
      } catch (e: any) {
        setError(
          e?.name === 'NotAllowedError'
            ? tx('Camera access denied. Allow the camera in the browser settings.')
            : tx('No camera available on this device.')
        )
        return
      }
      if (stopped) {
        stream.getTracks().forEach((track) => track.stop())
        return
      }

      // autofocus where the camera has it; fixed-focus webcams ignore this
      const [track] = stream.getVideoTracks()
      try {
        await track.applyConstraints({ advanced: [{ focusMode: 'continuous' } as any] })
      } catch {}

      const video = videoRef.current!
      video.srcObject = stream
      await video.play().catch(() => {})
      setResolution(`${video.videoWidth} × ${video.videoHeight}`)

      const detect = await makeDetector()
      let attempt = 0

      const tick = async () => {
        if (stopped) return
        if (video.readyState >= 2 && video.videoWidth > 0) {
          const code = await detect(video, attempt++)
          if (code) return found(code)
        }
        timer = setTimeout(tick, SCAN_EVERY_MS)
      }
      tick()
    }

    start()
    return stop
  }, [])

  return (
    <div className="flex flex-col gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : (
        <>
          <div className="relative">
            <video
              ref={videoRef}
              className="w-full max-h-[50vh] rounded bg-black object-contain"
              muted
              playsInline
            />
            {/* the band that is read first */}
            <div className="pointer-events-none absolute inset-x-[10%] top-[32%] bottom-[32%] rounded border-2 border-red-500/80" />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {tx('Hold the barcode inside the red frame, straight and sharp. If it does not read, move it closer or further until the lines are clear.')}
            {resolution && ` ${tx('Camera: {resolution}', { resolution })}`}
          </p>
        </>
      )}
      <Button color="gray" size="sm" onClick={onClose}>
        {tx('Close camera')}
      </Button>
    </div>
  )
}

type Detect = (video: HTMLVideoElement, attempt: number) => Promise<string | null>

const FORMATS = [
  'code_128',
  'ean_13',
  'ean_8',
  'upc_a',
  'upc_e',
  'code_39',
  'code_93',
  'itf',
  'codabar',
  'qr_code',
  'data_matrix',
]

const makeDetector = async (): Promise<Detect> => {
  const Native = (window as any).BarcodeDetector
  if (Native) {
    try {
      const supported: string[] = await Native.getSupportedFormats()
      const formats = FORMATS.filter((format) => supported.includes(format))
      if (formats.length > 0) {
        const detector = new Native({ formats })
        return async (video) => {
          try {
            const [hit] = await detector.detect(video)
            return hit?.rawValue ?? null
          } catch {
            return null
          }
        }
      }
    } catch {}
  }

  // loaded on demand: the library is big and touches browser APIs
  const [{ BrowserMultiFormatReader }, { BarcodeFormat, DecodeHintType }] =
    await Promise.all([import('@zxing/browser'), import('@zxing/library')])
  const hints = new Map()
  hints.set(DecodeHintType.POSSIBLE_FORMATS, [
    BarcodeFormat.CODE_128,
    BarcodeFormat.EAN_13,
    BarcodeFormat.EAN_8,
    BarcodeFormat.UPC_A,
    BarcodeFormat.UPC_E,
    BarcodeFormat.CODE_39,
    BarcodeFormat.CODE_93,
    BarcodeFormat.ITF,
    BarcodeFormat.CODABAR,
    BarcodeFormat.QR_CODE,
    BarcodeFormat.DATA_MATRIX,
  ])
  hints.set(DecodeHintType.TRY_HARDER, true)
  const reader = new BrowserMultiFormatReader(hints)
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d', { willReadFrequently: true })!

  return async (video, attempt) => {
    const width = video.videoWidth
    const height = video.videoHeight
    const mode = attempt % 3
    if (mode === 0) {
      // the middle band, enlarged twice so thin bars get more pixels
      const cropX = width * 0.1
      const cropY = height * 0.32
      const cropW = width * 0.8
      const cropH = height * 0.36
      const scale = Math.min(2, 2400 / cropW)
      canvas.width = Math.round(cropW * scale)
      canvas.height = Math.round(cropH * scale)
      context.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, canvas.width, canvas.height)
    } else if (mode === 1) {
      // the whole picture, for a code held outside the frame
      canvas.width = width
      canvas.height = height
      context.drawImage(video, 0, 0)
    } else {
      // the whole picture turned upright, for a code held sideways
      canvas.width = height
      canvas.height = width
      context.save()
      context.translate(height, 0)
      context.rotate(Math.PI / 2)
      context.drawImage(video, 0, 0)
      context.restore()
    }
    try {
      return reader.decodeFromCanvas(canvas).getText()
    } catch {
      return null
    }
  }
}

export default CameraScanner
