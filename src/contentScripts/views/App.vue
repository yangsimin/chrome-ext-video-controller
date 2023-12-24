<script setup lang="ts">
import type { UseStyleTagReturn } from '@vueuse/core'
import { useStyleTag, useToggle } from '@vueuse/core'
import 'uno.css'
import { Toast } from '../toast'
import { mapPause, mapScreen, mapSpeed, mapTime, mapVolume } from '../plugins'

const TAG = 'video-controller'
const [show] = useToggle(false)
const videos = ref<HTMLVideoElement[]>([])
const selectedIndex = ref<number>(0)

const videosRef = ref(null)

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

    window.addEventListener('keyup', (event) => {
      if (['input', 'textarea'].includes((event.target as Element)?.tagName?.toLowerCase()))
        return
      if (event.metaKey || event.altKey || event.ctrlKey)
        return
      if (!videos.value?.length)
        return
      if (selectedIndex.value >= videos.value.length)
        selectedIndex.value = videos.value.length - 1

      video = videos.value[selectedIndex.value]
      // 按下空格, 特殊处理
      const exceptKeys = [' ']
      if (exceptKeys.includes(event.key)) {
        event.stopImmediatePropagation()
        event.preventDefault()
      }
    }, {
      capture: true,
    })

    window.addEventListener(
      'keydown',
      async (event) => {
        if (['input', 'textarea'].includes((event.target as Element)?.tagName?.toLowerCase()))
          return

        // 与其他功能键一起按下时，跳过
        if (event.metaKey || event.altKey || event.ctrlKey)
          return

        // 控制插件功能的开关
        if (!videos.value?.length)
          return

        if (selectedIndex.value >= videos.value.length)
          selectedIndex.value = videos.value.length - 1

        video = videos.value[selectedIndex.value]
        const features = [mapVolume, mapTime, mapSpeed, mapPause, mapScreen]
        const ret = features.find(func => !!func(event.key, video!, toast!))

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
}

const videoHeight = ref(0)
const videoWidth = ref(0)
let styleTag: UseStyleTagReturn | undefined
const highlightClass = computed(() => `
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
    box-sizing: border-box;
    width: ${videoWidth.value}px;
    height: ${videoHeight.value}px;
  }
`)

function selectVideo(index: number) {
  const video = videos.value[index]
  logInfo('mouseEnter', videos.value, index, video)
  video && video.parentElement?.classList.add('video-controller-highlight')
  videoHeight.value = video.offsetHeight
  videoWidth.value = video.offsetWidth
  styleTag = useStyleTag(highlightClass, {
    id: 'video-controller-style',
    immediate: true,
  })
}

function unselectVideo(index: number) {
  const video = videos.value[index]
  logInfo('mouseLeave', videos.value, index, video)
  video && video.parentElement?.classList.remove('video-controller-highlight')
  if (styleTag) {
    styleTag.unload()
    styleTag = undefined
  }
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
