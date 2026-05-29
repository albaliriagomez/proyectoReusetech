package com.reusetech.test.pages;

import net.serenitybdd.core.pages.WebElementFacade;
import net.thucydides.core.pages.PageObject;
import org.openqa.selenium.support.FindBy;

public class LoginPage extends PageObject {
    
    @FindBy(css = "input[name='email']")
    protected WebElementFacade txt_email;
    
    @FindBy(css = "input[name='password']")
    protected WebElementFacade txt_password;
    
    @FindBy(css = "button[type='submit']")
    protected WebElementFacade btn_login;
    
    @FindBy(css = "span[class*='cursor-pointer']")
    protected WebElementFacade link_register;
    
    @FindBy(css = "h2")
    protected WebElementFacade lbl_title;

    public void enterEmail(String email) {
        txt_email.clear();
        txt_email.sendKeys(email);
    }

    public void enterPassword(String password) {
        txt_password.clear();
        txt_password.sendKeys(password);
    }

    public void clickLoginButton() {
        btn_login.click();
    }

    public void clickRegisterLink() {
        link_register.click();
    }

    public boolean isLoginPageDisplayed() {
        return lbl_title.isDisplayed() && lbl_title.getText().contains("Iniciar Sesión");
    }

    public void navigateToLogin() {
        getDriver().get(System.getProperty("base.url", "http://localhost:3000") + "/login");
    }
}
