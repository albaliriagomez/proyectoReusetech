package com.reusetech.test.steps;

import com.reusetech.test.pages.RegisterPage;
import net.serenitybdd.annotations.Step;
import net.thucydides.core.steps.ScenarioSteps;

public class RegisterSteps extends ScenarioSteps {
    
    RegisterPage registerPage;

    @Step("Navegar a la página de registro")
    public void navigateToRegister() {
        registerPage.navigateToRegister();
    }

    @Step("Ingresar nombre: {0}")
    public void enterNombre(String nombre) {
        registerPage.enterNombre(nombre);
    }

    @Step("Ingresar apellidos: {0}")
    public void enterApellidos(String apellidos) {
        registerPage.enterApellidos(apellidos);
    }

    @Step("Ingresar email: {0}")
    public void enterEmail(String email) {
        registerPage.enterEmail(email);
    }

    @Step("Ingresar contraseña")
    public void enterPassword(String password) {
        registerPage.enterPassword(password);
    }

    @Step("Seleccionar rol: {0}")
    public void selectRol(String rol) {
        registerPage.selectRol(rol);
    }

    @Step("Hacer clic en el botón de registro")
    public void clickRegister() {
        registerPage.clickRegisterButton();
    }

    @Step("Verificar que la página de registro está visible")
    public boolean isRegisterPageDisplayed() {
        return registerPage.isRegisterPageDisplayed();
    }
}
