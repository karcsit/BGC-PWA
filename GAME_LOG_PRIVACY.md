# Játéknapló Láthatóság / Privacy Funkció

## Probléma

Jelenleg minden játéknapló bejegyzés minden felhasználó számára látható az "Összes" fülön. Nincs lehetőség privát bejegyzésekre vagy megosztásra konkrét személyekkel.

## Megoldás

### Drupal Oldal - Field Hozzáadása

**1. Láthatóság mező létrehozása**

Navigálj a Drupal adminban:
- **Structure → Content types → Game Log → Manage fields**
- Kattints: **Add field**

**Field típus:** List (text)
**Label:** Láthatóság / Visibility
**Machine name:** `field_visibility`

**Allowed values:**
```
private|Privát (csak én látom)
public|Nyilvános (mindenki látja)
shared|Megosztott (kiválasztott személyekkel)
```

**Default value:** `private` (biztonságosabb alapértelmezés)

---

**2. Megosztott személyek mező (opcionális)**

Ha a "Megosztott" opciót választjuk, kiválaszthatjuk, hogy kik láthassák.

**Field típus:** Entity reference
**Label:** Megosztva ezekkel
**Machine name:** `field_shared_with`
**Reference type:** User
**Allowed number of values:** Unlimited

**Field beállítások:**
- **Required:** No (csak akkor kötelező, ha visibility = shared)
- **Widget:** Autocomplete (tagging style)

---

**3. JSON:API Hozzáférés Beállítása**

A Drupal JSON:API automatikusan szűrni fogja a bejegyzéseket a bejelentkezett user alapján, DE ezt explicit módon kell beállítani.

**Opció A: View Mode használata**

Hozz létre egy custom View-t (`/admin/structure/views`):
- **View type:** Content (Game Log)
- **Display:** REST export vagy JSON:API
- **Contextual filter:** Current user

**Opció B: Custom Access Control (fejlettebb)**

Készíts egy custom modult `game_log_access` néven:

```php
<?php
// modules/custom/game_log_access/game_log_access.module

use Drupal\Core\Access\AccessResult;
use Drupal\Core\Session\AccountInterface;
use Drupal\node\NodeInterface;

/**
 * Implements hook_node_access().
 */
function game_log_access_node_access(NodeInterface $node, $op, AccountInterface $account) {
  // Only apply to game_log content type
  if ($node->bundle() !== 'game_log') {
    return AccessResult::neutral();
  }

  // Allow view operation
  if ($op === 'view') {
    // Owner can always view
    if ($node->getOwnerId() == $account->id()) {
      return AccessResult::allowed()->cachePerUser();
    }

    // Check visibility field
    $visibility = $node->get('field_visibility')->value;

    switch ($visibility) {
      case 'public':
        // Public: everyone can view
        return AccessResult::allowed();

      case 'private':
        // Private: only owner
        return AccessResult::forbiddenIf($node->getOwnerId() != $account->id())
          ->cachePerUser();

      case 'shared':
        // Shared: owner + shared_with users
        $shared_with = $node->get('field_shared_with')->referencedEntities();
        $shared_uids = array_map(function($user) {
          return $user->id();
        }, $shared_with);

        $canView = in_array($account->id(), $shared_uids) || $node->getOwnerId() == $account->id();
        return AccessResult::forbiddenIf(!$canView)->cachePerUser();

      default:
        // Default: deny
        return AccessResult::forbidden();
    }
  }

  return AccessResult::neutral();
}
```

**game_log_access.info.yml:**
```yaml
name: 'Game Log Access Control'
type: module
description: 'Custom access control for game log visibility'
core_version_requirement: ^11
package: Custom
dependencies:
  - node
```

**Telepítés:**
```bash
drush en game_log_access -y
drush cr
```

---

## Frontend Oldal - PWA Módosítások

### 1. GameLogFormPage - Láthatóság Választó

Adj hozzá egy új mezőt az űrlaphoz:

```javascript
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Láthatóság 👁️
  </label>
  <select
    name="visibility"
    value={formData.visibility}
    onChange={handleChange}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-purple"
    required
  >
    <option value="private">🔒 Privát (csak én látom)</option>
    <option value="public">🌍 Nyilvános (mindenki látja)</option>
    <option value="shared">👥 Megosztott (kiválasztott személyekkel)</option>
  </select>
</div>

{/* Conditional: Show user selector if shared */}
{formData.visibility === 'shared' && (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Megosztva ezekkel
    </label>
    <UserMultiSelect
      value={formData.sharedWith}
      onChange={(users) => setFormData({...formData, sharedWith: users})}
    />
  </div>
)}
```

### 2. gameLogService.js - POST Request Frissítése

```javascript
field_visibility: gameLogData.visibility || 'private',
field_shared_with: gameLogData.visibility === 'shared' && gameLogData.sharedWith
  ? gameLogData.sharedWith.map(userId => ({
      type: 'user--user',
      id: userId
    }))
  : []
```

### 3. GameLogPage - Láthatóság Ikon Megjelenítése

A játéknapló kártyán mutasd meg, hogy milyen láthatóságú:

```javascript
{/* Visibility Badge */}
<div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
  {log.visibility === 'private' && <span>🔒 Privát</span>}
  {log.visibility === 'public' && <span>🌍 Nyilvános</span>}
  {log.visibility === 'shared' && (
    <span>👥 Megosztva ({log.sharedWithCount} személlyel)</span>
  )}
</div>
```

### 4. Szűrés Frontend Oldalon (Kiegészítő)

Bár a Drupal már szűr, a frontend oldalon is szűrheted biztonság kedvéért:

```javascript
const visibleLogs = gameLogs.filter(log => {
  // Always show own logs
  if (log.createdBy === user?.id) return true

  // Check visibility
  if (log.visibility === 'public') return true
  if (log.visibility === 'private') return false
  if (log.visibility === 'shared') {
    return log.sharedWith?.includes(user?.id)
  }

  return false
})
```

---

## Migrálás Meglévő Bejegyzésekhez

Ha már vannak meglévő játéknapló bejegyzések, azokhoz is be kell állítani a láthatóságot:

```bash
drush ev "
\$nodes = \Drupal::entityTypeManager()
  ->getStorage('node')
  ->loadByProperties(['type' => 'game_log']);

foreach (\$nodes as \$node) {
  if (!\$node->hasField('field_visibility') || empty(\$node->get('field_visibility')->value)) {
    \$node->set('field_visibility', 'public'); // Vagy 'private' ha biztonságosabb
    \$node->save();
    echo 'Updated: ' . \$node->id() . PHP_EOL;
  }
}

echo 'Migration complete!' . PHP_EOL;
"
```

---

## UI/UX Javaslatok

### Láthatóság Ikonok

- 🔒 Privát - Piros/szürke
- 🌍 Nyilvános - Zöld
- 👥 Megosztott - Kék

### Tooltip-ek

Adj hozzá tooltip-eket, hogy a user értse, mit jelentenek:
- **Privát:** Csak te látod ezt a bejegyzést
- **Nyilvános:** Mindenki láthatja a közösségben
- **Megosztott:** Csak a kiválasztott személyek látják

### Gyors Váltás

Az "Összes" fülön legyen egy gyors szűrő:
- [ ] Csak nyilvános bejegyzések
- [ ] Velem megosztott bejegyzések

---

## Tesztelés

1. Hozz létre 3 játéknapló bejegyzést különböző láthatósági beállításokkal
2. Jelentkezz be különböző userek-kel
3. Ellenőrizd, hogy mindegyik user csak azt látja, amit látnia kell:
   - **User A (owner):** Látja mind a 3-at
   - **User B (shared with):** Látja a public-ot és a shared-et
   - **User C (nem shared):** Csak a public-ot látja

---

## Prioritás

**Most azonnal (alapvető funkció):**
1. ✅ field_visibility mező hozzáadása (private/public/shared)
2. ✅ Default érték: "private"
3. ✅ Frontend form frissítése

**Később (extra funkció):**
4. field_shared_with mező + user selector
5. Access control hook
6. Migration script meglévő bejegyzésekhez

---

## Összefoglalás

A láthatóság funkció hozzáadásával:
- ✅ **Privacy:** Felhasználók dönthetnek, hogy kik lássák a bejegyzéseiket
- ✅ **Flexibility:** 3 szintű láthatóság (privát, nyilvános, megosztott)
- ✅ **Security:** Drupal access control + frontend validáció
- ✅ **User Experience:** Egyértelmű ikonok és tooltip-ek
