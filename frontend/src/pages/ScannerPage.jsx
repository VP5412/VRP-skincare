import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function ScannerPage() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [phase, setPhase] = useState('INIT'); // INIT, CENTER, RIGHT, LEFT, DONE, UPLOADING, ERROR
  const [instruction, setInstruction] = useState('Initializing camera...');
  const [capturedImages, setCapturedImages] = useState({});
  const [holdProgress, setHoldProgress] = useState(0);
  const [error, setError] = useState('');

  // Refs to keep mutable state accessible inside callbacks
  const phaseRef = useRef('INIT');
  const holdTimerRef = useRef(0);
  const capturedRef = useRef({});
  const faceMeshRef = useRef(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    async function initScanner() {
      // Dynamically load MediaPipe scripts
      await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');
      await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js');
      await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js');

      if (!mounted) return;

      const faceMesh = new window.FaceMesh({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      faceMesh.onResults((results) => {
        if (!mounted) return;
        onFaceMeshResults(results);
      });

      faceMeshRef.current = faceMesh;

      const camera = new window.Camera(videoRef.current, {
        onFrame: async () => {
          if (faceMeshRef.current) {
            await faceMeshRef.current.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480,
      });

      cameraRef.current = camera;
      camera.start();

      phaseRef.current = 'CENTER';
      setPhase('CENTER');
      setInstruction('Please look straight ahead.');
    }

    initScanner();

    return () => {
      mounted = false;
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
    };
  }, []);

  function onFaceMeshResults(results) {
    if (phaseRef.current === 'DONE' || phaseRef.current === 'UPLOADING') return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    if (canvas.width !== video.videoWidth) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      const landmarks = results.multiFaceLandmarks[0];

      // Draw mesh
      window.drawConnectors(ctx, landmarks, window.FACEMESH_TESSELATION, { color: '#bee6d370', lineWidth: 1 });
      window.drawConnectors(ctx, landmarks, window.FACEMESH_FACE_OVAL, { color: '#bee6d3', lineWidth: 2 });

      // Calculate yaw via nose-to-side ratios
      const nose = landmarks[1];
      const leftSide = landmarks[234];
      const rightSide = landmarks[454];
      const leftDist = nose.x - leftSide.x;
      const rightDist = rightSide.x - nose.x;
      const ratio = leftDist / rightDist;

      checkRotation(ratio);
    } else {
      setInstruction('Face not detected. Bring your face into frame.');
      resetHold();
    }
  }

  function checkRotation(ratio) {
    let isLookingCorrectly = false;
    const currentPhase = phaseRef.current;

    if (currentPhase === 'CENTER') {
      if (ratio > 0.8 && ratio < 1.2) isLookingCorrectly = true;
    } else if (currentPhase === 'RIGHT') {
      if (ratio > 2.0) isLookingCorrectly = true;
    } else if (currentPhase === 'LEFT') {
      if (ratio < 0.5) isLookingCorrectly = true;
    }

    if (isLookingCorrectly) {
      holdTimerRef.current++;
      const progress = Math.min((holdTimerRef.current / 20) * 100, 100);
      setHoldProgress(progress);
      setInstruction(`Hold still... ${Math.floor(holdTimerRef.current / 10)}`);

      if (holdTimerRef.current > 20) {
        takePicture();
      }
    } else {
      resetHold();
      if (currentPhase === 'CENTER') setInstruction('Please look straight ahead.');
      if (currentPhase === 'RIGHT') setInstruction('Slowly turn your head to your LEFT.');
      if (currentPhase === 'LEFT') setInstruction('Now slowly turn your head to your RIGHT.');
    }
  }

  function resetHold() {
    holdTimerRef.current = 0;
    setHoldProgress(0);
  }

  function takePicture() {
    const video = videoRef.current;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = video.videoWidth;
    tempCanvas.height = video.videoHeight;
    const ctx = tempCanvas.getContext('2d');

    // Mirror the image (since video is mirrored)
    ctx.translate(tempCanvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);

    const imgData = tempCanvas.toDataURL('image/jpeg');
    const currentPhase = phaseRef.current;

    capturedRef.current = { ...capturedRef.current, [currentPhase]: imgData };
    setCapturedImages({ ...capturedRef.current });

    resetHold();

    if (currentPhase === 'CENTER') {
      phaseRef.current = 'RIGHT';
      setPhase('RIGHT');
    } else if (currentPhase === 'RIGHT') {
      phaseRef.current = 'LEFT';
      setPhase('LEFT');
    } else if (currentPhase === 'LEFT') {
      phaseRef.current = 'DONE';
      setPhase('DONE');
      finishScan();
    }
  }

  function dataURLtoFile(dataurl, filename) {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  async function finishScan() {
    if (cameraRef.current) cameraRef.current.stop();

    setPhase('UPLOADING');
    setInstruction('Analyzing your skin with AI...');

    const formData = new FormData();
    formData.append('files', dataURLtoFile(capturedRef.current.CENTER, 'center.jpg'));
    formData.append('files', dataURLtoFile(capturedRef.current.RIGHT, 'right.jpg'));
    formData.append('files', dataURLtoFile(capturedRef.current.LEFT, 'left.jpg'));

    try {
      const result = await api.submitScan(formData);
      navigate(`/results/${result.scan_id}`, { state: { scanData: result } });
    } catch (err) {
      console.error('Scan error:', err);
      setError(err.message || 'Failed to analyze images. Is the backend running?');
      setPhase('ERROR');
    }
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  const completedDots = {
    CENTER: ['CENTER', 'RIGHT', 'LEFT'].indexOf(phase) > 0 || phase === 'DONE' || phase === 'UPLOADING',
    RIGHT: ['RIGHT', 'LEFT'].indexOf(phase) > 0 || (phase !== 'CENTER' && phase !== 'RIGHT' && phase !== 'INIT'),
    LEFT: phase === 'DONE' || phase === 'UPLOADING',
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Top Header */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-transparent">
        <button
          onClick={() => navigate('/dashboard')}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        <div className="flex flex-col items-center">
          <span className="text-white/60 font-label text-[10px] uppercase tracking-[0.2em]">Skin Analysis</span>
          <h1 className="text-white font-headline font-bold text-lg tracking-tight">AI Diagnostic</h1>
        </div>
        <div className="w-10 h-10" /> {/* Spacer */}
      </header>

      {/* Camera Viewport */}
      <main className="relative w-full h-screen flex items-center justify-center">
        {/* Video + Canvas */}
        <div className="relative w-full h-full">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }}
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
            style={{ transform: 'scaleX(-1)' }}
          />

          {/* Scanning frame overlay */}
          <div className="absolute inset-0 z-10 pointer-events-none">
            {/* Vignette */}
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)' }} />

            {/* Face frame */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(80vw,400px)] aspect-[3/4] max-h-[65vh] border border-white/20 rounded-[3rem] overflow-hidden">
              {/* Corner brackets */}
              <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-primary-container rounded-tl-lg" />
              <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-primary-container rounded-tr-lg" />
              <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-primary-container rounded-bl-lg" />
              <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-primary-container rounded-br-lg" />

              {/* Scan line */}
              <div
                className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary-container/60 to-transparent blur-xs"
                style={{ animation: 'scan-line 3s ease-in-out infinite' }}
              />

              {/* Grid */}
              <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            </div>
          </div>

          {/* Hold progress ring */}
          {holdProgress > 0 && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
              <svg className="w-48 h-48 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(190,230,211,0.2)" strokeWidth="3" />
                <circle
                  cx="50" cy="50" r="45" fill="none"
                  stroke="#bee6d3" strokeWidth="3"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={2 * Math.PI * 45 * (1 - holdProgress / 100)}
                  strokeLinecap="round"
                  className="transition-all duration-100"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Bottom Controls */}
        <section className="fixed bottom-0 left-0 w-full z-30 px-8 pb-12 pt-20 bg-gradient-to-t from-black/90 to-transparent">
          {phase === 'UPLOADING' ? (
            <div className="flex flex-col items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-primary-container/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary-container text-4xl animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              </div>
              <div className="text-center">
                <p className="text-white font-headline font-bold text-lg mb-1">Analyzing with AI</p>
                <p className="text-white/60 text-sm">Examining your skin...</p>
              </div>
              {/* Preview captured images */}
              <div className="flex gap-3">
                {Object.entries(capturedImages).map(([key, src]) => (
                  <img key={key} src={src} alt={key} className="w-16 h-16 rounded-xl object-cover border-2 border-primary-container/30" />
                ))}
              </div>
            </div>
          ) : phase === 'ERROR' ? (
            <div className="flex flex-col items-center gap-4">
              <span className="material-symbols-outlined text-error-container text-4xl">error</span>
              <p className="text-error-container text-sm text-center">{error}</p>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-8 py-3 bg-white/10 text-white rounded-full font-headline font-bold text-sm"
              >
                Go Back
              </button>
            </div>
          ) : (
            <>
              {/* Status */}
              <div className="flex flex-col items-center mb-8">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 bg-primary-container rounded-full animate-pulse" />
                  <p className="text-white font-label text-xs uppercase tracking-widest">{instruction}</p>
                </div>
              </div>

              {/* Progress dots */}
              <div className="flex justify-center gap-4 mb-6">
                {['CENTER', 'RIGHT', 'LEFT'].map((dotPhase) => (
                  <div key={dotPhase} className="flex flex-col items-center gap-1">
                    <div className={`w-4 h-4 rounded-full transition-all ${completedDots[dotPhase]
                      ? 'bg-primary-container shadow-[0_0_12px_rgba(190,230,211,0.6)]'
                      : phase === dotPhase
                        ? 'bg-primary-container/50 animate-pulse'
                        : 'bg-white/20'
                      }`} />
                    <span className="text-[8px] text-white/40 uppercase">{dotPhase}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
