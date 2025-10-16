<?php

namespace Drupal\bgc_api\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Drupal\user\Entity\User;

/**
 * Controller for user registration.
 */
class RegistrationController extends ControllerBase {

  /**
   * Handle CORS preflight requests.
   */
  private function handleCors() {
    return [
      'Access-Control-Allow-Origin' => '*',
      'Access-Control-Allow-Methods' => 'POST, OPTIONS',
      'Access-Control-Allow-Headers' => 'Content-Type, Authorization',
      'Access-Control-Max-Age' => '3600',
    ];
  }

  /**
   * Register a new user.
   *
   * POST /api/register
   * Body: {"username": "...", "email": "...", "password": "..."}
   */
  public function register(Request $request) {
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

      // Validate input
      $username = $data['username'] ?? '';
      $email = $data['email'] ?? '';
      $password = $data['password'] ?? '';

      if (empty($username) || empty($email) || empty($password)) {
        return new JsonResponse([
          'error' => 'Missing required fields: username, email, password',
        ], 400, $this->handleCors());
      }

      // Validate email format
      if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return new JsonResponse([
          'error' => 'Invalid email format',
        ], 400, $this->handleCors());
      }

      // Check if username already exists
      $existing_user = user_load_by_name($username);
      if ($existing_user) {
        return new JsonResponse([
          'error' => 'Ez a felhasználónév már foglalt',
        ], 409, $this->handleCors());
      }

      // Check if email already exists
      $existing_email = user_load_by_mail($email);
      if ($existing_email) {
        return new JsonResponse([
          'error' => 'Ez az email cím már regisztrálva van',
        ], 409, $this->handleCors());
      }

      // Check if user registration is allowed
      $config = $this->config('user.settings');
      $register = $config->get('register');

      if ($register === USER_REGISTER_ADMINISTRATORS_ONLY) {
        return new JsonResponse([
          'error' => 'A regisztráció jelenleg nem engedélyezett',
        ], 403, $this->handleCors());
      }

      // Create new user
      $user = User::create([
        'name' => $username,
        'mail' => $email,
        'pass' => $password,
        'status' => 1, // Active
        'roles' => ['authenticated'],
      ]);

      // Validate user entity
      $violations = $user->validate();
      if ($violations->count() > 0) {
        $errors = [];
        foreach ($violations as $violation) {
          $errors[] = $violation->getMessage();
        }
        return new JsonResponse([
          'error' => 'Validációs hiba',
          'details' => $errors,
        ], 400, $this->handleCors());
      }

      // Save user
      $user->save();

      // Log the registration
      \Drupal::logger('bgc_api')->notice('New user registered: @username', [
        '@username' => $username,
      ]);

      return new JsonResponse([
        'success' => TRUE,
        'message' => 'Sikeres regisztráció',
        'user' => [
          'uid' => $user->id(),
          'name' => $user->getAccountName(),
          'email' => $user->getEmail(),
        ],
      ], 201, $this->handleCors());

    } catch (\Exception $e) {
      \Drupal::logger('bgc_api')->error('Registration error: @message', [
        '@message' => $e->getMessage(),
      ]);

      return new JsonResponse([
        'error' => 'Szerver hiba a regisztráció során',
        'details' => $e->getMessage(),
      ], 500, $this->handleCors());
    }
  }

}
