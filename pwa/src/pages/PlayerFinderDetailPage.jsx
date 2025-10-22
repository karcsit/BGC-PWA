import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  fetchPlayerFinderPost,
  fetchApplications,
  createApplication,
  deletePlayerFinderPost
} from '../services/playerFinderService'
import { getCsrfToken } from '../services/authService'
import './PlayerFinderDetailPage.css'

function PlayerFinderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [post, setPost] = useState(null)
  const [included, setIncluded] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [applicationMessage, setApplicationMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showApplicationForm, setShowApplicationForm] = useState(false)

  useEffect(() => {
    loadData()
  }, [id])

  // Load application count for everyone (not just owner)
  useEffect(() => {
    const loadApplicationCount = async () => {
      try {
        const appsData = await fetchApplications(id)
        // Update applications for everyone to show correct count
        setApplications(appsData.data || [])
        if (appsData.included) {
          setIncluded(prev => [...prev, ...(appsData.included || [])])
        }
      } catch (err) {
        console.error('Error loading application count:', err)
      }
    }

    if (id) {
      loadApplicationCount()
    }
  }, [id])

  const loadData = async () => {
    try {
      setLoading(true)
      const postData = await fetchPlayerFinderPost(id)
      setPost(postData.data)
      setIncluded(postData.included || [])

      // Load applications if user is the owner
      const postAuthorUuid = postData.data.relationships?.uid?.data?.id
      if (user && postAuthorUuid) {
        const postAuthor = postData.included?.find(item => item.id === postAuthorUuid && item.type === 'user--user')
        const postAuthorDrupalId = postAuthor?.attributes?.drupal_internal__uid
        const currentUserId = user?.uid || user?.id

        console.log('Checking if owner:', { postAuthorDrupalId, currentUserId, isOwner: String(postAuthorDrupalId) === String(currentUserId) })
        if (String(postAuthorDrupalId) === String(currentUserId)) {
          const appsData = await fetchApplications(id)
          console.log('Applications loaded:', appsData.data?.length, appsData.data)
          setApplications(appsData.data || [])
          // Merge applications included data with existing included
          if (appsData.included) {
            setIncluded(prev => [...prev, ...appsData.included])
          }
        }
      }

      setError(null)
    } catch (err) {
      setError('Hiba történt a hirdetés betöltése során.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async (e) => {
    e.preventDefault()

    if (!user) {
      navigate('/login')
      return
    }

    if (!applicationMessage.trim()) {
      alert('Kérlek írj egy üzenetet!')
      return
    }

    try {
      setSubmitting(true)
      const csrfToken = await getCsrfToken()

      await createApplication({
        postId: id,
        field_message: applicationMessage,
        field_application_status: 'pending'
      }, csrfToken)

      alert('Jelentkezésed elküldve!')
      setApplicationMessage('')
      setShowApplicationForm(false)

      // Reload data to show updated state
      await loadData()
    } catch (err) {
      alert('Hiba történt a jelentkezés során.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Biztosan törölni szeretnéd ezt a hirdetést?')) {
      return
    }

    try {
      const csrfToken = await getCsrfToken()
      await deletePlayerFinderPost(id, csrfToken)
      alert('Hirdetés törölve!')
      navigate('/player-finder')
    } catch (err) {
      alert('Hiba történt a törlés során.')
      console.error(err)
    }
  }

  const getGameName = () => {
    if (!post?.relationships?.field_game?.data) {
      return null
    }

    const gameId = post.relationships.field_game.data.id
    const game = included?.find(item => item.id === gameId && item.type === 'node--tarsasjatek')

    return game?.attributes?.title || null
  }

  const getAuthorName = () => {
    if (!post?.relationships?.uid?.data) {
      return 'Ismeretlen'
    }

    const userId = post.relationships.uid.data.id
    const user = included?.find(item => item.id === userId && item.type === 'user--user')

    return user?.attributes?.display_name || user?.attributes?.name || 'Ismeretlen'
  }

  const getApplicantName = (application) => {
    const applicantUuid = application.relationships?.uid?.data?.id
    if (!applicantUuid) return 'Ismeretlen'

    // First check in applications included data
    const applicant = included?.find(item => item.id === applicantUuid && item.type === 'user--user')

    return applicant?.attributes?.display_name || applicant?.attributes?.name || 'Ismeretlen'
  }

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

  const postAuthorUuid = post?.relationships?.uid?.data?.id
  const postAuthor = included?.find(item => item.id === postAuthorUuid && item.type === 'user--user')
  const postAuthorDrupalId = postAuthor?.attributes?.drupal_internal__uid
  const currentUserId = user?.uid || user?.id
  const isOwner = user && String(postAuthorDrupalId) === String(currentUserId)

  // Check if current user already applied
  const hasApplied = applications.some(app => {
    const applicantUuid = app.relationships?.uid?.data?.id
    const applicant = included?.find(item => item.id === applicantUuid && item.type === 'user--user')
    const applicantDrupalId = applicant?.attributes?.drupal_internal__uid
    return String(applicantDrupalId) === String(currentUserId)
  })

  if (loading) {
    return (
      <div className="player-finder-detail-page">
        <div className="loading">
          <div className="spinner"></div>
          <p>Betöltés...</p>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="player-finder-detail-page">
        <div className="error-message">
          <i className="bi bi-exclamation-triangle"></i>
          {error || 'Hirdetés nem található'}
        </div>
        <Link to="/player-finder" className="btn-back">
          <i className="bi bi-arrow-left"></i>
          Vissza
        </Link>
      </div>
    )
  }

  const gameName = getGameName()
  const authorName = getAuthorName()

  return (
    <div className="player-finder-detail-page">
      <div className="detail-container">
        <div className="detail-header">
          <Link to="/player-finder" className="btn-back">
            <i className="bi bi-arrow-left"></i>
            Vissza
          </Link>
          {isOwner && (
            <div className="owner-actions">
              <button onClick={handleDelete} className="btn-delete">
                <i className="bi bi-trash"></i>
                Törlés
              </button>
            </div>
          )}
        </div>

        <div className="detail-content">
          <div className="main-info">
            <div className="title-row">
              <h1>{post.attributes.title}</h1>
              <span className={`status-badge status-${post.attributes.field_status || 'active'}`}>
                {post.attributes.field_status === 'active' ? 'Aktív' :
                 post.attributes.field_status === 'expired' ? 'Lejárt' :
                 post.attributes.field_status === 'full' ? 'Betelt' : 'Aktív'}
              </span>
            </div>

            <div className="info-grid">
              <div className="info-item">
                <i className="bi bi-calendar-event"></i>
                <div>
                  <strong>Időpont</strong>
                  <p>{formatDate(post.attributes.field_event_date)}</p>
                </div>
              </div>

              <div className="info-item">
                <i className="bi bi-geo-alt"></i>
                <div>
                  <strong>Helyszín</strong>
                  <p>{post.attributes.field_location === 'cafe' ? 'Board Game Cafe' : post.attributes.field_location === 'home' ? 'Otthon' : post.attributes.field_location}</p>
                </div>
              </div>

              <div className="info-item">
                <i className="bi bi-people"></i>
                <div>
                  <strong>Létszám</strong>
                  <p>{(post.attributes.field_current_players || 0) + applications.length} / {post.attributes.field_needed_players || 0} fő</p>
                </div>
              </div>

              {post.attributes.field_experience_level && (
                <div className="info-item">
                  <i className="bi bi-star"></i>
                  <div>
                    <strong>Szint</strong>
                    <p>{post.attributes.field_experience_level}</p>
                  </div>
                </div>
              )}

              {gameName && (
                <div className="info-item">
                  <i className="bi bi-dice-5"></i>
                  <div>
                    <strong>Játék</strong>
                    <p>{gameName}</p>
                  </div>
                </div>
              )}

              {post.attributes.field_contact && (
                <div className="info-item">
                  <i className="bi bi-envelope"></i>
                  <div>
                    <strong>Kapcsolat</strong>
                    <p>{post.attributes.field_contact}</p>
                  </div>
                </div>
              )}
            </div>

            {post.attributes.field_description && (
              <div className="description-section">
                <h3>Leírás</h3>
                <p>{post.attributes.field_description}</p>
              </div>
            )}

            <div className="author-section">
              <i className="bi bi-person-circle"></i>
              <span>Hirdette: <strong>{authorName}</strong></span>
            </div>
          </div>

          {!isOwner && user && post.attributes.field_status === 'active' && hasApplied && (
            <div className="application-section">
              <div className="already-applied">
                <i className="bi bi-check-circle"></i>
                <strong>Jelentkeztél erre a hirdetésre</strong>
                <p>A hirdető hamarosan felveszi veled a kapcsolatot!</p>
              </div>
            </div>
          )}

          {!isOwner && user && post.attributes.field_status === 'active' && !hasApplied && (
            <div className="application-section">
              {!showApplicationForm ? (
                <button
                  onClick={() => setShowApplicationForm(true)}
                  className="btn-apply"
                >
                  <i className="bi bi-send"></i>
                  Jelentkezem
                </button>
              ) : (
                <form onSubmit={handleApply} className="application-form">
                  <h3>Jelentkezés</h3>
                  <textarea
                    value={applicationMessage}
                    onChange={(e) => setApplicationMessage(e.target.value)}
                    placeholder="Írj egy üzenetet a hirdetőnek..."
                    rows="5"
                    required
                  ></textarea>
                  <div className="form-actions">
                    <button
                      type="button"
                      onClick={() => setShowApplicationForm(false)}
                      className="btn-cancel"
                      disabled={submitting}
                    >
                      Mégse
                    </button>
                    <button
                      type="submit"
                      className="btn-submit"
                      disabled={submitting}
                    >
                      {submitting ? 'Küldés...' : 'Jelentkezés küldése'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {isOwner && applications.length > 0 && (
            <div className="applications-list">
              <h3>Jelentkezések ({applications.length})</h3>
              {applications.map(app => (
                <div key={app.id} className="application-item">
                  <div className="app-header">
                    <span className="app-author">
                      <i className="bi bi-person"></i>
                      {getApplicantName(app)}
                    </span>
                    <span className={`app-status status-${app.attributes.field_application_status}`}>
                      {app.attributes.field_application_status}
                    </span>
                  </div>
                  <p className="app-message">{app.attributes.field_message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PlayerFinderDetailPage
