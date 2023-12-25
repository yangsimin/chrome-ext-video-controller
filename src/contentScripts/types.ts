import type { Toast } from './Toast'

export interface Context {
  event: KeyboardEvent
  video: HTMLVideoElement
  toast: Toast
}

export interface Plugin {
  onKeyUp: (context: Context) => boolean
  onKeyDown: (context: Context) => boolean
}
