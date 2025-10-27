import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { registerForEvent, unregisterFromEvent, getEventStatus } from '../services/eventService'

/**
 * Compact list item for events (for list view)
 */
function EventListItem({ event, included }) {
  const { user } = useAuth()
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const eventId = event.id

  // Get event data
  const title = event.attributes.title
  const eventDate = event.attributes.field_event_date
  const location = event.attributes.field_location || 'Board Game Cafe'
  const maxParticipants = event.attributes.field_max_participants || 0
  const eventType = event.attributes.field_event_type

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('hu-HU', {
      month: 'short',
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
      return `https://jatsszokosan.hu${fileEntity.attributes.uri.url}`
    }

    // Fallback: try to find as media entity (Media field)
    const mediaEntity = included?.find(item => item.id === imageId && item.type === 'media--image')
    if (mediaEntity) {
      const fileId = mediaEntity.relationships?.field_media_image?.data?.id
      if (fileId) {
        const fileEntity = included?.find(item => item.id === fileId && item.type === 'file--file')
        if (fileEntity?.attributes?.uri?.url) {
          return `https://jatsszokosan.hu${fileEntity.attributes.uri.url}`
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
      await loadStatus()
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
      await loadStatus()
    } catch (error) {
      setMessage('Hiba történt a lejelentkezés során.')
    } finally {
      setLoading(false)
    }
  }

  // Determine if event is in the past
  const isPastEvent = eventDate && new Date(eventDate) < new Date()

  // Debug logging
  console.log('EventListItem Debug:', {
    title,
    isPastEvent,
    user: !!user,
    userName: user?.name,
    status,
    showButton: !isPastEvent && user
  })

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-200">
      <div className="flex flex-col sm:flex-row gap-4 p-4">
        {/* Thumbnail */}
        {imageUrl && (
          <div className="w-full sm:w-32 h-32 flex-shrink-0 overflow-hidden rounded-lg bg-gray-200">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-800 truncate">{title}</h3>
              {eventType && (
                <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded mt-1">
                  {getEventTypeLabel(eventType)}
                </span>
              )}
            </div>

            {/* Action Button */}
            {!isPastEvent && user && (
              <button
                onClick={handleRegister}
                disabled={loading}
                className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {loading ? '...' : 'Jelentkezem'}
              </button>
            )}

            {!user && !isPastEvent && (
              <div className="px-3 py-2 bg-yellow-100 border border-yellow-400 rounded text-xs text-yellow-900 whitespace-nowrap">
                Nem vagy bejelentkezve
              </div>
            )}
          </div>

          {/* Date and Location */}
          <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-2">
            <span className="flex items-center gap-1">
              <span>📅</span>
              <span>{formatDate(eventDate)}</span>
            </span>
            <span className="flex items-center gap-1">
              <span>📍</span>
              <span className="truncate">{location}</span>
            </span>
          </div>

          {/* Status Info */}
          {status && (
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="text-gray-600">
                👥 {status.participant_count} / {status.max_participants}
              </span>
              {status.waitlist_count > 0 && (
                <span className="text-secondary font-semibold">
                  ⏳ Várólistán: {status.waitlist_count}
                </span>
              )}
              {status.is_registered && (
                <span className="text-primary font-semibold">
                  ✓ Regisztráltál
                </span>
              )}
              {status.is_waitlisted && (
                <span className="text-secondary font-semibold">
                  ⏳ Várólistán ({status.waitlist_position}.)
                </span>
              )}
            </div>
          )}

          {/* Message */}
          {message && (
            <div className="mt-2 p-2 bg-blue-50 text-blue-800 rounded text-xs">
              {message}
            </div>
          )}

          {isPastEvent && (
            <span className="text-xs text-gray-500 italic">Lezárult esemény</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default EventListItem
