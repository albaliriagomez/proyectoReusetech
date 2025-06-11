package com.reusetech.test.steps;

import com.reusetech.test.pages.LoginPage;
import net.serenitybdd.annotations.Step;
import net.thucydides.core.steps.ScenarioSteps;

public class LoginSteps extends ScenarioSteps {
    
    LoginPage loginPage;

    @Step("Navegar a la página de login")
    public void navigateToLogin() {
        loginPage.navigateToLogin();
    }

    @Step("Ingresar email: {0}")
    public void enterEmail(String email) {
        loginPage.enterEmail(email);
    }

    @Step("Ingresar contraseña")
    public void enterPassword(String password) {
        loginPage.enterPassword(password);
    }

    @Step("Hacer clic en el botón de login")
    public void clickLogin() {
        loginPage.clickLoginButton();
    }

    @Step("Hacer clic en el enlace de registro")
    public void clickRegisterLink() {
        loginPage.clickRegisterLink();
    }

    @Step("Verificar que la página de login está visible")
    public boolean isLoginPageDisplayed() {
        return loginPage.isLoginPageDisplayed();
    }
}
