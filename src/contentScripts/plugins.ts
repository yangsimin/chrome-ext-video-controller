import type { Toast } from './toast'

// 音量调节步长：0.1 = 10%
const VOLUME_STEP = 0.1
const MIN_VOLUME = 0
const MAX_VOLUME = 1

// 前进/后退的步长：3s
const TIME_STEP = 3

const DEFAULT_RATE = 1
// 播放倍速的调节步长：0.2 = 20%
const RATE_STEP = 0.2
const MIN_RATE = 0.1

// 控制播放倍速
// todo:
export function mapSpeed(keyName: string, video: HTMLVideoElement, toast: Toast) {
  const exceptKeys = ['z', 'x', 'c']
  if (!exceptKeys.includes(keyName))
    return

  let playbackRate = video.playbackRate
  switch (keyName) {
    case 'z':
      video.playbackRate = DEFAULT_RATE
      break
    case 'x':
      playbackRate -= RATE_STEP
      video.playbackRate = Math.max(+playbackRate.toFixed(2), MIN_RATE)
      break
    case 'c':
      playbackRate += RATE_STEP
      video.playbackRate = +playbackRate.toFixed(2)
      break
  }
  toast?.show(`速度：${video.playbackRate.toFixed(2)}x`)
  return true
}

// 控制播放进度
export function mapTime(keyName: string, video: HTMLVideoElement, toast: Toast) {
  const exceptKeys = ['h', 'l', 'H', 'L']
  if (!exceptKeys.includes(keyName))
    return

  switch (keyName) {
    case 'h':
      video.currentTime -= TIME_STEP
      toast?.show(`后退：${TIME_STEP}s`)
      break
    case 'l':
      video.currentTime += TIME_STEP
      toast?.show(`前进：${TIME_STEP}s`)
      break
    case 'H':
      video.currentTime -= TIME_STEP * 2
      toast?.show(`后退：${TIME_STEP * 2}s`)
      break
    case 'L':
      video.currentTime += TIME_STEP * 2
      toast?.show(`前进：${TIME_STEP * 2}s`)
      break
  }
  return true
}

// 控制音量
export function mapVolume(keyName: string, video: HTMLVideoElement, toast: Toast) {
  const exceptKeys = ['j', 'k', 'm']
  if (!exceptKeys.includes(keyName))
    return

  let volume = video.volume
  switch (keyName) {
    case 'j':
      volume -= VOLUME_STEP
      video.volume = Math.max(volume, MIN_VOLUME)
      break
    case 'k':
      volume += VOLUME_STEP
      video.volume = Math.min(volume, MAX_VOLUME)
      break
    case 'm':
      video.muted = !video.muted
  }
  toast?.show(`音量：${(video.volume * 100).toFixed(0)}%`)
  return true
}

// 暂停 / 播放
export function mapPause(keyName: string, video: HTMLVideoElement, toast: Toast) {
  const exceptKeys = [' ']
  if (!exceptKeys.includes(keyName))
    return

  switch (keyName) {
    case ' ':
      if (video.paused)
        video.play()

      else
        video.pause()

      toast?.show(`${video.paused ? '暂停' : '播放'}`)
      break
  }
  return true
}

export function mapScreen(keyName: string, video: HTMLVideoElement, toast: Toast) {
  const exceptKeys = ['f']
  if (!exceptKeys.includes(keyName))
    return

  switch (keyName) {
    case 'f':
      if (document.fullscreenElement) {
        document.exitFullscreen()
        toast?.show('退出全屏')
      }
      else {
        video.requestFullscreen()
        toast?.show('全屏')
      }
      break
  }
  return true
}
