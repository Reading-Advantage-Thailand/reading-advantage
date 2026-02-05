'use client'

import { Group, Image as KonvaImage } from 'react-konva'
import { useEffect, useState, useMemo } from 'react'
import { getRoadTileInfo, TILE_SIZE } from '@/lib/castleDefense'
import { withBasePath } from '@/lib/basePath'

const ASSETS = {
  grass: [
    withBasePath('/games/castle-defense/grass_A.png'),
    withBasePath('/games/castle-defense/grass_B.png'),
    withBasePath('/games/castle-defense/grass_C.png'),
    withBasePath('/games/castle-defense/grass-D.png')
  ],
  road: {
    EW: withBasePath('/games/castle-defense/road_EW.png'),
    NS: withBasePath('/games/castle-defense/road_NS.png'),
    CORNER: withBasePath('/games/castle-defense/road_corner.png')
  }
}

interface BackgroundLayerProps {
  grassMap: number[][]
  path: { x: number; y: number }[]
}

export function BackgroundLayer({ grassMap, path }: BackgroundLayerProps) {
  const [images, setImages] = useState<Record<string, HTMLImageElement>>({})
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const toLoad = [
      ...ASSETS.grass,
      ASSETS.road.EW,
      ASSETS.road.NS,
      ASSETS.road.CORNER
    ]
    
    let count = 0
    const loadedImgs: Record<string, HTMLImageElement> = {}

    toLoad.forEach(src => {
      const img = new window.Image()
      img.src = src
      img.onload = () => {
        loadedImgs[src] = img
        count++
        if (count === toLoad.length) {
          setImages(loadedImgs)
          setLoaded(true)
        }
      }
      img.onerror = () => {
          console.error(`Failed to load image: ${src}`)
          count++
           if (count === toLoad.length) {
            setImages(loadedImgs)
            setLoaded(true)
          }
      }
    })
  }, [])

  const tiles = useMemo(() => {
    if (!loaded) return null

    const grid: React.ReactNode[] = []
    
    for(let r=0; r<grassMap.length; r++) {
        for(let c=0; c<grassMap[0].length; c++) {
            const x = c * TILE_SIZE
            const y = r * TILE_SIZE
            
            const grassIdx = grassMap[r][c]
            const grassSrc = ASSETS.grass[grassIdx]
            
            if (images[grassSrc] && images[grassSrc].width > 0 && images[grassSrc].height > 0) {
                grid.push(
                    <KonvaImage 
                        key={`grass-${r}-${c}`}
                        image={images[grassSrc]}
                        x={x}
                        y={y}
                        width={TILE_SIZE}
                        height={TILE_SIZE}
                    />
                )
            }

            const roadInfo = getRoadTileInfo(c, r, path)
            if (roadInfo) {
                const roadSrc = ASSETS.road[roadInfo.type]
                if (images[roadSrc] && images[roadSrc].width > 0 && images[roadSrc].height > 0) {
                    const cx = x + TILE_SIZE / 2
                    const cy = y + TILE_SIZE / 2
                    
                    grid.push(
                        <KonvaImage
                            key={`road-${r}-${c}`}
                            image={images[roadSrc]}
                            x={cx}
                            y={cy}
                            width={TILE_SIZE}
                            height={TILE_SIZE}
                            offsetX={TILE_SIZE / 2}
                            offsetY={TILE_SIZE / 2}
                            rotation={roadInfo.rotation}
                        />
                    )
                }
            }
        }
    }
    return grid
  }, [loaded, images, grassMap, path])

  if (!loaded) return <Group />

  return (
    <Group listening={false}>
       {tiles}
    </Group>
  )
}
