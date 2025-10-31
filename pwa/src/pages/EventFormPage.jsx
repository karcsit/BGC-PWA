import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { canManageEvents } from '../utils/permissions'
import { createEvent, updateEvent, fetchEvents } from '../services/eventService'

const EventFormPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { eventId } = useParams() // If editing, eventId will be present
  const isEditing = !!eventId

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: '',
    location: 'Board Game Cafe',
    maxParticipants: 20,
    eventType: 'tarsasjatek_este'
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  // Check permissions
  if (!user || !canManageEvents(user)) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 text-center">
          <span className="text-6xl block mb-4">🚫</span>
          <h2 className="text-2xl font-bold text-red-900 mb-4">
            Nincs jogosultságod
          </h2>
          <p className="text-red-800 mb-6">
            Csak Editor vagy Administrator jogosultsággal rendelkezők hozhatnak létre eseményeket.
          </p>
          <button
            onClick={() => navigate('/pwa/events')}
            className="px-6 py-3 bg-gradient-to-r from-primary-purple to-primary-indigo text-white font-semibold rounded-xl hover:shadow-xl transition-all"
          >
            Vissza az eseményekhez
          </button>
        </div>
      </div>
    )
  }

  // Load existing event data if editing
  useEffect(() => {
    if (isEditing) {
      loadEventData()
    }
  }, [eventId])

  const loadEventData = async () => {
    try {
      const data = await fetchEvents()
      const event = data.data.find(e => e.id === eventId)

      if (!event) {
        setError('Esemény nem található')
        return
      }

      setFormData({
        title: event.attributes.title,
        description: event.attributes.body?.value || '',
        eventDate: event.attributes.field_event_date,
        location: event.attributes.field_location || 'Board Game Cafe',
        maxParticipants: event.attributes.field_max_participants || 20,
        eventType: event.attributes.field_event_type || 'tarsasjatek_este'
      })
    } catch (err) {
      console.error('Failed to load event:', err)
      setError('Nem sikerült betölteni az eseményt')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      if (isEditing) {
        await updateEvent(eventId, formData)
        setSuccess(true)
        setTimeout(() => navigate('/pwa/events'), 1500)
      } else {
        await createEvent(formData)
        setSuccess(true)
        setTimeout(() => navigate('/pwa/events'), 1500)
      }
    } catch (err) {
      console.error('Failed to save event:', err)
      setError(err.message || 'Nem sikerült menteni az eseményt')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-purple to-primary-indigo bg-clip-text text-transparent mb-4">
          {isEditing ? '📝 Esemény szerkesztése' : '➕ Új esemény létrehozása'}
        </h1>
        <p className="text-gray-600 text-lg">
          {isEditing ? 'Módosítsd az esemény adatait' : 'Hozz létre egy új eseményt a közösség számára'}
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl text-green-800">
          ✅ {isEditing ? 'Esemény sikeresen frissítve!' : 'Esemény sikeresen létrehozva!'}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-800">
          ⚠️ {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-8">
        {/* Title */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Esemény címe *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent"
            placeholder="pl. Társasjáték Este"
          />
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Leírás
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={5}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent"
            placeholder="Írd le az esemény részleteit..."
          />
        </div>

        {/* Event Date */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dátum és idő *
          </label>
          <input
            type="datetime-local"
            name="eventDate"
            value={formData.eventDate}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent"
          />
        </div>

        {/* Location */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Helyszín
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent"
            placeholder="Board Game Cafe"
          />
        </div>

        {/* Max Participants */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maximum résztvevők száma *
          </label>
          <input
            type="number"
            name="maxParticipants"
            value={formData.maxParticipants}
            onChange={handleChange}
            min="1"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent"
          />
        </div>

        {/* Event Type */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Esemény típusa *
          </label>
          <select
            name="eventType"
            value={formData.eventType}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent"
          >
            <option value="tarsasjatek_este">Társasjáték este</option>
            <option value="verseny">Verseny</option>
            <option value="workshop">Workshop</option>
            <option value="bemutato">Bemutató</option>
            <option value="turne">Turné</option>
            <option value="egyeb">Egyéb</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-purple to-primary-indigo text-white font-semibold rounded-xl hover:shadow-xl transition-all disabled:opacity-50"
          >
            {loading ? 'Mentés...' : (isEditing ? 'Frissítés' : 'Létrehozás')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/pwa/events')}
            className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all"
          >
            Mégse
          </button>
        </div>
      </form>
    </div>
  )
}

export default EventFormPage
