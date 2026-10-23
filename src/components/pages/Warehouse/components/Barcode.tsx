'use client'

import JsBarcode from 'jsbarcode'
import React, { useEffect, useRef } from 'react'

type BarcodeProps = {
  value: string
  // bar height in barcode units; the SVG itself scales to its container
  height?: number
  displayValue?: boolean
  className?: string
}

/**
 * Code128 as SVG. The SVG gets a viewBox instead of a fixed size, so the
 * same barcode fills a 70 mm label or a 40 mm one and stays sharp in print.
 */
const Barcode: React.FC<BarcodeProps> = ({
  value,
  height = 50,
  displayValue = true,
  className,
}) => {
  const ref = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const svg = ref.current
    if (!svg || !value) return

    try {
      JsBarcode(svg, value, {
        format: 'CODE128',
        width: 2,
        height,
        // quiet zone of 10 modules on each side, scanners need it
        margin: 20,
        marginTop: 2,
        marginBottom: 2,
        displayValue,
        fontSize: 16,
        textMargin: 1,
        background: '#ffffff',
        lineColor: '#000000',
      })
      const width = parseFloat(svg.getAttribute('width') || '0')
      const fullHeight = parseFloat(svg.getAttribute('height') || '0')
      svg.setAttribute('viewBox', `0 0 ${width} ${fullHeight}`)
      svg.removeAttribute('width')
      svg.removeAttribute('height')
      svg.removeAttribute('style')
    } catch (error) {
      console.error('Cannot render barcode for', value, error)
    }
  }, [value, height, displayValue])

  return <svg ref={ref} className={className} />
}

export default Barcode
