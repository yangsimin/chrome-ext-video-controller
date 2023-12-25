<script setup lang="ts">
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
import type { UseStyleTagReturn } from '@vueuse/core'
import { useStyleTag } from '@vueuse/core'
import 'uno.css'
import { Toast } from '../toast'
import { mapPause, mapScreen, mapSpeed, mapTime, mapVolume } from '../plugins'

const TAG = 'video-controller'
const floatBtnDisplayed = ref(false)
const videoElements = ref<HTMLVideoElement[]>([])
const videoSelectedIndex = ref(0)

const videoListRef = ref(null)

let toast: Toast | undefined
let video: HTMLVideoElement

window.addEventListener('load', () => {
  init()
})

function init() {
  toast = new Toast()
  observeVideoUpdate(() => {
    videoElements.value = getAllValidVideoElements()
    videoSelectedIndex.value = Math.min(
      videoSelectedIndex.value,
      videoElements.value.length - 1,
    )
    video = videoElements.value[videoSelectedIndex.value]
    logInfo(videoElements.value)
  })

  window.addEventListener(
    'keyup',
    event => {
      if (!shouldMapKey(event)) return

      // 按下空格, 特殊处理
      const exceptKeys = [' ']
      if (exceptKeys.includes(event.key)) {
        event.stopImmediatePropagation()
        event.preventDefault()
      }
    },
    {
      capture: true,
    },
  )

  window.addEventListener(
    'keydown',
    async event => {
      if (!shouldMapKey(event)) return

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

function observeVideoUpdate(onVideoUpdate: () => void) {
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes?.forEach(node => {
        if (node.nodeName !== 'VIDEO') return

        setTimeout(onVideoUpdate, 1000)
      })
      mutation.removedNodes?.forEach(node => {
        if (node.nodeName !== 'VIDEO') return

        setTimeout(onVideoUpdate)
      })
    })
  })

  observer.observe(document.body, {
    subtree: true,
    childList: true,
  })

  setTimeout(onVideoUpdate)

  window.addEventListener('hashchange', onVideoUpdate)
}

function getAllValidVideoElements() {
  return Array.from(document.querySelectorAll('video') ?? []).filter(
    video => video.src,
  )
}

function shouldMapKey(event: KeyboardEvent) {
  if (
    ['input', 'textarea'].includes(
      (event.target as Element)?.tagName?.toLowerCase(),
    )
  )
    return false

  if (event.metaKey || event.altKey || event.ctrlKey) return false

  if (!videoElements.value?.length) return false

  return true
}

const videoHeight = ref(0)
const videoWidth = ref(0)
let styleTag: UseStyleTagReturn | undefined
const highlightClass = computed(
  () => `
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
`,
)

function selectVideo(index: number) {
  const video = videoElements.value[index]
  logInfo('mouseEnter', videoElements.value, index, video)
  video && video.parentElement?.classList.add('video-controller-highlight')
  videoHeight.value = video.offsetHeight
  videoWidth.value = video.offsetWidth
  styleTag = useStyleTag(highlightClass, {
    id: 'video-controller-style',
    immediate: true,
  })
}

function unselectVideo(index: number) {
  const video = videoElements.value[index]
  logInfo('mouseLeave', videoElements.value, index, video)
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
    v-if="videoElements.length"
    class="fixed right-0 bottom-0 m-20px z-100 flex items-end font-sans select-none leading-1em text-16px"
    @mouseenter="floatBtnDisplayed = true"
    @mouseleave="floatBtnDisplayed = false"
  >
    <ul
      ref="videoListRef"
      class="list-none m-0 p-0 bg-white text-gray-800 rounded-lg shadow w-max h-min"
      p="x-16px y-8px"
      m="y-auto r-8px"
      transition="opacity duration-300"
      :class="floatBtnDisplayed ? '' : 'hidden'"
    >
      <li
        v-for="index in videoElements.length"
        :key="index"
        @mouseenter="selectVideo(index - 1)"
        @mouseleave="unselectVideo(index - 1)"
      >
        <label class="flex items-center cursor-pointer py-4px"
          ><input
            v-model="videoSelectedIndex"
            type="radio"
            :value="index - 1"
          />Video {{ index }}</label
        >
      </li>
    </ul>
    <button
      class="flex w-40px h-40px rounded-full shadow cursor-pointer border-none"
      bg="teal-600 hover:teal-700"
    >
      <pixelarticons-power
        class="block m-auto text-white text-18px leading-28px"
      />
    </button>
  </div>
</template>
