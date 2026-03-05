<?php

namespace Tests\Browser;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

class LoginTest extends DuskTestCase
{
    // use DatabaseMigrations; // Warning: This might wipe the DB if not careful. For local dev with seeded data, we might skip it or use a separate testing DB.

    /**
     * A basic browser test example.
     */
    public function testLogin(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/login')
                    ->assertSee('Login') // Assuming login page has 'Login' text
                    ->type('login', 'admin') // Assuming input name='login'
                    ->type('password', 'password123')
                    ->press('Sign In') // Assuming button text
                    ->waitForLocation('/admin/dashboard') // Assuming redirect
                    ->assertPathIs('/admin/dashboard')
                    ->assertSee('Dashboard'); // Assuming dashboard has 'Dashboard' text
        });
    }
}
