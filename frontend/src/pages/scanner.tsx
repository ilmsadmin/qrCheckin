import Head from 'next/head'
import { useState, useEffect, useRef } from 'react'
import { useScanner, CheckinType } from '../hooks/useScanner'
import { Scanner } from '@yudiel/react-qr-scanner'
import Navigation from '../components/Navigation'
import ProtectedRoute from '../components/ProtectedRoute'

export default function QRScanner() {
  const {
    events,
    currentEvent,
    recentScans,
    isLoading,
    isProcessing,
    error,
    success,
    isOnline,
    offlineScans,
    selectEvent,
    handleScan,
    clearMessages,
    refreshData,
    syncOfflineScans
  } = useScanner();

  const [scannedCode, setScannedCode] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedScanType, setSelectedScanType] = useState<CheckinType | null>(null);
  const [scannerActive, setScannerActive] = useState(true);
  const successModalTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle scan action
  const handleScanAction = (type: CheckinType) => {
    setSelectedScanType(type);
    
    if (scannedCode) {
      // If we already have a scanned code, process it
      handleScan(scannedCode, type);
      // Disable scanner during processing
      setScannerActive(false);
    }
  };
  
  // Handle successful QR code scan
  const handleQrCodeScan = (result: string) => {
    setScannedCode(result);
    // Pause scanning after successful scan
    setScannerActive(false);
  };
  
  // Reset scanner
  const resetScanner = () => {
    setScannedCode('');
    setSelectedScanType(null);
    setScannerActive(true);
    clearMessages();
  };

  // Show success modal when success message changes
  useEffect(() => {
    if (success) {
      setShowSuccessModal(true);
      
      // Auto-hide modal after 3 seconds
      if (successModalTimeoutRef.current) {
        clearTimeout(successModalTimeoutRef.current);
      }
      
      successModalTimeoutRef.current = setTimeout(() => {
        setShowSuccessModal(false);
        clearMessages();
      }, 3000);
    }
    
    return () => {
      if (successModalTimeoutRef.current) {
        clearTimeout(successModalTimeoutRef.current);
      }
    };
  }, [success, clearMessages]);

  // Close success modal
  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    resetScanner();
    
    if (successModalTimeoutRef.current) {
      clearTimeout(successModalTimeoutRef.current);
      successModalTimeoutRef.current = null;
    }
  };

  return (
    <ProtectedRoute requireStaff={true}>
      <>
        <Head>
          <title>QR Scanner - Staff App</title>
          <meta name="description" content="QR Code scanner for staff to manage check-ins" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <div className="bg-gray-900 text-white min-h-screen">
          {/* Header */}
          <header className="bg-gray-800 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <i className="fas fa-qrcode text-blue-400 text-xl mr-3"></i>
                <h1 className="text-lg font-semibold">QR Scanner</h1>
                {/* Offline indicator */}
                {!isOnline && (
                  <span className="ml-3 text-xs bg-yellow-600 text-white px-2 py-1 rounded-full">
                    Offline
                  </span>
                )}
                {/* Offline scans count */}
                {offlineScans > 0 && (
                  <button 
                    onClick={syncOfflineScans}
                    className="ml-3 text-xs bg-blue-600 text-white px-2 py-1 rounded-full flex items-center"
                    disabled={!isOnline}
                  >
                    <i className="fas fa-sync-alt mr-1 text-xs"></i>
                    {offlineScans} pending
                  </button>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={refreshData} 
                  className="text-gray-300 hover:text-white"
                  title="Refresh data"
                >
                  <i className="fas fa-sync-alt"></i>
                </button>
                <span className="text-sm text-gray-300">Staff App</span>
                <button className="text-gray-300 hover:text-white">
                  <i className="fas fa-cog"></i>
                </button>
              </div>
            </div>
          </header>

          {/* Error Message Banner */}
          {error && (
            <div className="bg-red-600 text-white p-4 flex justify-between items-center">
              <p>{error}</p>
              <button onClick={clearMessages} className="text-white">
                <i className="fas fa-times"></i>
              </button>
            </div>
          )}

          {/* Main Scanner Interface */}
          <div className="flex flex-col items-center justify-center p-8 min-h-screen">
            {/* Scanner Frame */}
            <div className="mb-8">
              <div className="scanner-frame mx-auto flex items-center justify-center relative">
                {isLoading || isProcessing ? (
                  <div className="text-blue-400 absolute top-0 left-0 w-full h-full flex items-center justify-center z-10 bg-gray-900 bg-opacity-75">
                    <div className="text-center">
                      <i className="fas fa-spinner fa-spin text-4xl mb-2"></i>
                      <p className="text-sm text-gray-300">{isProcessing ? "Processing..." : "Loading..."}</p>
                    </div>
                  </div>
                ) : scannerActive && !scannedCode ? (
                  <Scanner
                    onScan={(detectedCodes) => {
                      if (detectedCodes.length > 0) {
                        handleQrCodeScan(detectedCodes[0].rawValue);
                      }
                    }}
                    onError={(error) => console.log(error)}
                    scanDelay={1000}
                    styles={{
                      container: {
                        width: '250px',
                        height: '250px',
                        borderRadius: '12px',
                        overflow: 'hidden'
                      },
                      video: {
                        objectFit: 'cover'
                      }
                    }}
                  />
                ) : (
                  <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-gray-800">
                    <i className="fas fa-qrcode text-3xl text-blue-400 mb-2"></i>
                    {scannedCode ? (
                      <div className="text-center p-4">
                        <p className="text-sm text-white font-semibold mb-2">QR Code Detected</p>
                        <p className="text-xs text-gray-300 break-all">{scannedCode}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-300">Scanner paused</p>
                    )}
                  </div>
                )}
                <div className="scanner-corners absolute top-0 left-0 w-full h-full pointer-events-none">
                  <div className="corner top-left"></div>
                  <div className="corner top-right"></div>
                  <div className="corner bottom-left"></div>
                  <div className="corner bottom-right"></div>
                </div>
              </div>
              
              {/* Reset Button - Show only when QR code is detected or scanner is paused */}
              {(!scannerActive || scannedCode) && !isProcessing && (
                <button 
                  onClick={resetScanner}
                  className="mt-4 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm flex items-center justify-center mx-auto"
                >
                  <i className="fas fa-redo-alt mr-2"></i>
                  Reset Scanner
                </button>
              )}
            </div>

            {/* Instructions */}
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold mb-2">
                {!currentEvent ? 'Select an Event' : 
                 !scannedCode ? 'Scan Member QR Code' : 
                 !selectedScanType ? 'Choose Action' : 
                 `Performing ${selectedScanType === 'checkin' ? 'Check-in' : 'Check-out'}`}
              </h2>
              <p className="text-gray-300 text-sm">
                {!currentEvent ? 'Please select an event from the dropdown below' : 
                 !scannedCode ? 'Align the QR code within the frame to scan' : 
                 !selectedScanType ? 'Select check-in or check-out below' :
                 'Processing your request...'}
              </p>
            </div>

            {/* Event Selection */}
            <div className="w-full max-w-md mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">Current Event</label>
              <select 
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={currentEvent?.id || ''}
                onChange={(e) => {
                  const selectedEvent = events.find(event => event.id === e.target.value);
                  if (selectedEvent) {
                    selectEvent(selectedEvent);
                  }
                }}
              >
                {events.length === 0 ? (
                  <option value="">Loading events...</option>
                ) : (
                  events.map(event => (
                    <option key={event.id} value={event.id}>
                      {event.name} - {event.location || ''}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 mb-8">
              <button 
                onClick={() => handleScanAction('checkin')}
                className={`bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg flex items-center transition-colors ${(isProcessing || !currentEvent || (selectedScanType === 'checkin' && !scannedCode)) ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isProcessing || !currentEvent || (selectedScanType === 'checkin' && !scannedCode)}
              >
                <i className="fas fa-sign-in-alt mr-2"></i>
                {isProcessing && selectedScanType === 'checkin' ? 'Processing...' : 'Check In'}
              </button>
              <button 
                onClick={() => handleScanAction('checkout')}
                className={`bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg flex items-center transition-colors ${(isProcessing || !currentEvent || (selectedScanType === 'checkout' && !scannedCode)) ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isProcessing || !currentEvent || (selectedScanType === 'checkout' && !scannedCode)}
              >
                <i className="fas fa-sign-out-alt mr-2"></i>
                {isProcessing && selectedScanType === 'checkout' ? 'Processing...' : 'Check Out'}
              </button>
            </div>

            {/* Recent Scans */}
            <div className="w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Recent Scans</h3>
              {isLoading && recentScans.length === 0 ? (
                <div className="bg-gray-800 p-5 rounded-lg text-center">
                  <i className="fas fa-spinner fa-spin text-blue-400 text-xl mb-2"></i>
                  <p className="text-gray-400">Loading recent scans...</p>
                </div>
              ) : recentScans.length === 0 ? (
                <div className="bg-gray-800 p-5 rounded-lg text-center">
                  <p className="text-gray-400">No recent scans found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentScans.map((scan) => (
                    <div key={scan.id} className="bg-gray-800 p-3 rounded-lg flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 ${scan.type === 'checkin' ? 'bg-green-500' : 'bg-red-500'} rounded-full flex items-center justify-center mr-3`}>
                          <i className={`fas ${scan.type === 'checkin' ? 'fa-check' : 'fa-times'} text-white text-xs`}></i>
                        </div>
                        <div>
                          <p className="font-medium">{scan.name}</p>
                          <p className="text-xs text-gray-400">{scan.action} • {scan.time}</p>
                        </div>
                      </div>
                      <span className={`text-xs ${scan.type === 'checkin' ? 'text-green-400' : 'text-red-400'}`}>
                        {scan.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Navigation */}
          <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700">
            <div className="flex justify-around py-2">
              <button className="flex flex-col items-center py-2 px-4 text-blue-400">
                <i className="fas fa-qrcode text-xl mb-1"></i>
                <span className="text-xs">Scanner</span>
              </button>
              <button className="flex flex-col items-center py-2 px-4 text-gray-400 hover:text-white">
                <i className="fas fa-list text-xl mb-1"></i>
                <span className="text-xs">Logs</span>
              </button>
              <button className="flex flex-col items-center py-2 px-4 text-gray-400 hover:text-white">
                <i className="fas fa-chart-bar text-xl mb-1"></i>
                <span className="text-xs">Stats</span>
              </button>
              <button className="flex flex-col items-center py-2 px-4 text-gray-400 hover:text-white">
                <i className="fas fa-user text-xl mb-1"></i>
                <span className="text-xs">Profile</span>
              </button>
            </div>
          </nav>

          {/* Success Modal */}
          {showSuccessModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white rounded-lg p-6 m-4 max-w-sm w-full text-center text-gray-900">
                <div className={`w-16 h-16 ${!isOnline ? 'bg-yellow-100' : 'bg-green-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <i className={`${!isOnline ? 'fas fa-clock text-yellow-600' : 'fas fa-check text-green-600'} text-2xl`}></i>
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {!isOnline 
                    ? 'Saved for Later' 
                    : `${selectedScanType === 'checkin' ? 'Check-in' : 'Check-out'} Successful!`}
                </h3>
                <p className="text-gray-600 mb-4">{success}</p>
                {!isOnline && (
                  <p className="text-sm text-yellow-600 mb-4">
                    You are currently offline. This scan will be processed when you reconnect to the internet.
                  </p>
                )}
                <button 
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  onClick={closeSuccessModal}
                >
                  OK
                </button>
              </div>
            </div>
          )}
        </div>

        <style jsx>{`
          .scanner-frame {
            width: 250px;
            height: 250px;
            border: 2px solid #3B82F6;
            border-radius: 12px;
            position: relative;
            background: linear-gradient(45deg, transparent 45%, #3B82F6 45%, #3B82F6 55%, transparent 55%);
            background-size: 20px 20px;
            animation: scan 2s linear infinite;
          }
          @keyframes scan {
            0% { background-position: 0 0; }
            100% { background-position: 20px 20px; }
          }
          .scanner-corners {
            position: absolute;
            width: 100%;
            height: 100%;
          }
          .corner {
            position: absolute;
            width: 20px;
            height: 20px;
            border: 3px solid #3B82F6;
          }
          .corner.top-left { top: -2px; left: -2px; border-right: none; border-bottom: none; }
          .corner.top-right { top: -2px; right: -2px; border-left: none; border-bottom: none; }
          .corner.bottom-left { bottom: -2px; left: -2px; border-right: none; border-top: none; }
          .corner.bottom-right { bottom: -2px; right: -2px; border-left: none; border-top: none; }
        `}</style>
      </>
    </ProtectedRoute>
  )
}