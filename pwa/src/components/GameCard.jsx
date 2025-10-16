import React, { useState, forwardRef } from 'react'

const GameCard = forwardRef(({ game, included = [] }, ref) => {
  const { attributes, relationships } = game
  const [showDetails, setShowDetails] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const title = attributes?.title || 'Ismeretlen játék'
  const minPlayers = attributes?.field_minimalis_jatekosszam || '?'
  const maxPlayers = attributes?.field_maximalis_jatekosszam || '?'
  const playTime = attributes?.field_jatekido_perc || '?'
  const available = attributes?.field_elerheto !== false

  // Extract image URL from included resources
  const getImageUrl = () => {
    const mediaRelationship = relationships?.field_a_jatek_kepe?.data?.[0]
    if (!mediaRelationship) return null

    const mediaEntity = included.find(item =>
      item.type === 'media--image' && item.id === mediaRelationship.id
    )

    if (!mediaEntity) return null

    const fileRelationship = mediaEntity.relationships?.field_media_image?.data
    if (!fileRelationship) return null

    const fileEntity = included.find(item =>
      item.type === 'file--file' && item.id === fileRelationship.id
    )

    if (fileEntity?.attributes?.uri?.url) {
      const url = fileEntity.attributes.uri.url
      return `https://dr11.webgraf.hu${url}`
    }

    return null
  }

  const imageUrl = getImageUrl()

  const getDescription = () => {
    if (!attributes?.field_leiras) return ''
    return typeof attributes.field_leiras === 'string'
      ? attributes.field_leiras
      : (attributes.field_leiras.value || attributes.field_leiras.processed || '')
  }

  const description = getDescription()

  return (
    <>
    <div ref={ref} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      {/* Game Image */}
      <div className="h-48 bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-6xl">🎲</div>
        )}
      </div>

      {/* Game Info */}
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2 min-h-[3.5rem]">
          {title}
        </h3>

        {/* Stats */}
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center">
            <span className="mr-2">👥</span>
            <span>{minPlayers}-{maxPlayers} játékos</span>
          </div>
          <div className="flex items-center">
            <span className="mr-2">⏱️</span>
            <span>{playTime} perc</span>
          </div>
          {attributes?.field_polckod && (
            <div className="flex items-center">
              <span className="mr-2">📍</span>
              <span><strong>Polckód:</strong> {attributes.field_polckod}</span>
            </div>
          )}
        </div>

        {/* Availability badge */}
        <div className="mt-4">
          {available ? (
            <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
              ✓ Elérhető
            </span>
          ) : (
            <span className="inline-block bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium">
              Kölcsönben
            </span>
          )}
        </div>

        {/* Action button */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="mt-4 w-full bg-gradient-to-r from-primary-purple to-primary-indigo text-white py-2 rounded-lg hover:opacity-90 transition-opacity font-medium"
        >
          {showDetails ? 'Bezárás' : 'Részletek'}
        </button>

        {/* Details section (collapsible) */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
            {attributes?.field_eredeti_nev && (
              <p className="mb-2">
                <strong>Eredeti név:</strong> {attributes.field_eredeti_nev}
              </p>
            )}
            {attributes?.field_kiadas_eve && (
              <p className="mb-2">
                <strong>Kiadás éve:</strong> {attributes.field_kiadas_eve}
              </p>
            )}
            {description && (
              <div className="mt-3">
                <p className="text-xs line-clamp-3">{description}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowModal(true)
                  }}
                  className="text-primary-indigo text-xs mt-1 hover:underline"
                >
                  Teljes leírás olvasása →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>

    {/* Modal for full description */}
    {showModal && (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={() => setShowModal(false)}
      >
        <div
          className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
            <button
              onClick={() => setShowModal(false)}
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {imageUrl && (
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-64 object-cover rounded-lg mb-4"
            />
          )}

          <div className="space-y-3 text-sm text-gray-600 mb-4">
            <div className="flex items-center">
              <span className="mr-2">👥</span>
              <span>{minPlayers}-{maxPlayers} játékos</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">⏱️</span>
              <span>{playTime} perc</span>
            </div>
            {attributes?.field_polckod && (
              <div className="flex items-center">
                <span className="mr-2">📍</span>
                <span><strong>Polckód:</strong> {attributes.field_polckod}</span>
              </div>
            )}
            {attributes?.field_eredeti_nev && (
              <div>
                <strong>Eredeti név:</strong> {attributes.field_eredeti_nev}
              </div>
            )}
            {attributes?.field_kiadas_eve && (
              <div>
                <strong>Kiadás éve:</strong> {attributes.field_kiadas_eve}
              </div>
            )}
          </div>

          {description && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="font-semibold mb-2 text-gray-800">Leírás:</h3>
              <div
                className="text-sm text-gray-700 whitespace-pre-line"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            </div>
          )}
        </div>
      </div>
    )}
    </>
  )
})

GameCard.displayName = 'GameCard'

export default GameCard
