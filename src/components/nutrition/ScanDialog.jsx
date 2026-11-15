import { useEffect, useRef } from "preact/hooks";

const FORMATS = ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "code_39"];

export default function ScanDialog({ onClose, onCode, onError }) {
  const videoRef = useRef(null);

  useEffect(() => {
    let alive = true;
    let stream = null;
    let timer = null;

    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        const video = videoRef.current;
        if (!video || !alive) return;
        video.srcObject = stream;
        await video.play();
        const detector = new window.BarcodeDetector({ formats: FORMATS });
        const loop = async () => {
          if (!alive) return;
          try {
            const codes = await detector.detect(video);
            if (codes.length) { onCode(codes[0].rawValue); return; }
          } catch { /* keep trying */ }
          timer = setTimeout(loop, 250);
        };
        loop();
      } catch {
        if (alive) onError();
      }
    };

    start();
    return () => {
      alive = false;
      if (timer) clearTimeout(timer);
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return (
    <div class="ntr-scan" role="dialog" aria-modal="true" aria-label="Scan a barcode">
      <div class="ntr-scan-card">
        <video ref={videoRef} playsinline muted />
        <div class="ntr-scan-frame" aria-hidden="true" />
        <p>Point the camera at the barcode</p>
        <button type="button" class="ui-btn ui-btn-soft" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
