package com.reusetech.test.steps;

import com.reusetech.test.pages.ValidationPage;
import com.reusetech.test.pages.HomePage;
import net.serenitybdd.annotations.Step;
import net.thucydides.core.steps.ScenarioSteps;

public class ValidationSteps extends ScenarioSteps {
    
    ValidationPage validationPage;
    HomePage homePage;

    @Step("Verificar que el mensaje de éxito está visible")
    public boolean isSuccessMessageDisplayed() {
        return validationPage.isSuccessMessageDisplayed();
    }

    @Step("Verificar que el mensaje de error está visible")
    public boolean isErrorMessageDisplayed() {
        return validationPage.isErrorMessageDisplayed();
    }

    @Step("Verificar que la página principal está visible")
    public boolean isHomePageDisplayed() {
        return homePage.isHomePageDisplayed();
    }

    @Step("Verificar que el título está visible")
    public boolean isTitleVisible() {
        return validationPage.isTitleVisible();
    }

    @Step("Obtener mensaje de alerta")
    public String getAlertMessage() {
        return validationPage.getAlertMessage();
    }
}
