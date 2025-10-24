<?php

namespace Drupal\player_finder_notifications\Service;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\Component\Datetime\TimeInterface;

/**
 * Service for managing automated reminders and status updates.
 */
class ReminderService {

  /**
   * The entity type manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * The email service.
   *
   * @var \Drupal\player_finder_notifications\Service\EmailService
   */
  protected $emailService;

  /**
   * The logger.
   *
   * @var \Drupal\Core\Logger\LoggerChannelInterface
   */
  protected $logger;

  /**
   * The time service.
   *
   * @var \Drupal\Component\Datetime\TimeInterface
   */
  protected $time;

  /**
   * Constructs a ReminderService object.
   */
  public function __construct(
    EntityTypeManagerInterface $entity_type_manager,
    EmailService $email_service,
    LoggerChannelFactoryInterface $logger_factory,
    TimeInterface $time
  ) {
    $this->entityTypeManager = $entity_type_manager;
    $this->emailService = $email_service;
    $this->logger = $logger_factory->get('player_finder_notifications');
    $this->time = $time;
  }

  /**
   * Send reminder emails for events happening in 24 hours.
   */
  public function sendUpcomingEventReminders() {
    $current_time = $this->time->getRequestTime();
    $reminder_window_start = $current_time + (23 * 3600); // 23 hours from now
    $reminder_window_end = $current_time + (25 * 3600);   // 25 hours from now

    $node_storage = $this->entityTypeManager->getStorage('node');

    // Find events happening in 24 hours that haven't had reminder sent
    $query = $node_storage->getQuery()
      ->condition('type', 'player_finder')
      ->condition('status', 1) // Published
      ->condition('field_status', 'active') // Active status
      ->condition('field_event_date', $reminder_window_start, '>=')
      ->condition('field_event_date', $reminder_window_end, '<=')
      ->condition('field_reminder_sent', 0) // Reminder not yet sent
      ->accessCheck(FALSE);

    $nids = $query->execute();

    if (empty($nids)) {
      $this->logger->info('No events found needing reminder emails.');
      return;
    }

    $nodes = $node_storage->loadMultiple($nids);
    $sent_count = 0;

    foreach ($nodes as $node) {
      try {
        // Get all participants (owner + applicants)
        $participants = $this->getEventParticipants($node);

        if (empty($participants)) {
          $this->logger->warning('No participants found for event @nid, skipping reminder.', [
            '@nid' => $node->id(),
          ]);
          continue;
        }

        // Send reminder emails
        $success = $this->emailService->sendEventReminder($node, $participants);

        if ($success) {
          // Mark reminder as sent
          $node->set('field_reminder_sent', 1);
          $node->save();
          $sent_count++;

          $this->logger->info('Reminder sent for event @nid to @count participants', [
            '@nid' => $node->id(),
            '@count' => count($participants),
          ]);
        }
      }
      catch (\Exception $e) {
        $this->logger->error('Error sending reminder for event @nid: @message', [
          '@nid' => $node->id(),
          '@message' => $e->getMessage(),
        ]);
      }
    }

    $this->logger->info('Sent @count reminder emails out of @total events', [
      '@count' => $sent_count,
      '@total' => count($nids),
    ]);
  }

  /**
   * Update status of expired events to 'expired'.
   */
  public function updateExpiredEventStatus() {
    $current_time = $this->time->getRequestTime();
    $node_storage = $this->entityTypeManager->getStorage('node');

    // Find events that have passed and are still marked as active
    $query = $node_storage->getQuery()
      ->condition('type', 'player_finder')
      ->condition('status', 1) // Published
      ->condition('field_status', 'active') // Active status
      ->condition('field_event_date', $current_time, '<') // Event date in the past
      ->accessCheck(FALSE);

    $nids = $query->execute();

    if (empty($nids)) {
      $this->logger->info('No expired events found to update.');
      return;
    }

    $nodes = $node_storage->loadMultiple($nids);
    $updated_count = 0;

    foreach ($nodes as $node) {
      try {
        $node->set('field_status', 'expired');
        $node->save();
        $updated_count++;

        $this->logger->info('Event @nid marked as expired', [
          '@nid' => $node->id(),
        ]);
      }
      catch (\Exception $e) {
        $this->logger->error('Error updating event @nid status: @message', [
          '@nid' => $node->id(),
          '@message' => $e->getMessage(),
        ]);
      }
    }

    $this->logger->info('Updated @count expired events', [
      '@count' => $updated_count,
    ]);
  }

  /**
   * Get all participants for an event (owner + applicants).
   *
   * @param \Drupal\node\NodeInterface $node
   *   The Player Finder node.
   *
   * @return array
   *   Array of user objects.
   */
  protected function getEventParticipants($node) {
    $participants = [];

    // Add the event owner
    $owner = $node->getOwner();
    if ($owner && $owner->isActive()) {
      // Check if owner wants event reminders
      if ($owner->hasField('field_notify_my_events') &&
          $owner->get('field_notify_my_events')->value) {
        $participants[$owner->id()] = $owner;
      }
    }

    // Get all applications for this event
    // This depends on how you're storing applications
    // If applications are separate nodes with a reference to the player_finder node:
    $application_storage = $this->entityTypeManager->getStorage('node');
    $query = $application_storage->getQuery()
      ->condition('type', 'player_finder_application')
      ->condition('field_finder_post.target_id', $node->id())
      ->condition('status', 1)
      ->accessCheck(FALSE);

    $application_nids = $query->execute();

    if (!empty($application_nids)) {
      $applications = $application_storage->loadMultiple($application_nids);

      foreach ($applications as $application) {
        $applicant = $application->getOwner();
        if ($applicant && $applicant->isActive()) {
          // Check if applicant wants event reminders
          if ($applicant->hasField('field_notify_my_events') &&
              $applicant->get('field_notify_my_events')->value) {
            $participants[$applicant->id()] = $applicant;
          }
        }
      }
    }

    return $participants;
  }

}
