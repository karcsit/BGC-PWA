import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchPlayerFinderPosts, fetchApplications } from '../services/playerFinderService'
import PlayerFinderCard from '../components/PlayerFinderCard'
import './PlayerFinderPage.css'

function PlayerFinderPage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [included, setIncluded] = useState([])
  const [applicationCounts, setApplicationCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all') // all, open, my

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    try {
      setLoading(true)
      const data = await fetchPlayerFinderPosts()
      setPosts(data.data || [])
      setIncluded(data.included || [])

      // Load application counts for all posts
      const counts = {}
      for (const post of data.data || []) {
        try {
          const appsData = await fetchApplications(post.id)
          counts[post.id] = appsData.data?.length || 0
        } catch (err) {
          console.error(`Error loading applications for post ${post.id}:`, err)
          counts[post.id] = 0
        }
      }
      setApplicationCounts(counts)

      setError(null)
    } catch (err) {
      setError('Hiba történt a hirdetések betöltése során.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filteredPosts = posts.filter(post => {
    if (filter === 'active') {
      return post.attributes.field_status === 'active' || !post.attributes.field_status
    }
    if (filter === 'my' && user) {
      const postAuthorUuid = post.relationships?.uid?.data?.id
      if (!postAuthorUuid) return false

      // Find the user object in included array by UUID
      const postAuthor = included?.find(item => item.id === postAuthorUuid && item.type === 'user--user')
      const postAuthorDrupalId = postAuthor?.attributes?.drupal_internal__uid
      const currentUserId = user.uid || user.id

      const match = String(postAuthorDrupalId) === String(currentUserId)
      console.log('Filtering my posts:', { postAuthorUuid, postAuthorDrupalId, currentUserId, match })
      return match
    }
    return true
  })

  return (
    <div className="player-finder-page">
      <div className="page-header">
        <div>
          <h1>Játékostárs kereső</h1>
          <p>Találj játékostársakat vagy csatlakozz mások hirdetéseihez!</p>
        </div>
        {user && (
          <Link to="/player-finder/new" className="btn-create">
            <i className="bi bi-plus-circle"></i>
            Új hirdetés
          </Link>
        )}
      </div>

      <div className="filter-tabs">
        <button
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          Összes
        </button>
        <button
          className={filter === 'active' ? 'active' : ''}
          onClick={() => setFilter('active')}
        >
          Aktív
        </button>
        {user && (
          <button
            className={filter === 'my' ? 'active' : ''}
            onClick={() => setFilter('my')}
          >
            Saját hirdetéseim
          </button>
        )}
      </div>

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Hirdetések betöltése...</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          <i className="bi bi-exclamation-triangle"></i>
          {error}
        </div>
      )}

      {!loading && !error && filteredPosts.length === 0 && (
        <div className="no-posts">
          <i className="bi bi-inbox"></i>
          <p>
            {filter === 'my'
              ? 'Még nincs saját hirdetésed.'
              : filter === 'active'
              ? 'Jelenleg nincs aktív hirdetés.'
              : 'Még nincs hirdetés.'}
          </p>
          {user && filter !== 'my' && (
            <Link to="/player-finder/new" className="btn-create">
              Első hirdetés létrehozása
            </Link>
          )}
        </div>
      )}

      {!loading && !error && filteredPosts.length > 0 && (
        <div className="posts-grid">
          {filteredPosts.map(post => (
            <PlayerFinderCard
              key={post.id}
              post={post}
              included={included}
              applicationCount={applicationCounts[post.id] || 0}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default PlayerFinderPage
