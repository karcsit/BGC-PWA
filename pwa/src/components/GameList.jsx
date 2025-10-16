import React, { useState, useEffect, useRef, useCallback } from 'react'
import { fetchGames } from '../services/drupalApi'
import GameCard from './GameCard'
import FilterPanel from './FilterPanel'

function GameList() {
  const [visibleGames, setVisibleGames] = useState([]) // Games currently displayed
  const [searchResults, setSearchResults] = useState([]) // Search results from API
  const [included, setIncluded] = useState([]) // Store included resources (images, media)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searching, setSearching] = useState(false) // Search in progress
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const [filters, setFilters] = useState({
    gameType: '',
    playerCount: 1
  })

  const observer = useRef()
  const lastGameRef = useCallback(node => {
    if (loadingMore) return
    // Don't enable infinite scroll when filters are active
    const hasActiveFilters = filters.gameType || filters.playerCount > 1
    if (hasActiveFilters) return

    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreGames()
      }
    })
    if (node) observer.current.observe(node)
  }, [loadingMore, hasMore, filters.gameType, filters.playerCount])

  // Load games on mount and when filters change
  useEffect(() => {
    console.log('useEffect triggered, filters:', filters)
    const hasActiveFilters = filters.gameType || filters.playerCount > 1
    console.log('hasActiveFilters:', hasActiveFilters)

    if (hasActiveFilters) {
      console.log('Loading filtered games...')
      loadFilteredGames()
    } else {
      // No filters active, load initial games
      console.log('Loading initial games...')
      loadInitialGames()
    }
  }, [filters.gameType, filters.playerCount])

  // Search with debounce
  useEffect(() => {
    if (!searchTerm) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(() => {
      performSearch(searchTerm)
    }, 500) // Wait 500ms after user stops typing

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Load first 50 games with images
  async function loadInitialGames() {
    try {
      setLoading(true)
      setError(null)
      setPage(0) // Reset page counter
      const data = await fetchGames({ page: 0, limit: 50 })

      if (data && data.data) {
        setVisibleGames(data.data)
        setIncluded(data.included || [])
        setPage(1)
        setHasMore(data.data.length === 50)
      }
    } catch (err) {
      setError('Hiba történt a játékok betöltése közben. Kérlek, próbáld újra felől.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Load more games when scrolling (infinite scroll)
  async function loadMoreGames() {
    if (loadingMore) return

    try {
      setLoadingMore(true)
      const data = await fetchGames({ page, limit: 50 })

      if (data && data.data) {
        setVisibleGames(prev => [...prev, ...data.data])
        setIncluded(prev => [...prev, ...(data.included || [])])
        setPage(prev => prev + 1)
        setHasMore(data.data.length === 50)
      }
    } catch (err) {
      console.error('Error loading more games:', err)
    } finally {
      setLoadingMore(false)
    }
  }

  // Load games with filters - SERVER-SIDE filtering using Drupal JSON:API
  async function loadFilteredGames() {
    try {
      setLoading(true)
      setError(null)

      console.log('🔍 Loading games with SERVER-SIDE filtering...')
      console.log('🔍 Filters:', filters)

      // Build filter query string
      let filterParams = []

      // STEP 1: First, get the taxonomy term ID if filtering by game type
      let taxonomyTermId = null
      if (filters.gameType) {
        console.log(`Looking up taxonomy term for: ${filters.gameType}`)

        // Fetch taxonomy terms to find the matching ID
        const taxonomyResponse = await fetch(
          `/jsonapi/taxonomy_term/jatek_tipusok_polcrendszerben`,
          {
            headers: { 'Accept': 'application/vnd.api+json' }
          }
        )
        const taxonomyData = await taxonomyResponse.json()

        if (taxonomyData && taxonomyData.data) {
          // Helper function to normalize strings
          const normalize = (str) => {
            return str
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/\s+/g, '-')
              .replace(/[^a-z0-9-]/g, '')
          }

          const normalizedFilter = normalize(filters.gameType)
          const matchingTerm = taxonomyData.data.find(term => {
            const termName = term.attributes?.name || ''
            const normalizedTerm = normalize(termName)
            return normalizedTerm === normalizedFilter
          })

          if (matchingTerm) {
            taxonomyTermId = matchingTerm.id
            console.log(`✅ Found taxonomy term ID: ${taxonomyTermId}`)
          } else {
            console.warn(`⚠️ No matching taxonomy term found for "${filters.gameType}"`)
          }
        }
      }

      // STEP 2: Build the game query with filters
      if (taxonomyTermId) {
        // Filter by taxonomy term ID
        filterParams.push(`filter[field_tipus.id]=${taxonomyTermId}`)
      }

      // Filter by player count (games where min <= count <= max)
      if (filters.playerCount > 1) {
        const count = filters.playerCount === 8 ? 8 : filters.playerCount
        console.log(`Filtering by player count: ${count}`)

        // Min players should be <= count
        filterParams.push(`filter[min_players][condition][path]=field_minimalis_jatekosszam`)
        filterParams.push(`filter[min_players][condition][operator]=<=`)
        filterParams.push(`filter[min_players][condition][value]=${count}`)

        // Max players should be >= count
        filterParams.push(`filter[max_players][condition][path]=field_maximalis_jatekosszam`)
        filterParams.push(`filter[max_players][condition][operator]=>=`)
        filterParams.push(`filter[max_players][condition][value]=${count}`)
      }

      // Build final URL
      const filterString = filterParams.length > 0 ? `&${filterParams.join('&')}` : ''
      let url = `/jsonapi/node/tarsasjatek?page[limit]=50${filterString}&include=field_a_jatek_kepe,field_a_jatek_kepe.field_media_image,field_tipus`

      console.log('📡 Fetching from:', url)

      // Fetch ALL pages of filtered games (pagination loop)
      const allFilteredGames = []
      const allIncluded = []
      let currentPage = 0
      let hasNextPage = true

      while (hasNextPage) {
        console.log(`📄 Loading page ${currentPage + 1}...`)

        const response = await fetch(url, {
          headers: { 'Accept': 'application/vnd.api+json' }
        })

        const data = await response.json()

        if (data && data.data && data.data.length > 0) {
          allFilteredGames.push(...data.data)
          if (data.included) {
            allIncluded.push(...data.included)
          }

          console.log(`✓ Page ${currentPage + 1}: ${data.data.length} games (total: ${allFilteredGames.length})`)

          // Check if there's a next page
          if (data.links && data.links.next && data.links.next.href) {
            // Use the next link provided by Drupal
            // IMPORTANT: Remove the domain and /web prefix to use the Vite proxy
            const nextUrl = data.links.next.href
            const urlObj = new URL(nextUrl)
            let nextPath = urlObj.pathname + urlObj.search
            // Remove /web prefix if present (e.g., /web/jsonapi/... → /jsonapi/...)
            nextPath = nextPath.replace(/^\/web/, '')
            url = nextPath
            console.log(`➡️ Next page: ${url}`)
            currentPage++
          } else {
            hasNextPage = false
            console.log('✓ No more pages')
          }
        } else {
          hasNextPage = false
          console.log('✓ No more data')
        }
      }

      console.log(`📊 Total filtered games loaded: ${allFilteredGames.length}`)

      if (allFilteredGames.length > 0) {
        setVisibleGames(allFilteredGames)
        setIncluded(allIncluded)
        setHasMore(false) // Disable infinite scroll when filtering
      } else {
        console.warn('⚠️ No games found matching filters')
        setVisibleGames([])
        setIncluded([])
        setHasMore(false)
      }

    } catch (err) {
      console.error('❌ Filter error:', err)
      setError('Hiba történt a szűrés közben.')
    } finally {
      setLoading(false)
    }
  }

  // Server-side search using Drupal API
  async function performSearch(query) {
    try {
      setSearching(true)

      // Use Drupal's filter to search in title field
      const response = await fetch(
        `/jsonapi/node/tarsasjatek?filter[title][operator]=CONTAINS&filter[title][value]=${encodeURIComponent(query)}&page[limit]=100&include=field_a_jatek_kepe,field_a_jatek_kepe.field_media_image`,
        {
          headers: {
            'Accept': 'application/vnd.api+json',
          }
        }
      )

      const data = await response.json()

      if (data && data.data) {
        setSearchResults(data.data)
        // Also update included for images
        if (data.included) {
          setIncluded(data.included)
        }
      }
    } catch (err) {
      console.error('Search error:', err)
    } finally {
      setSearching(false)
    }
  }

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters) => {
    console.log('Filter changed:', newFilters)
    setFilters(newFilters)
    setSearchTerm('') // Clear search when filtering
    setSearchResults([])
  }, [])

  // Display either search results or visible games
  const displayGames = searchTerm ? searchResults : visibleGames

  console.log('🎨 RENDER - visibleGames.length:', visibleGames.length, 'displayGames.length:', displayGames.length)

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-purple"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600">{error}</p>
        <button
          onClick={loadInitialGames}
          className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Újrapróbálás
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Header with search */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Játékkatalógus
        </h2>
        <p className="text-gray-600 mb-6">
          {searchTerm ? (
            <>
              {searching ? (
                <span className="text-blue-600">Keresés...</span>
              ) : (
                <>
                  <span className="font-semibold">{searchResults.length}</span> találat "{searchTerm}" keresésre
                </>
              )}
            </>
          ) : (
            <>
              <span className="font-semibold">{visibleGames.length}</span> játék betöltve
              <span className="block mt-1 text-sm text-gray-500">
                Görgess tovább a többi játékért, vagy használd a keresőt!
              </span>
            </>
          )}
        </p>

        {/* Search bar */}
        <div className="max-w-2xl">
          <input
            type="text"
            placeholder="Keress játéknévre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-6 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent shadow-sm"
          />
        </div>
      </div>

      {/* Filter Panel */}
      <FilterPanel filters={filters} onFilterChange={handleFilterChange} />

      {/* Games grid */}
      {displayGames.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {searchTerm ? `Nem található játék "${searchTerm}" keresésre` : 'Nincsenek játékok'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayGames.map((game, index) => {
              // Add ref to last element for infinite scroll (only when not searching)
              if (index === displayGames.length - 1 && !searchTerm) {
                return <GameCard key={game.id} game={game} included={included} ref={lastGameRef} />
              }
              return <GameCard key={game.id} game={game} included={included} />
            })}
          </div>

          {/* Loading more indicator */}
          {loadingMore && !searchTerm && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-purple"></div>
              <span className="ml-3 text-gray-600">További játékok betöltése...</span>
            </div>
          )}

          {/* No more games message */}
          {!hasMore && !searchTerm && (
            <div className="text-center py-8">
              <p className="text-gray-500">✓ Az összes játék betöltve</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default GameList
