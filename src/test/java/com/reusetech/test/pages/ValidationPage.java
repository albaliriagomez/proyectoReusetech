package com.reusetech.test.pages;

import net.serenitybdd.core.pages.WebElementFacade;
import net.thucydides.core.pages.PageObject;
import org.openqa.selenium.support.FindBy;

public class ValidationPage extends PageObject {
    
    @FindBy(css = "div[role='alert']")
    protected WebElementFacade alert_message;
    
    @FindBy(css = "h1, h2, h3")
    protected WebElementFacade page_title;
    
    @FindBy(css = "nav")
    protected WebElementFacade navigation_bar;

    public boolean isAlertDisplayed() {
        return alert_message.isDisplayed();
    }

    public String getAlertMessage() {
        return alert_message.getText();
    }

    public boolean isTitleVisible() {
        return page_title.isDisplayed();
    }

    public String getPageTitle() {
        return page_title.getText();
    }

    public boolean isNavigationVisible() {
        return navigation_bar.isDisplayed();
    }

    public boolean isSuccessMessageDisplayed() {
        return alert_message.isDisplayed() && 
               (alert_message.getText().contains("éxito") || 
                alert_message.getText().contains("Bienvenido"));
    }

    public boolean isErrorMessageDisplayed() {
        return alert_message.isDisplayed() && 
               (alert_message.getText().contains("error") || 
                alert_message.getText().contains("incorrectos"));
    }
}
