package com.reusetech.test.definitions;

import com.reusetech.test.steps.RegisterSteps;
import com.reusetech.test.steps.ValidationSteps;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import net.serenitybdd.annotations.Steps;
import org.junit.Assert;

public class RegisterDefinitions {
    
    @Steps
    RegisterSteps registerSteps;
    
    @Steps
    ValidationSteps validationSteps;

    @Given("el usuario navega a la página de registro de ReuseTeach")
    public void userNavigatesToRegister() {
        registerSteps.navigateToRegister();
    }

    @When("completa el formulario de registro con {string}, {string}, {string}, {string} y {string}")
    public void userCompletesRegistrationForm(String nombre, String apellidos, String email, String password, String rol) {
        registerSteps.enterNombre(nombre);
        registerSteps.enterApellidos(apellidos);
        registerSteps.enterEmail(email);
        registerSteps.enterPassword(password);
        registerSteps.selectRol(rol);
        registerSteps.clickRegister();
    }

    @Then("la aplicación debería mostrar un mensaje de registro exitoso")
    public void systemShowsSuccessMessage() {
        Assert.assertTrue("El mensaje de éxito no está visible", 
                         validationSteps.isSuccessMessageDisplayed());
    }

    @Then("la página de registro debería estar visible")
    public void registerPageShouldBeVisible() {
        Assert.assertTrue("La página de registro no está visible", 
                         registerSteps.isRegisterPageDisplayed());
    }
}
