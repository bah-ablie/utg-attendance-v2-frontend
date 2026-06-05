import React, { useState, useEffect, useRef } from 'react';
import { FiCamera, FiCheckCircle, FiXCircle, FiRefreshCw } from 'react-icons/fi';
import { Html5Qrcode } from 'html5-qrcode';
import API from '../../api/axiosConfig';
import toast from 'react-hot-toast';

const StudentScan = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const scannerRef = useRef(null);
  const isMobile = window.innerWidth <= 768;

  useEffect(() => {
    return () => stopScanner();
  }, []);

  const startScanner = async () => {
    setResult(null);
    setCameraError(null);
    setScanning(true);

    setTimeout(async () => {
      try {
        const html5QrCode = new Html5Qrcode('qr-reader');
        scannerRef.current = html5QrCode;

        const qrboxSize = isMobile
          ? Math.min(window.innerWidth - 80, 280)
          : 280;

        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: qrboxSize, height: qrboxSize },
            aspectRatio: isMobile ? 1.0 : 1.333,
          },
          async (decodedText) => {
            await stopScanner();
            setLoading(true);

            try {
              const qrData = JSON.parse(decodedText);
              const response = await API.post('/attendance', {
                sessionToken: qrData.sessionToken,
                courseId: qrData.courseId
              });
              setResult({ success: true, message: response.data.message });
              toast.success('Attendance marked successfully! ✅');
            } catch (error) {
              const message = error.response?.data?.message || 'Error marking attendance';
              setResult({ success: false, message });
              toast.error(message);
            } finally {
              setLoading(false);
            }
          },
          () => {} // ignore per-frame errors
        );
      } catch (err) {
        setScanning(false);
        setCameraError(
          err.message?.includes('Permission')
            ? 'Camera permission denied. Please allow camera access and try again.'
            : 'Could not access camera. Make sure no other app is using it.'
        );
      }
    }, 100);
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (e) {}
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const handleScanAgain = () => {
    setResult(null);
    setCameraError(null);
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Scan QR Code</h1>
          <p className="page-subtitle">Mark your attendance by scanning the QR code</p>
        </div>
      </div>

      <div className="card" style={{
        maxWidth: '560px',
        margin: '0 auto',
        padding: isMobile ? '1rem' : '1.5rem'
      }}>

        {/* Instructions */}
        {!scanning && !result && (
          <div style={{
            backgroundColor: 'rgba(79,70,229,0.08)',
            borderRadius: '0.75rem',
            padding: '1rem',
            marginBottom: '1.5rem',
            border: '1px solid rgba(79,70,229,0.2)'
          }}>
            <h3 style={{
              fontSize: '0.875rem', fontWeight: '600',
              color: '#4F46E5', marginBottom: '0.5rem',
              display: 'flex', alignItems: 'center', gap: '0.4rem'
            }}>
              📋 Instructions
            </h3>
            <ul style={{
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              paddingLeft: '1.25rem',
              lineHeight: '1.8'
            }}>
              <li>Ask your lecturer to display the QR code</li>
              <li>Click <strong>"Start Scanning"</strong> and allow camera access</li>
              <li>Point your <strong>back camera</strong> at the QR code</li>
              <li>Make sure you are enrolled in the course</li>
              <li>⏱️ QR codes expire after <strong>5 minutes</strong> — scan quickly!</li>
            </ul>
          </div>
        )}

        {/* Camera Error */}
        {cameraError && (
          <div style={{
            padding: '1rem',
            borderRadius: '0.75rem',
            marginBottom: '1.5rem',
            backgroundColor: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.3)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem'
          }}>
            <FiXCircle style={{ color: '#EF4444', fontSize: '1.25rem', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ fontWeight: '600', color: '#EF4444', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                Camera Error
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {cameraError}
              </p>
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div style={{
            padding: '1.25rem',
            borderRadius: '0.75rem',
            marginBottom: '1.5rem',
            backgroundColor: result.success
              ? 'rgba(16,185,129,0.08)'
              : 'rgba(239,68,68,0.08)',
            border: `1px solid ${result.success
              ? 'rgba(16,185,129,0.3)'
              : 'rgba(239,68,68,0.3)'}`,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
              {result.success ? '✅' : '❌'}
            </div>
            <p style={{
              fontWeight: '700',
              fontSize: '1rem',
              color: result.success ? '#10B981' : '#EF4444',
              marginBottom: '0.4rem'
            }}>
              {result.success ? 'Attendance Marked!' : 'Marking Failed!'}
            </p>
            <p style={{
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              marginBottom: '1rem'
            }}>
              {result.message}
            </p>
            <button
              className="btn btn-outline"
              onClick={handleScanAgain}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <FiRefreshCw style={{ marginRight: '0.4rem' }} />
              Scan Again
            </button>
          </div>
        )}

        {/* Scanner area */}
        {scanning && (
          <div style={{ marginBottom: '1rem' }}>
            <div id="qr-reader" style={{
              width: '100%',
              borderRadius: '0.75rem',
              overflow: 'hidden',
              border: '2px solid #4F46E5'
            }} />
          </div>
        )}

        {/* Buttons */}
        {!result && (
          <div style={{ textAlign: 'center' }}>
            {scanning ? (
              <button
                className="btn btn-danger"
                onClick={stopScanner}
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '0.875rem',
                  fontSize: '1rem'
                }}
              >
                <FiXCircle style={{ marginRight: '0.5rem' }} />
                Stop Scanning
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={startScanner}
                disabled={loading}
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '0.875rem',
                  fontSize: '1rem'
                }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: '18px', height: '18px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: 'white',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                      marginRight: '0.5rem'
                    }} />
                    Processing...
                  </>
                ) : (
                  <>
                    <FiCamera style={{ marginRight: '0.5rem' }} />
                    Start Scanning
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentScan;