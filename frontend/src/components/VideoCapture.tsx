import { useState, useRef, useCallback } from 'react';

interface VideoCaptureProps {
  onBiometricHash: (hash: string) => void;
}

export const VideoCapture: React.FC<VideoCaptureProps> = ({ onBiometricHash }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasVideo, setHasVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setHasVideo(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Error accessing camera. Please check permissions.');
    }
  };

  const startRecording = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const mediaRecorder = new MediaRecorder(stream);
      
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        setRecordedChunks(chunks);
        setIsProcessing(true);
        
        // Simular procesamiento biométrico
        setTimeout(() => {
          const mockHash = generateMockBiometricHash();
          onBiometricHash(mockHash);
          setIsProcessing(false);
        }, 2000);
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);

      // Auto-stop después de 3 segundos
      setTimeout(() => {
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
        }
      }, 3000);
    }
  };

  const generateMockBiometricHash = (): string => {
    // Simular hash biométrico (en producción usarías face-api.js)
    const timestamp = Date.now().toString();
    const randomData = Math.random().toString(36).substring(2);
    return `bio_${timestamp}_${randomData}`;
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setHasVideo(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-lg border">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
        📹 Captura Biométrica
      </h2>
      
      <div className="mb-4">
        <video
          ref={videoRef}
          autoPlay
          muted
          className="w-full rounded-lg border-2 border-gray-300"
          style={{ maxHeight: '300px', transform: 'scaleX(-1)' }}
        />
      </div>

      <div className="space-y-3">
        {!hasVideo && (
          <button
            onClick={startCamera}
            className="w-full bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 font-semibold"
          >
            🎥 Iniciar Cámara
          </button>
        )}

        {hasVideo && !isRecording && !isProcessing && (
          <>
            <button
              onClick={startRecording}
              className="w-full bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 font-semibold"
            >
              🔴 Grabar Video (3s)
            </button>
            
            <button
              onClick={stopCamera}
              className="w-full bg-gray-500 text-white px-4 py-3 rounded-lg hover:bg-gray-600 font-semibold"
            >
              ⏹️ Detener Cámara
            </button>
          </>
        )}

        {isRecording && (
          <div className="w-full bg-red-500 text-white px-4 py-3 rounded-lg text-center font-semibold">
            🔴 Grabando... (3s)
          </div>
        )}

        {isProcessing && (
          <div className="w-full bg-yellow-500 text-white px-4 py-3 rounded-lg text-center font-semibold">
            ⚙️ Procesando Biométricos...
          </div>
        )}
      </div>
    </div>
  );
};
