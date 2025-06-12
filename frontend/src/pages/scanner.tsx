import Head from 'next/head'
import { useState, useEffect } from 'react'

export default function QRScanner() {
  const [currentEvent, setCurrentEvent] = useState('Fitness Class - Room A')
  const [recentScans, setRecentScans] = useState([
    {
      id: 1,
      name: 'John Doe',
      action: 'Check-in',
      time: '2 mins ago',
      status: 'Success',
      type: 'checkin'
    },
    {
      id: 2,
      name: 'Jane Smith',
      action: 'Check-out',
      time: '5 mins ago',
      status: 'Completed',
      type: 'checkout'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      action: 'Check-in',
      time: '8 mins ago',
      status: 'Success',
      type: 'checkin'
    }
  ])

  return (
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
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300">Staff App</span>
              <button className="text-gray-300 hover:text-white">
                <i className="fas fa-cog"></i>
              </button>
            </div>
          </div>
        </header>

        {/* Main Scanner Interface */}
        <div className="flex flex-col items-center justify-center p-8 min-h-screen">
          {/* Scanner Frame */}
          <div className="mb-8">
            <div className="scanner-frame mx-auto flex items-center justify-center relative">
              <div className="scanner-corners">
                <div className="corner top-left"></div>
                <div className="corner top-right"></div>
                <div className="corner bottom-left"></div>
                <div className="corner bottom-right"></div>
              </div>
              <div className="text-center">
                <i className="fas fa-qrcode text-4xl text-blue-400 mb-2"></i>
                <p className="text-sm text-gray-300">Position QR code here</p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold mb-2">Scan Member QR Code</h2>
            <p className="text-gray-300 text-sm">Align the QR code within the frame to check-in/check-out</p>
          </div>

          {/* Event Selection */}
          <div className="w-full max-w-md mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">Current Event</label>
            <select 
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={currentEvent}
              onChange={(e) => setCurrentEvent(e.target.value)}
            >
              <option>Fitness Class - Room A</option>
              <option>Yoga Session - Studio B</option>
              <option>Swimming Pool Access</option>
              <option>General Club Access</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 mb-8">
            <button className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg flex items-center transition-colors">
              <i className="fas fa-sign-in-alt mr-2"></i>
              Check In
            </button>
            <button className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg flex items-center transition-colors">
              <i className="fas fa-sign-out-alt mr-2"></i>
              Check Out
            </button>
          </div>

          {/* Recent Scans */}
          <div className="w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Recent Scans</h3>
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

        {/* Success Modal (Hidden by default) */}
        <div id="successModal" className="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center">
          <div className="bg-white rounded-lg p-6 m-4 max-w-sm w-full text-center text-gray-900">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-check text-green-600 text-2xl"></i>
            </div>
            <h3 className="text-xl font-semibold mb-2">Check-in Successful!</h3>
            <p className="text-gray-600 mb-4">John Doe has been successfully checked in.</p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              OK
            </button>
          </div>
        </div>
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
  )
}