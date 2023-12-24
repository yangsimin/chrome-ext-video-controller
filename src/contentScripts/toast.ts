const TOAST_TEXT_COLOR = '#ff5159'
const TOAST_BACKGROUND = 'rgba(0,0,0,0.9)'
const TOAST_TEXT_SIZE = '20px'

// 信息提示弹框
export class Toast {
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
      zIndex: '99999999999999999',
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
      if (document.documentElement.contains(this.divEl)) {
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
      if (document.documentElement.contains(this.divEl)) {
        // 如果是要显示toast，而且toast已经在dom中
        // 重置计时器
        clearTimeout(this.timer)
        clearTimeout(this.transitionTimer)
        return
      }
      document.documentElement.append(this.divEl)
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
