package com.reusetech.test;

import io.cucumber.junit.CucumberOptions;
import net.serenitybdd.cucumber.CucumberWithSerenity;
import org.junit.runner.RunWith;

@RunWith(CucumberWithSerenity.class)
@CucumberOptions(
        features = "src/test/resources/features",
        glue = "com.reusetech.test.definitions",
        plugin = {"pretty", "html:target/cucumber-reports"},
        tags = "@login or @register"
)
public class Runner {
}
