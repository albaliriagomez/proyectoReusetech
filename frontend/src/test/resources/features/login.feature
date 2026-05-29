@login
Feature: CP01 - Validar funcionalidad de inicio de sesión en ReuseTeach

  Como usuario de ReuseTeach
  Quiero poder iniciar sesión en la aplicación
  Para acceder a las funcionalidades de la plataforma

  Background:
    Given el usuario navega a la página de login de ReuseTeach

  @validLogin
  Scenario: 1 - Validar login con credenciales correctas
    When ingresa credenciales válidas "usuario@test.com" y "password123"
    Then la aplicación debería mostrar la página principal

  @invalidLogin
  Scenario: 2 - Validar login con credenciales incorrectas
    When ingresa credenciales inválidas "usuario@test.com" y "wrongpassword"
    Then la aplicación debería mostrar un mensaje de error de login

  @emptyCredentials
  Scenario: 3 - Validar login con campos vacíos
    When ingresa credenciales inválidas "" y ""
    Then la página de login debería estar visible

  @invalidEmail
  Scenario: 4 - Validar login con email inválido
    When ingresa credenciales inválidas "emailinvalido" y "password123"
    Then la aplicación debería mostrar un mensaje de error de login
