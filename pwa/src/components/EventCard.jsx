import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { registerForEvent, unregisterFromEvent, getEventStatus } from '../services/eventService'

function EventCard({ event, included }) {
  const { user } = useAuth()
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

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

    const mediaId = event.relationships.field_event_image.data.id
    const mediaEntity = included?.find(item => item.id === mediaId && item.type === 'media--image')

    if (!mediaEntity) {
      return null
    }

    // Get the actual file from media entity's field_media_image
    const fileId = mediaEntity.relationships?.field_media_image?.data?.id
    if (!fileId) {
      return null
    }

    const fileEntity = included?.find(item => item.id === fileId && item.type === 'file--file')

    if (fileEntity?.attributes?.uri?.url) {
      return `https://jatsszokosan.hu${fileEntity.attributes.uri.url}`
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

  // Determine if event is in the past
  const isPastEvent = eventDate && new Date(eventDate) < new Date()

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Event Image */}
      {imageUrl && (
        <div className="h-48 overflow-hidden bg-gray-200">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
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

        {/* Action Buttons */}
        {!isPastEvent && user && status && (
          <div className="flex gap-2">
            {!status.is_registered && !status.is_waitlisted && (
              <button
                onClick={handleRegister}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50"
              >
                {loading ? 'Jelentkezés...' : 'Jelentkezem'}
              </button>
            )}
            {(status.is_registered || status.is_waitlisted) && (
              <button
                onClick={handleUnregister}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-all duration-300 disabled:opacity-50"
              >
                {loading ? 'Lejelentkezés...' : 'Lejelentkezem'}
              </button>
            )}
          </div>
        )}

        {!user && !isPastEvent && (
          <div className="p-3 bg-yellow-50 text-yellow-800 rounded text-sm text-center">
            Jelentkezéshez először jelentkezz be!
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
