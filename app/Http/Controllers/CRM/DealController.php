<?php

namespace App\Http\Controllers\CRM;

use App\Http\Controllers\Controller;
use DateTime;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
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
        
        // Get date range parameters
        $dateParams = $this->getDateRangeParams($dateRange, $from, $to);
        
        // Fetch deals data
        $dealsResponse = $this->fetchDeals($login, $dateParams);
        
        // Fetch user profile data
        $userProfileResponse = $this->fetchUserProfile($login);
        
        // dd($userProfileResponse);
        // Prepare dummy user data for now
        $dummyUsers = [
            '5000311' => [
                'id' => 1,
                'name' => 'John Doe',
                'loginId' => '5000311',
                'email' => 'john.doe@example.com',
                'role' => 'Trader',
                'avatar' => null,
            ],
            '5000312' => [
                'id' => 2,
                'name' => 'Jane Smith',
                'loginId' => '5000312',
                'email' => 'jane.smith@example.com',
                'role' => 'Trader',
                'avatar' => null,
            ],
            '5000313' => [
                'id' => 3,
                'name' => 'Bob Johnson',
                'loginId' => '5000313',
                'email' => 'bob.johnson@example.com',
                'role' => 'Trader',
                'avatar' => null,
            ],
        ]; 
        
        $currentUser = $dummyUsers[$login] ?? $dummyUsers['5000311'];
        
        return Inertia::render('crm/deal/index', [
            'deals' => $dealsResponse['data'] ?? [],
            'apiResponse' => $dealsResponse,
            'userProfile' => $userProfileResponse,
            'currentUser' => $currentUser,
            'login' => $login,
            'dateRange' => $dateRange,
            'from' => $from,
            'to' => $to,
            // Commission distribution settings (for future development)
            'commissionSettings' => [
                'layer1' => [
                    'name' => 'BM – Business Manager',
                    'rate' => 10.0, // $ per LOT
                    'color' => 'indigo',
                ],
                'layer2' => [
                    'name' => 'DM – Deputy Manager',
                    'rate' => 8.0, // $ per LOT
                    'color' => 'blue',
                ],
                'layer3' => [
                    'name' => 'AM – Assistant Manager',
                    'rate' => 6.0, // $ per LOT
                    'color' => 'green',
                ],
                'layer4' => [
                    'name' => 'SMT – Senior Marketing Team',
                    'rate' => 4.0, // $ per LOT
                    'color' => 'yellow',
                ],
                'layer5' => [
                    'name' => 'STL – Senior Team Leader',
                    'rate' => 3.0, // $ per LOT
                    'color' => 'orange',
                ],
                'layer6' => [
                    'name' => 'MT – Marketing Team / Marketing Officer',
                    'rate' => 2.0, // $ per LOT
                    'color' => 'red',
                ],
                'layer7' => [
                    'name' => 'Freelance / IB – Introducing Broker',
                    'rate' => 1.0, // $ per LOT
                    'color' => 'purple',
                ],
            ],
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
