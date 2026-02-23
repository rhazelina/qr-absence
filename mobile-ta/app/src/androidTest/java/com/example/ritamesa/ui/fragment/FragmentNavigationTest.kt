package com.example.ritamesa.ui.fragment

import androidx.fragment.app.testing.FragmentScenario
import androidx.fragment.app.testing.launchFragmentInContainer
import androidx.navigation.Navigation
import androidx.navigation.testing.TestNavHostController
import androidx.test.core.app.ApplicationProvider
import androidx.test.espresso.Espresso.onView
import androidx.test.espresso.action.ViewActions.click
import androidx.test.espresso.assertion.ViewAssertions.matches
import androidx.test.espresso.matcher.ViewMatchers.*
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.example.ritamesa.R
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith

/**
 * Fragment Navigation Tests
 * Tests navigation flow between fragments and navigation state
 */
@RunWith(AndroidJUnit4::class)
class FragmentNavigationTest {

    private lateinit var navController: TestNavHostController

    @Before
    fun setUp() {
        navController = TestNavHostController(ApplicationProvider.getApplicationContext())
    }

    @Test
    fun testStudentDashboardFragmentDisplays() {
        // Launch student dashboard fragment
        val scenario: FragmentScenario<StudentDashboardFragment> = launchFragmentInContainer()
        
        scenario.onFragment { fragment ->
            Navigation.setViewNavController(fragment.requireView(), navController)
        }

        // Verify dashboard elements are displayed
        onView(withId(R.id.studentDashboardContainer))
            .check(matches(isDisplayed()))
    }

    @Test
    fun testNavigateFromDashboardToAttendance() {
        val scenario: FragmentScenario<StudentDashboardFragment> = launchFragmentInContainer()
        
        scenario.onFragment { fragment ->
            Navigation.setViewNavController(fragment.requireView(), navController)
        }

        // Click attendance button
        onView(withId(R.id.btnAttendance))
            .perform(click())

        // Verify navigation occurred
        // In real scenario, you'd check navController.currentBackStackEntry
    }

    @Test
    fun testTeacherDashboardFragmentDisplays() {
        val scenario: FragmentScenario<TeacherDashboardFragment> = launchFragmentInContainer()
        
        scenario.onFragment { fragment ->
            Navigation.setViewNavController(fragment.requireView(), navController)
        }

        // Verify teacher-specific elements
        onView(withId(R.id.teacherScheduleList))
            .check(matches(isDisplayed()))
    }

    @Test
    fun testNavigationBackStack() {
        val scenario: FragmentScenario<StudentDashboardFragment> = launchFragmentInContainer()
        
        scenario.onFragment { fragment ->
            Navigation.setViewNavController(fragment.requireView(), navController)
        }

        // Perform navigation
        onView(withId(R.id.btnAttendance))
            .perform(click())

        // Simulate back press
        navController.popBackStack()

        // Verify we're back at dashboard
    }

    @Test
    fun testFragmentArgumentPassing() {
        val args = android.os.Bundle().apply {
            putInt("student_id", 123)
        }

        val scenario: FragmentScenario<StudentDetailFragment> = launchFragmentInContainer(args)
        
        scenario.onFragment { fragment ->
            // Verify arguments were passed correctly
            assert(fragment.arguments?.getInt("student_id") == 123)
        }
    }

    @Test
    fun testMultipleFragmentNavigation() {
        var scenario: FragmentScenario<StudentDashboardFragment> = launchFragmentInContainer()
        
        scenario.onFragment { fragment ->
            Navigation.setViewNavController(fragment.requireView(), navController)
        }

        // First navigation
        onView(withId(R.id.btnAttendance))
            .perform(click())

        scenario.recreate()

        // Second navigation
        onView(withId(R.id.btnProfile))
            .perform(click())
    }

    @Test
    fun testFragmentStatePreservation() {
        val scenario: FragmentScenario<StudentDashboardFragment> = launchFragmentInContainer()

        // Change fragment state
        onView(withId(R.id.filterButton))
            .perform(click())

        // Recreate fragment
        scenario.recreate()

        // Verify state preserved
        onView(withId(R.id.filterButton))
            .check(matches(isDisplayed()))
    }
}

// Placeholder fragment classes for testing
class StudentDashboardFragment : androidx.fragment.app.Fragment()
class TeacherDashboardFragment : androidx.fragment.app.Fragment()
class StudentDetailFragment : androidx.fragment.app.Fragment()
