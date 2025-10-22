import { Link } from 'react-router-dom'
import './PlayerFinderCard.css'

function PlayerFinderCard({ post, included }) {
  // Get game name if referenced
  const getGameName = () => {
    if (!post.relationships?.field_game?.data) {
      return null
    }

    const gameId = post.relationships.field_game.data.id
    const game = included?.find(item => item.id === gameId && item.type === 'node--tarsasjatek')

    return game?.attributes?.title || null
  }

  // Get author name
  const getAuthorName = () => {
    if (!post.relationships?.uid?.data) {
      return 'Ismeretlen'
    }

    const userId = post.relationships.uid.data.id
    const user = included?.find(item => item.id === userId && item.type === 'user--user')

    return user?.attributes?.display_name || user?.attributes?.name || 'Ismeretlen'
  }

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

  const gameName = getGameName()
  const authorName = getAuthorName()
  const playerInfo = `${post.attributes.field_current_players || 0} / ${post.attributes.field_needed_players || 0}`

  return (
    <div className="player-finder-card">
      <div className="card-header">
        <h3>{post.attributes.title}</h3>
        <span className={`status-badge status-${post.attributes.field_status || 'active'}`}>
          {post.attributes.field_status === 'active' ? 'Aktív' :
           post.attributes.field_status === 'full' ? 'Betelt' :
           post.attributes.field_status === 'expired' ? 'Lejárt' : 'Aktív'}
        </span>
      </div>

      {post.attributes.field_event_date && (
        <div className="card-detail">
          <i className="bi bi-calendar-event"></i>
          <span>{formatDate(post.attributes.field_event_date)}</span>
        </div>
      )}

      {post.attributes.field_location && (
        <div className="card-detail">
          <i className="bi bi-geo-alt"></i>
          <span>{post.attributes.field_location === 'cafe' ? 'Board Game Cafe' : post.attributes.field_location === 'home' ? 'Otthon' : post.attributes.field_location}</span>
        </div>
      )}

      {gameName && (
        <div className="card-detail">
          <i className="bi bi-dice-5"></i>
          <span>{gameName}</span>
        </div>
      )}

      <div className="card-detail players-info">
        <i className="bi bi-people"></i>
        <span>
          <strong>{playerInfo}</strong> játékos
          {post.attributes.field_experience_level &&
            <span className="experience-badge">{post.attributes.field_experience_level}</span>
          }
        </span>
      </div>

      {post.attributes.field_description && (
        <div className="card-description">
          {post.attributes.field_description.length > 150
            ? post.attributes.field_description.substring(0, 150) + '...'
            : post.attributes.field_description}
        </div>
      )}

      <div className="card-footer">
        <span className="author">
          <i className="bi bi-person"></i>
          {authorName}
        </span>
        <Link to={`/player-finder/${post.id}`} className="btn-view">
          Részletek
        </Link>
      </div>
    </div>
  )
}

export default PlayerFinderCard
