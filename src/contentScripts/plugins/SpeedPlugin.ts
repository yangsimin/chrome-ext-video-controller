import type { Context, Plugin } from '../types'

// 控制播放倍速
export class SpeedPlugin implements Plugin {
  DEFAULT_RATE = 1
  // 播放倍速的调节步长：0.2 = 20%
  RATE_STEP = 0.2
  MIN_RATE = 0.1

  onKeyUp() {
    return false
  }

  onKeyDown({ event, video, toast }: Context) {
    const { key } = event
    const mapKeys = ['z', 'x', 'c']
    if (!mapKeys.includes(key))
      return false

    let playbackRate = video.playbackRate
    switch (key) {
      case 'z':
        video.playbackRate = this.DEFAULT_RATE
        break
      case 'x':
        playbackRate -= this.RATE_STEP
        video.playbackRate = Math.max(+playbackRate.toFixed(2), this.MIN_RATE)
        break
      case 'c':
        playbackRate += this.RATE_STEP
        video.playbackRate = +playbackRate.toFixed(2)
        break
    }
    toast.show(`速度：${video.playbackRate.toFixed(2)}x`)
    return true
  }
}
