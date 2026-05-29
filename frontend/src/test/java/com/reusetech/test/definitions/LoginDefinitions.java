package com.reusetech.test.definitions;

import com.reusetech.test.steps.LoginSteps;
import com.reusetech.test.steps.ValidationSteps;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import net.serenitybdd.annotations.Steps;
import org.junit.Assert;

public class LoginDefinitions {
    
    @Steps
    LoginSteps loginSteps;
    
    @Steps
    ValidationSteps validationSteps;

    @Given("el usuario navega a la página de login de ReuseTeach")
    public void userNavigatesToLogin() {
        loginSteps.navigateToLogin();
    }

    @When("ingresa credenciales válidas {string} y {string}")
    public void userEntersValidCredentials(String email, String password) {
        loginSteps.enterEmail(email);
        loginSteps.enterPassword(password);
        loginSteps.clickLogin();
    }

    @When("ingresa credenciales inválidas {string} y {string}")
    public void userEntersInvalidCredentials(String email, String password) {
        loginSteps.enterEmail(email);
        loginSteps.enterPassword(password);
        loginSteps.clickLogin();
    }

    @Then("la aplicación debería mostrar la página principal")
    public void systemShowsHomePage() {
        Assert.assertTrue("La página principal no está visible", 
                         validationSteps.isHomePageDisplayed());
    }

    @Then("la aplicación debería mostrar un mensaje de error de login")
    public void systemShowsErrorMessage() {
        Assert.assertTrue("El mensaje de error no está visible", 
                         validationSteps.isErrorMessageDisplayed());
    }

    @Then("la página de login debería estar visible")
    public void loginPageShouldBeVisible() {
        Assert.assertTrue("La página de login no está visible", 
                         loginSteps.isLoginPageDisplayed());
    }
}
