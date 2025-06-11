package com.reusetech.test.pages;

import net.serenitybdd.core.pages.WebElementFacade;
import net.thucydides.core.pages.PageObject;
import org.openqa.selenium.support.FindBy;

public class HomePage extends PageObject {
    
    @FindBy(css = "nav")
    protected WebElementFacade navigation_bar;
    
    @FindBy(css = "button[class*='bg-green']")
    protected WebElementFacade btn_crear_publicacion;
    
    @FindBy(css = "div[class*='grid']")
    protected WebElementFacade publications_grid;
    
    @FindBy(css = "input[placeholder*='Buscar']")
    protected WebElementFacade txt_search;
    
    @FindBy(css = "select[class*='border']")
    protected WebElementFacade select_filter;

    public boolean isHomePageDisplayed() {
        return navigation_bar.isDisplayed() && publications_grid.isDisplayed();
    }

    public void clickCrearPublicacion() {
        btn_crear_publicacion.click();
    }

    public void searchPublication(String searchTerm) {
        txt_search.clear();
        txt_search.sendKeys(searchTerm);
    }

    public void selectFilter(String filterValue) {
        select_filter.selectByValue(filterValue);
    }

    public void navigateToHome() {
        getDriver().get(System.getProperty("base.url", "http://localhost:3000") + "/home");
    }
}
