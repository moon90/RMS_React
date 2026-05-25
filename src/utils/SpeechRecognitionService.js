const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

class SpeechRecognitionService {
  constructor() {
    this.recognition = SpeechRecognition ? new SpeechRecognition() : null;
    if (this.recognition) {
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
    }
  }

  startListening(onResult, onError, onEnd) {
    if (!this.recognition) {
      onError('Speech recognition not supported in this browser.');
      return;
    }

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    this.recognition.onerror = (event) => {
      onError(event.error);
    };

    this.recognition.onend = () => {
      onEnd();
    };

    try {
      this.recognition.start();
    } catch (err) {
      console.error('Speech recognition error:', err);
      onError(err.message);
    }
  }

  stopListening() {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  isSupported() {
    return !!this.recognition;
  }
}

export default new SpeechRecognitionService();
