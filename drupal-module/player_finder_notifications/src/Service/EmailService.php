<?php

namespace Drupal\player_finder_notifications\Service;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Mail\MailManagerInterface;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\node\NodeInterface;
use Drupal\user\UserInterface;

/**
 * Service for sending email notifications.
 */
class EmailService {

  /**
   * The entity type manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * The mail manager.
   *
   * @var \Drupal\Core\Mail\MailManagerInterface
   */
  protected $mailManager;

  /**
   * The config factory.
   *
   * @var \Drupal\Core\Config\ConfigFactoryInterface
   */
  protected $configFactory;

  /**
   * The logger.
   *
   * @var \Drupal\Core\Logger\LoggerChannelInterface
   */
  protected $logger;

  /**
   * The current user.
   *
   * @var \Drupal\Core\Session\AccountProxyInterface
   */
  protected $currentUser;

  /**
   * Constructs an EmailService object.
   */
  public function __construct(
    EntityTypeManagerInterface $entity_type_manager,
    MailManagerInterface $mail_manager,
    ConfigFactoryInterface $config_factory,
    LoggerChannelFactoryInterface $logger_factory,
    AccountProxyInterface $current_user
  ) {
    $this->entityTypeManager = $entity_type_manager;
    $this->mailManager = $mail_manager;
    $this->configFactory = $config_factory;
    $this->logger = $logger_factory->get('player_finder_notifications');
    $this->currentUser = $current_user;
  }

  /**
   * Send reminder email to event participants 24 hours before event.
   *
   * @param \Drupal\node\NodeInterface $node
   *   The Player Finder node.
   * @param array $participants
   *   Array of user objects (participants).
   *
   * @return bool
   *   TRUE if emails were sent successfully.
   */
  public function sendEventReminder(NodeInterface $node, array $participants) {
    if (empty($participants)) {
      return FALSE;
    }

    $success = TRUE;
    foreach ($participants as $user) {
      if (!$user instanceof UserInterface) {
        continue;
      }

      $params = [
        'node' => $node,
        'user' => $user,
        'participants' => $participants,
      ];

      $result = $this->mailManager->mail(
        'player_finder_notifications',
        'event_reminder',
        $user->getEmail(),
        $user->getPreferredLangcode(),
        $params,
        NULL,
        TRUE
      );

      if ($result['result'] !== TRUE) {
        $this->logger->error('Failed to send reminder email to @email for event @nid', [
          '@email' => $user->getEmail(),
          '@nid' => $node->id(),
        ]);
        $success = FALSE;
      }
      else {
        $this->logger->info('Reminder email sent to @email for event @nid', [
          '@email' => $user->getEmail(),
          '@nid' => $node->id(),
        ]);
      }
    }

    return $success;
  }

  /**
   * Send notification emails to users when a new post is created.
   *
   * @param \Drupal\node\NodeInterface $node
   *   The newly created Player Finder node.
   *
   * @return bool
   *   TRUE if emails were sent successfully.
   */
  public function sendNewPostNotifications(NodeInterface $node) {
    // Get all users who have notifications enabled
    $user_storage = $this->entityTypeManager->getStorage('user');
    $query = $user_storage->getQuery()
      ->condition('status', 1)
      ->condition('field_notify_new_posts', 1)
      ->accessCheck(FALSE);

    $uids = $query->execute();

    if (empty($uids)) {
      return FALSE;
    }

    $users = $user_storage->loadMultiple($uids);
    $success = TRUE;

    foreach ($users as $user) {
      // Don't send notification to the post creator
      if ($user->id() == $node->getOwnerId()) {
        continue;
      }

      $params = [
        'node' => $node,
        'user' => $user,
      ];

      $result = $this->mailManager->mail(
        'player_finder_notifications',
        'new_post',
        $user->getEmail(),
        $user->getPreferredLangcode(),
        $params,
        NULL,
        TRUE
      );

      if ($result['result'] !== TRUE) {
        $this->logger->error('Failed to send new post notification to @email for post @nid', [
          '@email' => $user->getEmail(),
          '@nid' => $node->id(),
        ]);
        $success = FALSE;
      }
    }

    return $success;
  }

  /**
   * Send invitation emails to selected users.
   *
   * @param \Drupal\node\NodeInterface $node
   *   The Player Finder node.
   * @param array $user_ids
   *   Array of user IDs to invite.
   *
   * @return array
   *   Array with 'success' => count of successful sends, 'failed' => count of failures.
   */
  public function sendInvitations(NodeInterface $node, array $user_ids) {
    $user_storage = $this->entityTypeManager->getStorage('user');
    $users = $user_storage->loadMultiple($user_ids);

    $results = ['success' => 0, 'failed' => 0];

    foreach ($users as $user) {
      $params = [
        'node' => $node,
        'user' => $user,
        'inviter' => $this->currentUser,
      ];

      $result = $this->mailManager->mail(
        'player_finder_notifications',
        'invitation',
        $user->getEmail(),
        $user->getPreferredLangcode(),
        $params,
        NULL,
        TRUE
      );

      if ($result['result'] === TRUE) {
        $results['success']++;
        $this->logger->info('Invitation sent to @email for event @nid', [
          '@email' => $user->getEmail(),
          '@nid' => $node->id(),
        ]);
      }
      else {
        $results['failed']++;
        $this->logger->error('Failed to send invitation to @email for event @nid', [
          '@email' => $user->getEmail(),
          '@nid' => $node->id(),
        ]);
      }
    }

    return $results;
  }

  /**
   * Notify post owner when someone applies to their event.
   *
   * @param \Drupal\node\NodeInterface $node
   *   The Player Finder node.
   * @param \Drupal\user\UserInterface $applicant
   *   The user who applied.
   *
   * @return bool
   *   TRUE if email was sent successfully.
   */
  public function sendApplicationNotification(NodeInterface $node, UserInterface $applicant) {
    $owner = $node->getOwner();

    // Check if owner wants application notifications
    if (!$owner->hasField('field_notify_applications') ||
        !$owner->get('field_notify_applications')->value) {
      return FALSE;
    }

    $params = [
      'node' => $node,
      'owner' => $owner,
      'applicant' => $applicant,
    ];

    $result = $this->mailManager->mail(
      'player_finder_notifications',
      'new_application',
      $owner->getEmail(),
      $owner->getPreferredLangcode(),
      $params,
      NULL,
      TRUE
    );

    if ($result['result'] === TRUE) {
      $this->logger->info('Application notification sent to @email for event @nid', [
        '@email' => $owner->getEmail(),
        '@nid' => $node->id(),
      ]);
      return TRUE;
    }

    $this->logger->error('Failed to send application notification to @email for event @nid', [
      '@email' => $owner->getEmail(),
      '@nid' => $node->id(),
    ]);
    return FALSE;
  }

}
