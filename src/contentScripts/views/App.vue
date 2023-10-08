<script setup lang="ts">
import { useStyleTag, useToggle } from '@vueuse/core'
import 'uno.css'

const TAG = 'video-controller'
const [show] = useToggle(false)
const videos = ref<HTMLVideoElement[]>([])
const selectedIndex = ref<number>(0)

const videosRef = ref(null)

const { load, unload } = useStyleTag(`
.video-controller-highlight::before {
  content: "";
  display: block;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  border: 6px solid red;
  z-index: 10;
}
`)
onMounted(load)
onUnmounted(unload)

videoController()

function videoController() {
  /**
 * h/H: 后退
 * l/L: 前进
 * j: 减小音量
 * k: 增加音量
 * m: 静音 / 取消静音
 * z: 重置播放倍速
 * x: 减小播放倍速
 * c: 增加播放倍速
 *  (space): 暂停
 */
  const TOAST_TEXT_COLOR = '#ff5159'
  const TOAST_BACKGROUND = 'rgba(0,0,0,0.9)'
  const TOAST_TEXT_SIZE = '20px'

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

  let toast: Toast | undefined
  let video: HTMLVideoElement

  window.addEventListener('load', () => {
    mapKey()
    toast = new Toast()
  })

  // 映射按键
  function mapKey() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeName === 'VIDEO') {
              setTimeout(() => {
                videos.value = Array.from(document.querySelectorAll('video') ?? []).filter(video => !!video.src)
                logInfo(videos.value)
              }, 1000)
            }
          })
        }
        if (mutation.removedNodes) {
          mutation.removedNodes.forEach((node) => {
            if (node.nodeName === 'VIDEO') {
              setTimeout(() => {
                videos.value = Array.from(document.querySelectorAll('video') ?? []).filter(video => !!video.src)
                logInfo(videos.value)
              })
            }
          })
        }
      })
    })
    observer.observe(document.body, {
      subtree: true,
      childList: true,
    })

    setTimeout(() => {
      videos.value = Array.from(document.querySelectorAll('video') ?? []).filter(video => !!video.src)
      logInfo(videos.value)
    })

    window.addEventListener('hashchange', () => {
      videos.value = Array.from(document.querySelectorAll('video') ?? []).filter(video => !!video.src)
      logInfo(videos.value)
    })

    window.addEventListener(
      'keydown',
      async (event) => {
        if (['input', 'textarea'].includes((event.target as Element)?.tagName?.toLowerCase()))
          return

        // 与其他功能键一起按下时，跳过
        if (event.metaKey)
          return

        // 控制插件功能的开关
        if (!videos.value?.length)
          return

        if (selectedIndex.value >= videos.value.length)
          selectedIndex.value = videos.value.length - 1

        video = videos.value[selectedIndex.value]
        const features = [mapVolume, mapTime, mapSpeed, mapPause, mapScreen]
        const ret = features.find(func => !!func(event.key, video!))

        if (ret) {
          // 避免和网站原本的快捷键功能冲突，优先使用我们自定义的
          event.stopImmediatePropagation()
          event.preventDefault()
        }
      },
      {
      // 在事件捕获阶段执行回调
      // 这样可以保证回调的优先级，有利于后续阻止其他 handle 执行
        capture: true,
      },
    )
  }

  // 控制播放倍速
  // todo:
  function mapSpeed(keyName: string, video: HTMLVideoElement) {
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
  function mapTime(keyName: string, video: HTMLVideoElement) {
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
  function mapVolume(keyName: string, video: HTMLVideoElement) {
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
  function mapPause(keyName: string, video: HTMLVideoElement) {
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

  function mapScreen(keyName: string, video: HTMLVideoElement) {
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

  // 信息提示弹框
  class Toast {
    private divEl
    private timer: NodeJS.Timer | undefined
    private transitionTimer: NodeJS.Timer | undefined

    constructor() {
      this.timer = undefined
      this.transitionTimer = undefined
      // 1. 创建 toast 标签
      this.divEl = document.createElement('div')
      // 2. 初始化样式
      const style = {
        position: 'fixed',
        left: 0,
        top: 0,
        fontSize: TOAST_TEXT_SIZE,
        fontWeight: '700',
        color: TOAST_TEXT_COLOR,
        padding: '20px',
        margin: '20px',
        zIndex: '999999999',
        backgroundColor: TOAST_BACKGROUND,
        borderRadius: '99999px',
      }
      Object.assign(this.divEl.style, style)
    }

    // 展示toast
    show(text = '未设置文字', duration = 1000) {
      this.divEl.textContent = text
      this._setVisible(true)
      this.timer = setTimeout(() => {
        this._setVisible(false)
      }, duration)
    }

    // 设置toast是否可见
    _setVisible(visible: boolean) {
      if (!visible) {
        const duration = 1000
        if (document.body.contains(this.divEl)) {
          this.divEl.style.transition = `${duration}ms`
          this.divEl.style.opacity = '0'
          this.transitionTimer = setTimeout(() => {
            this.divEl.remove()
          }, duration)
        }
      }
      else {
      // 重置样式
        this._resetOpacity()
        if (document.body.contains(this.divEl)) {
        // 如果是要显示toast，而且toast已经在dom中
        // 重置计时器
          clearTimeout(this.timer)
          clearTimeout(this.transitionTimer)
          return
        }
        document.body.append(this.divEl)
      }
    }

    // 重置样式
    _resetOpacity() {
      const style = {
        opacity: 1,
        transition: 'none',
      }
      Object.assign(this.divEl.style, style)
    }
  }
}

function selectVideo(index: number) {
  const video = videos.value[index]
  logInfo('mouseEnter', videos.value, index, video)
  video && video.parentElement?.classList.add('video-controller-highlight')
}

function unselectVideo(index: number) {
  const video = videos.value[index]
  logInfo('mouseLeave', videos.value, index, video)
  video && video.parentElement?.classList.remove('video-controller-highlight')
}

function logInfo(message: any, ...optionalParams: any[]) {
  // eslint-disable-next-line no-console
  console.log(`[${TAG}]`, message, ...optionalParams)
}
</script>

<template>
  <div
    v-if="videos.length"
    class="fixed right-0 bottom-0 m-20px z-100 flex items-end font-sans select-none leading-1em text-16px"
    @mouseenter="show = true"
    @mouseleave="show = false"
  >
    <ul
      ref="videosRef"
      class="list-none m-0 p-0 bg-white text-gray-800 rounded-lg shadow w-max h-min"
      p="x-16px y-8px"
      m="y-auto r-8px"
      transition="opacity duration-300"
      :class="show ? '' : 'hidden'"
    >
      <li
        v-for="index in videos.length"
        :key="index" @mouseenter="selectVideo(index - 1)" @mouseleave="unselectVideo(index - 1)"
      >
        <label class="flex items-center cursor-pointer py-4px"><input v-model="selectedIndex" type="radio" :value="index - 1">Video {{ index }}</label>
      </li>
    </ul>
    <button
      class="flex w-40px h-40px rounded-full shadow cursor-pointer border-none"
      bg="teal-600 hover:teal-700"
    >
      <pixelarticons-power class="block m-auto text-white text-18px leading-28px" />
    </button>
  </div>
</template>
