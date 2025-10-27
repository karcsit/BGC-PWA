import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { createPlayerFinderPost } from '../services/playerFinderService'
import { fetchGames } from '../services/drupalApi'
import './PlayerFinderFormPage.css'

function PlayerFinderFormPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [gameSearch, setGameSearch] = useState('')
  const [gameResults, setGameResults] = useState([])
  const [selectedGame, setSelectedGame] = useState(null)
  const [searchingGames, setSearchingGames] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    field_event_date: '',
    field_location: 'cafe',
    field_event_type: '',
    field_needed_players: 4,
    field_current_players: 1,
    field_contact: '',
    field_description: '',
    field_status: 'active',
    field_experience_level: '',
    field_game: '',
    field_game_type: ''
  })

  // Game types based on jatek_tipusok_polcrendszerben taxonomy
  const gameTypes = [
    { value: '', label: '-- Válassz típust --' },
    { value: 'partijatekok', label: 'Partijátékok' },
    { value: 'gyors-jatekok', label: 'Gyors játékok' },
    { value: 'csaladi-jatekok', label: 'Családi játékok' },
    { value: 'osszetett-csaladi-jatekok', label: 'Összetett családi játékok' },
    { value: 'tarsasjatekok-tapasztalt-jatekosoknak', label: 'Tapasztalt játékosoknak' },
    { value: 'kartyajatekok', label: 'Kártyajátékok' },
    { value: 'kockajatekok', label: 'Kockajátékok' },
    { value: 'logikai-es-ugyessegi-jatekok', label: 'Logikai és ügyességi játékok' },
    { value: 'szo-es-betujatekok', label: 'Szó- és betűjátékok' },
    { value: 'gyerekjatekok', label: 'Gyerekjátékok' },
    { value: 'jatekok-felnotteknek-18-plusz', label: 'Felnőtt játékok (18+)' },
    { value: 'angol-nyelvu-jatekok', label: 'Angol nyelvű játékok' },
    { value: 'jatekok-2-jatekosnak', label: 'Kétfős játékok' },
    { value: 'spiel-des-jahres', label: 'Spiel des Jahres' },
    { value: 'kennerspiel-des-jahres', label: 'Kennerspiel des Jahres' },
    { value: 'retro-jatekok', label: 'Retro játékok' }
  ]

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    // Set user contact info
    setFormData(prev => ({
      ...prev,
      field_contact: user.mail || user.email || ''
    }))
  }, [user, navigate])

  // Game search with debounce
  useEffect(() => {
    if (!gameSearch || gameSearch.length < 3) {
      setGameResults([])
      return
    }

    const timer = setTimeout(() => {
      searchGames(gameSearch)
    }, 300)

    return () => clearTimeout(timer)
  }, [gameSearch])

  const searchGames = async (query) => {
    try {
      setSearchingGames(true)
      const response = await fetch(
        `/jsonapi/node/tarsasjatek?filter[title][operator]=CONTAINS&filter[title][value]=${encodeURIComponent(query)}&page[limit]=20`,
        {
          headers: {
            'Accept': 'application/vnd.api+json',
          }
        }
      )
      const data = await response.json()
      if (data && data.data) {
        setGameResults(data.data)
      }
    } catch (err) {
      console.error('Error searching games:', err)
    } finally {
      setSearchingGames(false)
    }
  }

  const handleGameSelect = (game) => {
    setSelectedGame(game)
    setGameSearch(game.attributes.title)
    setGameResults([])
    setFormData(prev => ({
      ...prev,
      field_game: game.id,
      field_game_type: '', // Clear game type when specific game is selected
      title: generateTitle(game.attributes.title, null, prev.field_event_date)
    }))
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: value
      }
      // Auto-generate title when date changes
      if (name === 'field_event_date') {
        const gameTypeLabel = gameTypes.find(t => t.value === prev.field_game_type)?.label
        updated.title = generateTitle(selectedGame?.attributes.title, gameTypeLabel, value)
      }
      // Auto-generate title when game type changes
      if (name === 'field_game_type') {
        const gameTypeLabel = gameTypes.find(t => t.value === value)?.label
        updated.title = generateTitle(null, gameTypeLabel, prev.field_event_date)
        // Clear selected game when game type is selected
        if (value) {
          updated.field_game = ''
          setSelectedGame(null)
          setGameSearch('')
        }
      }
      return updated
    })
  }

  const generateTitle = (gameName, gameType, eventDate) => {
    const gameInfo = gameName || gameType

    if (!gameInfo && !eventDate) {
      return 'Játékostárs keresés'
    }
    if (!gameInfo) {
      const date = new Date(eventDate)
      const formatted = date.toLocaleDateString('hu-HU', { month: 'long', day: 'numeric' })
      return `Játékostárs keresés - ${formatted}`
    }
    if (!eventDate) {
      return `${gameInfo} - Játékostárs keresés`
    }
    const date = new Date(eventDate)
    const formatted = date.toLocaleDateString('hu-HU', { month: 'long', day: 'numeric' })
    return `${gameInfo} - ${formatted}`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.field_event_date || !formData.field_location) {
      setError('Kérlek töltsd ki a kötelező mezőket!')
      return
    }

    // Auto-generate title if not set
    let finalTitle = formData.title
    if (!finalTitle || finalTitle === '') {
      const gameTypeLabel = gameTypes.find(t => t.value === formData.field_game_type)?.label
      finalTitle = generateTitle(selectedGame?.attributes?.title, gameTypeLabel, formData.field_event_date)
    }

    try {
      setLoading(true)
      setError(null)

      // Format date to RFC 3339 with explicit timezone offset (Drupal requires +HH:MM format, not Z)
      const eventDate = new Date(formData.field_event_date)
      const year = eventDate.getFullYear()
      const month = String(eventDate.getMonth() + 1).padStart(2, '0')
      const day = String(eventDate.getDate()).padStart(2, '0')
      const hours = String(eventDate.getHours()).padStart(2, '0')
      const minutes = String(eventDate.getMinutes()).padStart(2, '0')
      const seconds = String(eventDate.getSeconds()).padStart(2, '0')

      // Get timezone offset in +HH:MM format
      const tzOffset = -eventDate.getTimezoneOffset()
      const tzHours = String(Math.floor(Math.abs(tzOffset) / 60)).padStart(2, '0')
      const tzMinutes = String(Math.abs(tzOffset) % 60).padStart(2, '0')
      const tzSign = tzOffset >= 0 ? '+' : '-'

      const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${tzSign}${tzHours}:${tzMinutes}`

      const postData = {
        attributes: {
          title: finalTitle,
          field_event_date: formattedDate,
          field_location: formData.field_location,
          field_needed_players: parseInt(formData.field_needed_players),
          field_current_players: parseInt(formData.field_current_players),
          field_status: formData.field_status
        },
        relationships: {}
      }

      // Only include optional fields if they have values
      if (formData.field_event_type) {
        postData.attributes.field_event_type = formData.field_event_type
      }
      if (formData.field_contact) {
        postData.attributes.field_contact = formData.field_contact
      }
      if (formData.field_description) {
        postData.attributes.field_description = formData.field_description
      }
      if (formData.field_experience_level) {
        postData.attributes.field_experience_level = formData.field_experience_level
      }

      // Add game relationship if selected
      if (formData.field_game) {
        postData.relationships.field_game = {
          data: {
            type: 'node--tarsasjatek',
            id: formData.field_game
          }
        }
      }

      // Add game type relationship if selected
      if (formData.field_game_type) {
        // Fetch all taxonomy terms and find the matching one by machine name
        try {
          const taxonomyResponse = await fetch(
            `/jsonapi/taxonomy_term/jatek_tipusok_polcrendszerben`,
            {
              headers: {
                'Accept': 'application/vnd.api+json',
              }
            }
          )
          const taxonomyData = await taxonomyResponse.json()
          console.log('Taxonomy terms:', taxonomyData.data)

          // Find term by matching machine name (stored in name field or path)
          if (taxonomyData && taxonomyData.data) {
            // The value we have is like 'partijatekok', need to find matching term
            // Try to match by checking if the path alias or name contains our value
            const matchingTerm = taxonomyData.data.find(term => {
              // Check various fields to find a match
              const termName = term.attributes.name?.toLowerCase() || ''
              const termPath = term.attributes.path?.alias?.toLowerCase() || ''
              const searchValue = formData.field_game_type.toLowerCase()

              return termPath.includes(searchValue) || termName.replace(/\s+/g, '-').toLowerCase() === searchValue
            })

            if (matchingTerm) {
              console.log('Found matching term:', matchingTerm)
              postData.relationships.field_game_type = {
                data: {
                  type: 'taxonomy_term--jatek_tipusok_polcrendszerben',
                  id: matchingTerm.id
                }
              }
            } else {
              console.warn('No matching taxonomy term found for:', formData.field_game_type)
            }
          }
        } catch (err) {
          console.error('Error fetching game type taxonomy:', err)
        }
      }

      await createPlayerFinderPost(postData)

      navigate('/player-finder')
    } catch (err) {
      setError('Hiba történt a hirdetés létrehozása során.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="player-finder-form-page">
      <div className="form-container">
        <h1>Új játékostárs hirdetés</h1>
        <p className="form-description">
          Töltsd ki az alábbi űrlapot, hogy játékostársakat találj!
        </p>

        {error && (
          <div className="error-message">
            <i className="bi bi-exclamation-triangle"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="field_event_date">
              Dátum és időpont <span className="required">*</span>
            </label>
            <input
              type="datetime-local"
              id="field_event_date"
              name="field_event_date"
              value={formData.field_event_date}
              onChange={handleChange}
              required
            />
            <small className="field-note">Helyszín: Board Game Cafe</small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="field_current_players">
                Jelenlegi létszám
              </label>
              <input
                type="number"
                id="field_current_players"
                name="field_current_players"
                value={formData.field_current_players}
                onChange={handleChange}
                min="1"
                max="20"
              />
            </div>

            <div className="form-group">
              <label htmlFor="field_needed_players">
                Kívánt létszám
              </label>
              <input
                type="number"
                id="field_needed_players"
                name="field_needed_players"
                value={formData.field_needed_players}
                onChange={handleChange}
                min="2"
                max="20"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="field_game_type">
              Játék típusa (opcionális)
            </label>
            <select
              id="field_game_type"
              name="field_game_type"
              value={formData.field_game_type}
              onChange={handleChange}
              disabled={!!selectedGame}
            >
              {gameTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {selectedGame && (
              <small className="field-note" style={{ color: '#666', marginTop: '4px' }}>
                Konkrét játék kiválasztva, típus választás letiltva
              </small>
            )}
          </div>

          <div className="form-group game-search-container">
            <label htmlFor="gameSearch">
              vagy konkrét játék keresése (opcionális)
            </label>
            <input
              type="text"
              id="gameSearch"
              value={gameSearch}
              onChange={(e) => setGameSearch(e.target.value)}
              placeholder="Kezdj el gépelni a játék nevét (min. 3 karakter)..."
              autoComplete="off"
              disabled={!!formData.field_game_type}
            />
            {formData.field_game_type && (
              <small className="field-note" style={{ color: '#666', marginTop: '4px' }}>
                Játék típus kiválasztva, konkrét játék keresés letiltva
              </small>
            )}
            {searchingGames && (
              <div className="search-loading">Keresés...</div>
            )}
            {gameResults.length > 0 && (
              <div className="game-results">
                {gameResults.map(game => (
                  <div
                    key={game.id}
                    className="game-result-item"
                    onClick={() => handleGameSelect(game)}
                  >
                    {game.attributes.title}
                  </div>
                ))}
              </div>
            )}
            {selectedGame && (
              <div className="selected-game">
                <i className="bi bi-check-circle"></i>
                Kiválasztva: <strong>{selectedGame.attributes.title}</strong>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedGame(null)
                    setGameSearch('')
                    setFormData(prev => ({ ...prev, field_game: '' }))
                  }}
                  className="btn-clear"
                >
                  <i className="bi bi-x"></i>
                </button>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="field_experience_level">
              Tapasztalati szint
            </label>
            <select
              id="field_experience_level"
              name="field_experience_level"
              value={formData.field_experience_level}
              onChange={handleChange}
            >
              <option value="">-- Válassz szintet --</option>
              <option value="beginner">Kezdő</option>
              <option value="intermediate">Haladó</option>
              <option value="advanced">Szakértő</option>
              <option value="any">Bárki</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="field_contact">
              Kapcsolat
            </label>
            <input
              type="text"
              id="field_contact"
              name="field_contact"
              value={formData.field_contact}
              onChange={handleChange}
              placeholder="Email, telefon vagy más elérhetőség"
            />
          </div>

          <div className="form-group">
            <label htmlFor="field_description">
              Leírás
            </label>
            <textarea
              id="field_description"
              name="field_description"
              value={formData.field_description}
              onChange={handleChange}
              rows="5"
              placeholder="Írd le, mit keresel, milyen játékosokat vársz, stb."
            ></textarea>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/player-finder')}
              className="btn-cancel"
              disabled={loading}
            >
              Mégse
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Mentés...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle"></i>
                  Hirdetés feladása
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PlayerFinderFormPage
