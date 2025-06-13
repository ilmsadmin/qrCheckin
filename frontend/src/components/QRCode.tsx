import { useEffect, useRef } from 'react'

interface QRCodeProps {
  value: string
  size?: number
  className?: string
}

export default function QRCode({ value, size = 200, className = '' }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      // Simple QR code placeholder - in production, you'd use a proper QR code library
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      
      if (ctx) {
        // Clear canvas
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, size, size)
        
        // Create a simple pattern to represent QR code
        const moduleSize = size / 21 // Standard QR code is typically 21x21 modules
        
        // Border
        ctx.fillStyle = '#000000'
        ctx.fillRect(0, 0, size, moduleSize)
        ctx.fillRect(0, 0, moduleSize, size)
        ctx.fillRect(size - moduleSize, 0, moduleSize, size)
        ctx.fillRect(0, size - moduleSize, size, moduleSize)
        
        // Position detection patterns (corners)
        const patternSize = moduleSize * 7
        
        // Top-left corner
        ctx.fillRect(0, 0, patternSize, patternSize)
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(moduleSize, moduleSize, patternSize - 2 * moduleSize, patternSize - 2 * moduleSize)
        ctx.fillStyle = '#000000'
        ctx.fillRect(moduleSize * 2, moduleSize * 2, patternSize - 4 * moduleSize, patternSize - 4 * moduleSize)
        
        // Top-right corner
        ctx.fillStyle = '#000000'
        ctx.fillRect(size - patternSize, 0, patternSize, patternSize)
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(size - patternSize + moduleSize, moduleSize, patternSize - 2 * moduleSize, patternSize - 2 * moduleSize)
        ctx.fillStyle = '#000000'
        ctx.fillRect(size - patternSize + moduleSize * 2, moduleSize * 2, patternSize - 4 * moduleSize, patternSize - 4 * moduleSize)
        
        // Bottom-left corner
        ctx.fillStyle = '#000000'
        ctx.fillRect(0, size - patternSize, patternSize, patternSize)
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(moduleSize, size - patternSize + moduleSize, patternSize - 2 * moduleSize, patternSize - 2 * moduleSize)
        ctx.fillStyle = '#000000'
        ctx.fillRect(moduleSize * 2, size - patternSize + moduleSize * 2, patternSize - 4 * moduleSize, patternSize - 4 * moduleSize)
        
        // Random data pattern (simplified)
        ctx.fillStyle = '#000000'
        for (let i = 0; i < 50; i++) {
          const x = Math.floor(Math.random() * (size / moduleSize)) * moduleSize
          const y = Math.floor(Math.random() * (size / moduleSize)) * moduleSize
          if (Math.random() > 0.5) {
            ctx.fillRect(x, y, moduleSize, moduleSize)
          }
        }
      }
    }
  }, [value, size])

  return (
    <div className={`bg-white p-4 border border-gray-300 rounded-lg ${className}`}>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="block"
        style={{ width: size, height: size }}
      />
      <p className="text-xs text-gray-500 text-center mt-2">QR Code: {value}</p>
    </div>
  )
}