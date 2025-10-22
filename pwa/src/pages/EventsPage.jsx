import React, { useState, useEffect } from 'react'
import { fetchEvents } from '../services/eventService'
import EventCard from '../components/EventCard'
import EventCalendar from '../components/EventCalendar'

function EventsPage() {
  const [events, setEvents] = useState([])
  const [included, setIncluded] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('upcoming') // 'upcoming', 'past', 'all'
  const [view, setView] = useState('list') // 'list', 'calendar'

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchEvents()

      if (data && data.data) {
        setEvents(data.data)
        setIncluded(data.included || [])
      }
    } catch (err) {
      setError('Hiba történt az események betöltése közben.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Filter events based on selected filter
  const getFilteredEvents = () => {
    const now = new Date()

    return events.filter(event => {
      const eventDate = event.attributes.field_event_date
      if (!eventDate) return filter === 'all'

      const date = new Date(eventDate)

      if (filter === 'upcoming') {
        return date >= now
      } else if (filter === 'past') {
        return date < now
      }
      return true // 'all'
    })
  }

  const filteredEvents = getFilteredEvents()

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 text-lg">{error}</p>
        <button
          onClick={loadEvents}
          className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Újrapróbálás
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Események</h1>
        <p className="text-gray-600">
          Csatlakozz programjainkhoz és versenyeinkhez!
        </p>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2 mb-6 flex-wrap items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setView('list')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              view === 'list'
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            📋 Lista
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              view === 'calendar'
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            📅 Naptár
          </button>
        </div>

        {/* Filters - only for list view */}
        {view === 'list' && (
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'upcoming'
                  ? 'bg-secondary text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Közelgő
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'past'
                  ? 'bg-secondary text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Lezárult
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-secondary text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Összes
            </button>
          </div>
        )}
      </div>

      {/* Calendar View */}
      {view === 'calendar' && (
        <EventCalendar events={events} included={included} />
      )}

      {/* List View */}
      {view === 'list' && (
        <>
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600 text-lg">
                {filter === 'upcoming' && 'Jelenleg nincsenek közelgő események.'}
                {filter === 'past' && 'Még nem volt lezárult esemény.'}
                {filter === 'all' && 'Még nincsenek események.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredEvents.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  included={included}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default EventsPage
