import type { Context, Plugin } from '../types'

// 控制音量
export class VolumePlugin implements Plugin {
  // 音量调节步长：0.1 = 10%
  VOLUME_STEP = 0.1
  MIN_VOLUME = 0
  MAX_VOLUME = 1

  onKeyUp() {
    return false
  }

  onKeyDown({ event, video, toast }: Context) {
    const { key } = event
    const mapKeys = ['j', 'k', 'm']
    if (!mapKeys.includes(key))
      return false

    let volume = video.volume
    switch (key) {
      case 'j':
        volume -= this.VOLUME_STEP
        video.volume = Math.max(volume, this.MIN_VOLUME)
        break
      case 'k':
        volume += this.VOLUME_STEP
        video.volume = Math.min(volume, this.MAX_VOLUME)
        break
      case 'm':
        video.muted = !video.muted
    }
    toast?.show(`音量：${(video.volume * 100).toFixed(0)}%`)
    return true
  }
}
