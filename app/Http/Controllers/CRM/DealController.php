<?php

namespace App\Http\Controllers\CRM;

use App\Http\Controllers\Controller;
use App\Models\LoginCode;
use App\Models\User;
use DateTime;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class DealController extends Controller
{
    /**
     * Display the GLORI dashboard
     */
    public function index(Request $request)
    {
        // Get parameters from request
        $login = $request->get('login', '5000311');
        $dateRange = $request->get('dateRange', 'today');
        $from = $request->get('from');
        $to = $request->get('to');
        $selectedUserId = $request->get('userId'); // Get selected user ID

        Log::debug($request->all());
        
        // Get date range parameters
        $dateParams = $this->getDateRangeParams($dateRange, $from, $to);
        
        // Fetch deals data
        $dealsResponse = $this->fetchDeals($login, $dateParams);
        
        // Fetch user profile data
        $userProfileResponse = $this->fetchUserProfile($login);
        
        $loginCode = [];

        if (auth()->user()->role === 'marketing') {
            $loginCode = LoginCode::where('user_id', auth()->user()->id)->get();
        }else {
            $loginCode = LoginCode::all();
        }
        
        
        // Get all users for the select dropdown
        // You can add filters based on role or other criteria
        $users = User::select('id', 'name', 'email')
            // ->where('status', 'active') // Optional: filter by status
            ->where('role', 'marketing')
            ->orderBy('name')
            ->get()
            ->map(function ($user) {
                return [
                    'value' => $user->id,
                    'label' => $user->name . ' (' . $user->email . ')',
                ];
            });
        
        // Get selected user details if userId is provided
        $selectedUser = null;
        if ($selectedUserId) {
            $selectedUser = User::find($selectedUserId);
            if ($selectedUser) {
                $selectedUser = [
                    'value' => $selectedUser->id,
                    'label' => $selectedUser->name . ' (' . $selectedUser->email . ')',
                ];
            }
        }
        
        return Inertia::render('crm/deal/index', [
            'deals' => $dealsResponse['data'] ?? [],
            'apiResponse' => $dealsResponse,
            'userProfile' => $userProfileResponse,
            'loginCode' => $loginCode,
            'login' => $login,
            'dateRange' => $dateRange,
            'from' => $from,
            'to' => $to,
            'users' => $users, // Pass users list
            'selectedUser' => $selectedUser, // Pass selected user
        ]);
    }
    
    /**
     * Fetch deals data from external API
     */
    private function fetchDeals($login, $dateParams)
    {
        try {
            $apiUrl = 'https://mt5crm.hsb.co.id/gloryapi/adminapi/api.php';
            $params = [
                'cmd' => 'getdeal',
                'login' => $login,
            ];
            
            if (!empty($dateParams['from'])) {
                $params['from'] = $dateParams['from'];
            }
            
            if (!empty($dateParams['to'])) {
                $params['to'] = $dateParams['to'];
            }
            
            $response = Http::get($apiUrl, $params);
            
            if ($response->successful()) {
                return $response->json();
            } else {
                return [
                    'result' => false,
                    'error' => 'Failed to fetch deals from API',
                    'data' => [],
                ];
            }
        } catch (\Exception $e) {
            return [
                'result' => false,
                'error' => 'Failed to connect to API: ' . $e->getMessage(),
                'data' => [],
            ];
        }
    }
    
    /**
     * Fetch user profile data from external API
     */
    private function fetchUserProfile($login)
    {
        try {
            $apiUrl = 'https://mt5crm.hsb.co.id/gloryapi/adminapi/api.php';
            $response = Http::get($apiUrl, [
                'cmd' => 'getuser',
                'login' => $login,
            ]);
            
            if ($response->successful()) {
                return $response->json();
            } else {
                return [
                    'result' => false,
                    'error' => 'Failed to fetch user profile from API',
                ];
            }
        } catch (\Exception $e) {
            return [
                'result' => false,
                'error' => 'Failed to connect to API: ' . $e->getMessage(),
            ];
        }
    }
    
    /**
     * Get date range parameters based on selected range
     */
    private function getDateRangeParams($range, $from = null, $to = null)
    {
        $now = new DateTime();
        $today = new DateTime($now->format('Y-m-d'));
        
        switch ($range) {
            case 'today':
                return [
                    'from' => $today->getTimestamp(),
                    'to' => $now->getTimestamp()
                ];
            case 'week':
                $weekAgo = clone $today;
                $weekAgo->modify('-7 days');
                return [
                    'from' => $weekAgo->getTimestamp(),
                    'to' => $now->getTimestamp()
                ];
            case 'month':
                $monthAgo = clone $today;
                $monthAgo->modify('-30 days');
                return [
                    'from' => $monthAgo->getTimestamp(),
                    'to' => $now->getTimestamp()
                ];
            case 'year':
                $yearAgo = clone $today;
                $yearAgo->modify('-365 days');
                return [
                    'from' => $yearAgo->getTimestamp(),
                    'to' => $now->getTimestamp()
                ];
            case 'all':
                return ['from' => '', 'to' => ''];
            case 'custom':
                return [
                    'from' => $from ? (new DateTime($from))->getTimestamp() : '',
                    'to' => $to ? (new DateTime($to))->getTimestamp() : '',
                ];
            default:
                return ['from' => '', 'to' => ''];
        }
    }
}