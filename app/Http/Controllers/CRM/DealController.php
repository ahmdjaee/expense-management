<?php

namespace App\Http\Controllers\CRM;

use App\Http\Controllers\Controller;
use App\Models\CommissionDistribution;
use App\Models\CommissionLayer;
use App\Models\LoginCode;
use App\Models\User;
use DateTime;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
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
        $selectedUserId = $request->get('selectedUser'); // Get selected user ID
        $selectedLoginCode = $request->get('loginCode'); // Get selected login code

        Log::debug($request->all());

        // Get date range parameters
        $dateParams = $this->getDateRangeParams($dateRange, $from, $to);

        // Fetch deals data
        $dealsResponse = $this->fetchDeals($login, $dateParams);

        // Fetch user profile data
        $userProfileResponse = $this->fetchUserProfile($login);

        // Get login codes based on user role
        $loginCodes = [];
        
        if (auth()->user()->role === 'marketing' || auth()->user()->role === 'user') {
            // Get login codes assigned to this marketing user
            $loginCodes = auth()->user()->loginCodes;
            
            // If no specific login code selected, use the first one
            if (!$selectedLoginCode && $loginCodes->isNotEmpty()) {
                $selectedLoginCode = $loginCodes->first()->code;
                $login = $selectedLoginCode;
            }
        } else {
            // For admin and superadmin, get all login codes
            $loginCodes = LoginCode::all();
        }

        // Get all users for the select dropdown (only marketing users)
        $users = User::select('id', 'name', 'email')
            ->whereIn('role', ['marketing', 'user'])
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

        // Get selected login code details
        $selectedLoginCodeOption = null;
        if ($selectedLoginCode) {
            $selectedLoginCodeOption = [
                'value' => $selectedLoginCode,
                'label' => $selectedLoginCode,
            ];
        }

        // Get commission layers from database
        $commissionLayers = CommissionLayer::with('user')->get();

        // If user is marketing, only show commission layers assigned to them
        if (auth()->user()->role === 'marketing' || auth()->user()->role === 'user') {
            $commissionLayers = $commissionLayers->where('user_id', auth()->user()->id);
        }

        // Get commission distributions if user is marketing
        $commissionDistributions = [];
        if (auth()->user()->role === 'marketing' || auth()->user()->role === 'user') {
            $query = CommissionDistribution::where('user_id', auth()->user()->id)
                ->with('commissionLayer')
                ->orderBy('deal_time', 'desc');
                
            // If a specific login code is selected, filter by it
            if ($selectedLoginCode) {
                $query->where('login_code', $selectedLoginCode);
            }
                
            $commissionDistributions = $query->get();
        }

        // Get commission periods for marketing users
        $commissionPeriods = [];
        if (auth()->user()->role === 'marketing' || auth()->user()->role === 'user') {
            // Group commission distributions by date range and login code
            $commissionPeriods = DB::table('commission_distributions')
                ->select(
                    'login_code',
                    DB::raw('MIN(deal_time) as from_date'),
                    DB::raw('MAX(deal_time) as to_date'),
                    DB::raw('SUM(commission_amount) as total_commission'),
                    DB::raw('COUNT(*) as deal_count'),
                    DB::raw('CONCAT(MIN(deal_time), " - ", MAX(deal_time)) as date_range')
                )
                ->where('user_id', auth()->user()->id)
                ->groupBy('login_code')
                ->orderBy('from_date', 'desc')
                ->get()
                ->map(function ($period) {
                    return [
                        'id' => $period->login_code . '_' . $period->from_date,
                        'loginCode' => $period->login_code,
                        'fromDate' => $period->from_date,
                        'toDate' => $period->to_date,
                        'dateRange' => $period->date_range,
                        'totalCommission' => (float) $period->total_commission,
                        'totalCommissionIDR' => (float) $period->total_commission * 10000, // Assuming rate is 10000
                        'dealCount' => $period->deal_count,
                    ];
                });
        }

        return Inertia::render('crm/deal/index', [
            'deals' => $dealsResponse['data'] ?? [],
            'apiResponse' => $dealsResponse,
            'userProfile' => $userProfileResponse,
            'loginCode' => $loginCodes,
            'loginCodes' => $loginCodes, // Pass login codes list
            'login' => $login,
            'dateRange' => $dateRange,
            'from' => $from,
            'to' => $to,
            'users' => $users, // Pass users list
            'selectedUser' => $selectedUser, // Pass selected user
            'selectedLoginCode' => $selectedLoginCodeOption, // Pass selected login code
            'commissionLayers' => $commissionLayers,
            'commissionDistributions' => $commissionDistributions,
            'commissionPeriods' => $commissionPeriods, // Pass commission periods
        ]);
    }

    /**
     * Save commission layers configuration.
     */
    public function saveCommissionLayers(Request $request)
    {
        $validated = $request->validate([
            'layers' => 'required|array',
            'layers.*.name' => 'required|string|max:255',
            'layers.*.rate' => 'required|numeric|min:0',
            'layers.*.color' => 'required|string|max:50',
            'layers.*.user_id' => 'nullable|exists:users,id',
        ]);

        // Get IDs of layers that will be saved
        $newLayerIds = [];
        foreach ($validated['layers'] as $layer) {
            if (isset($layer['id'])) {
                $newLayerIds[] = $layer['id'];
            }
        }

        // Delete commission distributions related to layers that will be removed
        if (!empty($newLayerIds)) {
            CommissionDistribution::whereNotIn('commission_layer_id', $newLayerIds)->delete();
        } else {
            // If all layers will be removed, delete all commission distributions
            CommissionDistribution::query()->delete();
        }

        // Delete all existing commission layers to replace with new ones
        CommissionLayer::query()->delete();

        // Save new commission layers
        foreach ($validated['layers'] as $layer) {
            CommissionLayer::create($layer);
        }

        return redirect()->back()->with('success', 'Commission layers saved successfully!');
    }

    // Method untuk menghitung dan menyimpan distribusi komisi
    public function calculateAndSaveCommissions(Request $request)
    {
        $login = $request->get('login', '5000311');
        $dateRange = $request->get('dateRange', 'today');
        $from = $request->get('from');
        $to = $request->get('to');

        // Get date range parameters
        $dateParams = $this->getDateRangeParams($dateRange, $from, $to);

        // Fetch deals data
        $dealsResponse = $this->fetchDeals($login, $dateParams);
        $deals = $dealsResponse['data'] ?? [];

        // Get all commission layers
        $commissionLayers = CommissionLayer::all();

        // Delete existing commission distributions for this login and date range
        $fromDate = $dateParams['from'] ? date('Y-m-d H:i:s', $dateParams['from']) : null;
        $toDate = $dateParams['to'] ? date('Y-m-d H:i:s', $dateParams['to']) : null;

        CommissionDistribution::where('login_code', $login)
            ->when($fromDate, function ($query, $fromDate) {
                return $query->where('deal_time', '>=', $fromDate);
            })
            ->when($toDate, function ($query, $toDate) {
                return $query->where('deal_time', '<=', $toDate);
            })
            ->delete();

        // Calculate and save new commission distributions
        foreach ($deals as $deal) {
            // Skip if this is a close transaction
            if ($deal['entry'] == 1)
                continue;

            // Calculate LOT size
            $lotSize = ($deal['volume'] / 100000) * 10;

            // Skip if LOT is less than 0.1
            if ($lotSize < 0.1)
                continue;

            $dealTime = date('Y-m-d H:i:s', $deal['time']);

            // For each commission layer, calculate commission
            foreach ($commissionLayers as $layer) {
                $commissionAmount = $layer->rate * $lotSize;

                // Save commission distribution
                CommissionDistribution::create([
                    'commission_layer_id' => $layer->id,
                    'user_id' => $layer->user_id,
                    'login_code' => $login,
                    'deal_id' => $deal['deal'],
                    'symbol' => $deal['symbol'],
                    'lot_size' => $lotSize,
                    'commission_amount' => $commissionAmount,
                    'deal_time' => $dealTime,
                ]);
            }
        }

        return redirect()->back()->with('success', 'Commissions calculated and saved successfully');
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