<?php

namespace Drupal\player_finder_notifications\Plugin\rest\resource;

use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ResourceResponse;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\player_finder_notifications\Service\EmailService;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Psr\Log\LoggerInterface;

/**
 * Provides a resource for sending invitations.
 *
 * @RestResource(
 *   id = "player_finder_send_invitation",
 *   label = @Translation("Send Player Finder Invitation"),
 *   uri_paths = {
 *     "create" = "/api/player-finder/{node}/send-invitations"
 *   }
 * )
 */
class SendInvitationResource extends ResourceBase {

  /**
   * The current user.
   *
   * @var \Drupal\Core\Session\AccountProxyInterface
   */
  protected $currentUser;

  /**
   * The email service.
   *
   * @var \Drupal\player_finder_notifications\Service\EmailService
   */
  protected $emailService;

  /**
   * Constructs a SendInvitationResource object.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param array $serializer_formats
   *   The available serialization formats.
   * @param \Psr\Log\LoggerInterface $logger
   *   A logger instance.
   * @param \Drupal\Core\Session\AccountProxyInterface $current_user
   *   The current user.
   * @param \Drupal\player_finder_notifications\Service\EmailService $email_service
   *   The email service.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    array $serializer_formats,
    LoggerInterface $logger,
    AccountProxyInterface $current_user,
    EmailService $email_service
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition, $serializer_formats, $logger);
    $this->currentUser = $current_user;
    $this->emailService = $email_service;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->getParameter('serializer.formats'),
      $container->get('logger.factory')->get('rest'),
      $container->get('current_user'),
      $container->get('player_finder_notifications.email_service')
    );
  }

  /**
   * Responds to POST requests.
   *
   * Sends invitation emails to selected users.
   *
   * @param int $node
   *   The node ID of the Player Finder post.
   * @param array $data
   *   POST data containing 'user_ids' array.
   *
   * @return \Drupal\rest\ResourceResponse
   *   The response containing results.
   *
   * @throws \Symfony\Component\HttpKernel\Exception\HttpException
   *   Throws exception expected.
   */
  public function post($node, array $data) {
    // Validate user is logged in
    if (!$this->currentUser->isAuthenticated()) {
      throw new AccessDeniedHttpException('You must be logged in to send invitations.');
    }

    // Load the node
    $node_storage = \Drupal::entityTypeManager()->getStorage('node');
    $player_finder_node = $node_storage->load($node);

    if (!$player_finder_node || $player_finder_node->getType() !== 'player_finder') {
      throw new NotFoundHttpException('Player Finder post not found.');
    }

    // Check if current user is the owner
    if ($player_finder_node->getOwnerId() != $this->currentUser->id()) {
      throw new AccessDeniedHttpException('You can only send invitations for your own posts.');
    }

    // Validate user_ids
    if (empty($data['user_ids']) || !is_array($data['user_ids'])) {
      throw new BadRequestHttpException('user_ids array is required.');
    }

    // Send invitations
    $results = $this->emailService->sendInvitations($player_finder_node, $data['user_ids']);

    return new ResourceResponse([
      'success' => true,
      'message' => 'Invitations sent successfully',
      'results' => $results,
    ], 200);
  }

}
