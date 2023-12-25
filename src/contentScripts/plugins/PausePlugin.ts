import type { Context, Plugin } from '../types'

// 暂停 / 播放
export class PausePlugin implements Plugin {
  onKeyUp({ event }: Context) {
    const { key } = event
    const mapKeys = [' ']
    if (mapKeys.includes(key))
      return true

    return false
  }

  onKeyDown({ event, video, toast }: Context) {
    const { key } = event
    const mapKeys = [' ']
    if (!mapKeys.includes(key))
      return false

    if (video.paused) {
      video.play()
      toast.show('播放')
    }
    else {
      video.pause()
      toast.show('暂停')
    }

    return true
  }
}
