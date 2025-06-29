<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

class WebsiteController extends Controller
{
    public function index()
    {
        return inertia('Website/Home', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
        ]);
    }

    public function about()
    {
        return inertia('Website/About');
    }

    public function services()
    {
        return inertia('Website/Services');
    }

    public function portfolio()
    {
        return inertia('Website/Portfolio');
    }

    public function contact()
    {
        return inertia('Website/Contact');
    }

    public function webDevelopment()
    {
        return inertia('Website/Services/WebDevelopment');
    }

    public function mobileApps()
    {
        return inertia('Website/Services/MobileApps');
    }

    public function aiSolutions()
    {
        return inertia('Website/Services/AISolutions');
    }

    public function cloudServices()
    {
        return inertia('Website/Services/CloudServices');
    }

    public function help()
    {
        return inertia('Website/Help');
    }

    public function faq()
    {
        return inertia('Website/FAQ');
    }
}
