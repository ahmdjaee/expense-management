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

        // Ganti bagian ini di method index()
        $loginCode = [];

        if (auth()->user()->role === 'marketing') {
            // Gunakan hubungan many-to-many yang sudah didefinisikan di model User
            $loginCode = auth()->user()->loginCodes;
        } else {
            // Untuk superadmin dan admin, tampilkan semua login code
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

        // Ambil commission layers dari database
        $commissionLayers = CommissionLayer::with('user')->get();

        // Jika user adalah marketing, hanya tampilkan commission layers miliknya
        if (auth()->user()->role === 'marketing') {
            $commissionLayers = $commissionLayers->where('user_id', auth()->user()->id);
        }

        // Ambil commission distributions jika user adalah marketing
        $commissionDistributions = [];
        if (auth()->user()->role === 'marketing') {
            $commissionDistributions = CommissionDistribution::where('user_id', auth()->user()->id)
                ->with('commissionLayer')
                ->orderBy('deal_time', 'desc')
                ->get();
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
            'commissionLayers' => $commissionLayers,
            'commissionDistributions' => $commissionDistributions,
        ]);
    }

    /**
     * Save commission layers configuration.
     */
    public function saveCommissionLayers(Request $request)
    {

        // dd($request->all());
        $validated = $request->validate([
            'layers' => 'required|array',
            'layers.*.name' => 'required|string|max:255',
            'layers.*.rate' => 'required|numeric|min:0',
            'layers.*.color' => 'required|string|max:50',
            'layers.*.user_id' => 'nullable|exists:users,id',
        ]);

        // Ambil ID dari layer yang akan disimpan
        $newLayerIds = [];
        foreach ($validated['layers'] as $layer) {
            if (isset($layer['id'])) {
                $newLayerIds[] = $layer['id'];
            }
        }

        // Hapus distribusi komisi yang terkait dengan layer yang akan dihapus
        if (!empty($newLayerIds)) {
            CommissionDistribution::whereNotIn('commission_layer_id', $newLayerIds)->delete();
        } else {
            // Jika semua layer akan dihapus, hapus semua distribusi komisi
            CommissionDistribution::query()->delete();
        }

        // Hapus semua commission layers yang ada untuk diganti dengan yang baru
        CommissionLayer::query()->delete();

        // Simpan commission layers baru
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

        // Hapus distribusi komisi yang ada untuk login dan rentang tanggal ini
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

        // Hitung dan simpan distribusi komisi baru
        foreach ($deals as $deal) {
            // Skip jika ini adalah transaksi close
            if ($deal['entry'] == 1)
                continue;

            // Hitung LOT size
            $lotSize = ($deal['volume'] / 100000) * 10;

            // Skip jika LOT kurang dari 0.1
            if ($lotSize < 0.1)
                continue;

            $dealTime = date('Y-m-d H:i:s', $deal['time']);

            // Untuk setiap commission layer, hitung komisi
            foreach ($commissionLayers as $layer) {
                $commissionAmount = $layer->rate * $lotSize;

                // Simpan distribusi komisi
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