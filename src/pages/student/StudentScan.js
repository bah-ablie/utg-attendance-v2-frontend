import React, { useState, useEffect, useRef } from 'react';
import { FiCamera, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { Html5QrcodeScanner } from 'html5-qrcode';
import API from '../../api/axiosConfig';
import toast from 'react-hot-toast';

const StudentScan = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    return () => stopScanner();
  }, []);

  const startScanner = () => {
    setResult(null);
    setScanning(true);
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner('qr-reader', {
        fps: 10,
        qrbox: { width: 280, height: 280 },
        videoConstraints: { facingMode: { exact: 'environment' } }
      });

      scanner.render(
        async (decodedText) => {
          scanner.clear();
          scannerRef.current = null;
          setScanning(false);
          setLoading(true);

          try {
            const qrData = JSON.parse(decodedText);
            const response = await API.post('/attendance', {
              sessionToken: qrData.sessionToken,
              courseId: qrData.courseId
            });

            setResult({ success: true, message: response.data.message });
            toast.success('Attendance marked successfully!');
          } catch (error) {
            const message = error.response?.data?.message || 'Error marking attendance';
            setResult({ success: false, message });
            toast.error(message);
          } finally {
            setLoading(false);
          }
        },
        (error) => console.log('QR scan error:', error)
      );

      scannerRef.current = scanner;
    }, 100);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setScanning(false);
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Scan QR Code</h1>
          <p className="page-subtitle">Mark your attendance by scanning the QR code</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Instructions */}
        <div style={{
          backgroundColor: 'rgba(79,70,229,0.1)',
          borderRadius: '0.75rem',
          padding: '1rem',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#4F46E5', marginBottom: '0.5rem' }}>
            📋 Instructions
          </h3>
          <ul style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: '1rem' }}>
            <li>Ask your lecturer to display the QR code</li>
            <li>Click "Start Scanning" and point your camera at the QR code</li>
            <li>Make sure you are enrolled in the course</li>
            <li>QR codes expire after 5 minutes — scan quickly!</li>
          </ul>
        </div>

        {/* Result */}
        {result && (
          <div style={{
            padding: '1rem',
            borderRadius: '0.75rem',
            marginBottom: '1.5rem',
            backgroundColor: result.success ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${result.success ? '#10B981' : '#EF4444'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            {result.success
              ? <FiCheckCircle style={{ color: '#10B981', fontSize: '1.5rem', flexShrink: 0 }} />
              : <FiXCircle style={{ color: '#EF4444', fontSize: '1.5rem', flexShrink: 0 }} />
            }
            <div>
              <p style={{
                fontWeight: '600',
                color: result.success ? '#10B981' : '#EF4444',
                fontSize: '0.875rem'
              }}>
                {result.success ? 'Success!' : 'Failed!'}
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {result.message}
              </p>
            </div>
          </div>
        )}

        {/* Scanner */}
        <div style={{ textAlign: 'center' }}>
          {scanning ? (
            <>
              <div id="qr-reader" style={{ width: '100%' }}></div>
              <button
                className="btn btn-danger"
                onClick={stopScanner}
                style={{ marginTop: '1rem', width: '100%' }}
              >
                Stop Scanning
              </button>
            </>
          ) : (
            <button
              className="btn btn-primary btn-lg"
              onClick={startScanner}
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '16px', height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                  }} />
                  Processing...
                </>
              ) : (
                <>
                  <FiCamera /> Start Scanning
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentScan;