import AppLogo from '@/components/app-logo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { logout } from '@/routes';
import { SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Activity,
    AlertCircle,
    Calculator,
    DollarSign,
    Download,
    Eye,
    EyeOff,
    LogOut,
    Menu,
    Plus,
    RefreshCw,
    Search,
    Trash2,
    TrendingDown,
    TrendingUp,
    User,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ReactSelect from 'react-select';

interface Deal {
    deal: number;
    symbol: string;
    action: number;
    entry: number;
    digits: number;
    contractSize: number;
    price: number;
    sl: number;
    tp: number;
    volume: number;
    volumeclosed: number;
    profit: number;
    storage: number;
    commission: number;
    fee: number;
    rateprofit: number;
    time: number;
    position: number;
}

interface ApiResponse {
    result: boolean;
    error: string;
    login: number;
    from: number;
    to: number;
    size: number;
    data: Deal[];
}

interface UserProfile {
    login: number;
    name: string;
    balance: number;
    equity: number;
    leverage: number;
    city: string;
    country: string;
    status: string;
    comment: string;
}

// New interface for dynamic commission layer
interface CommissionLayer {
    id: string;
    name: string;
    rate: number;
    color: string;
    userId?: number | null; // Add userId to track which user this layer belongs to
}

// Interface for user select options
interface UserOption {
    value: number;
    label: string;
}

// Interface for login code options
interface LoginCodeOption {
    value: string;
    label: string;
}

// Interface for commission history periods
interface CommissionPeriod {
    id: string;
    loginCode: string;
    dateRange: string;
    fromDate: string;
    toDate: string;
    totalCommission: number;
    totalCommissionIDR: number;
    dealCount: number;
}

type DateRange = 'today' | 'week' | 'month' | 'year' | 'all' | 'custom';

// Dummy data for layer options
const LAYER_OPTIONS = [
    'Business Manager',
    'Deputy Manager',
    'Assistant Manager',
    'Senior Marketing Team',
    'Team Leader',
    'Marketing Team',
    'Marketing Officer',
    'Introducing Broker',
    'Regional Manager',
    'Senior Broker',
    'Junior Broker',
    'Account Manager',
    'Sales Representative',
];

// Color options for layers
const LAYER_COLORS = ['indigo', 'blue', 'green', 'yellow', 'orange', 'red', 'purple', 'pink', 'teal', 'cyan'];

// Custom hook for debouncing
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

export default function GLORIDashboard() {
    const { props } = usePage<SharedData>();
    const initialDeals = Array.isArray(props.deals) ? props.deals as Deal[] : []; // Defensive: Ensure deals is always an array
    const initialUserProfile = (props.userProfile as UserProfile) || null;
    const initialLoginCode = props.loginCode || null;
    const initialLogin = props.login || '5000311';
    const initialDateRange = props.dateRange || 'today';
    const initialFrom = props.from || '';
    const initialTo = props.to || '';
    const user = props.auth.user || null;
    const initialApiResponse = (props.apiResponse && typeof props.apiResponse === 'object')
  ? (props.apiResponse as ApiResponse)
  : null;

    // Get users list from props
    const usersList = props.users || [];
    const initialSelectedUser = (props.selectedUser as UserOption) || null;

    // Get login codes list from props
    const loginCodesList = props.loginCodes || [];
    const initialSelectedLoginCode = (props.selectedLoginCode as LoginCodeOption) || null;

    // Get commission periods from props
    const commissionPeriods = props.commissionPeriods || [];

    const initialLayers = Array.isArray(props.commissionLayers) ? props.commissionLayers as CommissionLayer[] : []; // Data dari DB
    const [commissionLayers, setCommissionLayers] = useState<CommissionLayer[]>(initialLayers);
    const [commissionDistributions, setCommissionDistributions] = useState(props.commissionDistributions || []); // Data dari DB

    const [deals, setDeals] = useState<Deal[]>(initialDeals);
    const [filteredDeals, setFilteredDeals] = useState<Deal[]>(initialDeals);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [login, setLogin] = useState(initialLogin);
    const [apiResponse, setApiResponse] = useState<ApiResponse | null>(initialApiResponse);
    const [showAllColumns, setShowAllColumns] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSymbol, setSelectedSymbol] = useState<string>('all');
    const [dateRange, setDateRange] = useState<DateRange>(initialDateRange);
    const [customTransactionFromDate, setCustomTransactionFromDate] = useState(initialFrom);
    const [customTransactionToDate, setCustomTransactionToDate] = useState(initialTo);
    const [customCommissionFromDate, setCustomCommissionFromDate] = useState(initialFrom);
    const [customCommissionToDate, setCustomCommissionToDate] = useState(initialTo);
    const [filteredCommissions, setFilteredCommissions] = useState(null);

    const [idrRate, setIdrRate] = useState<string>('10000');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [loginCode, setLoginCode] = useState(initialLoginCode);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(initialUserProfile);

    // Add selected user state
    const [selectedUser, setSelectedUser] = useState<UserOption | null>(initialSelectedUser);
    
    // Add selected login code state for marketing
    const [selectedLoginCode, setSelectedLoginCode] = useState<LoginCodeOption | null>(initialSelectedLoginCode);

 //   const activeLoginCode = selectedLoginCode?.value ?? login;

//     const hasDistributionForLogin = commissionDistributions?.some(
//         dist => String(dist.login_code) === String(activeLoginCode)
// );

    useEffect(() => {
        // Cek apakah props memiliki data baru
        if (props.selectedLoginCode && props.selectedLoginCode.value !== selectedLoginCode?.value) {
            setSelectedLoginCode(props.selectedLoginCode);
        }

        if (props.selectedUser && props.selectedUser.value !== selectedUser?.value) {
            setSelectedUser(props.selectedUser);
        }

    // Tambahkan 'selectedLoginCode?.value' ke dalam array dependency
    }, [props.selectedLoginCode, selectedLoginCode?.value, props.selectedUser, selectedUser?.value]);

    // Local state for rate inputs to provide immediate feedback
    // const [localRates, setLocalRates] = useState<{ [key: string]: string }>(() => {
    //     const initial: { [key: string]: string } = {};
    //     initialLayers.forEach((layer) => {
    //         initial[layer.id] = layer.rate.toString();
    //     });
    //     return initial;
    // });
    const [localRates, setLocalRates] = useState<Record<string, string>>(() => {
    if (!Array.isArray(initialLayers)) return {};

    return Object.fromEntries(
        initialLayers.map(layer => [layer.id, String(layer.rate)])
    );
});

    // Debounced version of localRates
    const debouncedRates = useDebounce(localRates, 300);

    // Calculate total commission for all periods 
    const totalCommissionAllPeriods = useMemo(() => {
        return commissionPeriods.reduce((sum, period) => {
     
            const isLoginCodeMatch = selectedLoginCode 
                ? period.loginCode === selectedLoginCode.value 
                : true;

            return isLoginCodeMatch ? sum + period.totalCommission : sum;
        }, 0);
    }, [commissionPeriods, selectedLoginCode]); 

    // Handle custom commission period
    const handleCustomCommisionPeriod = () => {
        const result = commissionPeriods.filter(period => {

            // Date check
            const itemDate = new Date(period.fromDate).setHours(0, 0, 0, 0);

            const start = customCommissionFromDate ? new Date(customCommissionFromDate).setHours(0, 0, 0, 0) : null;
            const end = customCommissionToDate ? new Date(customCommissionToDate).setHours(0, 0, 0, 0) : null;

            const isAfterStart = start ? itemDate >= start : true;
            const isBeforeEnd = end ? itemDate <= end : true;

            // Login code match
            const isLoginCodeMatch = selectedLoginCode 
                ? period.loginCode === selectedLoginCode.value 
                : true;

            return isAfterStart && isBeforeEnd && isLoginCodeMatch

            // return isAfterStart && isBeforeEnd;
        });

        if (result.length === 0) {
            alert("No commissions found in this period");
        }

        // Filtred data array
        setFilteredCommissions(result);
    };

    // Calculate total commission for current login code
    const totalCommissionThisPeriod = useMemo(() => {
        if (filteredCommissions === null) return null;
    
        return filteredCommissions.reduce((sum, period) => sum + period.totalCommission, 0);
    }, [filteredCommissions]); // Hanya jalan ulang jika hasi

    // Commissions History to displau
    const commissionHistory = filteredCommissions || commissionPeriods;

    // Fungsi untuk menyimpan commission layers ke database
    const saveCommissionLayersToDb = () => {
        setLoading(true);
        router.post(
            '/commissions/save-layers',
            {
                layers: commissionLayers,
            },
            {
                onSuccess: () => {
                    // Tampilkan pesan sukses
                    // Inertia akan otomatis me-refresh props, termasuk commissionLayers
                },
                onError: (errors) => {
                    setError('Failed to save commission layers');
                    console.error(errors);
                },
                onFinish: () => {
                    setLoading(false);
                },
            },
        );
    };

    // Fungsi untuk menghitung dan menyimpan komisi
    const calculateCommissions = () => {
        setLoading(true);
        const params: any = {
            login: login,
            dateRange: dateRange,
        };
        if (dateRange === 'custom' && customTransactionFromDate) params.from = customTransactionFromDate;
        if (dateRange === 'custom' && customTransactionToDate) params.to = customTransactionToDate;

        router.post('/commissions/calculate-commissions', params, {
            onSuccess: (page: any) => {
                // Refresh data distribusi komisi jika user marketing
                if (user?.role === 'marketing' || user?.role === 'user') {
                    setCommissionDistributions(page.props.commissionDistributions || []);
                }
                setError('');
            },
            onError: (errors) => {
                setError('Failed to calculate commissions');
            },
            onFinish: () => {
                setLoading(false);
            },
        });
    };

    // Update commissionLayers when debounced rates change
    // useEffect(() => {
    //     const updatedLayers = commissionLayers.map((layer) => {
    //         const newRate = parseFloat(debouncedRates[layer.id]) || 0;
    //         if (newRate !== layer.rate) {
    //             return { ...layer, rate: newRate };
    //         }
    //         return layer;
    //     });
    useEffect(() => {
    if (!Array.isArray(commissionLayers)) return;

    const updatedLayers = commissionLayers.map((layer) => {
        const newRate = parseFloat(debouncedRates[layer.id]) || 0;
        if (newRate !== layer.rate) {
            return { ...layer, rate: newRate };
        }
        return layer;
    });

        // Only update if there are actual changes
        const hasChanges = updatedLayers.some((layer, index) => layer.rate !== commissionLayers[index].rate);
        if (hasChanges) {
            setCommissionLayers(updatedLayers);
        }
    }, [debouncedRates]);

    // Defensive: Ensure deals is always an array
    const safeDeals = useMemo(() => (Array.isArray(deals) ? deals : []), [deals]);
    const safeFilteredDeals = useMemo(() => (Array.isArray(filteredDeals) ? filteredDeals : []), [filteredDeals]);

    // Function to refresh data using Inertia.js
    const refreshData = () => {
        setLoading(true);

        const params: any = {
            login: login,
            dateRange: dateRange,
            commissionLayers: commissionLayers, // Pass the current layers configuration
            userId: selectedUser?.value || null, // Pass selected user ID
            loginCode: selectedLoginCode?.value || null, // Pass selected login code for marketing
        };

        if (dateRange === 'custom' && customTransactionFromDate) {
            params.from = customTransactionFromDate;
        }

        if (dateRange === 'custom' && customTransactionToDate) {
            params.to = customTransactionToDate;
        }

        router.get('/commissions/deals', params, {
            preserveState: false,
            onSuccess: (page: any) => {
                setDeals(page.props.deals || []);
                setFilteredDeals(page.props.deals || []);
                setApiResponse(page.props.apiResponse || null);
                setUserProfile(page.props.userProfile || null);
                setLoginCode(page.props.loginCode || null);
                setSelectedUser(page.props.selectedUser || null);
                setError('');
            },
            onError: (errors) => {
                setError('Failed to refresh data');
            },
            onFinish: () => {
                setLoading(false);
            },
        });
    };

    useEffect(() => {
        let filtered = safeDeals;

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(
                (deal) =>
                    deal.deal.toString().includes(searchTerm) ||
                    deal.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    deal.position.toString().includes(searchTerm),
            );
        }

        // Filter by symbol
        if (selectedSymbol !== 'all') {
            filtered = filtered.filter((deal) => deal.symbol === selectedSymbol);
        }

        setFilteredDeals(filtered);
    }, [deals, searchTerm, selectedSymbol]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const formatIDR = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatTimestamp = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getActionBadge = (action: number, entry: number) => {
        if (entry === 0) {
            return action === 0 ? (
                <Badge variant="destructive" className="text-xs">
                    Sell
                </Badge>
            ) : (
                <Badge variant="default" className="text-xs">
                    Buy
                </Badge>
            );
        } else {
            return action === 0 ? (
                <Badge variant="secondary" className="text-xs">
                    Sell Close
                </Badge>
            ) : (
                <Badge variant="secondary" className="text-xs">
                    Buy Close
                </Badge>
            );
        }
    };

    const getActionText = (action: number, entry: number) => {
        if (entry === 0) {
            return action === 0 ? 'SELL' : 'BUY';
        } else {
            return action === 0 ? 'SELL CLOSE' : 'BUY CLOSE';
        }
    };

    const getProfitColor = (profit: number) => {
        if (profit > 0) return 'text-green-600 font-semibold';
        if (profit < 0) return 'text-red-600 font-semibold';
        return 'text-gray-600';
    };

    const getEntryText = (entry: number) => {
        return entry === 0 ? 'IN' : 'OUT';
    };

    const totalProfit = useMemo(() => safeDeals.reduce((sum, deal) => sum + deal.profit, 0), [safeDeals]);

    const { entryInDeals, entryOutDeals, totalCommission, totalLotIn } = useMemo(() => {
        const inDeals = safeDeals.filter((deal) => deal.entry === 0);
        const outDeals = safeDeals.filter((deal) => deal.entry === 1);
        const commIn = inDeals.reduce((sum, deal) => sum + deal.commission, 0);
        const commOut = outDeals.reduce((sum, deal) => sum + deal.commission, 0);
        const lotIn = inDeals.reduce((sum, deal) => sum + (deal.volume / 100000) * 10, 0);
        return { entryInDeals: inDeals, entryOutDeals: outDeals, totalCommission: commIn + commOut, totalLotIn: lotIn };
    }, [safeDeals]);

    // Split total commission equally between IN and OUT (Total Commission / 2) - using absolute value
    const commissionSplitIn = Math.abs(totalCommission) / 2;
    const commissionSplitOut = Math.abs(totalCommission) / 2;

    // Update the getLayerDistribution function to work with dynamic layers
    const getLayerDistribution = useCallback(
        (commissionAmount: number, volume: number, entry: number) => {
            // Only calculate distribution for non-close positions with 0.1 LOT or more
            if (entry === 1) {
                // Close position - no commission distribution
                const result: { [key: string]: number } = {};
                commissionLayers.forEach((layer) => {
                    result[layer.id] = 0;
                });
                return result;
            }

            // Calculate LOT size
            const lotSize = (volume / 100000) * 10;

            // Only apply commission if LOT is 0.1 or more
            if (lotSize < 0.1) {
                const result: { [key: string]: number } = {};
                commissionLayers.forEach((layer) => {
                    result[layer.id] = 0;
                });
                return result;
            }

            // Use configured dollar amounts per layer (multiplied by LOT size)
            const result: { [key: string]: number } = {};
            commissionLayers.forEach((layer) => {
                result[layer.id] = layer.rate * lotSize;
            });

            return result;
        },
        [commissionLayers],
    );

    // Update the totalLayerDistribution calculation to work with dynamic layers
    const totalLayerDistribution = useMemo(() => {

        if (!Array.isArray(commissionLayers)) {
            return {};
        }
        
        return safeDeals.reduce(
            (acc, deal) => {
                const distribution = getLayerDistribution(deal.commission, deal.volume, deal.entry);

                // Initialize accumulator if needed
                commissionLayers.forEach((layer) => {
                    if (acc[layer.id] === undefined) {
                        acc[layer.id] = 0;
                    }
                });

                // Add distribution to accumulator
                commissionLayers.forEach((layer) => {
                    acc[layer.id] += distribution[layer.id];
                });

                return acc;
            },
            {} as { [key: string]: number },
        );
    }, [safeDeals, commissionLayers, getLayerDistribution]);

    const totalFee = safeDeals.reduce((sum, deal) => sum + deal.fee, 0);
    const totalStorage = safeDeals.reduce((sum, deal) => sum + deal.storage, 0);
    const profitableDeals = safeDeals.filter((deal) => deal.profit > 0).length;
    const losingDeals = safeDeals.filter((deal) => deal.profit < 0).length;
    const neutralDeals = safeDeals.filter((deal) => deal.profit === 0).length;

    // Calculate IDR values - Use userProfile.id as the rate
    const rate = userProfile?.id || parseFloat(idrRate) || 10000;
    const commissionSplitInIDR = commissionSplitIn * rate;
    const commissionSplitOutIDR = commissionSplitOut * rate;
    const totalCommissionIDR = commissionSplitInIDR + commissionSplitOutIDR;
    const totalFeeIDR = Math.abs(totalFee) * rate;
    const totalStorageIDR = Math.abs(totalStorage) * rate;
    const totalFeesIDR = totalCommissionIDR + totalFeeIDR + totalStorageIDR;

    const uniqueSymbols = Array.from(new Set(safeDeals.map((deal) => deal.symbol)));
    const uniquePositions = Array.from(new Set(safeDeals.map((deal) => deal.position)));

    // Functions to manage dynamic layers
    const addLayer = () => {
        const newLayerId = `layer${commissionLayers.length + 1}`;
        const availableColors = LAYER_COLORS.filter(
            (color) => !commissionLayers.some((layer) => layer.color === color),
        );
        const newColor = availableColors.length > 0 ? availableColors[0] : 'gray';

        const newLayer = {
            id: newLayerId,
            name: LAYER_OPTIONS[0], // Default to first option
            rate: 1,
            color: newColor,
        };

        setCommissionLayers([...commissionLayers, newLayer]);
        setLocalRates((prev) => ({ ...prev, [newLayerId]: '1' }));
    };

    const removeLayer = (layerId: string) => {
        // Prevent removing if only one layer remains
        if (commissionLayers.length <= 1) {
            setError('At least one commission layer is required');
            return;
        }

        setCommissionLayers(commissionLayers.filter((layer) => layer.id !== layerId));
        setLocalRates((prev) => {
            const newRates = { ...prev };
            delete newRates[layerId];
            return newRates;
        });
    };

    const updateLayerName = (layerId: string, name: string) => {
        setCommissionLayers(commissionLayers.map((layer) => (layer.id === layerId ? { ...layer, name } : layer)));
    };

    const updateLayerUser = (layerId: string, userOption: UserOption | null) => {
        setCommissionLayers(
            commissionLayers.map((layer) =>
                layer.id === layerId ? { ...layer, user_id: userOption?.value || null } : layer,
            ),
        );
    };

    // Optimized rate update - only updates local state immediately
    const updateLayerRateLocal = useCallback((layerId: string, value: string) => {
        setLocalRates((prev) => ({ ...prev, [layerId]: value }));
    }, []);

    const handleUserChange = (userOption: UserOption | null) => {
        setSelectedUser(userOption);

        // Use Inertia.js to navigate with new parameters
        const params: any = {
            login: login,
            dateRange: dateRange,
            commissionLayers: commissionLayers,
            userId: userOption?.value || null,
            loginCode: selectedLoginCode?.value || null, // Keep selected login code
        };

        if (dateRange === 'custom' && customTransactionFromDate) {
            params.from = customTransactionFromDate;
        }

        if (dateRange === 'custom' && customTransactionToDate) {
            params.to = customTransactionToDate;
        }

        router.get('/commissions/deals', params, {
            preserveState: false,
            onSuccess: (page: any) => {
                setDeals(page.props.deals || []);
                setFilteredDeals(page.props.deals || []);
                setApiResponse(page.props.apiResponse || null);
                setUserProfile(page.props.userProfile || null);
                setError('');
            },
            onError: (errors) => {
                setError('Failed to update data');
            },
        });
    };

    // Handle login code change for marketing
    const handleLoginCodeChange = (loginCodeOption: LoginCodeOption | null) => {
        setSelectedLoginCode(loginCodeOption);
        
        // Update the login value with the selected login code
        if (loginCodeOption) {
            setLogin(loginCodeOption.value);
            
            // Use Inertia.js to navigate with new parameters
            const params: any = {
                login: loginCodeOption.value,
                dateRange: dateRange,
                commissionLayers: commissionLayers,
                userId: selectedUser?.value || null,
                loginCode: loginCodeOption.value,
            };

            if (dateRange === 'custom' && customTransactionFromDate) {
                params.from = customTransactionFromDate;
            }

            if (dateRange === 'custom' && customTransactionToDate) {
                params.to = customTransactionToDate;
            }

            router.get('/commissions/deals', params, {
                preserveState: false,
                onSuccess: (page: any) => {
                    setDeals(page.props.deals || []);
                    setFilteredDeals(page.props.deals || []);
                    setApiResponse(page.props.apiResponse || null);
                    setUserProfile(page.props.userProfile || null);
                    setError('');
                },
                onError: (errors) => {
                    setError('Failed to update data');
                },
            });
        }
    };

    const exportToCSV = () => {
        const headers = [
            'Deal ID',
            'Position ID',
            'Symbol',
            'Action',
            'Price',
            'LOT',
            'Volume Closed',
            'S/L',
            'T/P',
            'Total Commission',
            'Fee',
            'Storage',
            'Profit',
            'Contract Size',
            'Digits',
            'Rate Profit',
            'Time',
            'Date',
        ];

        const csvData = safeFilteredDeals.map((deal) => {
            return [
                deal.deal,
                deal.position,
                deal.symbol,
                getActionText(deal.action, deal.entry),
                deal.price.toFixed(deal.digits),
                deal.entry === 1 ? '0' : ((deal.volume / 100000) * 10).toFixed(1),
                deal.volumeclosed,
                deal.sl > 0 ? deal.sl.toFixed(deal.digits) : '0',
                deal.tp > 0 ? deal.tp.toFixed(deal.digits) : '0',
                deal.commission, // Total commission
                deal.fee,
                deal.storage,
                deal.profit,
                deal.contractSize,
                deal.digits,
                deal.rateprofit,
                formatTimestamp(deal.time),
                formatDate(deal.time),
            ];
        });

        // Add summary row at the end
        const summaryRow = ['SUMMARY', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];

        const csv = [headers, ...csvData, summaryRow].map((row) => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `glori_transactions_${login}_${dateRange}_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handleDateRangeChange = (range: DateRange) => {
        setDateRange(range);
        if (range !== 'custom') {
            setCustomTransactionFromDate('');
            setCustomTransactionToDate('');
            alert("Ini bukan custom woiii!")
        }

        // Use Inertia.js to navigate with new parameters
        const params: any = {
            login: login,
            dateRange: range,
            commissionLayers: commissionLayers, // Pass the current layers configuration
            userId: selectedUser?.value || null,
            loginCode: selectedLoginCode?.value || null, // Pass selected login code
        };
        
        if (range === 'custom' && customTransactionFromDate) {
            params.from = customTransactionFromDate;
        }

        if (range === 'custom' && customTransactionToDate) {
            params.to = customTransactionToDate;
        }

        router.get('/commissions/deals', params, {
            preserveState: false,
            onSuccess: (page: any) => {
                setDeals(page.props.deals || []);
                setFilteredDeals(page.props.deals || []);
                setApiResponse(page.props.apiResponse || null);
                setUserProfile(page.props.userProfile || null);
                setError('');
            },
            onError: (errors) => {
                setError('Failed to update data');
            },
        });
    };

    const handleCustomDateSearch = () => {
        if (customTransactionFromDate || customTransactionToDate) {
            handleDateRangeChange('custom');
        }
    };

    const handleLoginChange = (newLogin: string) => {
        setLogin(newLogin);

        // Use Inertia.js to navigate with new parameters
        const params: any = {
            login: newLogin,
            dateRange: dateRange,
            commissionLayers: commissionLayers, // Pass the current layers configuration
            userId: selectedUser?.value || null,
            loginCode: selectedLoginCode?.value || null, // Pass selected login code
        };

        if (dateRange === 'custom' && customTransactionFromDate) {
            params.from = customTransactionFromDate;
        }

        if (dateRange === 'custom' && customTransactionToDate) {
            params.to = customTransactionToDate;
        }

        router.get('/commissions/deals', params, {
            preserveState: false,
            onSuccess: (page: any) => {
                setDeals(page.props.deals || []);
                setFilteredDeals(page.props.deals || []);
                setApiResponse(page.props.apiResponse || null);
                setUserProfile(page.props.userProfile || null);
                setLoginCode(page.props.loginCode || null);
                setError('');
            },
            onError: (errors) => {
                setError('Failed to update data');
            },
        });
    };

    const cleanup = useMobileNavigation();

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    return (
        <div className="min-h-screen">
            {/* Mobile Header */}
            <div className="p-4 shadow-sm lg:hidden">
                <div className="flex items-center justify-between">
                    <Link href="/">
                        <AppLogo />
                    </Link>
                    <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm lg:hidden">
                    <div className="h-full w-80 overflow-y-auto p-4 shadow-xl">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Menu</h2>
                            <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(false)}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="space-y-6">
                            {/* Login Code Selection for Marketing */}
                            {(user?.role === 'marketing' || user?.role === 'user') && (
                                <div>
                                    <Label htmlFor="mobile-login-code">Login Code:</Label>
                                    <Select 
                                        value={selectedLoginCode?.value || login} 
                                        onValueChange={(value) => {
                                            const option = loginCodesList.find((code: any) => code.code === value);
                                            if (option) {
                                                handleLoginCodeChange({ value: option.code, label: option.code });
                                            }
                                        }}
                                    >
                                        <SelectTrigger className="w-48">
                                            <SelectValue placeholder="Select Login Code" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {loginCodesList.map((code: any) => (
                                                <SelectItem key={code.id} value={code.code}>
                                                    {code.code}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Login ID for Admin */}
                            {(user?.role !== 'marketing' && user?.role !== 'user') && (
                                <div>
                                    <Label htmlFor="mobile-login">Login ID:</Label>
                                    <Select value={login} onValueChange={handleLoginChange}>
                                        <SelectTrigger className="w-48">
                                            <SelectValue placeholder="Select Login ID" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {loginCode &&
                                                loginCode.map((code: any) => (
                                                    <SelectItem key={code.id} value={code.code}>
                                                        {code.code}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* IDR Rate */}
                            <div>
                                <Label htmlFor="mobile-rate">USD to IDR Rate:</Label>
                                <Input
                                    id="mobile-rate"
                                    type="number"
                                    value={idrRate}
                                    onChange={(e) => setIdrRate(e.target.value)}
                                    className="w-full"
                                    placeholder="10000"
                                    min="1"
                                    step="100"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                <Button onClick={refreshData} disabled={loading} className="w-full">
                                    <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                    Refresh Data
                                </Button>
                                <Button
                                    onClick={exportToCSV}
                                    variant="outline"
                                    disabled={(filteredDeals?.length || 0) === 0}
                                    className="w-full"
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Export CSV
                                </Button>
                                <Link
                                    href={logout()}
                                    as="button"
                                    onClick={handleLogout}
                                    className="w-full"
                                    data-test="logout-button"
                                >
                                    <Button variant="default" className="w-full">
                                        <LogOut className="mr-2" />
                                        Log out
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop Header */}
            <div className="hidden p-6 shadow-sm lg:block">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <Link href="/">
                        <AppLogo />
                    </Link>
                    <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                        {/* Login Code Selection for Marketing */}
                        {(user?.role === 'marketing' || user?.role === 'user') && (
                            <div className="flex items-center space-x-2">
                                <Label htmlFor="login-code">Login Code:</Label>
                                <Select 
                                    value={selectedLoginCode?.value || login} 
                                    onValueChange={(value) => {
                                        const option = loginCodesList.find((code: any) => code.code === value);
                                        if (option) {
                                            handleLoginCodeChange({ value: option.code, label: option.code });
                                        }
                                    }}
                                >
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Select Login Code" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {loginCodesList.map((code: any) => (
                                            <SelectItem key={code.id} value={code.code}>
                                                {code.code}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Login ID for Admin */}
                        {(user?.role !== 'marketing' && user?.role !== 'user') && (
                            <div className="flex items-center space-x-2">
                                <Label htmlFor="login">Login ID:</Label>
                                <Select value={login} onValueChange={handleLoginChange}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Select Login ID" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {loginCode &&
                                            loginCode.map((code: any) => (
                                                <SelectItem key={code.id} value={code.code}>
                                                    {code.code}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                </Select>
                            </div>
                        )}
                        
                        <div className="flex items-center space-x-2">
                            <Label htmlFor="rate">Rate:</Label>
                            <Input
                                id="rate"
                                type="number"
                                value={userProfile?.id}
                                className="w-24"
                                placeholder="10000"
                                min="1"
                                step="100"
                                disabled
                            />
                        </div>
                        <Button onClick={refreshData} disabled={loading}>
                            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Button onClick={exportToCSV} variant="outline" disabled={(filteredDeals?.length || 0) === 0}>
                            <Download className="mr-2 h-4 w-4" />
                            Export CSV
                        </Button>
                        <Link href={logout()} as="button" onClick={handleLogout} data-test="logout-button">
                            <Button variant="default">
                                <LogOut className="mr-2" />
                                Log out
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-4">
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2 text-red-800">
                                <AlertCircle className="h-5 w-5" />
                                <span>{error}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* IDR Rate Configuration - Mobile Optimized */}
            <div className="p-4 lg:p-6">
                <Head title="Dashboard" />
                <div className="mb-3 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                        <p className="mt-1 text-muted-foreground">
                            Complete trading transaction data and analytics with full date range
                        </p>
                    </div>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg lg:text-base">
                            <Calculator className="h-5 w-5" />
                            Currency Configuration
                        </CardTitle>
                        <CardDescription className="text-sm">
                            USD to IDR conversion rate from user profile (Rate ID: {userProfile?.id || 'N/A'})
                        </CardDescription>
                        {/* {Array.isArray(commissionLayers) && commissionLayers.length > 0 && hasDistributionForLogin && (
                        {Array.isarray(commissionLayers) && commissionLayers.length > 0 && hasDistributionForLogin && (
                            <CardDescription className="mt-2 text-sm">
                                Active Layers:{" "}
                                {commissionLayers.map(layer => `${layer.name} (${layer.rate}$/LOT)`).join(', ')}
                            </CardDescription>
                            )} */}
                        
                        <CardDescription className="mt-2 text-sm">
                        {(() => {
                        // Log for debugging
                        console.log("Component mounted");
                        console.log("selectedLoginCode:", selectedLoginCode);
                        console.log("login:", login);
                        console.log("commissionLayers:", commissionLayers);
                        console.log("commissionDistributions:", commissionDistributions);

                        const activeLoginCode = selectedLoginCode?.value ?? login;

                        // Safe check for distributions
                        const hasDistributionForLogin = Array.isArray(commissionDistributions)
                            ? commissionDistributions.some(
                                dist => String(dist.login_code) === String(activeLoginCode)
                            )
                            : false;

                        if (!Array.isArray(commissionLayers) || commissionLayers.length === 0) {
                            return "No active layers available.";
                        }

                        if (!hasDistributionForLogin) {
                            return `No distribution found for login code ${activeLoginCode}.`;
                        }

                        // Safe mapping
                        return `Active Layers: ${commissionLayers
                            .map(layer => `${layer.name ?? "Unnamed"} (${layer.rate ?? "0"}/$LOT)`)
                            .join(", ")}`;
                        })()}
                    </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Results/Summary Section */}
                        <div className="rounded-lg border p-4">
                            <h4 className="mb-3 text-sm font-semibold">Fee Calculations Summary</h4>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {/* Current Rate */}
                                <div className="flex justify-between sm:col-span-2">
                                    <span className="text-sm text-gray-300">Current Rate:</span>
                                    <span className="text-sm font-medium">
                                        1 USD = {rate.toLocaleString('id-ID')} IDR
                                    </span>
                                </div>

                                {/* Rate Source Info */}
                                <div className="flex justify-between rounded p-2 sm:col-span-2
                                    bg-blue-50 dark:bg-blue-900/30 shadow-inset dark:shadow-[inset_0_1px_3px_rgba(0,0,0,0.6)]">
                                    <span className="text-xs text-blue-700">Rate Source:</span>
                                    <span className="text-xs font-semibold text-blue-900">
                                        User Profile ID: {userProfile?.id || 'Default (10000)'}
                                    </span>
                                </div>

                                {/* Commission IN */}
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Commission IN:</span>
                                    <div className="text-right">
                                        <span className="block text-sm font-medium">
                                            {formatCurrency(commissionSplitIn)}
                                        </span>
                                        <span className="text-xs text-gray-500">{formatIDR(commissionSplitInIDR)}</span>
                                    </div>
                                </div>

                                {/* Commission OUT */}
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Commission OUT:</span>
                                    <div className="text-right">
                                        <span className="block text-sm font-medium">
                                            {formatCurrency(commissionSplitOut)}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {formatIDR(commissionSplitOutIDR)}
                                        </span>
                                    </div>
                                </div>

                                {/* Total Commission */}
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Total Commission:</span>
                                    <div className="text-right">
                                        <span className="block text-sm font-medium">
                                            {formatCurrency(totalCommission)}
                                        </span>
                                        <span className="text-xs text-gray-500">{formatIDR(totalCommissionIDR)}</span>
                                    </div>
                                </div>

                                {/* Fee */}
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Fee:</span>
                                    <div className="text-right">
                                        <span className="block text-sm font-medium">{formatCurrency(totalFee)}</span>
                                        <span className="text-xs text-gray-500">{formatIDR(totalFeeIDR)}</span>
                                    </div>
                                </div>

                                {/* Storage */}
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Storage:</span>
                                    <div className="text-right">
                                        <span className="block text-sm font-medium">
                                            {formatCurrency(totalStorage)}
                                        </span>
                                        <span className="text-xs text-gray-500">{formatIDR(totalStorageIDR)}</span>
                                    </div>
                                </div>

                                {/* Total Fees - Highlighted */}
                                <div className="col-span-full border-t pt-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm font-semibold text-gray-700">Total Fees:</span>
                                        <div className="text-right">
                                            <span className="block text-sm font-bold">
                                                {formatCurrency(totalCommission + totalFee + totalStorage)}
                                            </span>
                                            <span className="text-xs font-semibold text-gray-700">
                                                {formatIDR(totalFeesIDR)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Summary Cards - Mobile Optimized */}
            <div className="px-4 pb-4 lg:px-6">
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4 xl:grid-cols-6">
                    <Card className="p-3 lg:p-4">
                        <div className="mb-1 flex items-center justify-between lg:mb-2">
                            <DollarSign className="h-4 w-4 text-green-600 lg:h-5 lg:w-5" />
                            <span className="text-xs text-gray-500 lg:text-sm">Total P&L</span>
                        </div>
                        <div className={`text-lg font-bold lg:text-xl ${getProfitColor(totalProfit)}`}>
                            {formatCurrency(totalProfit)}
                        </div>
                        <div className="text-xs text-gray-600">Net Profit/Loss</div>
                    </Card>

                    <Card className="p-3 lg:p-4">
                        <div className="mb-1 flex items-center justify-between lg:mb-2">
                            <TrendingDown className="h-4 w-4 text-red-600 lg:h-5 lg:w-5" />
                            <span className="text-xs text-gray-500 lg:text-sm">Commission</span>
                        </div>
                        <div className="text-lg font-bold text-red-600 lg:text-xl">
                            {formatCurrency(totalCommission)}
                        </div>
                        <div className="text-xs text-gray-600">Total Fees</div>
                        <div className="text-xs font-semibold text-gray-600">{formatIDR(totalCommissionIDR)}</div>
                        <div className="text-xs text-blue-600">
                            Rate: {rate.toLocaleString('id-ID')} (Profile ID: {userProfile?.id || 'Default'})
                        </div>
                    </Card>

                    <Card className="p-3 lg:p-4">
                        <div className="mb-1 flex items-center justify-between lg:mb-2">
                            <TrendingUp className="h-4 w-4 text-purple-600 lg:h-5 lg:w-5" />
                            <span className="text-xs text-gray-500 lg:text-sm">Win Rate</span>
                        </div>
                        <div className="text-lg font-bold text-purple-600 lg:text-xl">
                            {safeDeals.length > 0 ? Math.round((profitableDeals / safeDeals.length) * 100) : 0}%
                        </div>
                        <div className="text-xs text-gray-600">
                            {profitableDeals}/{safeDeals.length} wins
                        </div>
                    </Card>

                    {/* Account Profile Card */}
                    <Card className="p-3 lg:p-4">
                        <div className="mb-1 flex items-center justify-between lg:mb-2">
                            <User className="h-4 w-4 text-blue-600 lg:h-5 lg:w-5" />
                            <span className="text-xs text-gray-500 lg:text-sm">Account Profile</span>
                        </div>
                        <div className="text-lg font-bold text-blue-600 lg:text-xl">
                            {userProfile?.name || `Login ${login}`}
                        </div>
                        <div className="text-xs text-gray-600">Account {login}</div>
                        <div className="mt-1 text-xs text-gray-600">
                            <div className="flex justify-between">
                                <span>Balance:</span>
                                <span className="font-semibold">${userProfile?.balance?.toFixed(2) || '0.00'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Equity:</span>
                                <span className="font-semibold">${userProfile?.equity?.toFixed(2) || '0.00'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Leverage:</span>
                                <span className="font-semibold">1:{userProfile?.leverage || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>City:</span>
                                <span className="font-semibold">{userProfile?.city || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Country:</span>
                                <span className="font-semibold">{userProfile?.country || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Status:</span>
                                <span
                                    className={`font-semibold ${userProfile?.status ? 'text-green-600' : 'text-gray-600'}`}
                                >
                                    {userProfile?.status || 'Unknown'}
                                </span>
                            </div>
                            {userProfile?.comment && (
                                <div className="flex justify-between">
                                    <span>Rate:</span>
                                    <span className="font-semibold">{userProfile.comment}</span>
                                </div>
                            )}
                        </div>
                    </Card>

                    <Card className="p-3 lg:col-span-2 lg:p-4 xl:col-span-2">
                        <div className="mb-1 flex items-center justify-between lg:mb-2">
                            <Activity className="h-4 w-4 text-orange-600 lg:h-5 lg:w-5" />
                            <span className="text-xs text-gray-500 lg:text-sm">Total LOT</span>
                        </div>
                        <div className="text-lg font-bold text-orange-600 lg:text-xl">{totalLotIn.toFixed(1)}</div>
                        <div className="text-xs text-gray-600">Total dari semua transaksi IN (exclude Close)</div>
                    </Card>
                </div>
            </div>

            {/* Main Content - Mobile Optimized */}
            <div className="p-4 lg:p-6">
                <Tabs defaultValue="deals" className="space-y-4">
                    <div className="relative -mx-4 overflow-x-auto px-4 lg:mx-0 lg:px-0">
                        <TabsList
                            className={`inline-flex w-auto min-w-full lg:grid lg:w-full ${user?.role === 'admin' || user?.role === 'superadmin' ? 'lg:grid-cols-3' : 'lg:grid-cols-3'}`}
                        >
                            <TabsTrigger value="deals" className="flex-shrink-0 text-sm whitespace-nowrap">
                                Transactions ({filteredDeals?.length || 0})
                            </TabsTrigger>
                            <TabsTrigger value="analysis" className="flex-shrink-0 text-sm whitespace-nowrap">
                                Analysis
                            </TabsTrigger>
                            {/* Tab "My Commissions" hanya untuk marketing dan user*/}
                            {(user?.role === 'marketing' || user?.role === 'user') && (
                                <TabsTrigger value="my-commissions" className="flex-shrink-0 text-sm whitespace-nowrap">
                                    My Commissions
                                </TabsTrigger>
                            )}
                            {/* Tab "Distribution" hanya untuk admin */}
                            {(user?.role === 'admin' || user?.role === 'superadmin') && (
                                <TabsTrigger value="distribution" className="flex-shrink-0 text-sm whitespace-nowrap">
                                    Commission Distribution
                                </TabsTrigger>
                            )}
                        </TabsList>
                    </div>

                    <TabsContent value="deals">
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                    <div>
                                        <CardTitle className="text-lg">Trading Transactions</CardTitle>
                                        <CardDescription className="text-sm">
                                            {apiResponse &&
                                                `Showing ${filteredDeals?.length || 0} of ${apiResponse.size} deals`}
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowAllColumns(!showAllColumns)}
                                            className="text-xs lg:text-sm"
                                        >
                                            {showAllColumns ? (
                                                <EyeOff className="mr-1 h-4 w-4" />
                                            ) : (
                                                <Eye className="mr-1 h-4 w-4" />
                                            )}
                                            {showAllColumns ? 'Less' : 'More'}
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <RefreshCw className="h-8 w-8 animate-spin text-gray-600" />
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {/* Filters */}
                                        <div className="flex flex-col gap-4 lg:flex-row">
                                            <div className="flex-1">
                                                <Label htmlFor="search">Search:</Label>
                                                <div className="relative">
                                                    <Input
                                                        id="search"
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                        className="w-full pr-10 text-base"
                                                        placeholder="Deal ID, Symbol, or Position..."
                                                    />
                                                    <Search className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <Label htmlFor="symbol">Symbol:</Label>
                                                <select
                                                    id="symbol"
                                                    value={selectedSymbol}
                                                    onChange={(e) => setSelectedSymbol(e.target.value)}
                                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                >
                                                    <option value="all">All Symbols</option>
                                                    {uniqueSymbols.map((symbol) => (
                                                        <option key={symbol} value={symbol}>
                                                            {symbol}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Date Range Buttons */}
                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                variant={dateRange === 'today' ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => handleDateRangeChange('today')}
                                                className="text-xs lg:text-sm"
                                            >
                                                Today
                                            </Button>
                                            <Button
                                                variant={dateRange === 'week' ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => handleDateRangeChange('week')}
                                                className="text-xs lg:text-sm"
                                            >
                                                Last 7 Days
                                            </Button>
                                            <Button
                                                variant={dateRange === 'month' ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => handleDateRangeChange('month')}
                                                className="text-xs lg:text-sm"
                                            >
                                                Last 30 Days
                                            </Button>
                                            <Button
                                                variant={dateRange === 'year' ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => handleDateRangeChange('year')}
                                                className="text-xs lg:text-sm"
                                            >
                                                Last Year
                                            </Button>
                                        </div>

                                        {/* Custom Date Range - Mobile Optimized */}
                                        <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-end">
                                            <div className="flex-1">
                                                <Label htmlFor="fromDate">From Date:</Label>
                                                <Input
                                                    id="fromDate"
                                                    type="date"
                                                    value={customTransactionFromDate}
                                                    onChange={(e) => setCustomTransactionFromDate(e.target.value)}
                                                    className="w-full text-base"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <Label htmlFor="toDate">To Date:</Label>
                                                <Input
                                                    id="toDate"
                                                    type="date"
                                                    value={customTransactionToDate}
                                                    onChange={(e) => setCustomTransactionToDate(e.target.value)}
                                                    className="w-full text-base"
                                                />
                                            </div>
                                            <Button
                                                onClick={handleCustomDateSearch}
                                                disabled={!customTransactionFromDate && !customTransactionToDate}
                                                className="w-full sm:w-auto"
                                            >
                                                <Search className="mr-2 h-4 w-4" />
                                                Search
                                            </Button>
                                        </div>

                                        {/* Results Count */}
                                        <div className="text-sm text-gray-600">
                                            {filteredDeals?.length || 0} of {deals?.length || 0} deals shown
                                        </div>

                                        {/* Mobile Table View */}
                                        <div className="lg:hidden">
                                            <div className="max-h-96 space-y-3 overflow-y-auto">
                                                {safeFilteredDeals.map((deal) => (
                                                    <Card key={deal.deal} className="p-3">
                                                        <div className="mb-2 flex items-start justify-between">
                                                            <div>
                                                                <div className="text-sm font-semibold">
                                                                    {deal.symbol}
                                                                </div>
                                                                <div className="text-xs text-gray-600">
                                                                    #{deal.deal}
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col items-end">
                                                                {getActionBadge(deal.action, deal.entry)}
                                                                <div className="mt-1 text-xs text-gray-600">
                                                                    {getEntryText(deal.entry)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                                            <div>
                                                                <span className="text-gray-600">Price:</span>{' '}
                                                                {deal.price.toFixed(deal.digits)}
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-600">LOT:</span>{' '}
                                                                {deal.entry === 1
                                                                    ? '0'
                                                                    : ((deal.volume / 100000) * 10).toFixed(1)}
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-600">Total Commission:</span>
                                                                <span
                                                                    className={
                                                                        deal.commission < 0
                                                                            ? 'text-red-600'
                                                                            : 'text-gray-600'
                                                                    }
                                                                >
                                                                    {formatCurrency(deal.commission)}
                                                                </span>
                                                            </div>
                                                            <div className={getProfitColor(deal.profit)}>
                                                                <span className="text-gray-600">Profit:</span>{' '}
                                                                {formatCurrency(deal.profit)}
                                                            </div>
                                                        </div>
                                                        <div className="mt-2 text-xs text-gray-600">
                                                            {formatTimestamp(deal.time)}
                                                        </div>
                                                    </Card>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Mobile SUM Row */}
                                        <div className="mt-4 border-t border-gray-200 pt-2 lg:hidden">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-semibold text-gray-700">SUM LOT:</span>
                                                <span className="text-lg font-bold text-orange-600">
                                                    {totalLotIn.toFixed(1)}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-600">
                                                Total dari semua transaksi IN (exclude Close)
                                            </div>
                                        </div>

                                        {/* Desktop Table View */}
                                        <div className="hidden overflow-x-auto lg:block">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="text-xs">Deal ID</TableHead>
                                                        <TableHead className="text-xs">Position ID</TableHead>
                                                        <TableHead className="text-xs">Symbol</TableHead>
                                                        <TableHead className="text-xs">Action</TableHead>
                                                        <TableHead className="text-xs">Price</TableHead>
                                                        <TableHead className="text-xs">LOT</TableHead>
                                                        <TableHead className="text-xs">S/L</TableHead>
                                                        <TableHead className="text-xs">T/P</TableHead>
                                                        <TableHead className="text-xs">Total Commission</TableHead>
                                                        <TableHead className="text-xs">Fee</TableHead>
                                                        <TableHead className="text-xs">Storage</TableHead>
                                                        <TableHead className="text-xs">Profit</TableHead>
                                                        {showAllColumns && (
                                                            <>
                                                                <TableHead className="text-xs">Contract Size</TableHead>
                                                                <TableHead className="text-xs">Digits</TableHead>
                                                                <TableHead className="text-xs">Rate Profit</TableHead>
                                                            </>
                                                        )}
                                                        <TableHead className="text-xs">Time</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {safeFilteredDeals.map((deal) => (
                                                        <TableRow key={deal.deal} className="hover:bg-gray-50">
                                                            <TableCell className="font-mono text-xs">
                                                                {deal.deal}
                                                            </TableCell>
                                                            <TableCell className="font-mono text-xs">
                                                                {deal.position}
                                                            </TableCell>
                                                            <TableCell className="text-xs font-medium">
                                                                {deal.symbol}
                                                            </TableCell>
                                                            <TableCell className="text-xs">
                                                                {getActionBadge(deal.action, deal.entry)}
                                                            </TableCell>
                                                            <TableCell className="text-xs">
                                                                {deal.price.toFixed(deal.digits)}
                                                            </TableCell>
                                                            <TableCell className="text-xs">
                                                                {deal.entry === 1
                                                                    ? '0'
                                                                    : ((deal.volume / 100000) * 10).toFixed(1)}
                                                            </TableCell>
                                                            <TableCell className="text-xs">
                                                                {deal.sl > 0 ? deal.sl.toFixed(deal.digits) : '-'}
                                                            </TableCell>
                                                            <TableCell className="text-xs">
                                                                {deal.tp > 0 ? deal.tp.toFixed(deal.digits) : '-'}
                                                            </TableCell>
                                                            <TableCell
                                                                className={`text-xs font-semibold ${deal.commission < 0 ? 'text-red-600' : 'text-gray-600'}`}
                                                            >
                                                                {formatCurrency(deal.commission)}
                                                            </TableCell>
                                                            <TableCell className="text-xs">
                                                                {formatCurrency(deal.fee)}
                                                            </TableCell>
                                                            <TableCell className="text-xs">
                                                                {formatCurrency(deal.storage)}
                                                            </TableCell>
                                                            <TableCell
                                                                className={`text-xs font-semibold ${getProfitColor(deal.profit)}`}
                                                            >
                                                                {formatCurrency(deal.profit)}
                                                            </TableCell>
                                                            {showAllColumns && (
                                                                <>
                                                                    <TableCell className="text-xs">
                                                                        {deal.contractSize}
                                                                    </TableCell>
                                                                    <TableCell className="text-xs">
                                                                        {deal.digits}
                                                                    </TableCell>
                                                                    <TableCell className="text-xs">
                                                                        {deal.rateprofit}
                                                                    </TableCell>
                                                                </>
                                                            )}
                                                            <TableCell className="text-xs whitespace-nowrap">
                                                                {formatTimestamp(deal.time)}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>

                                            {/* SUM Row */}
                                            <div className="mt-4 border-t border-gray-200 pt-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-semibold text-gray-700">
                                                        SUM LOT:
                                                    </span>
                                                    <span className="text-lg font-bold text-orange-600">
                                                        {totalLotIn.toFixed(1)}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-gray-600">
                                                    Total dari semua transaksi IN (exclude Close)
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="analysis">
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Trading Statistics</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-gray-50">
                                            <span className="text-sm">Total Positions</span>
                                            <span className="text-sm font-semibold">{uniquePositions.length}</span>
                                        </div>
                                        <div className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-gray-50">
                                            <span className="text-sm">Profitable Deals</span>
                                            <span className="text-sm font-semibold text-green-600">
                                                {profitableDeals}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-gray-50">
                                            <span className="text-sm">Losing Deals</span>
                                            <span className="text-sm font-semibold text-red-600">{losingDeals}</span>
                                        </div>
                                        <div className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-gray-50">
                                            <span className="text-sm">Neutral Deals</span>
                                            <span className="text-sm font-semibold text-gray-600">{neutralDeals}</span>
                                        </div>
                                        <div className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-gray-50">
                                            <span className="text-sm">Win Rate</span>
                                            <span className="text-sm font-semibold">
                                                {deals?.length > 0
                                                    ? Math.round((profitableDeals / safeDeals.length) * 100)
                                                    : 0}
                                                %
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Financial Summary</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-gray-50">
                                            <span className="text-sm">Total Profit</span>
                                            <span className={`text-sm font-semibold ${getProfitColor(totalProfit)}`}>
                                                {formatCurrency(totalProfit)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-gray-50">
                                            <span className="text-sm">Commission IN</span>
                                            <div className="text-right">
                                                <span className="block text-sm font-semibold text-red-600">
                                                    {formatCurrency(commissionSplitIn)}
                                                </span>
                                                <span className="text-xs text-gray-600">
                                                    {formatIDR(commissionSplitInIDR)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-gray-50">
                                            <span className="text-sm">Commission OUT</span>
                                            <div className="text-right">
                                                <span className="block text-sm font-semibold text-red-600">
                                                    {formatCurrency(commissionSplitOut)}
                                                </span>
                                                <span className="text-xs text-gray-600">
                                                    {formatIDR(commissionSplitOutIDR)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-gray-50">
                                            <span className="text-sm">Total Commission</span>
                                            <div className="text-right">
                                                <span className="block text-sm font-semibold text-red-600">
                                                    {formatCurrency(totalCommission)}
                                                </span>
                                                <span className="text-xs text-gray-600">
                                                    {formatIDR(totalCommissionIDR)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Dynamic Commission Layer Summary */}
                                        <div className="border-t pt-4">
                                            <h4 className="mb-3 text-sm font-semibold text-gray-700">
                                                Dynamic Commission Distribution ({commissionLayers.length} layers)
                                            </h4>
                                            <div className="space-y-2">
                                                {(Array.isArray(commissionLayers)
                                                    ? commissionLayers
                                                    : commissionLayers?.data ?? []
                                                    ).map((layer) => (
                                                    <div
                                                        key={layer.id}
                                                        className={`flex items-center justify-between rounded-lg border bg-${layer.color}-50 p-3 transition-colors hover:bg-gray-50`}
                                                    >
                                                        <span className={`text-sm font-medium text-${layer.color}-700`}>
                                                            {layer.name}
                                                        </span>
                                                        <div className="text-right">
                                                            <span
                                                                className={`block text-sm font-semibold text-${layer.color}-600`}
                                                            >
                                                                {formatCurrency(totalLayerDistribution[layer.id] || 0)}
                                                            </span>
                                                            <span className="text-xs text-gray-600">
                                                                {formatIDR(
                                                                    (totalLayerDistribution[layer.id] || 0) * rate,
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-gray-50">
                                            <span className="text-sm">Total Fees</span>
                                            <span className="text-sm font-semibold text-red-600">
                                                {formatCurrency(totalFee)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-gray-50">
                                            <span className="text-sm">Total Storage</span>
                                            <span className="text-sm font-semibold text-red-600">
                                                {formatCurrency(totalStorage)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-gray-50">
                                            <span className="text-sm">Net Result</span>
                                            <span
                                                className={`text-sm font-semibold ${getProfitColor(totalProfit + totalCommission + totalFee + totalStorage)}`}
                                            >
                                                {formatCurrency(
                                                    totalProfit + totalCommission + totalFee + totalStorage,
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="lg:col-span-2 xl:col-span-3">
                                <CardHeader>
                                    <CardTitle className="text-lg">Performance Metrics</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                                        <div className="rounded-lg border p-4 text-center">
                                            <div className="text-2xl font-bold text-blue-600">
                                                {deals?.length > 0
                                                    ? formatCurrency(totalProfit / safeDeals.length)
                                                    : '$0.00'}
                                            </div>
                                            <div className="text-sm text-gray-600">Average Profit per Deal</div>
                                        </div>
                                        <div className="rounded-lg border p-4 text-center">
                                            <div className="text-2xl font-bold text-green-600">
                                                {losingDeals > 0
                                                    ? (profitableDeals / losingDeals).toFixed(2)
                                                    : profitableDeals > 0
                                                      ? '∞'
                                                      : '0.00'}
                                            </div>
                                            <div className="text-sm text-gray-600">Profit Factor</div>
                                        </div>
                                        <div className="rounded-lg border p-4 text-center">
                                            <div className="text-2xl font-bold text-green-600">
                                                {deals?.length > 0
                                                    ? formatCurrency(Math.max(...safeDeals.map((d) => d.profit)))
                                                    : '$0.00'}
                                            </div>
                                            <div className="text-sm text-gray-600">Best Deal</div>
                                        </div>
                                        <div className="rounded-lg border p-4 text-center">
                                            <div className="text-2xl font-bold text-red-600">
                                                {deals?.length > 0
                                                    ? formatCurrency(Math.min(...safeDeals.map((d) => d.profit)))
                                                    : '$0.00'}
                                            </div>
                                            <div className="text-sm text-gray-600">Worst Deal</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* TAB BARU: My Commissions (untuk Marketing) */}
                    {(user?.role === 'marketing' || user?.role === 'user')  && (
                        <TabsContent value="my-commissions">
                            <div className="space-y-6">
                                {/* Commission Statistics Cards */}
                                <div className="grid grid-cols-1 gap-4 text-center md:grid-cols-2 lg:grid-cols-2">
                                    <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg flex items-center">
                                                <DollarSign className="mr-2 h-5 w-5" />
                                                Total Commission All Period ({selectedLoginCode?.value || 'All Login Codes'})
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">
                                                {formatCurrency(totalCommissionAllPeriods)}
                                            </div>
                                            <div className="text-sm opacity-90">
                                                {formatIDR(totalCommissionAllPeriods * rate)}
                                            </div>
                                        </CardContent>
                                    </Card>
                                    
                                    <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg flex items-center">
                                                <DollarSign className="mr-2 h-5 w-5" />
                                                Total Commission This Period ({selectedLoginCode?.value || 'All Login Codes'})
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">
                                                {totalCommissionThisPeriod === null 
                                                    ? "Unspecified" 
                                                    : formatCurrency(totalCommissionThisPeriod)
                                                }
                                            </div>
                                            <div className="text-sm opacity-90">
                                                {totalCommissionThisPeriod === null 
                                                    ? "-" 
                                                    : formatIDR(totalCommissionThisPeriod * rate)
                                                }
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Custom Period Date */}
                                <Card>
                                    <CardHeader>
                                         <CardTitle className="text-lg">Custom Date Period</CardTitle>
                                         <CardDescription>
                                            Customize your date period
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-end">
                                            <div className="flex-1">
                                                <Label htmlFor="fromDate">From Date:</Label>
                                                <Input
                                                    id="fromDate"
                                                    type="date"
                                                    value={customCommissionFromDate}
                                                    onChange={(e) => setCustomCommissionFromDate(e.target.value)}
                                                    className="w-full text-base"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <Label htmlFor="toDate">To Date:</Label>
                                                <Input
                                                    id="toDate"
                                                    type="date"
                                                    value={customCommissionToDate}
                                                    onChange={(e) => setCustomCommissionToDate(e.target.value)}
                                                    className="w-full text-base"
                                                />
                                            </div>
                                            <Button
                                                onClick={handleCustomCommisionPeriod}
                                                disabled={!customCommissionFromDate && !customCommissionToDate}
                                                className="w-full sm:w-auto"
                                            >
                                                <Search className="mr-2 h-4 w-4" />
                                                Search
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Commission Periods List */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Commission History by Period</CardTitle>
                                        <CardDescription>
                                            View your commission earnings for each period
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {commissionHistory.length === 0 ? (
                                            <div className="text-center py-8 text-gray-500">
                                                No commission periods found
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-1">
                                                {commissionHistory.map((period) => (
                                                    <Card key={period.id} className="overflow-hidden">
                                                        <CardHeader className="pb-2">
                                                            <div className="flex items-center justify-between">
                                                                <CardTitle className="text-base">
                                                                   Login Code: {period.loginCode}
                                                                </CardTitle>
                                                                <Badge variant="outline" className="text-xs">
                                                                    {period.dateRange}
                                                                </Badge>
                                                            </div>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <div className="space-y-2">
                                                                <div className="flex justify-between text-sm">
                                                                    <span className="text-gray-600">Period:</span>
                                                                    <span className="font-medium">
                                                                        {new Date(period.fromDate).toLocaleDateString()} - {new Date(period.toDate).toLocaleDateString()}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between text-sm">
                                                                    <span className="text-gray-600">Commission:</span>
                                                                    <span className="font-medium text-green-600">
                                                                        {formatCurrency(period.totalCommission)}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between text-sm">
                                                                    <span className="text-gray-600">IDR:</span>
                                                                    <span className="font-medium text-green-600">
                                                                        {formatIDR(period.totalCommissionIDR)}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between text-sm">
                                                                    <span className="text-gray-600">Deals:</span>
                                                                    <span className="font-medium">
                                                                        {period.dealCount}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    )}

                    {/* PERBARUI TAB: Distribution (untuk Admin) */}
                    {(user?.role === 'admin' || user?.role === 'superadmin') && (
                        <TabsContent value="distribution">
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                {/* Dynamic Layer Configuration */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Calculator className="h-5 w-5" />
                                                Commission Configuration
                                            </div>
                                            <div className="flex gap-2">
                                                <Button onClick={addLayer} size="sm" className="text-xs">
                                                    <Plus className="mr-1 h-4 w-4" />
                                                    Add Layer
                                                </Button>
                                                <Button
                                                    onClick={saveCommissionLayersToDb}
                                                    disabled={loading}
                                                    size="sm"
                                                    className="text-xs"
                                                >
                                                    <RefreshCw
                                                        className={`mr-1 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                                                    />
                                                    Save
                                                </Button>
                                            </div>
                                        </CardTitle>
                                        <CardDescription>
                                            Configure commission layers. (Applied to 0.1 LOT+ and non-close positions)
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {/* Individual Layer Configuration */}
                                            {commissionLayers.map((layer, index) => (
                                                <div
                                                    key={layer.id}
                                                    className="space-y-3 rounded-lg border p-4 shadow-sm"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <Label className="text-sm font-medium">Layer {index + 1}</Label>
                                                        {commissionLayers.length > 1 && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => removeLayer(layer.id)}
                                                                className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-1 gap-3">
                                                        <div>
                                                            <Label className="mb-1 text-xs text-gray-600">
                                                                Layer Name
                                                            </Label>
                                                            <Select
                                                                value={layer.name}
                                                                onValueChange={(value) =>
                                                                    updateLayerName(layer.id, value)
                                                                }
                                                            >
                                                                <SelectTrigger className="w-full">
                                                                    <SelectValue placeholder="Select name" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {LAYER_OPTIONS.map((o) => (
                                                                        <SelectItem key={o} value={o}>
                                                                            {o}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        <div>
                                                            <Label className="mb-1 text-xs text-gray-600">
                                                                Assign User
                                                            </Label>
                                                            <ReactSelect
                                                                value={
                                                                    usersList.find((u) => u.value === layer.user_id) ||
                                                                    null
                                                                }
                                                                onChange={(option) => updateLayerUser(layer.id, option)}
                                                                options={usersList}
                                                                isClearable
                                                                placeholder="Select user..."
                                                                className="react-select-container"
                                                                classNamePrefix="react-select"
                                                                styles={{
                                                                    control: (base) => ({
                                                                        ...base,
                                                                        minHeight: '38px',
                                                                        fontSize: '0.875rem',
                                                                    }),
                                                                    menu: (base) => ({
                                                                        ...base,
                                                                        color: 'black',
                                                                        zIndex: 9999,
                                                                    }),
                                                                }}
                                                            />
                                                        </div>

                                                        <div>
                                                            <Label className="mb-1 text-xs text-gray-600">
                                                                Rate ($/LOT)
                                                            </Label>
                                                            <Input
                                                                type="number"
                                                                value={localRates[layer.id] || '0'}
                                                                onChange={(e) =>
                                                                    updateLayerRateLocal(layer.id, e.target.value)
                                                                }
                                                                className="w-full"
                                                                min="0"
                                                                step="0.5"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Distribution Results & Calculation Trigger */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center justify-between">
                                            <span>Distribution Results</span>
                                            <Button onClick={calculateCommissions} disabled={loading}>
                                                <RefreshCw
                                                    className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                                                />
                                                Calculate & Save
                                            </Button>
                                        </CardTitle>
                                        <CardDescription>
                                            Total commission distribution across {commissionLayers.length} layers.
                                            <br />
                                            <span className="text-xs font-semibold text-blue-600">
                                                Rate: 1 USD = {rate.toLocaleString('id-ID')} IDR
                                            </span>
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {commissionLayers.map((layer) => (
                                                <div
                                                    key={layer.id}
                                                    className={`flex items-center justify-between rounded-lg border bg-${layer.color}-50 p-3 transition-colors hover:bg-gray-50`}
                                                >
                                                    <span className={`text-sm font-medium text-${layer.color}-700`}>
                                                        {layer.name}
                                                    </span>
                                                    <div className="text-right">
                                                        <span
                                                            className={`block text-sm font-semibold text-black text-${layer.color}-600`}
                                                        >
                                                            {formatCurrency(totalLayerDistribution[layer.id] || 0)}
                                                        </span>
                                                        <span className="text-xs text-gray-600">
                                                            {formatIDR((totalLayerDistribution[layer.id] || 0) * rate)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}

                                            <div className="mt-4 border-t pt-3">
                                                <div className="flex items-center justify-between rounded-lg border bg-gray-100 p-3">
                                                    <span className="text-sm font-bold text-gray-700">
                                                        Total Commission
                                                    </span>
                                                    <div className="text-right">
                                                        <span className="block text-sm font-bold text-gray-800">
                                                            {formatCurrency(totalCommission)}
                                                        </span>
                                                        <span className="text-xs text-gray-600">
                                                            {formatIDR(totalCommissionIDR)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    )}
                </Tabs>
            </div>
        </div>
    );
}
