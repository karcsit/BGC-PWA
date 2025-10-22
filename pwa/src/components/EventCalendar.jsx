import React, { useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import './EventCalendar.css'

function EventCalendar({ events, included, onDateSelect }) {
  const [selectedDate, setSelectedDate] = useState(new Date())

  // Get event image URL - handles both media and file entities
  const getEventImageUrl = (event) => {
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

  // Get events for a specific date
  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.attributes.field_event_date)
      return (
        eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getDate() === date.getDate()
      )
    })
  }

  // Check if a date has events
  const hasEvents = (date) => {
    return getEventsForDate(date).length > 0
  }

  // Add custom class to dates with events
  const tileClassName = ({ date, view }) => {
    if (view === 'month' && hasEvents(date)) {
      return 'has-events'
    }
    return null
  }

  // Handle date selection
  const handleDateChange = (date) => {
    setSelectedDate(date)
    const eventsOnDate = getEventsForDate(date)
    if (onDateSelect) {
      onDateSelect(date, eventsOnDate)
    }
  }

  // Show event details in tiles
  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const eventsOnDate = getEventsForDate(date)
      if (eventsOnDate.length > 0) {
        return (
          <div className="tile-events">
            {eventsOnDate.slice(0, 2).map((event, idx) => (
              <div key={event.id} className="tile-event-item">
                <span className="tile-event-time">
                  {new Date(event.attributes.field_event_date).toLocaleTimeString('hu-HU', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                <span className="tile-event-title">
                  {event.attributes.title.length > 15
                    ? event.attributes.title.substring(0, 15) + '...'
                    : event.attributes.title}
                </span>
              </div>
            ))}
            {eventsOnDate.length > 2 && (
              <div className="tile-event-more">
                +{eventsOnDate.length - 2} további
              </div>
            )}
          </div>
        )
      }
    }
    return null
  }

  return (
    <div className="event-calendar-container">
      <Calendar
        onChange={handleDateChange}
        value={selectedDate}
        tileClassName={tileClassName}
        tileContent={tileContent}
        locale="hu-HU"
        minDate={new Date()} // Don't show past dates
        className="custom-calendar"
      />

      {/* Events list for selected date */}
      {selectedDate && (
        <div className="selected-date-events mt-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            {selectedDate.toLocaleDateString('hu-HU', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </h3>
          {getEventsForDate(selectedDate).length > 0 ? (
            <div className="space-y-4">
              {getEventsForDate(selectedDate).map(event => {
                const imageUrl = getEventImageUrl(event)
                return (
                  <div
                    key={event.id}
                    className="bg-white rounded-lg shadow hover:shadow-md transition-shadow border-l-4 border-primary overflow-hidden"
                  >
                    {imageUrl && (
                      <div className="w-full h-48 overflow-hidden bg-gray-200">
                        <img
                          src={imageUrl}
                          alt={event.attributes.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h4 className="font-bold text-gray-800 text-lg mb-2">
                        {event.attributes.title}
                      </h4>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <span>🕐</span>
                          <span>
                            {new Date(event.attributes.field_event_date).toLocaleTimeString('hu-HU', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <span>👥</span>
                          <span>{event.attributes.field_max_participants} fő max</span>
                        </p>
                        {event.attributes.field_event_type && (
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <span>🎯</span>
                            <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                              {event.attributes.field_event_type}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-500 italic">Nincs esemény ezen a napon.</p>
          )}
        </div>
      )}
    </div>
  )
}

export default EventCalendar
