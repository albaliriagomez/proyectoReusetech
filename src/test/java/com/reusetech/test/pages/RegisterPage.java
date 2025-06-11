package com.reusetech.test.pages;

import net.serenitybdd.core.pages.WebElementFacade;
import net.thucydides.core.pages.PageObject;
import org.openqa.selenium.support.FindBy;

public class RegisterPage extends PageObject {
    
    @FindBy(css = "input[name='nombre']")
    protected WebElementFacade txt_nombre;
    
    @FindBy(css = "input[name='apellidos']")
    protected WebElementFacade txt_apellidos;
    
    @FindBy(css = "input[name='email']")
    protected WebElementFacade txt_email;
    
    @FindBy(css = "input[name='password']")
    protected WebElementFacade txt_password;
    
    @FindBy(css = "select[name='rol']")
    protected WebElementFacade select_rol;
    
    @FindBy(css = "button[type='submit']")
    protected WebElementFacade btn_register;
    
    @FindBy(css = "span[class*='cursor-pointer']")
    protected WebElementFacade link_login;
    
    @FindBy(css = "h2")
    protected WebElementFacade lbl_title;

    public void enterNombre(String nombre) {
        txt_nombre.clear();
        txt_nombre.sendKeys(nombre);
    }

    public void enterApellidos(String apellidos) {
        txt_apellidos.clear();
        txt_apellidos.sendKeys(apellidos);
    }

    public void enterEmail(String email) {
        txt_email.clear();
        txt_email.sendKeys(email);
    }

    public void enterPassword(String password) {
        txt_password.clear();
        txt_password.sendKeys(password);
    }

    public void selectRol(String rol) {
        select_rol.selectByValue(rol);
    }

    public void clickRegisterButton() {
        btn_register.click();
    }

    public void clickLoginLink() {
        link_login.click();
    }

    public boolean isRegisterPageDisplayed() {
        return lbl_title.isDisplayed() && lbl_title.getText().contains("Crear Cuenta");
    }

    public void navigateToRegister() {
        getDriver().get(System.getProperty("base.url", "http://localhost:3000") + "/register");
    }
}
