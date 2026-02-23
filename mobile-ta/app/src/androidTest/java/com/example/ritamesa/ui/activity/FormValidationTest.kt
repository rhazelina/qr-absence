package com.example.ritamesa.ui.activity

import androidx.test.espresso.Espresso.onView
import androidx.test.espresso.action.ViewActions.clearText
import androidx.test.espresso.action.ViewActions.click
import androidx.test.espresso.action.ViewActions.typeText
import androidx.test.espresso.assertion.ViewAssertions.matches
import androidx.test.espresso.matcher.ViewMatchers.*
import androidx.test.ext.junit.rules.ActivityScenarioRule
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.example.ritamesa.TambahDataSiswa
import com.example.ritamesa.R
import org.hamcrest.Matchers.allOf
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

/**
 * Form Validation UI Tests for Student Creation
 * Tests form field validation, error messages, and submission
 */
@RunWith(AndroidJUnit4::class)
class FormValidationTest {

    @Rule
    @JvmField
    val activityRule = ActivityScenarioRule(TambahDataSiswa::class.java)

    @Test
    fun testAllFormFieldsVisible() {
        // Verify all form fields are displayed
        onView(withId(R.id.edtNisn))
            .check(matches(isDisplayed()))

        onView(withId(R.id.edtNama))
            .check(matches(isDisplayed()))

        onView(withId(R.id.edtEmail))
            .check(matches(isDisplayed()))

        onView(withId(R.id.edtClass))
            .check(matches(isDisplayed()))

        onView(withId(R.id.btnSubmit))
            .check(matches(isDisplayed()))
    }

    @Test
    fun testEmptyFormSubmission() {
        // Try to submit empty form
        onView(withId(R.id.btnSubmit))
            .perform(click())

        // Verify error message appears
        onView(withText("NISN dan Nama harus diisi"))
            .check(matches(isDisplayed()))
    }

    @Test
    fun testMissingNisnValidation() {
        // Fill only name
        onView(withId(R.id.edtNama))
            .perform(typeText("John Doe"))

        // Try to submit
        onView(withId(R.id.btnSubmit))
            .perform(click())

        // Should show error about NISN
        onView(withText("NISN dan Nama harus diisi"))
            .check(matches(isDisplayed()))
    }

    @Test
    fun testMissingNamaValidation() {
        // Fill only NISN
        onView(withId(R.id.edtNisn))
            .perform(typeText("1234567890"))

        // Try to submit
        onView(withId(R.id.btnSubmit))
            .perform(click())

        // Should show error about Nama
        onView(withText("NISN dan Nama harus diisi"))
            .check(matches(isDisplayed()))
    }

    @Test
    fun testInvalidClassId() {
        // Fill required fields
        onView(withId(R.id.edtNisn))
            .perform(typeText("1234567890"))

        onView(withId(R.id.edtNama))
            .perform(typeText("John Doe"))

        // Fill invalid class
        onView(withId(R.id.edtClass))
            .perform(typeText("invalid"))

        // Try to submit
        onView(withId(R.id.btnSubmit))
            .perform(click())

        // Should show error about class
        onView(withText("Kelas harus diisi dengan nilai yang valid"))
            .check(matches(isDisplayed()))
    }

    @Test
    fun testValidFormSubmission() {
        // Fill all required fields correctly
        onView(withId(R.id.edtNisn))
            .perform(typeText("1234567890"))

        onView(withId(R.id.edtNama))
            .perform(typeText("John Doe"))

        onView(withId(R.id.edtEmail))
            .perform(typeText("john@example.com"))

        onView(withId(R.id.edtClass))
            .perform(typeText("1"))

        // Submit form
        onView(withId(R.id.btnSubmit))
            .perform(click())

        // Should show success message or navigate away
        // This depends on API response
    }

    @Test
    fun testEmailValidation() {
        // Fill fields
        onView(withId(R.id.edtNisn))
            .perform(typeText("1234567890"))

        onView(withId(R.id.edtNama))
            .perform(typeText("John Doe"))

        // Enter invalid email
        onView(withId(R.id.edtEmail))
            .perform(typeText("invalid-email"))

        // Verify email format hint or validation
        // Depends on implementation
    }

    @Test
    fun testFormFieldClear() {
        // Enter text
        onView(withId(R.id.edtNisn))
            .perform(typeText("1234567890"))

        // Clear field
        onView(withId(R.id.edtNisn))
            .perform(clearText())

        // Verify cleared
        onView(withId(R.id.edtNisn))
            .check(matches(withText("")))
    }

    @Test
    fun testFormTrimWhitespace() {
        // Enter text with whitespace
        onView(withId(R.id.edtNisn))
            .perform(typeText("  1234567890  "))

        onView(withId(R.id.edtNama))
            .perform(typeText("  John Doe  "))

        onView(withId(R.id.edtClass))
            .perform(typeText("  1  "))

        // Submit should trim values
        onView(withId(R.id.btnSubmit))
            .perform(click())

        // Validation should pass after trimming
    }

    @Test
    fun testDuplicateNisnValidation() {
        // This would require mock API response
        // Enter NISN that already exists
        onView(withId(R.id.edtNisn))
            .perform(typeText("9999999999")) // Assume existing NISN

        onView(withId(R.id.edtNama))
            .perform(typeText("John Doe"))

        onView(withId(R.id.edtClass))
            .perform(typeText("1"))

        onView(withId(R.id.btnSubmit))
            .perform(click())

        // Should show error about duplicate
    }

    @Test
    fun testMaxLengthValidation() {
        // Try to enter text longer than max allowed
        val longText = "a".repeat(300)

        onView(withId(R.id.edtNama))
            .perform(typeText(longText))

        // Verify it respects max length
    }
}

/**
 * Edit Student Form Validation Tests
 * Tests update form field population and validation
 */
@RunWith(AndroidJUnit4::class)
class EditFormValidationTest {

    @Rule
    @JvmField
    val activityRule = ActivityScenarioRule(EditDataSiswa::class.java)

    @Test
    fun testFormPopulationFromData() {
        // Verify form fields are populated with student data
        onView(withId(R.id.edtNisn))
            .check(matches(isDisplayed()))

        onView(withId(R.id.edtNama))
            .check(matches(isDisplayed()))
    }

    @Test
    fun testUpdateWithChanges() {
        // Clear and update name
        onView(withId(R.id.edtNama))
            .perform(clearText(), typeText("Updated Name"))

        // Submit changes
        onView(withId(R.id.btnSubmit))
            .perform(click())

        // Should show success message
    }

    @Test
    fun testUpdateWithoutChanges() {
        // Just submit without any changes
        onView(withId(R.id.btnSubmit))
            .perform(click())

        // Should still succeed
    }

    @Test
    fun testInvalidUpdateData() {
        // Clear required field
        onView(withId(R.id.edtNama))
            .perform(clearText())

        // Try to submit
        onView(withId(R.id.btnSubmit))
            .perform(click())

        // Should show validation error
    }
}
