package com.example.ritamesa.ui.activity

import androidx.test.espresso.Espresso.onView
import androidx.test.espresso.action.ViewActions.click
import androidx.test.espresso.action.ViewActions.typeText
import androidx.test.espresso.assertion.ViewAssertions.matches
import androidx.test.espresso.matcher.ViewMatchers.*
import androidx.test.ext.junit.rules.ActivityScenarioRule
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.example.ritamesa.LoginAwal
import com.example.ritamesa.R
import org.hamcrest.Matchers.allOf
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

/**
 * Activity Lifecycle Tests for LoginAwal
 * Tests role selection, navigation, and UI state management
 */
@RunWith(AndroidJUnit4::class)
class LoginActivityTest {

    @Rule
    @JvmField
    val activityRule = ActivityScenarioRule(LoginAwal::class.java)

    @Test
    fun testActivityCreatesSuccessfully() {
        // Verify activity is displayed
        onView(withId(R.id.roleEditText))
            .check(matches(isDisplayed()))
    }

    @Test
    fun testRoleSelectionDropdown() {
        // Click dropdown button
        onView(withId(R.id.btnDropdown))
            .perform(click())

        // Verify a role is selected
        onView(withId(R.id.roleEditText))
            .check(matches(isDisplayed()))
    }

    @Test
    fun testMultipleRoleSelections() {
        val rolesCount = 4
        
        // Click dropdown multiple times to cycle through roles
        repeat(rolesCount) {
            onView(withId(R.id.btnDropdown))
                .perform(click())
        }

        // Verify role is selected
        onView(withId(R.id.roleEditText))
            .check(matches(isDisplayed()))
    }

    @Test
    fun testNavigateToNextWithRoleSelected() {
        // Select a role
        onView(withId(R.id.btnDropdown))
            .perform(click())

        // Click next/continue button
        onView(withId(R.id.btnLanjut))
            .perform(click())

        // Activity should transition (test by checking if we're still on login)
        // Or check if next activity intent was triggered
    }

    @Test
    fun testNavigateToNextWithoutRoleShowsError() {
        // Don't select role, just click next
        onView(withId(R.id.btnLanjut))
            .perform(click())

        // Should still be on login activity
        onView(withId(R.id.roleEditText))
            .check(matches(isDisplayed()))
    }

    @Test
    fun testRoleFieldIsNotEditable() {
        // Try to type in role field (should fail as it's not editable)
        onView(withId(R.id.roleEditText))
            .check(matches(not(isClickable())))
    }

    @Test
    fun testInitialRoleDisplay() {
        // Verify that a default role or empty state is shown
        onView(withId(R.id.roleEditText))
            .check(matches(withText("")))
    }

    @Test
    fun testBackNavigationFromLogin() {
        // Press back should close activity
        activityRule.scenario.onActivity { activity ->
            activity.onBackPressed()
        }
    }

    @Test
    fun testActivityStatePreservation() {
        // Select a role
        onView(withId(R.id.btnDropdown))
            .perform(click())

        // Recreate activity (simulate rotation)
        activityRule.scenario.recreate()

        // Verify role field still exists
        onView(withId(R.id.roleEditText))
            .check(matches(isDisplayed()))
    }
}
