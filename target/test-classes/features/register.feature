@register
Feature: CP02 - Validar funcionalidad de registro en ReuseTeach

  Como nuevo usuario de ReuseTeach
  Quiero poder registrarme en la aplicación
  Para crear una cuenta y acceder a la plataforma

  Background:
    Given el usuario navega a la página de registro de ReuseTeach

  @validRegister
  Scenario: 1 - Validar registro con datos válidos
    When completa el formulario de registro con "Juan", "Pérez", "juan.perez@test.com", "password123" y "usuario"
    Then la aplicación debería mostrar un mensaje de registro exitoso

  @adminRegister
  Scenario: 2 - Validar registro como administrador
    When completa el formulario de registro con "Admin", "Sistema", "admin@test.com", "admin123" y "admin"
    Then la aplicación debería mostrar un mensaje de registro exitoso

  @duplicateEmail
  Scenario: 3 - Validar registro con email duplicado
    When completa el formulario de registro con "Usuario", "Duplicado", "usuario@test.com", "password123" y "usuario"
    Then la aplicación debería mostrar un mensaje de error de login

  @emptyFields
  Scenario: 4 - Validar registro con campos vacíos
    When completa el formulario de registro con "", "", "", "" y "usuario"
    Then la página de registro debería estar visible
