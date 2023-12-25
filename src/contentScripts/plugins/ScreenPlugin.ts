import type { Context, Plugin } from '../types'

export class ScreenPlugin implements Plugin {
  onKeyUp() {
    return false
  }

  onKeyDown({ event, video, toast }: Context) {
    const { key } = event
    const mapKeys = ['f']
    if (!mapKeys.includes(key))
      return false

    if (document.fullscreenElement) {
      document.exitFullscreen()
      toast.show('退出全屏')
    }
    else {
      video.requestFullscreen()
      toast.show('全屏')
    }

    return true
  }
}
