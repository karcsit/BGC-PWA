# Event Management Implementation Guide

## Eddig Elkészült ✅

1. **Permissions Helper** (`src/utils/permissions.js`)
   - `canManageEvents(user)` - Ellenőrzi hogy Editor vagy Admin
   - `hasRole(user, role)` - Általános role ellenőrző

2. **EventService CRUD műveletek** (`src/services/eventService.js`)
   - `createEvent(eventData)` - Új esemény létrehozása
   - `updateEvent(eventId, eventData)` - Esemény szerkesztése
   - `deleteEvent(eventId)` - Esemény törlése
   - `getEventParticipants(eventId)` - Résztvevők listája

3. **EventFormPage** (`src/pages/EventFormPage.jsx`)
   - Új esemény létrehozása
   - Meglévő esemény szerkesztése
   - Jogosultság ellenőrzés

## Hátralevő Feladatok 📋

### 1. Add Routes to App.jsx

```javascript
// Add import
import EventFormPage from './pages/EventFormPage'

// Add routes (line 108 után):
<Route
  path="/events/new"
  element={
    <ProtectedRoute>
      <EventFormPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/events/:eventId/edit"
  element={
    <ProtectedRoute>
      <EventFormPage />
    </ProtectedRoute>
  }
/>
```

### 2. Update EventsPage.jsx - Add "New Event" Button

```javascript
// Add at top
import { canManageEvents } from '../utils/permissions'

// After title (line 80 után):
{canManageEvents(user) && (
  <Link
    to="/events/new"
    className="inline-block px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:shadow-xl transition-all"
  >
    ➕ Új esemény létrehozása
  </Link>
)}
```

### 3. Update EventCard.jsx - Add Edit/Delete Buttons & Participants List

```javascript
// Add imports
import { canManageEvents } from '../utils/permissions'
import { deleteEvent, getEventParticipants } from '../services/eventService'
import { useNavigate } from 'react-router-dom'

// Add state
const [showParticipants, setShowParticipants] = useState(false)
const [participants, setParticipants] = useState(null)
const navigate = useNavigate()

// Add functions
const handleDelete = async () => {
  if (!confirm('Biztosan törölni szeretnéd ezt az eseményt?')) return

  try {
    await deleteEvent(eventId)
    alert('Esemény törölve!')
    window.location.reload()
  } catch (error) {
    alert('Hiba történt a törlés során')
  }
}

const loadParticipants = async () => {
  if (participants) {
    setShowParticipants(!showParticipants)
    return
  }

  try {
    const data = await getEventParticipants(eventId)
    setParticipants(data)
    setShowParticipants(true)
  } catch (error) {
    alert('Nem sikerült betölteni a résztvevőket')
  }
}

// Add UI after the event info (line 195 előtt):
{canManageEvents(user) && (
  <div className="mb-4 flex gap-2 border-t pt-4">
    <button
      onClick={() => navigate(`/events/${eventId}/edit`)}
      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
    >
      ✏️ Szerkesztés
    </button>
    <button
      onClick={handleDelete}
      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
    >
      🗑️ Törlés
    </button>
    <button
      onClick={loadParticipants}
      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700"
    >
      👥 Résztvevők
    </button>
  </div>
)}

{/* Participants List */}
{showParticipants && participants && (
  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
    <h4 className="font-bold text-gray-800 mb-2">Jelentkezők:</h4>

    {/* Registered */}
    {participants.participants?.length > 0 && (
      <div className="mb-3">
        <p className="text-sm text-gray-600 mb-1">Elfogadott ({participants.participants.length}):</p>
        <ul className="space-y-1">
          {participants.participants.map((p, i) => (
            <li key={i} className="text-sm">✓ {p}</li>
          ))}
        </ul>
      </div>
    )}

    {/* Waitlist */}
    {participants.waitlist?.length > 0 && (
      <div>
        <p className="text-sm text-gray-600 mb-1">Várólistán ({participants.waitlist.length}):</p>
        <ul className="space-y-1">
          {participants.waitlist.map((p, i) => (
            <li key={i} className="text-sm text-orange-600">⏳ {p}</li>
          ))}
        </ul>
      </div>
    )}

    {participants.participants?.length === 0 && participants.waitlist?.length === 0 && (
      <p className="text-sm text-gray-500">Még nincs jelentkező</p>
    )}
  </div>
)}
```

### 4. Drupal Backend - API Endpoint Szükséges

**FONTOS**: A `GET /api/event/{eventId}/participants` endpoint még nem létezik a Drupal oldalon!

Létre kell hozni egy custom endpointot a `bgc_events` modulban:

```php
// modules/custom/bgc_events/src/Controller/EventController.php

/**
 * Get participants list with names
 *
 * @param string $event_id
 * @return JsonResponse
 */
public function getParticipants($event_id) {
  $node = \Drupal::entityTypeManager()->getStorage('node')->load($event_id);

  if (!$node || $node->bundle() !== 'esemeny') {
    return new JsonResponse(['error' => 'Event not found'], 404);
  }

  $participants = [];
  $waitlist = [];

  // Get participants
  if ($node->hasField('field_participants') && !$node->get('field_participants')->isEmpty()) {
    foreach ($node->get('field_participants')->referencedEntities() as $user) {
      $participants[] = $user->getDisplayName();
    }
  }

  // Get waitlist
  if ($node->hasField('field_waitlist') && !$node->get('field_waitlist')->isEmpty()) {
    foreach ($node->get('field_waitlist')->referencedEntities() as $user) {
      $waitlist[] = $user->getDisplayName();
    }
  }

  return new JsonResponse([
    'participants' => $participants,
    'waitlist' => $waitlist,
    'participant_count' => count($participants),
    'waitlist_count' => count($waitlist),
  ]);
}
```

```yaml
# modules/custom/bgc_events/bgc_events.routing.yml
bgc_events.get_participants:
  path: '/api/event/{event_id}/participants'
  defaults:
    _controller: '\Drupal\bgc_events\Controller\EventController::getParticipants'
  requirements:
    _permission: 'access content'
  methods: [GET]
```

## Build & Deploy

```bash
cd pwa
npm run build
powershell "Compress-Archive -Path 'dist/*' -DestinationPath '../jatsszokosan-pwa-LATEST.zip' -Force"
```

## Tesztelési Checklist

- [ ] Editor user be tud jelentkezni
- [ ] "Új esemény" gomb megjelenik Editor-nak
- [ ] Új esemény létrehozása működik
- [ ] Esemény szerkesztése működik
- [ ] Esemény törlése működik (megerősítéssel)
- [ ] Résztvevők lista megjelenik
- [ ] Non-Editor user nem látja a gombokat
- [ ] Védett route-ok működnek (redirectel login-ra)

## Következő Lépések (Opcionális)

1. **Image Upload**: Esemény képfeltöltés
2. **Rich Text Editor**: Body mező formázása
3. **Event Categories**: Események kategorizálása
4. **Export Participants**: CSV export a résztvevőkről
5. **Email Notifications**: Értesítések küldése
