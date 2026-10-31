'use client'

import { Button } from 'flowbite-react'
import React, { useEffect, useRef, useState } from 'react'

type CameraScannerProps = {
  onDetected: (code: string) => void
  onClose: () => void
}

/**
 * Reads a barcode with the device camera (ZXing). Stops after the first code
 * so one scan is one lookup. The camera only works over https or on
 * localhost; browsers refuse it on plain http.
 */
const CameraScanner: React.FC<CameraScannerProps> = ({
  onDetected,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string | null>(null)
  const detectedRef = useRef(onDetected)
  detectedRef.current = onDetected

  useEffect(() => {
    let controls: { stop: () => void } | null = null
    let cancelled = false

    const start = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError(
          'Camera unavailable. The browser only allows it over https or on localhost.'
        )
        return
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
        BarcodeFormat.QR_CODE,
      ])
      const reader = new BrowserMultiFormatReader(hints)

      try {
        const started = await reader.decodeFromConstraints(
          { video: { facingMode: { ideal: 'environment' } } },
          videoRef.current!,
          (result, _error, scannerControls) => {
            if (result && !cancelled) {
              cancelled = true
              scannerControls.stop()
              detectedRef.current(result.getText())
            }
          }
        )
        if (cancelled) {
          started.stop()
        } else {
          controls = started
        }
      } catch (e: any) {
        setError(
          e?.name === 'NotAllowedError'
            ? 'Camera access denied. Allow the camera in the browser settings.'
            : 'No camera available on this device.'
        )
      }
    }

    start()

    return () => {
      cancelled = true
      controls?.stop()
    }
  }, [])

  return (
    <div className="flex flex-col gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : (
        <>
          <video
            ref={videoRef}
            className="w-full max-h-[50vh] rounded bg-black object-contain"
            muted
            playsInline
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Point the camera at the barcode. If it does not read, move closer so it is sharp and fills most of the image.
          </p>
        </>
      )}
      <Button color="gray" size="sm" onClick={onClose}>
        Close camera
      </Button>
    </div>
  )
}

export default CameraScanner
