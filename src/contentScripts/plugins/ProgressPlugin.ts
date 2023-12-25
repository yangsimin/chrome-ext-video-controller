import type { Context, Plugin } from '../types'

// 控制播放进度
export class ProgressPlugin implements Plugin {
  // 前进/后退的步长：3s
  TIME_STEP = 3

  onKeyUp() {
    return false
  }

  onKeyDown({ event, video, toast }: Context) {
    const { key } = event
    const mapKeys = ['h', 'l', 'H', 'L']
    if (!mapKeys.includes(key))
      return false

    switch (key) {
      case 'h':
        video.currentTime -= this.TIME_STEP
        toast.show(`后退：${this.TIME_STEP}s`)
        break
      case 'l':
        video.currentTime += this.TIME_STEP
        toast.show(`前进：${this.TIME_STEP}s`)
        break
      case 'H':
        video.currentTime -= this.TIME_STEP * 2
        toast.show(`后退：${this.TIME_STEP * 2}s`)
        break
      case 'L':
        video.currentTime += this.TIME_STEP * 2
        toast.show(`前进：${this.TIME_STEP * 2}s`)
        break
    }
    return true
  }
}
