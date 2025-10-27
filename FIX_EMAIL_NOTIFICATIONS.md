# Email Értesítések Hibaelhárítása

## Probléma

Új Player Finder hirdetés létrehozásakor a Watchdog log szerint az értesítések elküldésre kerülnek:
```
New post notifications sent for post 6291
```

De a felhasználók nem kapják meg az emaileket.

## Diagnózis Lépések

### 1. Ellenőrizd a User Értesítési Beállításokat

Az email értesítések csak azoknak a felhasználóknak mennek el, akiknek **be van kapcsolva** a `field_notify_new_posts` mező.

**Ellenőrzés Drupal admin-ban:**

1. Jelentkezz be admin-ként: `https://jatsszokosan.hu/user/login`
2. Menj ide: **People** (`/admin/people`)
3. Keresd meg azt a felhasználót, akinek email-t kellett volna kapnia (pl. "karcsit@gmail.com" email címmel)
4. Kattints a **Edit** gombra a sorában
5. Görgess le és keresd meg ezeket a mezőket:
   - **"Notify about new Player Finder posts"** (`field_notify_new_posts`)
   - **"Notify about my events"** (`field_notify_my_events`)
   - **"Notify about applications"** (`field_notify_applications`)
6. **Pipáld be** a `field_notify_new_posts` mezőt
7. **Save** (Mentés)

**Vizuálisan:**
```
User account settings:
□ Profile picture
[x] Notify about new Player Finder posts     <-- EZ KELL BEPIPÁLNI!
[x] Notify about my events
[x] Notify about applications
```

### 2. Ellenőrizd, hogy a Mező Létezik-e

Ha a fenti mezők **nem jelennek meg** a user edit oldalon:

**Opció A: Mezők manuális hozzáadása**

1. Menj ide: **Configuration → Account settings → Manage fields** (`/admin/config/people/accounts/fields`)
2. Ellenőrizd, hogy léteznek-e ezek a mezők:
   - `field_notify_new_posts`
   - `field_notify_my_events`
   - `field_notify_applications`

**Ha NINCSENEK:**

A modul install hook-jának kellett volna létrehoznia ezeket. Próbáld újratelepíteni:

```bash
drush pmu player_finder_notifications -y
drush en player_finder_notifications -y
drush cr
```

**Opció B: Mezők manuális létrehozása**

Ha az újratelepítés sem segít, add hozzá manuálisan:

1. **Configuration → Account settings → Manage fields** (`/admin/config/people/accounts/fields`)
2. Kattints: **Add field**
3. Field type: **Boolean**
4. Label: **Notify about new Player Finder posts**
5. Machine name: `field_notify_new_posts`
6. Default value: **Checked** (1)
7. Save

Ismételd meg a másik két mezővel is.

### 3. Drush Parancsokkal Ellenőrzés

#### Listázd ki az összes user értesítési beállítását:

```bash
drush ev "
\$users = \Drupal::entityTypeManager()->getStorage('user')->loadByProperties(['status' => 1]);
foreach (\$users as \$user) {
  if (\$user->id() == 0) continue;
  echo 'User: ' . \$user->getDisplayName() . ' (' . \$user->getEmail() . ')' . PHP_EOL;
  echo '  field_notify_new_posts: ' . (\$user->hasField('field_notify_new_posts') ? (\$user->get('field_notify_new_posts')->value ? 'YES' : 'NO') : 'FIELD MISSING') . PHP_EOL;
  echo '  field_notify_my_events: ' . (\$user->hasField('field_notify_my_events') ? (\$user->get('field_notify_my_events')->value ? 'YES' : 'NO') : 'FIELD MISSING') . PHP_EOL;
  echo PHP_EOL;
}
"
```

Ez kiírja minden user esetében, hogy be van-e kapcsolva az értesítés.

#### Manuálisan kapcsold be egy usernek:

```bash
drush ev "
\$user = \Drupal::entityTypeManager()->getStorage('user')->load(YOUR_USER_ID);
if (\$user && \$user->hasField('field_notify_new_posts')) {
  \$user->set('field_notify_new_posts', 1);
  \$user->save();
  echo 'Notifications enabled for ' . \$user->getDisplayName();
}
"
```

Cseréld ki a `YOUR_USER_ID`-t a tényleges user ID-re (pl. `2`, `3`, stb.).

### 4. Teszt Email Küldés

Próbáld meg manuálisan meghívni az email service-t egy létező node-ra:

```bash
drush ev "
\$node_id = 6291; // A legutóbbi player_finder post ID
\$node = \Drupal::entityTypeManager()->getStorage('node')->load(\$node_id);
if (\$node) {
  \$email_service = \Drupal::service('player_finder_notifications.email_service');
  \$result = \$email_service->sendNewPostNotifications(\$node);
  echo \$result ? 'Emails sent!' : 'No emails sent (no users with notifications enabled)';
}
"
```

### 5. Email Delivery Ellenőrzés

Ha a mezők be vannak kapcsolva, de még mindig nem érkeznek az emailek:

#### A. Ellenőrizd az Email Configuration-t

```bash
drush ev "
\$config = \Drupal::config('system.site');
echo 'Site email: ' . \$config->get('mail') . PHP_EOL;
"
```

#### B. Küldj teszt emailt:

```bash
drush ev "
\$mail_manager = \Drupal::service('plugin.manager.mail');
\$params = ['subject' => 'Test', 'body' => 'Test email from Drupal'];
\$result = \$mail_manager->mail('system', 'mail', 'DESTINATION_EMAIL@example.com', 'en', \$params);
echo \$result['result'] ? 'Test email sent!' : 'Test email failed!';
"
```

Cseréld ki a `DESTINATION_EMAIL@example.com`-ot a saját email címedre.

#### C. Ellenőrizd a Mail System beállítást:

**Configuration → System → Mail System** (`/admin/config/system/mailsystem`)

Ha **SMTP modul** van telepítve, ellenőrizd:
- **Configuration → System → SMTP Authentication Support** (`/admin/config/system/smtp`)

#### D. Ellenőrizd a Watchdog log-ot részletesebben:

```bash
drush watchdog:show --type=player_finder_notifications --extended
```

vagy

```bash
drush watchdog:show --type=mail --extended
```

### 6. Spam Mappa Ellenőrzés

Ne feledd ellenőrizni a **spam/junk** mappát is az email fiókodban!

## Leggyakoribb Problémák és Megoldások

### ❌ Probléma: "New post notifications sent" log van, de nincs email

**Ok:** A `field_notify_new_posts` mező nincs bekapcsolva egyetlen usernél sem.

**Megoldás:** Kapcsold be a mezőt a user edit oldalon (lásd 1. pont)

### ❌ Probléma: A mező nem jelenik meg a user edit oldalon

**Ok:** A modul install hook nem futott le, vagy a mezők nem jöttek létre.

**Megoldás:**
```bash
drush pmu player_finder_notifications -y
drush en player_finder_notifications -y
drush cr
```

### ❌ Probléma: Emailek egyáltalán nem mennek ki

**Ok:** SMTP/Email konfiguráció probléma a szerveren.

**Megoldás:** Telepítsd és konfiguráld az SMTP modult:
```bash
composer require drupal/smtp
drush en smtp -y
```

Majd: **Configuration → System → SMTP Authentication Support**

### ❌ Probléma: A creator is megkapja az emailt

**Ok:** A kód szűri, ne aggódj. A creator NEM kapja meg (lásd EmailService.php:154).

```php
// Don't send notification to the post creator
if ($user->id() == $node->getOwnerId()) {
  continue;
}
```

## Ellenőrző Lista

- [ ] `field_notify_new_posts` mező létezik a user entity-n
- [ ] A mező be van kapcsolva legalább 1 user-nél
- [ ] A user aktív (status = 1)
- [ ] A user NEM a hirdetés létrehozója
- [ ] Email konfiguráció működik (teszt email sikeres)
- [ ] Spam mappa ellenőrizve
- [ ] Cache ürítve: `drush cr`

## Ha Minden Rendben, de Még Mindig Nincs Email

1. Ellenőrizd a server mail log-ot:
   ```bash
   tail -f /var/log/mail.log
   # vagy
   tail -f /var/log/maillog
   ```

2. Nézd meg a Drupal dblog-ot részletesen:
   ```bash
   drush watchdog:tail --extended
   ```

3. Próbáld meg a `sendmail` parancsot közvetlenül:
   ```bash
   echo "Test email" | mail -s "Test Subject" your@email.com
   ```

## Gyors Fix Script

Ha mindent egyszerre akarsz ellenőrizni:

```bash
drush ev "
echo '=== EMAIL NOTIFICATION DIAGNOSTIC ===' . PHP_EOL . PHP_EOL;

// 1. Check if fields exist
\$field_storage = \Drupal\field\Entity\FieldStorageConfig::loadByName('user', 'field_notify_new_posts');
echo '1. Field exists: ' . (\$field_storage ? 'YES' : 'NO') . PHP_EOL;

// 2. Count users with notifications enabled
\$query = \Drupal::entityTypeManager()->getStorage('user')->getQuery()
  ->condition('status', 1)
  ->condition('field_notify_new_posts', 1)
  ->accessCheck(FALSE);
\$count = \$query->count()->execute();
echo '2. Users with notifications enabled: ' . \$count . PHP_EOL;

// 3. List those users
if (\$count > 0) {
  \$uids = \$query->execute();
  \$users = \Drupal::entityTypeManager()->getStorage('user')->loadMultiple(\$uids);
  echo '3. Users:' . PHP_EOL;
  foreach (\$users as \$user) {
    echo '   - ' . \$user->getDisplayName() . ' (' . \$user->getEmail() . ')' . PHP_EOL;
  }
}

// 4. Check mail config
\$site_mail = \Drupal::config('system.site')->get('mail');
echo '4. Site email: ' . \$site_mail . PHP_EOL;

echo PHP_EOL . '=== END DIAGNOSTIC ===' . PHP_EOL;
"
```

Futtasd ezt a scriptet, és küldd el az eredményt!
