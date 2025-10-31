import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { registerForEvent, unregisterFromEvent, getEventStatus, deleteEvent, getEventParticipants } from '../services/eventService'
import { canManageEvents } from '../utils/permissions'

function EventCard({ event, included }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showParticipants, setShowParticipants] = useState(false)
  const [participants, setParticipants] = useState(null)

  const eventId = event.id // Use UUID directly

  // Get event data
  const title = event.attributes.title
  const body = event.attributes.body?.processed || event.attributes.body?.value || ''
  const eventDate = event.attributes.field_event_date
  const location = event.attributes.field_location || 'Board Game Cafe'
  const maxParticipants = event.attributes.field_max_participants || 0
  const eventType = event.attributes.field_event_type

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get event type label
  const getEventTypeLabel = (type) => {
    const types = {
      'verseny': 'Verseny',
      'workshop': 'Workshop',
      'tarsasjatek_este': 'Társasjáték este',
      'bemutato': 'Bemutató',
      'turne': 'Turné',
      'egyeb': 'Egyéb'
    }
    return types[type] || type
  }

  // Get event image - handles both media and file entities
  const getImageUrl = () => {
    if (!event.relationships?.field_event_image?.data) {
      return null
    }

    const imageId = event.relationships.field_event_image.data.id

    // Try to find as file--file (Image field)
    const fileEntity = included?.find(item => item.id === imageId && item.type === 'file--file')
    if (fileEntity?.attributes?.uri?.url) {
      // Use relative path for Vite proxy in development, full URL in production
      const imageUrl = fileEntity.attributes.uri.url
      return import.meta.env.DEV ? imageUrl : `https://jatsszokosan.hu${imageUrl}`
    }

    // Fallback: try to find as media entity (Media field)
    const mediaEntity = included?.find(item => item.id === imageId && item.type === 'media--image')
    if (mediaEntity) {
      // Get the actual file from media entity's field_media_image
      const fileId = mediaEntity.relationships?.field_media_image?.data?.id
      if (fileId) {
        const fileEntity = included?.find(item => item.id === fileId && item.type === 'file--file')
        if (fileEntity?.attributes?.uri?.url) {
          // Use relative path for Vite proxy in development, full URL in production
          const imageUrl = fileEntity.attributes.uri.url
          return import.meta.env.DEV ? imageUrl : `https://jatsszokosan.hu${imageUrl}`
        }
      }
    }

    return null
  }

  const imageUrl = getImageUrl()

  // Load event status if user is logged in
  useEffect(() => {
    if (user && eventId) {
      loadStatus()
    }
  }, [user, eventId])

  const loadStatus = async () => {
    try {
      const statusData = await getEventStatus(eventId)
      setStatus(statusData)
    } catch (error) {
      console.error('Error loading status:', error)
    }
  }

  const handleRegister = async () => {
    if (!user) {
      setMessage('Jelentkezéshez be kell jelentkezned!')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const result = await registerForEvent(eventId)
      setMessage(result.message)
      await loadStatus() // Reload status
    } catch (error) {
      setMessage('Hiba történt a jelentkezés során.')
    } finally {
      setLoading(false)
    }
  }

  const handleUnregister = async () => {
    setLoading(true)
    setMessage('')

    try {
      const result = await unregisterFromEvent(eventId)
      setMessage(result.message)
      await loadStatus() // Reload status
    } catch (error) {
      console.error('Unregister error:', error)
      setMessage('Hiba történt a lejelentkezés során.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Biztosan törölni szeretnéd ezt az eseményt?\n\n"${title}"`)) return

    try {
      setLoading(true)
      await deleteEvent(eventId)
      alert('Esemény törölve!')
      window.location.reload()
    } catch (error) {
      alert('Hiba történt a törlés során: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const loadParticipants = async () => {
    if (participants) {
      setShowParticipants(!showParticipants)
      return
    }

    try {
      setLoading(true)
      const data = await getEventParticipants(eventId)
      setParticipants(data)
      setShowParticipants(true)
    } catch (error) {
      alert('Nem sikerült betölteni a résztvevőket: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Determine if event is in the past
  const isPastEvent = eventDate && new Date(eventDate) < new Date()

  // Debug logging
  console.log('🔍 EventCard Debug:', {
    title,
    eventDate,
    eventDateParsed: eventDate ? new Date(eventDate).toISOString() : 'N/A',
    now: new Date().toISOString(),
    isPastEvent,
    hasUser: !!user,
    userName: user?.name,
    userObject: user,
    status,
    shouldShowButton: !isPastEvent && !!user
  })

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Event Image */}
      {imageUrl && (
        <div className="h-64 overflow-hidden bg-gray-200">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      <div className="p-6">
        {/* Event Type Badge */}
        {eventType && (
          <span className="inline-block px-3 py-1 bg-primary text-white text-sm font-semibold rounded-full mb-2">
            {getEventTypeLabel(eventType)}
          </span>
        )}

        {/* Title */}
        <h3 className="text-2xl font-bold text-gray-800 mb-2">{title}</h3>

        {/* Date and Location */}
        <div className="text-gray-600 mb-4">
          <p className="flex items-center gap-2 mb-1">
            <span>📅</span>
            <span>{formatDate(eventDate)}</span>
          </p>
          <p className="flex items-center gap-2">
            <span>📍</span>
            <span>{location}</span>
          </p>
        </div>

        {/* Description */}
        {body && (
          <div
            className="text-gray-700 mb-4 line-clamp-3"
            dangerouslySetInnerHTML={{ __html: body }}
          />
        )}

        {/* Status Info */}
        {status && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Résztvevők:</span>
              <span className="font-semibold text-gray-800">
                {status.participant_count} / {status.max_participants}
              </span>
            </div>
            {status.waitlist_count > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Várólistán:</span>
                <span className="font-semibold text-secondary">
                  {status.waitlist_count} fő
                </span>
              </div>
            )}
            {status.is_registered && (
              <div className="mt-2 p-2 bg-primary/10 text-primary rounded text-sm font-semibold">
                ✓ Regisztráltál erre az eseményre
              </div>
            )}
            {status.is_waitlisted && (
              <div className="mt-2 p-2 bg-secondary/10 text-secondary rounded text-sm font-semibold">
                ⏳ Várólistán vagy ({status.waitlist_position}. helyen)
              </div>
            )}
          </div>
        )}

        {/* Message */}
        {message && (
          <div className="mb-4 p-3 bg-blue-50 text-blue-800 rounded text-sm">
            {message}
          </div>
        )}

        {/* Editor Management Buttons */}
        {canManageEvents(user) && (
          <div className="mb-4 pb-4 border-b border-gray-200">
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => navigate(`/events/${eventId}/edit`)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
              >
                ✏️ Szerkesztés
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors text-sm disabled:opacity-50"
              >
                🗑️ Törlés
              </button>
            </div>
            <button
              onClick={loadParticipants}
              disabled={loading}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors text-sm disabled:opacity-50"
            >
              👥 {showParticipants ? 'Résztvevők elrejtése' : 'Résztvevők megtekintése'}
            </button>

            {/* Participants List */}
            {showParticipants && participants && (
              <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-bold text-gray-800 mb-3">Jelentkezők:</h4>

                {/* Registered */}
                {participants.participants?.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-2 font-semibold">Elfogadott ({participants.participants.length}):</p>
                    <ul className="space-y-1">
                      {participants.participants.map((p, i) => (
                        <li key={i} className="text-sm text-gray-700">✓ {p}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Waitlist */}
                {participants.waitlist?.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2 font-semibold">Várólistán ({participants.waitlist.length}):</p>
                    <ul className="space-y-1">
                      {participants.waitlist.map((p, i) => (
                        <li key={i} className="text-sm text-orange-600">⏳ {p}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {participants.participants?.length === 0 && participants.waitlist?.length === 0 && (
                  <p className="text-sm text-gray-500 italic">Még nincs jelentkező</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {!isPastEvent && user && !status?.is_registered && !status?.is_waitlisted && (
          <button
            onClick={handleRegister}
            disabled={loading}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium transition-colors hover:bg-gray-700 disabled:opacity-50"
          >
            {loading ? 'Jelentkezés...' : 'Jelentkezem'}
          </button>
        )}

        {/* Already Registered - Show Unregister Button */}
        {!isPastEvent && user && status?.is_registered && (
          <div className="space-y-2">
            <div className="p-3 bg-green-100 text-green-800 rounded-lg text-sm text-center font-medium">
              ✓ Regisztráltál erre az eseményre
            </div>
            <button
              onClick={handleUnregister}
              disabled={loading}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg font-medium transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Törlés...' : 'Jelentkezés törlése'}
            </button>
          </div>
        )}

        {/* On Waitlist */}
        {!isPastEvent && user && status?.is_waitlisted && (
          <div className="space-y-2">
            <div className="p-3 bg-yellow-100 text-yellow-800 rounded-lg text-sm text-center">
              <p className="font-medium">📋 Várólistán vagy</p>
              <p className="text-xs mt-1">Pozíció: {status.waitlist_position}</p>
            </div>
            <button
              onClick={handleUnregister}
              disabled={loading}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg font-medium transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Törlés...' : 'Várólistáról törlés'}
            </button>
          </div>
        )}

        {!user && !isPastEvent && (
          <div className="p-4 bg-yellow-100 border-2 border-yellow-400 rounded-lg text-center">
            <p className="text-yellow-900 font-bold mb-2">⚠️ Nem vagy bejelentkezve!</p>
            <p className="text-yellow-800 text-sm">Jelentkezéshez először jelentkezz be a Profil menüben.</p>
          </div>
        )}

        {isPastEvent && (
          <div className="p-3 bg-gray-100 text-gray-600 rounded text-sm text-center">
            Ez az esemény már lezárult
          </div>
        )}
      </div>
    </div>
  )
}

export default EventCard
