export class VoiceActivityDetector {
  private audioContext: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private microphone: MediaStreamAudioSourceNode | null = null
  private dataArray: Uint8Array | null = null
  private isDetecting: boolean = false
  private threshold: number = 30 // Adjust this value to set sensitivity
  private smoothingTimeConstant: number = 0.8
  private fftSize: number = 256
  private callbacks: Set<(isSpeaking: boolean, average?: number) => void> = new Set()

  constructor() {
    // Properties initialized above
  }

  async initialize(stream: MediaStream): Promise<boolean> {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      this.audioContext = new AudioContextClass()
      this.analyser = this.audioContext.createAnalyser()
      this.microphone = this.audioContext.createMediaStreamSource(stream)

      this.analyser.fftSize = this.fftSize
      this.analyser.smoothingTimeConstant = this.smoothingTimeConstant
      const bufferLength = this.analyser.frequencyBinCount
      this.dataArray = new Uint8Array(bufferLength)

      this.microphone.connect(this.analyser)

      this.startDetection()
      return true
    } catch (error) {
      console.error('Error initializing voice activity detector:', error)
      return false
    }
  }

  startDetection(): void {
    if (this.isDetecting) return

    this.isDetecting = true
    this.detectVoice()
  }

  stopDetection(): void {
    this.isDetecting = false
  }

  detectVoice(): void {
    if (!this.isDetecting || !this.analyser || !this.dataArray) return

    // Create a fresh array to avoid type issues
    const dataArray = new Uint8Array(this.dataArray.length)
    this.analyser.getByteFrequencyData(dataArray)

    // Calculate average volume
    let sum = 0
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i]
    }
    const average = sum / dataArray.length

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

  addCallback(callback: (isSpeaking: boolean, average?: number) => void): void {
    this.callbacks.add(callback)
  }

  removeCallback(callback: (isSpeaking: boolean, average?: number) => void): void {
    this.callbacks.delete(callback)
  }

  setThreshold(threshold: number): void {
    this.threshold = threshold
  }

  cleanup(): void {
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