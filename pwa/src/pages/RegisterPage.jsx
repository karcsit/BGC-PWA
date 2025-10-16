import React from 'react'
import { Link } from 'react-router-dom'

const RegisterPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 animate-fade-in-up">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-gradient-to-r from-primary-purple to-primary-indigo rounded-full mb-4">
              <span className="text-4xl">🎮</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-purple to-primary-indigo bg-clip-text text-transparent mb-2">
              Csatlakozz hozzánk!
            </h1>
            <p className="text-gray-600">
              Hozz létre egy fiókot a Board Game Cafe-ban
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <span className="text-3xl">💡</span>
              <div>
                <h3 className="font-bold text-blue-900 mb-2 text-lg">
                  Miért a Drupal regisztrációs oldalon?
                </h3>
                <ul className="text-blue-800 space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-0.5">✓</span>
                    <span><strong>Biztonságosabb:</strong> CAPTCHA védelem spam ellen</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-0.5">✓</span>
                    <span><strong>Email megerősítés:</strong> Biztos, hogy eléred a fiókod</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-0.5">✓</span>
                    <span><strong>Admin moderáció:</strong> Kontrollált közösség</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-0.5">✓</span>
                    <span><strong>Egyszeri alkalom:</strong> Utána már bejelentkezhetsz a PWA-ból! 🎉</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="mb-8">
            <h3 className="font-bold text-gray-800 mb-4 text-lg">📝 Hogyan történik a regisztráció?</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-primary-purple to-primary-indigo text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Kattints a regisztrációs gombra</h4>
                  <p className="text-gray-600 text-sm">Új ablakban megnyílik a Drupal regisztrációs oldal</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-primary-purple to-primary-indigo text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Töltsd ki a regisztrációs űrlapot</h4>
                  <p className="text-gray-600 text-sm">Felhasználónév, email, jelszó (+ esetleg CAPTCHA)</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-primary-purple to-primary-indigo text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Erősítsd meg az email címed</h4>
                  <p className="text-gray-600 text-sm">Kapni fogsz egy megerősítő emailt (ellenőrizd a spam mappát is!)</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-primary-purple to-primary-indigo text-white rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Gyere vissza és jelentkezz be!</h4>
                  <p className="text-gray-600 text-sm">Ezután már innen tudsz bejelentkezni a PWA-ból 🎲</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main CTA Button */}
          <a
            href="https://dr11.webgraf.hu/web/user/register"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-4 bg-gradient-to-r from-primary-purple to-primary-indigo text-white
                     text-center font-bold text-lg rounded-xl shadow-lg
                     hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]
                     transition-all duration-300"
          >
            🔗 Regisztráció indítása
          </a>

          <p className="text-center text-sm text-gray-500 mt-4">
            Új ablakban nyílik meg a Board Game Cafe regisztrációs oldala
          </p>

          {/* Divider */}
          <div className="my-8 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500">vagy</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Már van fiókod?
            </p>
            <Link
              to="/login"
              className="inline-block px-6 py-3 border-2 border-primary-purple text-primary-purple
                       font-semibold rounded-xl
                       hover:bg-primary-purple hover:text-white
                       transition-all duration-300"
            >
              Bejelentkezés itt a PWA-ból
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-gray-600 hover:text-primary-purple transition-colors"
          >
            ← Vissza a főoldalra
          </Link>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
      `}</style>
    </div>
  )
}

export default RegisterPage
