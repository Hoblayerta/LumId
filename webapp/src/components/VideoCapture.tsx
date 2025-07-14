import { useState, useRef } from 'react';

interface VideoCaptureProps {
  onBiometricHash: (hash: string) => void;
}

export const VideoCapture: React.FC<VideoCaptureProps> = ({ onBiometricHash }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasVideo, setHasVideo] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user' // Cámara frontal
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setHasVideo(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Error al acceder a la cámara. Verifica los permisos.');
    }
  };

  const captureFrame = (): string => {
    if (!videoRef.current || !canvasRef.current) return '';
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    
    // Configurar canvas del mismo tamaño que el video
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    // Capturar frame actual del video
    ctx.drawImage(videoRef.current, 0, 0);
    
    // Convertir a data URL
    return canvas.toDataURL('image/jpeg', 0.8);
  };

  const generateBiometricHash = async (imageData: string): Promise<string> => {
    // Simulación más realista de procesamiento biométrico
    const buffer = new TextEncoder().encode(imageData);
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return `bio_${hashHex.substring(0, 32)}`;
  };

  const startRecording = () => {
    if (!videoRef.current) return;
    
    setIsRecording(true);
    setCountdown(3);
    
    // Countdown
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          processCapture();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const processCapture = async () => {
    setIsRecording(false);
    setIsProcessing(true);
    
    try {
      // Capturar frame del video
      const imageData = captureFrame();
      
      if (imageData) {
        // Simular procesamiento (en producción usarías face-api.js)
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Generar hash biométrico
        const hash = await generateBiometricHash(imageData);
        onBiometricHash(hash);
      } else {
        alert('Error al capturar imagen');
      }
    } catch (error) {
      console.error('Error processing biometrics:', error);
      alert('Error al procesar biométricos');
    } finally {
      setIsProcessing(false);
    }
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
    <div className="p-6 max-w-md mx-auto bg-blue-500/20 backdrop-blur-sm rounded-xl shadow-lg border border-blue-300/30">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
        📹 Captura Biométrica
      </h2>
      
      <div className="mb-4 relative">
        <video
          ref={videoRef}
          autoPlay
          muted
          className="w-full rounded-lg border-2 border-gray-300"
          style={{ maxHeight: '300px', transform: 'scaleX(-1)' }}
        />
        
        {/* Countdown overlay */}
        {isRecording && countdown > 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
            <div className="text-white text-6xl font-bold">{countdown}</div>
          </div>
        )}
        
        {/* Canvas oculto para captura */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="space-y-3">
        {!hasVideo && (
          <button
            onClick={startCamera}
            className="w-full bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 font-semibold transition-colors"
          >
            🎥 Iniciar Cámara
          </button>
        )}

        {hasVideo && !isRecording && !isProcessing && (
          <>
            <button
              onClick={startRecording}
              className="w-full bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 font-semibold transition-colors"
            >
              📸 Capturar Biométricos
            </button>
            
            <button
              onClick={stopCamera}
              className="w-full bg-gray-500 text-white px-4 py-3 rounded-lg hover:bg-gray-600 font-semibold transition-colors"
            >
              ⏹️ Detener Cámara
            </button>
          </>
        )}

        {isRecording && (
          <div className="w-full bg-red-500 text-white px-4 py-3 rounded-lg text-center font-semibold">
            🔴 Preparándose para captura...
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
