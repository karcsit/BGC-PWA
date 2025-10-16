<?php

namespace Drupal\bgc_api\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Drupal\user\Entity\User;

/**
 * Controller for authentication.
 */
class AuthController extends ControllerBase {

  /**
   * Handle CORS preflight requests.
   */
  private function handleCors() {
    return [
      'Access-Control-Allow-Origin' => '*',
      'Access-Control-Allow-Methods' => 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers' => 'Content-Type, Authorization',
      'Access-Control-Max-Age' => '3600',
    ];
  }

  /**
   * Login user.
   *
   * POST /api/login
   * Body: {"username": "...", "password": "..."}
   */
  public function login(Request $request) {
    // Handle CORS preflight
    if ($request->getMethod() === 'OPTIONS') {
      return new JsonResponse(null, 200, $this->handleCors());
    }

    try {
      // Parse JSON body
      $data = json_decode($request->getContent(), TRUE);

      if (!$data) {
        return new JsonResponse([
          'error' => 'Invalid JSON',
        ], 400, $this->handleCors());
      }

      $username = $data['username'] ?? '';
      $password = $data['password'] ?? '';

      if (empty($username) || empty($password)) {
        return new JsonResponse([
          'error' => 'Missing username or password',
        ], 400, $this->handleCors());
      }

      // Load user by name
      $user = user_load_by_name($username);

      if (!$user) {
        return new JsonResponse([
          'error' => 'Hibás felhasználónév vagy jelszó',
        ], 401, $this->handleCors());
      }

      // Check password
      $password_hasher = \Drupal::service('password');
      if (!$password_hasher->check($password, $user->getPassword())) {
        return new JsonResponse([
          'error' => 'Hibás felhasználónév vagy jelszó',
        ], 401, $this->handleCors());
      }

      // Check if user is active
      if (!$user->isActive()) {
        return new JsonResponse([
          'error' => 'A felhasználó nincs aktiválva',
        ], 403, $this->handleCors());
      }

      // Login user (start session)
      user_login_finalize($user);

      // Generate CSRF token
      $csrf_token = \Drupal::csrfToken()->get('rest');

      return new JsonResponse([
        'success' => TRUE,
        'current_user' => [
          'uid' => $user->id(),
          'name' => $user->getAccountName(),
          'email' => $user->getEmail(),
        ],
        'csrf_token' => $csrf_token,
        'logout_token' => \Drupal::csrfToken()->get('user/logout'),
      ], 200, $this->handleCors());

    } catch (\Exception $e) {
      \Drupal::logger('bgc_api')->error('Login error: @message', [
        '@message' => $e->getMessage(),
      ]);

      return new JsonResponse([
        'error' => 'Szerver hiba a bejelentkezés során',
      ], 500, $this->handleCors());
    }
  }

  /**
   * Logout user.
   *
   * POST /api/logout
   */
  public function logout(Request $request) {
    // Handle CORS preflight
    if ($request->getMethod() === 'OPTIONS') {
      return new JsonResponse(null, 200, $this->handleCors());
    }

    try {
      user_logout();

      return new JsonResponse([
        'success' => TRUE,
        'message' => 'Sikeres kijelentkezés',
      ], 200, $this->handleCors());

    } catch (\Exception $e) {
      return new JsonResponse([
        'error' => 'Kijelentkezési hiba',
      ], 500, $this->handleCors());
    }
  }

  /**
   * Get current user info.
   *
   * GET /api/current-user
   */
  public function currentUser(Request $request) {
    // Handle CORS preflight
    if ($request->getMethod() === 'OPTIONS') {
      return new JsonResponse(null, 200, $this->handleCors());
    }

    $current_user = \Drupal::currentUser();

    if ($current_user->isAnonymous()) {
      return new JsonResponse([
        'authenticated' => FALSE,
      ], 200, $this->handleCors());
    }

    $user = User::load($current_user->id());

    return new JsonResponse([
      'authenticated' => TRUE,
      'user' => [
        'uid' => $user->id(),
        'name' => $user->getAccountName(),
        'email' => $user->getEmail(),
      ],
    ], 200, $this->handleCors());
  }

}
