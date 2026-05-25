import React, { useState } from 'react';
import { FiMic, FiMicOff } from 'react-icons/fi';
import speechRecognitionService from '../utils/SpeechRecognitionService';
import voiceIntentParser from '../utils/VoiceIntentParser';
import { toast } from 'react-toastify';

const VoiceCommandButton = ({ onCommand, products }) => {
  const [isListening, setIsListening] = useState(false);
  const [lastTranscript, setLastTranscript] = useState('');

  const toggleListening = () => {
    if (isListening) {
      speechRecognitionService.stopListening();
      setIsListening(false);
    } else {
      if (!speechRecognitionService.isSupported()) {
        toast.error('Voice commands are not supported in this browser.');
        return;
      }

      setIsListening(true);
      speechRecognitionService.startListening(
        (transcript) => {
          setLastTranscript(transcript);
          const intent = voiceIntentParser.parseIntent(transcript);
          onCommand(intent);
        },
        (error) => {
          console.error('Speech recognition error:', error);
          toast.error(`Voice Error: ${error}`);
          setIsListening(false);
        },
        () => {
          setIsListening(false);
        }
      );
    }
  };

  return (
    <div className="fixed bottom-24 right-8 z-[60] flex flex-col items-end gap-2">
      {isListening && (
        <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-2xl border border-blue-100 animate-bounce">
          <p className="text-xs font-bold text-blue-600 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Listening... {lastTranscript && `"${lastTranscript}"`}
          </p>
        </div>
      )}
      
      <button
        onClick={toggleListening}
        className={`p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 ${
          isListening 
            ? 'bg-rose-500 text-white animate-pulse' 
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
        title={isListening ? 'Stop Listening' : 'Start Voice Commands'}
      >
        {isListening ? <FiMicOff size={24} /> : <FiMic size={24} />}
      </button>
    </div>
  );
};

export default VoiceCommandButton;
