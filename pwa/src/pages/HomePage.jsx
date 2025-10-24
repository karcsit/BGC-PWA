import React from 'react'
import { Link } from 'react-router-dom'

function HomePage() {
  const menuItems = [
    {
      title: '🎲 Játékok',
      description: '1500+ társasjáték',
      link: '/games',
      color: 'bg-[#9acd32] hover:bg-[#8ab82d]'
    },
    {
      title: '📖 Játéknapló',
      description: 'Játékok nyilvántartása',
      link: '/game-log',
      color: 'bg-[#ef8118] hover:bg-[#d67215]'
    },
    {
      title: '🍽️ Menü',
      description: 'Ételek és italok',
      link: '/menu',
      color: 'bg-[#98191b] hover:bg-[#850f11]'
    },
    {
      title: '📅 Foglalás',
      description: 'Asztal foglalása',
      link: '/booking',
      color: 'bg-[#9acd32] hover:bg-[#8ab82d]'
    },
    {
      title: '🎉 Események',
      description: 'Programok és versenyek',
      link: '/events',
      color: 'bg-[#ef8118] hover:bg-[#d67215]'
    },
    {
      title: '👥 Játékostárs kereső',
      description: 'Találj társakat',
      link: '/player-finder',
      color: 'bg-[#9acd32] hover:bg-[#8ab82d]'
    },
    {
      title: 'ℹ️ Rólunk',
      description: 'Elérhetőség, nyitvatartás',
      link: '/about',
      color: 'bg-gray-800 hover:bg-gray-900'
    }
  ]

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Board Game Cafe
        </h1>
        <p className="text-xl text-gray-600 mb-1">
          Üllői út 46, Budapest 1084
        </p>
        <p className="text-lg text-gray-500">
          1500 társasjáték • Nyitva: Kedd-Vasárnap 17:00-23:00
        </p>
      </div>

      {/* Menu Cards Grid */}
      <div className="grid grid-cols-2 gap-4 px-2">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            to={item.link}
            className="block"
          >
            <div className={`${item.color} rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 p-6 min-h-[140px] flex flex-col justify-center items-center text-center`}>
              <div className="text-4xl mb-2">
                {item.title.split(' ')[0]}
              </div>
              <h2 className="text-white font-bold text-lg mb-1">
                {item.title.substring(item.title.indexOf(' ') + 1)}
              </h2>
              <p className="text-white/90 text-sm">
                {item.description}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Info Section */}
      <div className="mt-8 text-center text-gray-600 text-sm px-4">
        <p>Üdvözlünk a Board Game Cafe-ban!</p>
        <p>Válassz a menüből, hogy felfedezd kínálatunkat.</p>
      </div>
    </div>
  )
}

export default HomePage
