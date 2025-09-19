"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Play,
  Square,
  AlertTriangle,
  MapPin,
  Languages,
  Gauge,
  Navigation,
  Phone,
  Clock,
  Satellite,
  Map,
  Wifi,
  WifiOff,
  Wrench,
  Car,
  Heart,
  Shield,
  Bell,
  X,
  CheckCircle,
  Battery,
  Zap,
} from "lucide-react"

interface PerformanceMetrics {
  batteryLevel?: number
  isCharging?: boolean
  memoryUsage?: number
  networkType?: string
  lastOptimization: number
}

interface LocationData {
  latitude: number
  longitude: number
  accuracy: number
  timestamp: number
  speed?: number
}

interface EmergencyAlert {
  id: string
  type: "breakdown" | "accident" | "medical" | "security" | "general"
  timestamp: Date
  location?: LocationData
  description?: string
  status: "active" | "resolved" | "cancelled"
  autoDetected?: boolean
}

interface TripData {
  id: string
  startTime: Date
  endTime?: Date
  duration?: number
  maxSpeed: number
  averageSpeed: number
  route?: LocationData[]
  status: "active" | "completed" | "interrupted"
  startLocation?: LocationData
  endLocation?: LocationData
  totalDistance?: number
  emergencyAlerts?: EmergencyAlert[]
}

// Language translations
const translations = {
  en: {
    appTitle: "RAASTE Captain",
    startTrip: "START TRIP",
    stopTrip: "STOP TRIP",
    sos: "SOS EMERGENCY",
    viewRoute: "VIEW ROUTE",
    language: "Language",
    speed: "Speed",
    status: "Status",
    tripActive: "Trip Active",
    tripInactive: "Trip Inactive",
    currentSpeed: "Current Speed",
    maxSpeed: "Max Speed: 60 km/h",
    location: "Location Tracking",
    emergency: "Emergency Services",
    kmh: "km/h",
    tripDuration: "Trip Duration",
    tripHistory: "Trip History",
    currentTrip: "Current Trip",
    totalTrips: "Total Trips Today",
    avgSpeed: "Avg Speed",
    maxSpeedReached: "Max Speed",
    minutes: "min",
    hours: "hrs",
    noTrips: "No trips today",
    tripStarted: "Trip Started",
    tripCompleted: "Trip Completed",
    gpsStatus: "GPS Status",
    gpsActive: "GPS Active",
    gpsInactive: "GPS Inactive",
    accuracy: "Accuracy",
    meters: "m",
    coordinates: "Coordinates",
    networkStatus: "Network",
    online: "Online",
    offline: "Offline",
    routePoints: "Route Points",
    distance: "Distance",
    kilometers: "km",
    locationPermission: "Location Permission Required",
    enableLocation: "Enable Location",
    lowAccuracy: "Low GPS Accuracy",
    goodAccuracy: "Good GPS Signal",
    emergencyType: "Emergency Type",
    breakdown: "Bus Breakdown",
    accident: "Accident",
    medical: "Medical Emergency",
    security: "Security Issue",
    general: "General Emergency",
    selectEmergency: "Select Emergency Type",
    sendAlert: "Send Alert",
    cancelAlert: "Cancel Alert",
    resolveAlert: "Mark Resolved",
    activeAlerts: "Active Alerts",
    alertHistory: "Alert History",
    noActiveAlerts: "No active alerts",
    alertSent: "Emergency alert sent successfully",
    alertCancelled: "Alert cancelled",
    alertResolved: "Alert marked as resolved",
    autoDetected: "Auto-detected",
    manualAlert: "Manual alert",
    emergencyContacts: "Emergency Contacts",
    suddenStop: "Sudden stop detected - possible emergency",
    hardBraking: "Hard braking detected",
    emergencyServices: "Emergency Services: 108",
    police: "Police: 100",
    fire: "Fire: 101",
    ambulance: "Ambulance: 108",
    batteryOptimized: "Battery Optimized",
    powerSaving: "Power Saving Mode",
    batteryLevel: "Battery",
    charging: "Charging",
    performance: "Performance",
  },
  pa: {
    appTitle: "ਰਾਸਤੇ ਕੈਪਟਨ",
    startTrip: "ਯਾਤਰਾ ਸ਼ੁਰੂ ਕਰੋ",
    stopTrip: "ਯਾਤਰਾ ਬੰਦ ਕਰੋ",
    sos: "ਐਮਰਜੈਂਸੀ SOS",
    viewRoute: "ਰੂਟ ਦੇਖੋ",
    language: "ਭਾਸ਼ਾ",
    speed: "ਰਫ਼ਤਾਰ",
    status: "ਸਥਿਤੀ",
    tripActive: "ਯਾਤਰਾ ਚਾਲੂ",
    tripInactive: "ਯਾਤਰਾ ਬੰਦ",
    currentSpeed: "ਮੌਜੂਦਾ ਰਫ਼ਤਾਰ",
    maxSpeed: "ਵੱਧ ਤੋਂ ਵੱਧ: 60 ਕਿ.ਮੀ./ਘੰਟਾ",
    location: "ਸਥਾਨ ਟਰੈਕਿੰਗ",
    emergency: "ਐਮਰਜੈਂਸੀ ਸੇਵਾਵਾਂ",
    kmh: "ਕਿ.ਮੀ./ਘੰਟਾ",
    tripDuration: "ਯਾਤਰਾ ਦਾ ਸਮਾਂ",
    tripHistory: "ਯਾਤਰਾ ਇਤਿਹਾਸ",
    currentTrip: "ਮੌਜੂਦਾ ਯਾਤਰਾ",
    totalTrips: "ਅੱਜ ਕੁੱਲ ਯਾਤਰਾਵਾਂ",
    avgSpeed: "ਔਸਤ ਰਫ਼ਤਾਰ",
    maxSpeedReached: "ਵੱਧ ਰਫ਼ਤਾਰ",
    minutes: "ਮਿੰਟ",
    hours: "ਘੰਟੇ",
    noTrips: "ਅੱਜ ਕੋਈ ਯਾਤਰਾ ਨਹੀਂ",
    tripStarted: "ਯਾਤਰਾ ਸ਼ੁਰੂ ਹੋਈ",
    tripCompleted: "ਯਾਤਰਾ ਪੂਰੀ ਹੋਈ",
    gpsStatus: "GPS ਸਥਿਤੀ",
    gpsActive: "GPS ਚਾਲੂ",
    gpsInactive: "GPS ਬੰਦ",
    accuracy: "ਸ਼ੁੱਧਤਾ",
    meters: "ਮੀਟਰ",
    coordinates: "ਨਿਰਦੇਸ਼ਾਂਕ",
    networkStatus: "ਨੈੱਟਵਰਕ",
    online: "ਔਨਲਾਈਨ",
    offline: "ਔਫਲਾਈਨ",
    routePoints: "ਰੂਟ ਪੁਆਇੰਟ",
    distance: "ਦੂਰੀ",
    kilometers: "ਕਿ.ਮੀ.",
    locationPermission: "ਸਥਾਨ ਦੀ ਇਜਾਜ਼ਤ ਚਾਹੀਦੀ",
    enableLocation: "ਸਥਾਨ ਚਾਲੂ ਕਰੋ",
    lowAccuracy: "GPS ਸਿਗਨਲ ਕਮਜ਼ੋਰ",
    goodAccuracy: "GPS ਸਿਗਨਲ ਚੰਗਾ",
    emergencyType: "ਐਮਰਜੈਂਸੀ ਕਿਸਮ",
    breakdown: "ਬੱਸ ਖਰਾਬ",
    accident: "ਦੁਰਘਟਨਾ",
    medical: "ਮੈਡੀਕਲ ਐਮਰਜੈਂਸੀ",
    security: "ਸੁਰੱਖਿਆ ਮਸਲਾ",
    general: "ਆਮ ਐਮਰਜੈਂਸੀ",
    selectEmergency: "ਐਮਰਜੈਂਸੀ ਕਿਸਮ ਚੁਣੋ",
    sendAlert: "ਅਲਰਟ ਭੇਜੋ",
    cancelAlert: "ਅਲਰਟ ਰੱਦ ਕਰੋ",
    resolveAlert: "ਹੱਲ ਹੋਇਆ",
    activeAlerts: "ਸਰਗਰਮ ਅਲਰਟ",
    alertHistory: "ਅਲਰਟ ਇਤਿਹਾਸ",
    noActiveAlerts: "ਕੋਈ ਸਰਗਰਮ ਅਲਰਟ ਨਹੀਂ",
    alertSent: "ਐਮਰਜੈਂਸੀ ਅਲਰਟ ਸਫਲਤਾਪੂਰਵਕ ਭੇਜਿਆ",
    alertCancelled: "ਅਲਰਟ ਰੱਦ ਕੀਤਾ",
    alertResolved: "ਅਲਰਟ ਹੱਲ ਹੋਇਆ",
    autoDetected: "ਆਟੋ-ਖੋਜਿਆ",
    manualAlert: "ਮੈਨੁਅਲ ਅਲਰਟ",
    emergencyContacts: "ਐਮਰਜੈਂਸੀ ਸੰਪਰਕ",
    suddenStop: "ਅਚਾਨਕ ਰੁਕਣਾ - ਸੰਭਾਵਿਤ ਐਮਰਜੈਂਸੀ",
    hardBraking: "ਸਖ਼ਤ ਬ੍ਰੇਕਿੰਗ ਖੋਜੀ",
    emergencyServices: "ਐਮਰਜੈਂਸੀ ਸੇਵਾਵਾਂ: 108",
    police: "ਪੁਲਿਸ: 100",
    fire: "ਫਾਇਰ: 101",
    ambulance: "ਐਂਬੂਲੈਂਸ: 108",
    batteryOptimized: "ਬੈਟਰੀ ਅਨੁਕੂਲਿਤ",
    powerSaving: "ਪਾਵਰ ਸੇਵਿੰਗ ਮੋਡ",
    batteryLevel: "ਬੈਟਰੀ",
    charging: "ਚਾਰਜਿੰਗ",
    performance: "ਪ੍ਰਦਰਸ਼ਨ",
  },
  hi: {
    appTitle: "रास्ते कैप्टन",
    startTrip: "यात्रा शुरू करें",
    stopTrip: "यात्रा बंद करें",
    sos: "SOS आपातकाल",
    viewRoute: "रूट देखें",
    language: "भाषा",
    speed: "गति",
    status: "स्थिति",
    tripActive: "यात्रा सक्रिय",
    tripInactive: "यात्रा निष्क्रिय",
    currentSpeed: "वर्तमान गति",
    maxSpeed: "अधिकतम: 60 किमी/घंटा",
    location: "स्थान ट्रैकिंग",
    emergency: "आपातकालीन सेवाएं",
    kmh: "किमी/घंटा",
    tripDuration: "यात्रा अवधि",
    tripHistory: "यात्रा इतिहास",
    currentTrip: "वर्तमान यात्रा",
    totalTrips: "आज कुल यात्राएं",
    avgSpeed: "औसत गति",
    maxSpeedReached: "अधिकतम गति",
    minutes: "मिनट",
    hours: "घंटे",
    noTrips: "आज कोई यात्रा नहीं",
    tripStarted: "यात्रा शुरू हुई",
    tripCompleted: "यात्रा पूर्ण हुई",
    gpsStatus: "GPS स्थिति",
    gpsActive: "GPS सक्रिय",
    gpsInactive: "GPS निष्क्रिय",
    accuracy: "सटीकता",
    meters: "मीटर",
    coordinates: "निर्देशांक",
    networkStatus: "नेटवर्क",
    online: "ऑनलाइन",
    offline: "ऑफलाइन",
    routePoints: "रूट पॉइंट्स",
    distance: "दूरी",
    kilometers: "किमी",
    locationPermission: "स्थान अनुमति आवश्यक",
    enableLocation: "स्थान सक्षम करें",
    lowAccuracy: "GPS सिग्नल कमजोर",
    goodAccuracy: "GPS सिग्नल अच्छा",
    emergencyType: "आपातकाल प्रकार",
    breakdown: "बस खराबी",
    accident: "दुर्घटना",
    medical: "मेडिकल इमरजेंसी",
    security: "सुरक्षा समस्या",
    general: "सामान्य आपातकाल",
    selectEmergency: "आपातकाल प्रकार चुनें",
    sendAlert: "अलर्ट भेजें",
    cancelAlert: "अलर्ट रद्द करें",
    resolveAlert: "हल हुआ",
    activeAlerts: "सक्रिय अलर्ट",
    alertHistory: "अलर्ट इतिहास",
    noActiveAlerts: "कोई सक्रिय अलर्ट नहीं",
    alertSent: "आपातकालीन अलर्ट सफलतापूर्वक भेजा गया",
    alertCancelled: "अलर्ट रद्द किया गया",
    alertResolved: "अलर्ट हल हुआ",
    autoDetected: "ऑटो-डिटेक्टेड",
    manualAlert: "मैनुअल अलर्ट",
    emergencyContacts: "आपातकालीन संपर्क",
    suddenStop: "अचानक रुकना - संभावित आपातकाल",
    hardBraking: "तेज़ ब्रेकिंग का पता चला",
    emergencyServices: "आपातकालीन सेवाएं: 108",
    police: "पुलिस: 100",
    fire: "Fire: 101",
    ambulance: "एम्बुलेंस: 108",
    batteryOptimized: "बैटरी अनुकूलित",
    powerSaving: "पावर सेविंग मोड",
    batteryLevel: "बैटरी",
    charging: "चार्जिंग",
    performance: "प्रदर्शन",
  },
}

export default function RAASTECaptainApp() {
  const [language, setLanguage] = useState<"en" | "pa" | "hi">("en")
  const [tripActive, setTripActive] = useState(false)
  const [currentSpeed, setCurrentSpeed] = useState(0)
  const [isTracking, setIsTracking] = useState(false)

  const [currentTrip, setCurrentTrip] = useState<TripData | null>(null)
  const [tripHistory, setTripHistory] = useState<TripData[]>([])
  const [tripDuration, setTripDuration] = useState(0)
  const [maxSpeedInTrip, setMaxSpeedInTrip] = useState(0)
  const [speedHistory, setSpeedHistory] = useState<number[]>([])

  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null)
  const [gpsActive, setGpsActive] = useState(false)
  const [locationPermission, setLocationPermission] = useState<"granted" | "denied" | "prompt">("prompt")
  const [routePoints, setRoutePoints] = useState<LocationData[]>([])
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [watchId, setWatchId] = useState<number | null>(null)
  const [totalDistance, setTotalDistance] = useState(0)

  const [activeAlerts, setActiveAlerts] = useState<EmergencyAlert[]>([])
  const [alertHistory, setAlertHistory] = useState<EmergencyAlert[]>([])
  const [showEmergencyMenu, setShowEmergencyMenu] = useState(false)
  const [selectedEmergencyType, setSelectedEmergencyType] = useState<EmergencyAlert["type"] | null>(null)
  const [lastSpeedCheck, setLastSpeedCheck] = useState<number>(0)
  const [suddenStopDetected, setSuddenStopDetected] = useState(false)

  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    lastOptimization: Date.now(),
  })
  const [powerSavingMode, setPowerSavingMode] = useState(false)
  const intervalRefs = useRef<{ [key: string]: NodeJS.Timeout }>({})
  const lastLocationUpdate = useRef<number>(0)
  const locationBuffer = useRef<LocationData[]>([])

  const t = translations[language]

  const monitorBatteryAndPerformance = useCallback(async () => {
    try {
      // Battery API monitoring
      if ("getBattery" in navigator) {
        const battery = await (navigator as any).getBattery()
        const batteryLevel = Math.round(battery.level * 100)
        const isCharging = battery.charging

        setPerformanceMetrics((prev) => ({
          ...prev,
          batteryLevel,
          isCharging,
          lastOptimization: Date.now(),
        }))

        // Enable power saving mode if battery is low and not charging
        if (batteryLevel < 20 && !isCharging && !powerSavingMode) {
          setPowerSavingMode(true)
        } else if ((batteryLevel > 30 || isCharging) && powerSavingMode) {
          setPowerSavingMode(false)
        }
      }

      // Memory usage monitoring (if available)
      if ("memory" in performance) {
        const memoryInfo = (performance as any).memory
        setPerformanceMetrics((prev) => ({
          ...prev,
          memoryUsage: memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit,
        }))
      }

      // Network type detection
      if ("connection" in navigator) {
        const connection = (navigator as any).connection
        setPerformanceMetrics((prev) => ({
          ...prev,
          networkType: connection.effectiveType,
        }))
      }
    } catch (error) {
      console.log("Performance monitoring not fully supported")
    }
  }, [powerSavingMode])

  const optimizedLocationTracking = useCallback(() => {
    if ("geolocation" in navigator && locationPermission === "granted") {
      // Adjust GPS settings based on power saving mode
      const options = {
        enableHighAccuracy: !powerSavingMode,
        timeout: powerSavingMode ? 15000 : 10000,
        maximumAge: powerSavingMode ? 10000 : 5000, // Cache longer in power saving mode
      }

      const id = navigator.geolocation.watchPosition(
        (position) => {
          const now = Date.now()
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: now,
            speed: position.coords.speed || undefined,
          }

          // Throttle location updates in power saving mode
          if (powerSavingMode && now - lastLocationUpdate.current < 10000) {
            locationBuffer.current.push(locationData)
            return
          }

          lastLocationUpdate.current = now
          setCurrentLocation(locationData)
          setGpsActive(true)

          if (tripActive) {
            setRoutePoints((prev) => {
              // Limit route points to prevent memory issues
              const maxPoints = powerSavingMode ? 500 : 1000
              let newPoints = [...prev, locationData]

              if (newPoints.length > maxPoints) {
                newPoints = newPoints.slice(-maxPoints)
              }

              if (prev.length > 0) {
                const lastPoint = prev[prev.length - 1]
                const distance = calculateDistance(
                  lastPoint.latitude,
                  lastPoint.longitude,
                  locationData.latitude,
                  locationData.longitude,
                )
                setTotalDistance((prevDistance) => prevDistance + distance)
              }

              return newPoints
            })
          }
        },
        (error) => {
          console.error("GPS Error:", error)
          setGpsActive(false)
        },
        options,
      )

      setWatchId(id)
    }
  }, [locationPermission, powerSavingMode, tripActive])

  const debouncedSaveToStorage = useCallback(
    debounce((key: string, data: any) => {
      try {
        localStorage.setItem(key, JSON.stringify(data))
      } catch (error) {
        console.error("Storage quota exceeded, clearing old data")
        // Clear old trip history if storage is full
        if (key === "raaste-trip-history") {
          const recentTrips = data.slice(-10) // Keep only last 10 trips
          localStorage.setItem(key, JSON.stringify(recentTrips))
        }
      }
    }, 1000),
    [],
  )

  const optimizedSpeedMonitoring = useCallback(() => {
    if (tripActive) {
      const updateInterval = powerSavingMode ? 5000 : 2000 // Less frequent updates in power saving

      const interval = setInterval(() => {
        const newSpeed = currentLocation?.speed
          ? Math.floor(currentLocation.speed * 3.6)
          : Math.floor(Math.random() * 80)

        setCurrentSpeed(newSpeed)
        setSpeedHistory((prev) => {
          const maxHistory = powerSavingMode ? 15 : 30 // Smaller history in power saving
          return [...prev.slice(-maxHistory + 1), newSpeed]
        })
        setMaxSpeedInTrip((prev) => Math.max(prev, newSpeed))
      }, updateInterval)

      intervalRefs.current.speedMonitoring = interval
      return () => clearInterval(interval)
    } else {
      setCurrentSpeed(0)
    }
  }, [tripActive, currentLocation, powerSavingMode])

  const cleanupResources = useCallback(() => {
    // Clear all intervals
    Object.values(intervalRefs.current).forEach(clearInterval)
    intervalRefs.current = {}

    // Clear location buffer
    locationBuffer.current = []

    // Stop location tracking
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
      setWatchId(null)
      setGpsActive(false)
    }
  }, [watchId])

  useEffect(() => {
    monitorBatteryAndPerformance()
    const performanceInterval = setInterval(monitorBatteryAndPerformance, 30000) // Check every 30 seconds
    intervalRefs.current.performance = performanceInterval

    return () => clearInterval(performanceInterval)
  }, [monitorBatteryAndPerformance])

  useEffect(() => {
    const cleanup = optimizedSpeedMonitoring()
    return cleanup
  }, [optimizedSpeedMonitoring])

  useEffect(() => {
    if (tripActive && locationPermission === "granted") {
      optimizedLocationTracking()
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [tripActive, locationPermission, optimizedLocationTracking, watchId])

  useEffect(() => {
    return cleanupResources
  }, [cleanupResources])

  useEffect(() => {
    const savedActiveAlerts = localStorage.getItem("raaste-active-alerts")
    const savedAlertHistory = localStorage.getItem("raaste-alert-history")

    if (savedActiveAlerts) {
      const alerts = JSON.parse(savedActiveAlerts).map((alert: any) => ({
        ...alert,
        timestamp: new Date(alert.timestamp),
      }))
      setActiveAlerts(alerts)
    }

    if (savedAlertHistory) {
      const history = JSON.parse(savedAlertHistory).map((alert: any) => ({
        ...alert,
        timestamp: new Date(alert.timestamp),
      }))
      setAlertHistory(history)
    }
  }, [])

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }, [])

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  useEffect(() => {
    const requestLocationPermission = async () => {
      if ("geolocation" in navigator) {
        try {
          const permission = await navigator.permissions.query({ name: "geolocation" })
          setLocationPermission(permission.state)

          permission.addEventListener("change", () => {
            setLocationPermission(permission.state)
          })
        } catch (error) {
          console.log("Permission API not supported")
        }
      }
    }

    requestLocationPermission()
  }, [])

  useEffect(() => {
    if (tripActive && speedHistory.length >= 3) {
      const recentSpeeds = speedHistory.slice(-3)
      const speedDrop = recentSpeeds[0] - recentSpeeds[2]

      if (speedDrop > 30 && recentSpeeds[2] < 5 && !suddenStopDetected) {
        setSuddenStopDetected(true)
        createAutoEmergencyAlert("accident", t.suddenStop)

        setTimeout(() => setSuddenStopDetected(false), 30000)
      }
    }
  }, [speedHistory, tripActive, suddenStopDetected, t.suddenStop])

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const requestLocationAccess = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationPermission("granted")
        },
        (error) => {
          setLocationPermission("denied")
          console.error("Location access denied:", error)
        },
      )
    }
  }

  useEffect(() => {
    const savedTrips = localStorage.getItem("raaste-trip-history")
    const savedCurrentTrip = localStorage.getItem("raaste-current-trip")

    if (savedTrips) {
      const trips = JSON.parse(savedTrips).map((trip: any) => ({
        ...trip,
        startTime: new Date(trip.startTime),
        endTime: trip.endTime ? new Date(trip.endTime) : undefined,
      }))
      setTripHistory(trips)
    }

    if (savedCurrentTrip) {
      const trip = JSON.parse(savedCurrentTrip)
      const tripData = {
        ...trip,
        startTime: new Date(trip.startTime),
        endTime: trip.endTime ? new Date(trip.endTime) : undefined,
      }
      setCurrentTrip(tripData)
      setTripActive(trip.status === "active")
      setIsTracking(trip.status === "active")
    }
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (tripActive && currentTrip) {
      const updateInterval = powerSavingMode ? 5000 : 1000 // Less frequent in power saving
      interval = setInterval(() => {
        const duration = Math.floor((Date.now() - currentTrip.startTime.getTime()) / 1000)
        setTripDuration(duration)
      }, updateInterval)
      intervalRefs.current.tripDuration = interval
    }
    return () => {
      if (intervalRefs.current.tripDuration) {
        clearInterval(intervalRefs.current.tripDuration)
      }
    }
  }, [tripActive, currentTrip, powerSavingMode])

  const handleStartTrip = () => {
    const newTrip: TripData = {
      id: `trip-${Date.now()}`,
      startTime: new Date(),
      maxSpeed: 0,
      averageSpeed: 0,
      status: "active",
      startLocation: currentLocation || undefined,
      route: [],
      emergencyAlerts: [],
    }

    setCurrentTrip(newTrip)
    setTripActive(true)
    setIsTracking(true)
    setTripDuration(0)
    setMaxSpeedInTrip(0)
    setSpeedHistory([])
    setRoutePoints([])
    setTotalDistance(0)

    debouncedSaveToStorage("raaste-current-trip", newTrip)
  }

  const handleStopTrip = () => {
    if (currentTrip) {
      const endTime = new Date()
      const duration = Math.floor((endTime.getTime() - currentTrip.startTime.getTime()) / 1000)
      const averageSpeed =
        speedHistory.length > 0 ? Math.floor(speedHistory.reduce((a, b) => a + b, 0) / speedHistory.length) : 0

      const completedTrip: TripData = {
        ...currentTrip,
        endTime,
        duration,
        maxSpeed: maxSpeedInTrip,
        averageSpeed,
        status: "completed",
        endLocation: currentLocation || undefined,
        route: routePoints,
        totalDistance,
        emergencyAlerts: [...activeAlerts, ...alertHistory],
      }

      const updatedHistory = [...tripHistory, completedTrip]
      setTripHistory(updatedHistory)

      debouncedSaveToStorage("raaste-trip-history", updatedHistory)
      localStorage.removeItem("raaste-current-trip")
    }

    cleanupResources()

    setTripActive(false)
    setIsTracking(false)
    setCurrentTrip(null)
    setTripDuration(0)
    setMaxSpeedInTrip(0)
    setSpeedHistory([])
    setRoutePoints([])
    setTotalDistance(0)
  }

  const handleSOS = () => {
    setShowEmergencyMenu(true)
  }

  const cycleLanguage = () => {
    const languages: ("en" | "pa" | "hi")[] = ["en", "pa", "hi"]
    const currentIndex = languages.indexOf(language)
    const nextIndex = (currentIndex + 1) % languages.length
    setLanguage(languages[nextIndex])
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (hours > 0) {
      return `${hours}${t.hours} ${minutes}${t.minutes}`
    }
    return `${minutes}${t.minutes}`
  }

  const todaysTrips = useMemo(() => {
    return tripHistory.filter((trip) => {
      const today = new Date()
      const tripDate = trip.startTime
      return tripDate.toDateString() === today.toDateString()
    })
  }, [tripHistory])

  const createAutoEmergencyAlert = (type: EmergencyAlert["type"], description: string) => {
    const alert: EmergencyAlert = {
      id: `alert-${Date.now()}`,
      type,
      timestamp: new Date(),
      location: currentLocation || undefined,
      description,
      status: "active",
      autoDetected: true,
    }

    setActiveAlerts((prev) => [...prev, alert])
    debouncedSaveToStorage("raaste-active-alerts", [...activeAlerts, alert])

    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("RAASTE Captain - Emergency Detected", {
        body: description,
        icon: "/favicon.ico",
      })
    }
  }

  const createManualEmergencyAlert = (type: EmergencyAlert["type"]) => {
    const alert: EmergencyAlert = {
      id: `alert-${Date.now()}`,
      type,
      timestamp: new Date(),
      location: currentLocation || undefined,
      status: "active",
      autoDetected: false,
    }

    setActiveAlerts((prev) => [...prev, alert])
    debouncedSaveToStorage("raaste-active-alerts", [...activeAlerts, alert])

    setShowEmergencyMenu(false)
    setSelectedEmergencyType(null)

    alert(
      `${t.alertSent}\nType: ${getEmergencyTypeLabel(type)}\nLocation: ${currentLocation ? `${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}` : "Unavailable"}`,
    )
  }

  const resolveAlert = (alertId: string) => {
    setActiveAlerts((prev) => {
      const updated = prev.filter((alert) => alert.id !== alertId)
      debouncedSaveToStorage("raaste-active-alerts", updated)
      return updated
    })

    const resolvedAlert = activeAlerts.find((alert) => alert.id === alertId)
    if (resolvedAlert) {
      const updatedAlert = { ...resolvedAlert, status: "resolved" as const }
      setAlertHistory((prev) => {
        const updated = [...prev, updatedAlert]
        debouncedSaveToStorage("raaste-alert-history", updated)
        return updated
      })
    }
  }

  const cancelAlert = (alertId: string) => {
    setActiveAlerts((prev) => {
      const updated = prev.filter((alert) => alert.id !== alertId)
      debouncedSaveToStorage("raaste-active-alerts", updated)
      return updated
    })

    const cancelledAlert = activeAlerts.find((alert) => alert.id === alertId)
    if (cancelledAlert) {
      const updatedAlert = { ...cancelledAlert, status: "cancelled" as const }
      setAlertHistory((prev) => {
        const updated = [...prev, updatedAlert]
        debouncedSaveToStorage("raaste-alert-history", updated)
        return updated
      })
    }
  }

  const getEmergencyTypeLabel = (type: EmergencyAlert["type"]) => {
    switch (type) {
      case "breakdown":
        return t.breakdown
      case "accident":
        return t.accident
      case "medical":
        return t.medical
      case "security":
        return t.security
      case "general":
        return t.general
      default:
        return t.general
    }
  }

  const getEmergencyIcon = (type: EmergencyAlert["type"]) => {
    switch (type) {
      case "breakdown":
        return <Wrench className="h-4 w-4" />
      case "accident":
        return <Car className="h-4 w-4" />
      case "medical":
        return <Heart className="h-4 w-4" />
      case "security":
        return <Shield className="h-4 w-4" />
      case "general":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">{t.appTitle}</h1>
        <Button variant="outline" size="sm" onClick={cycleLanguage} className="flex items-center gap-2 bg-transparent">
          <Languages className="h-4 w-4" />
          {language.toUpperCase()}
        </Button>
      </div>

      {(performanceMetrics.batteryLevel !== undefined || powerSavingMode) && (
        <Card className="p-3 mb-4 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {performanceMetrics.batteryLevel !== undefined && (
                <div className="flex items-center gap-2">
                  <Battery
                    className={`h-4 w-4 ${performanceMetrics.batteryLevel < 20 ? "text-destructive" : "text-primary"}`}
                  />
                  <span className="text-sm font-medium">{performanceMetrics.batteryLevel}%</span>
                  {performanceMetrics.isCharging && <Zap className="h-3 w-3 text-primary" />}
                </div>
              )}

              {powerSavingMode && (
                <Badge variant="secondary" className="text-xs">
                  {t.powerSaving}
                </Badge>
              )}
            </div>

            <div className="text-xs text-muted-foreground">{t.batteryOptimized}</div>
          </div>
        </Card>
      )}

      {activeAlerts.length > 0 && (
        <Card className="p-4 mb-4 border-destructive bg-destructive/5">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="h-4 w-4 text-destructive" />
            <span className="font-medium text-destructive">
              {t.activeAlerts} ({activeAlerts.length})
            </span>
          </div>
          <div className="space-y-2">
            {activeAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 bg-background rounded-lg border">
                <div className="flex items-center gap-3">
                  {getEmergencyIcon(alert.type)}
                  <div>
                    <div className="font-medium text-sm">{getEmergencyTypeLabel(alert.type)}</div>
                    <div className="text-xs text-muted-foreground">
                      {alert.timestamp.toLocaleTimeString()} • {alert.autoDetected ? t.autoDetected : t.manualAlert}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => resolveAlert(alert.id)}>
                    <CheckCircle className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => cancelAlert(alert.id)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {showEmergencyMenu && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">{t.selectEmergency}</h3>
              <Button variant="outline" size="sm" onClick={() => setShowEmergencyMenu(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3 mb-6">
              {(["breakdown", "accident", "medical", "security", "general"] as const).map((type) => (
                <Button
                  key={type}
                  variant={selectedEmergencyType === type ? "default" : "outline"}
                  className="w-full justify-start h-12"
                  onClick={() => setSelectedEmergencyType(type)}
                >
                  {getEmergencyIcon(type)}
                  <span className="ml-3">{getEmergencyTypeLabel(type)}</span>
                </Button>
              ))}
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => selectedEmergencyType && createManualEmergencyAlert(selectedEmergencyType)}
                disabled={!selectedEmergencyType}
                className="w-full"
                variant="destructive"
              >
                {t.sendAlert}
              </Button>

              <div className="text-xs text-muted-foreground text-center space-y-1">
                <div>{t.emergencyServices}</div>
                <div>
                  {t.police} • {t.fire} • {t.ambulance}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      <Card className="p-4 mb-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Satellite className={`h-4 w-4 ${gpsActive ? "text-primary" : "text-muted-foreground"}`} />
            <div>
              <div className="text-sm font-medium">{t.gpsStatus}</div>
              <div className="text-xs text-muted-foreground">{gpsActive ? t.gpsActive : t.gpsInactive}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-primary" />
            ) : (
              <WifiOff className="h-4 w-4 text-muted-foreground" />
            )}
            <div>
              <div className="text-sm font-medium">{t.networkStatus}</div>
              <div className="text-xs text-muted-foreground">{isOnline ? t.online : t.offline}</div>
            </div>
          </div>
        </div>

        {currentLocation && (
          <div className="mt-3 pt-3 border-t">
            <div className="text-xs text-muted-foreground mb-1">{t.coordinates}</div>
            <div className="text-sm font-mono">
              {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {t.accuracy}: {Math.round(currentLocation.accuracy)}
              {t.meters}
              {currentLocation.accuracy > 50 && <span className="ml-2 text-destructive">({t.lowAccuracy})</span>}
            </div>
          </div>
        )}

        {locationPermission !== "granted" && (
          <Button onClick={requestLocationAccess} variant="outline" size="sm" className="w-full mt-3 bg-transparent">
            <MapPin className="h-4 w-4 mr-2" />
            {t.enableLocation}
          </Button>
        )}
      </Card>

      {/* Status Card */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-semibold text-foreground">{t.status}</span>
          <Badge variant={tripActive ? "default" : "secondary"} className="text-sm px-3 py-1">
            {tripActive ? t.tripActive : t.tripInactive}
          </Badge>
        </div>

        {/* Speed Display */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Gauge className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{t.currentSpeed}:</span>
          </div>
          <span className="text-2xl font-bold text-foreground">
            {currentSpeed} <span className="text-sm text-muted-foreground">{t.kmh}</span>
          </span>
        </div>

        {tripActive && (
          <>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{t.tripDuration}:</span>
              </div>
              <span className="text-lg font-semibold text-foreground">{formatDuration(tripDuration)}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <span className="text-sm text-muted-foreground">{t.distance}:</span>
                <div className="font-semibold">
                  {totalDistance.toFixed(1)} {t.kilometers}
                </div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">{t.routePoints}:</span>
                <div className="font-semibold">{routePoints.length}</div>
              </div>
            </div>
          </>
        )}

        <div className="text-sm text-muted-foreground">{t.maxSpeed}</div>

        {currentSpeed > 60 && (
          <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="text-sm text-destructive font-medium">Speed Limit Exceeded!</span>
          </div>
        )}
      </Card>

      {/* Main Action Buttons */}
      <div className="space-y-4 mb-6">
        {!tripActive ? (
          <Button
            onClick={handleStartTrip}
            size="lg"
            className="w-full h-16 text-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Play className="h-6 w-6 mr-3" />
            {t.startTrip}
          </Button>
        ) : (
          <Button onClick={handleStopTrip} size="lg" variant="secondary" className="w-full h-16 text-xl font-bold">
            <Square className="h-6 w-6 mr-3" />
            {t.stopTrip}
          </Button>
        )}

        {/* SOS Button */}
        <Button onClick={handleSOS} size="lg" variant="destructive" className="w-full h-16 text-xl font-bold">
          <Phone className="h-6 w-6 mr-3" />
          {t.sos}
        </Button>
      </div>

      {/* Secondary Actions */}
      <div className="grid grid-cols-1 gap-4">
        <Button variant="outline" size="lg" className="h-14 text-lg font-semibold bg-transparent">
          <Map className="h-5 w-5 mr-3" />
          {t.viewRoute}
        </Button>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <Navigation className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium text-foreground">{t.location}</span>
          </div>
          <Badge variant={isTracking ? "default" : "secondary"}>{isTracking ? "Active" : "Inactive"}</Badge>
        </div>
      </div>
    </div>
  )
}

function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
