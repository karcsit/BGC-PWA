import React, { useState, useRef, useEffect } from 'react'
import menuData from '../data/menu.json'

const Menu = () => {
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const scrollRef = useRef(null)

  // Category emojis
  const categoryEmojis = {
    'Szendvicsek, Rágcsálnivalók': '🥪',
    'Sörök': '🍺',
    'Borok': '🍷',
    'Fröccsök': '🥂',
    'Limonádék': '🍹',
    'Szörpök': '🧃',
    'Üdítők': '🥤',
    'Long drinkek': '🍸'
  }

  // Get all categories with count
  const categories = Object.keys(menuData).map(key => {
    const name = key.replace('keyboard_arrow_down', '').replace('\n', '').trim()
    return {
      key,
      name,
      count: menuData[key].length,
      emoji: categoryEmojis[name] || '🍴'
    }
  })

  // Filter items by search term
  const filterItems = (items) => {
    if (!searchTerm) return items
    return items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  // Allergen translations
  const allergenNames = {
    barley: 'Árpa',
    wheatflour: 'Búzaliszt',
    gluten: 'Glutén',
    mustard: 'Mustár',
    cheese: 'Sajt',
    sesame: 'Szezám',
    milk: 'Tej',
    sulphites: 'Szulfit',
    cashewnut: 'Kesudió',
    almond: 'Mandula',
    celery: 'Zeller',
    soya: 'Szója',
    nuts: 'Diófélék',
    peanuts: 'Mogyoró',
    walnut: 'Dió',
    lactose: 'Laktóz',
    phenylalanine: 'Fenilalanin',
    kinin: 'Kinin',
    wheyconcentrate: 'Tejsavó',
    cream: 'Tejföl',
    egg: 'Tojás'
  }

  // Swipe handling (minimum swipe distance: 50px)
  const minSwipeDistance = 50

  const onTouchStart = (e) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe || isRightSwipe) {
      const currentIndex = selectedCategory === null
        ? -1
        : categories.findIndex(cat => cat.key === selectedCategory)

      if (isLeftSwipe && currentIndex < categories.length - 1) {
        // Swipe left = next category
        const nextCategory = currentIndex === -1 ? categories[0].key : categories[currentIndex + 1].key
        setSelectedCategory(nextCategory)
      } else if (isRightSwipe && currentIndex > -1) {
        // Swipe right = previous category
        const prevCategory = currentIndex === 0 ? null : categories[currentIndex - 1].key
        setSelectedCategory(prevCategory)
      }
    }
  }

  // Auto-scroll selected category button into view
  useEffect(() => {
    if (scrollRef.current && selectedCategory !== null) {
      // Escape special characters for CSS selector
      const escapedCategory = CSS.escape(selectedCategory)
      const selectedButton = scrollRef.current.querySelector(`[data-category="${escapedCategory}"]`)
      if (selectedButton) {
        selectedButton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
      }
    }
  }, [selectedCategory])

  return (
    <div
      className="container mx-auto px-4 py-8 max-w-6xl"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Header with animation */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-purple to-primary-indigo bg-clip-text text-transparent mb-4">
          🍽️ Étlap & Itallap
        </h1>
        <p className="text-gray-600 text-lg">
          Böngésszen kínálatunkban, vagy keressen konkrét termékre
        </p>
        <p className="text-sm text-gray-400 mt-2">
          💡 Mobilon: húzza jobbra/balra a kategóriák közti váltáshoz
        </p>
      </div>

      {/* Search Bar with glow effect */}
      <div className="mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="relative">
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl">
            🔍
          </span>
          <input
            type="text"
            placeholder="Keresés az étlapon..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 border-2 border-gray-300 rounded-2xl
                       focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-primary-purple
                       shadow-lg transition-all duration-300 text-lg
                       hover:shadow-xl"
          />
        </div>
      </div>

      {/* Category Tabs with emojis */}
      <div className="mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div ref={scrollRef} className="flex gap-3 pb-3 overflow-x-auto snap-x snap-mandatory scroll-smooth">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium whitespace-nowrap
                       transition-all duration-300 transform hover:scale-105 snap-center shadow-md ${
              selectedCategory === null
                ? 'bg-gradient-to-r from-primary-purple to-primary-indigo text-white shadow-lg scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="text-2xl">🎯</span>
            <span>Összes</span>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
              {categories.reduce((sum, cat) => sum + cat.count, 0)}
            </span>
          </button>
          {categories.map((category) => (
            <button
              key={category.key}
              data-category={category.key}
              onClick={() => setSelectedCategory(category.key)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium whitespace-nowrap
                         transition-all duration-300 transform hover:scale-105 snap-center shadow-md ${
                selectedCategory === category.key
                  ? 'bg-gradient-to-r from-primary-purple to-primary-indigo text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-2xl">{category.emoji}</span>
              <span>{category.name}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                selectedCategory === category.key
                  ? 'bg-white/20'
                  : 'bg-purple-100 text-purple-700'
              }`}>
                {category.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Menu Categories and Items */}
      <div className="space-y-8">
        {categories
          .filter(cat => selectedCategory === null || cat.key === selectedCategory)
          .map((category, catIndex) => {
            const items = filterItems(menuData[category.key])
            if (items.length === 0) return null

            return (
              <div
                key={category.key}
                className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 animate-fade-in-up overflow-hidden"
                style={{ animationDelay: `${catIndex * 0.1}s` }}
              >
                {/* Category Header with gradient */}
                <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-purple-200">
                  <span className="text-4xl">{category.emoji}</span>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-purple to-primary-indigo bg-clip-text text-transparent">
                      {category.name}
                    </h2>
                    <p className="text-sm text-gray-500">{items.length} tétel</p>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-start p-4 rounded-xl
                                 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50
                                 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md
                                 border border-transparent hover:border-purple-200"
                      style={{
                        animation: 'fadeInSlide 0.4s ease-out',
                        animationDelay: `${index * 0.03}s`,
                        animationFillMode: 'both'
                      }}
                    >
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">
                          {item.name}
                        </h3>
                        {item.allergens && item.allergens.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {item.allergens.map((allergen, idx) => (
                              <span
                                key={idx}
                                className="text-xs bg-gradient-to-r from-yellow-100 to-orange-100
                                         text-yellow-900 px-2 py-1 rounded-full border border-yellow-200
                                         hover:scale-110 transition-transform cursor-help"
                                title={`Allergén: ${allergenNames[allergen] || allergen}`}
                              >
                                ⚠️ {allergenNames[allergen] || allergen}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="ml-4 font-bold text-primary-indigo text-xl whitespace-nowrap flex items-center gap-1">
                        <span className="text-2xl">💰</span>
                        {item.price}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
      </div>

      {/* No results message */}
      {categories.every(cat => filterItems(menuData[cat.key]).length === 0) && (
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-purple-50 rounded-2xl shadow-lg animate-fade-in">
          <span className="text-6xl mb-4 block">😕</span>
          <p className="text-gray-600 text-xl font-medium">
            Nem található találat "{searchTerm}" keresésre
          </p>
          <p className="text-gray-400 mt-2">Próbáljon más keresési kifejezést</p>
        </div>
      )}

      {/* Custom CSS animations */}
      <style>{`
        @keyframes fadeInSlide {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
          animation-fill-mode: both;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
          animation-fill-mode: both;
        }

        /* Hide scrollbar but keep functionality */
        .overflow-x-auto::-webkit-scrollbar {
          height: 4px;
        }

        .overflow-x-auto::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }

        .overflow-x-auto::-webkit-scrollbar-thumb {
          background: linear-gradient(to right, #7c3aed, #4f46e5);
          border-radius: 10px;
        }

        .overflow-x-auto::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to right, #6d28d9, #4338ca);
        }
      `}</style>
    </div>
  )
}

export default Menu
