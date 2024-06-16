"use client"

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"
import img from '../../public/xpBox.webp'
import Image from "next/image"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, imgSrc, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid grid-cols-[1fr_2fr] gap-1">
              <div>
                {title && <ToastTitle>{title}</ToastTitle>}
                {imgSrc && (
                  <Image src={imgSrc.toString() as string} width={120} height={120} alt="XP Box" />
                )}
              </div>
              {(description as string)?.startsWith("Congratulations") 
                ? (                  
                  <ToastDescription>
                    Congratulations,<br/>
                    {(description as string).slice((description as string).indexOf(",") + 2)}
                  </ToastDescription>             
                ) : (
                  <ToastDescription>{(description as string)}</ToastDescription>
                )
              }
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
