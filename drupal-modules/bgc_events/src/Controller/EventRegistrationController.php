<?php

namespace Drupal\bgc_events\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

/**
 * Controller for event registration endpoints.
 */
class EventRegistrationController extends ControllerBase {

  /**
   * Load node by UUID.
   */
  private function loadNodeByUuid($uuid) {
    $nodes = \Drupal::entityTypeManager()
      ->getStorage('node')
      ->loadByProperties(['uuid' => $uuid]);

    if (empty($nodes)) {
      return NULL;
    }

    return reset($nodes);
  }

  /**
   * Register current user for an event.
   */
  public function register($uuid, Request $request) {
    $node = $this->loadNodeByUuid($uuid);

    if (!$node) {
      return new JsonResponse([
        'error' => 'Event not found',
      ], 404);
    }

    // Verify this is an event node
    if ($node->bundle() !== 'esemeny') {
      return new JsonResponse([
        'error' => 'Not an event node',
      ], 400);
    }

    $current_user = $this->currentUser();
    $user_id = $current_user->id();

    // Get current participants and waitlist
    $participants = $node->get('field_participants')->getValue();
    $waitlist = $node->get('field_waitlist')->getValue();
    $max_participants = (int) $node->get('field_max_participants')->value;

    // Check if user is already registered
    foreach ($participants as $participant) {
      if ($participant['target_id'] == $user_id) {
        return new JsonResponse([
          'status' => 'already_registered',
          'message' => 'Már regisztráltál erre az eseményre.',
        ], 200);
      }
    }

    // Check if user is already on waitlist
    foreach ($waitlist as $wait_user) {
      if ($wait_user['target_id'] == $user_id) {
        return new JsonResponse([
          'status' => 'already_on_waitlist',
          'message' => 'Már a várólistán vagy.',
        ], 200);
      }
    }

    // Check if event is full
    $participant_count = count($participants);
    if ($participant_count >= $max_participants) {
      // Add to waitlist
      $node->get('field_waitlist')->appendItem(['target_id' => $user_id]);
      $node->save();

      return new JsonResponse([
        'status' => 'waitlisted',
        'message' => 'Az esemény megtelt. Felkerültél a várólistára.',
        'waitlist_position' => count($waitlist) + 1,
      ], 200);
    }

    // Add to participants
    $node->get('field_participants')->appendItem(['target_id' => $user_id]);
    $node->save();

    return new JsonResponse([
      'status' => 'registered',
      'message' => 'Sikeresen regisztráltál az eseményre!',
      'participant_count' => $participant_count + 1,
      'max_participants' => $max_participants,
    ], 200);
  }

  /**
   * Unregister current user from an event.
   */
  public function unregister($uuid, Request $request) {
    $node = $this->loadNodeByUuid($uuid);

    if (!$node) {
      return new JsonResponse([
        'error' => 'Event not found',
      ], 404);
    }

    // Verify this is an event node
    if ($node->bundle() !== 'esemeny') {
      return new JsonResponse([
        'error' => 'Not an event node',
      ], 400);
    }

    $current_user = $this->currentUser();
    $user_id = $current_user->id();

    // Get current participants and waitlist
    $participants = $node->get('field_participants')->getValue();
    $waitlist = $node->get('field_waitlist')->getValue();

    // Check if user is in participants
    $was_participant = FALSE;
    foreach ($participants as $key => $participant) {
      if ($participant['target_id'] == $user_id) {
        $node->get('field_participants')->removeItem($key);
        $was_participant = TRUE;
        break;
      }
    }

    // If not in participants, check waitlist
    if (!$was_participant) {
      $was_on_waitlist = FALSE;
      foreach ($waitlist as $key => $wait_user) {
        if ($wait_user['target_id'] == $user_id) {
          $node->get('field_waitlist')->removeItem($key);
          $was_on_waitlist = TRUE;
          break;
        }
      }

      if (!$was_on_waitlist) {
        return new JsonResponse([
          'status' => 'not_registered',
          'message' => 'Nem vagy regisztrálva erre az eseményre.',
        ], 200);
      }

      $node->save();
      return new JsonResponse([
        'status' => 'removed_from_waitlist',
        'message' => 'Lekerültél a várólistáról.',
      ], 200);
    }

    // User was a participant - check if we can promote someone from waitlist
    if (!empty($waitlist) && count($waitlist) > 0) {
      // Get first person from waitlist
      $first_waitlist_user = array_shift($waitlist);

      // Remove from waitlist
      $node->set('field_waitlist', $waitlist);

      // Add to participants
      $node->get('field_participants')->appendItem(['target_id' => $first_waitlist_user['target_id']]);

      // TODO: Send notification to promoted user
    }

    $node->save();

    return new JsonResponse([
      'status' => 'unregistered',
      'message' => 'Sikeresen lejelentkeztél az eseményről.',
    ], 200);
  }

  /**
   * Get registration status for current user.
   */
  public function status($uuid, Request $request) {
    $node = $this->loadNodeByUuid($uuid);

    if (!$node) {
      return new JsonResponse([
        'error' => 'Event not found',
      ], 404);
    }

    // Verify this is an event node
    if ($node->bundle() !== 'esemeny') {
      return new JsonResponse([
        'error' => 'Not an event node',
      ], 400);
    }

    $current_user = $this->currentUser();
    $user_id = $current_user->id();

    // Get current participants and waitlist
    $participants = $node->get('field_participants')->getValue();
    $waitlist = $node->get('field_waitlist')->getValue();
    $max_participants = (int) $node->get('field_max_participants')->value;

    $is_registered = FALSE;
    $is_waitlisted = FALSE;
    $waitlist_position = NULL;

    // Check if user is in participants
    foreach ($participants as $participant) {
      if ($participant['target_id'] == $user_id) {
        $is_registered = TRUE;
        break;
      }
    }

    // Check if user is on waitlist
    if (!$is_registered) {
      foreach ($waitlist as $index => $wait_user) {
        if ($wait_user['target_id'] == $user_id) {
          $is_waitlisted = TRUE;
          $waitlist_position = $index + 1;
          break;
        }
      }
    }

    return new JsonResponse([
      'is_registered' => $is_registered,
      'is_waitlisted' => $is_waitlisted,
      'waitlist_position' => $waitlist_position,
      'participant_count' => count($participants),
      'waitlist_count' => count($waitlist),
      'max_participants' => $max_participants,
      'spots_available' => max(0, $max_participants - count($participants)),
    ], 200);
  }

}
