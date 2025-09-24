export class VoiceActivityDetector {
  constructor() {
    this.audioContext = null
    this.analyser = null
    this.microphone = null
    this.dataArray = null
    this.isDetecting = false
    this.threshold = 30 // Adjust this value to set sensitivity
    this.smoothingTimeConstant = 0.8
    this.fftSize = 256
    this.callbacks = new Set()
  }

  async initialize(stream) {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
      this.analyser = this.audioContext.createAnalyser()
      this.microphone = this.audioContext.createMediaStreamSource(stream)

      this.analyser.fftSize = this.fftSize
      this.analyser.smoothingTimeConstant = this.smoothingTimeConstant
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount)

      this.microphone.connect(this.analyser)

      this.startDetection()
      return true
    } catch (error) {
      console.error('Error initializing voice activity detector:', error)
      return false
    }
  }

  startDetection() {
    if (this.isDetecting) return

    this.isDetecting = true
    this.detectVoice()
  }

  stopDetection() {
    this.isDetecting = false
  }

  detectVoice() {
    if (!this.isDetecting || !this.analyser) return

    this.analyser.getByteFrequencyData(this.dataArray)

    // Calculate average volume
    let sum = 0
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i]
    }
    const average = sum / this.dataArray.length

    // Check if speaking
    const isSpeaking = average > this.threshold

    // Notify all callbacks
    this.callbacks.forEach(callback => {
      try {
        callback(isSpeaking, average)
      } catch (error) {
        console.error('Error in voice activity callback:', error)
      }
    })

    // Continue detection
    requestAnimationFrame(() => this.detectVoice())
  }

  addCallback(callback) {
    this.callbacks.add(callback)
  }

  removeCallback(callback) {
    this.callbacks.delete(callback)
  }

  setThreshold(threshold) {
    this.threshold = threshold
  }

  cleanup() {
    this.stopDetection()
    if (this.microphone) {
      this.microphone.disconnect()
    }
    if (this.analyser) {
      this.analyser.disconnect()
    }
    if (this.audioContext) {
      this.audioContext.close()
    }
    this.callbacks.clear()
  }
}