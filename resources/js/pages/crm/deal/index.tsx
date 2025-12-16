import React, { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, TrendingUp, TrendingDown, DollarSign, Activity, RefreshCw, Eye, EyeOff, Download, Search, Filter, Calendar, Calculator, Menu, X, User } from 'lucide-react';

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

interface CommissionSettings {
  [key: string]: {
    name: string;
    rate: number;
    color: string;
  };
}

type DateRange = 'today' | 'week' | 'month' | 'year' | 'all' | 'custom';

export default function GLORIDashboard() {
  const { props } = usePage();
  const initialDeals = props.deals || [];
  const initialUserProfile = props.userProfile || null;
  const initialCurrentUser = props.currentUser || null;
  const initialLogin = props.login || '5000311';
  const initialDateRange = props.dateRange || 'today';
  const initialFrom = props.from || '';
  const initialTo = props.to || '';
  const initialCommissionSettings = props.commissionSettings || {};
  
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>(initialDeals);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [login, setLogin] = useState(initialLogin);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(props.apiResponse || null);
  const [showAllColumns, setShowAllColumns] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange>(initialDateRange);
  const [customFromDate, setCustomFromDate] = useState(initialFrom);
  const [customToDate, setCustomToDate] = useState(initialTo);
  const [idrRate, setIdrRate] = useState<string>('10000');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(initialCurrentUser);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(initialUserProfile);
  const [commissionSettings, setCommissionSettings] = useState<CommissionSettings>(initialCommissionSettings);
  
  // Commission split states
  const [commissionSplitA, setCommissionSplitA] = useState<string>('60');
  const [commissionSplitB, setCommissionSplitB] = useState<string>('20');
  const [commissionSplitC, setCommissionSplitC] = useState<string>('20');
  
  // 7 layer commission distribution states (in USD amounts)
  const [layer1, setLayer1] = useState<string>(initialCommissionSettings.layer1?.rate?.toString() || '10');
  const [layer2, setLayer2] = useState<string>(initialCommissionSettings.layer2?.rate?.toString() || '8');
  const [layer3, setLayer3] = useState<string>(initialCommissionSettings.layer3?.rate?.toString() || '6');
  const [layer4, setLayer4] = useState<string>(initialCommissionSettings.layer4?.rate?.toString() || '4');
  const [layer5, setLayer5] = useState<string>(initialCommissionSettings.layer5?.rate?.toString() || '3');
  const [layer6, setLayer6] = useState<string>(initialCommissionSettings.layer6?.rate?.toString() || '2');
  const [layer7, setLayer7] = useState<string>(initialCommissionSettings.layer7?.rate?.toString() || '1');

  // Defensive: Ensure deals is always an array
  const safeDeals = Array.isArray(deals) ? deals : [];
  const safeFilteredDeals = Array.isArray(filteredDeals) ? filteredDeals : [];

  // Function to refresh data using Inertia.js
  const refreshData = () => {
    setLoading(true);
    
    const params: any = {
      login: login,
      dateRange: dateRange,
    };
    
    if (dateRange === 'custom' && customFromDate) {
      params.from = customFromDate;
    }
    
    if (dateRange === 'custom' && customToDate) {
      params.to = customToDate;
    }
    
    router.get('/commissions/deals', params, {
      preserveState: false,
      onSuccess: (page) => {
        setDeals(page.props.deals || []);
        setFilteredDeals(page.props.deals || []);
        setApiResponse(page.props.apiResponse || null);
        setUserProfile(page.props.userProfile || null);
        setCurrentUser(page.props.currentUser || null);
        setError('');
      },
      onError: (errors) => {
        setError('Failed to refresh data');
      },
      onFinish: () => {
        setLoading(false);
      }
    });
  };

  // Initialize with today's data
//   useEffect(() => {
//     if (initialDeals.length === 0) {
//       refreshData();
//     }
//   }, []);

  useEffect(() => {
    let filtered = safeDeals;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(deal => 
        deal.deal.toString().includes(searchTerm) ||
        deal.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.position.toString().includes(searchTerm)
      );
    }

    // Filter by symbol
    if (selectedSymbol !== 'all') {
      filtered = filtered.filter(deal => deal.symbol === selectedSymbol);
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
      second: '2-digit'
    });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getActionBadge = (action: number, entry: number) => {
    if (entry === 0) {
      return action === 0 ? (
        <Badge variant="destructive" className="text-xs">Sell</Badge>
      ) : (
        <Badge variant="default" className="text-xs">Buy</Badge>
      );
    } else {
      return action === 0 ? (
        <Badge variant="secondary" className="text-xs">Sell Close</Badge>
      ) : (
        <Badge variant="secondary" className="text-xs">Buy Close</Badge>
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

  const totalProfit = safeDeals.reduce((sum, deal) => sum + deal.profit, 0);
  
  // Calculate commission by entry type
  const entryInDeals = safeDeals.filter(deal => deal.entry === 0);
  const entryOutDeals = safeDeals.filter(deal => deal.entry === 1);
  
  const commissionEntryIn = entryInDeals.reduce((sum, deal) => sum + deal.commission, 0);
  const commissionEntryOut = entryOutDeals.reduce((sum, deal) => sum + deal.commission, 0);
  const totalCommission = commissionEntryIn + commissionEntryOut;
  
  // Split total commission equally between IN and OUT (Total Commission / 2) - using absolute value
  const commissionSplitIn = Math.abs(totalCommission) / 2;
  const commissionSplitOut = Math.abs(totalCommission) / 2;
  
  // Calculate commission split per transaction (dynamic values)
  const getCommissionSplitPerTransaction = (dealCommission: number) => {
    const commissionPerDeal = dealCommission;
    const splitA = parseFloat(commissionSplitA) || 60;
    const splitB = parseFloat(commissionSplitB) || 20;
    const splitC = parseFloat(commissionSplitC) || 20;
    
    return {
      A: commissionPerDeal * (splitA / 100),
      B: commissionPerDeal * (splitB / 100),
      C: commissionPerDeal * (splitC / 100)
    };
  };
  
  // Calculate total LOT only for IN positions (entry = 0) - same as SUM LOT in table
  const inDeals = safeDeals.filter(deal => deal.entry === 0);
  const totalLotIn = inDeals.reduce((sum, deal) => sum + ((deal.volume / 100000) * 10), 0);
  
  // Calculate total commission split for all deals
  const totalCommissionSplitA = safeDeals.reduce((sum, deal) => sum + (deal.commission * (parseFloat(commissionSplitA) || 60) / 100), 0);
  const totalCommissionSplitB = safeDeals.reduce((sum, deal) => sum + (deal.commission * (parseFloat(commissionSplitB) || 20) / 100), 0);
  const totalCommissionSplitC = safeDeals.reduce((sum, deal) => sum + (deal.commission * (parseFloat(commissionSplitC) || 20) / 100), 0);
  
  // Calculate 7 layer commission distribution
  const getLayerDistribution = (commissionAmount: number, volume: number, entry: number) => {
    // Only calculate distribution for non-close positions with 0.1 LOT or more
    if (entry === 1) {
      // Close position - no commission distribution
      return {
        layer1: 0,
        layer2: 0,
        layer3: 0,
        layer4: 0,
        layer5: 0,
        layer6: 0,
        layer7: 0
      };
    }
    
    // Calculate LOT size
    const lotSize = (volume / 100000) * 10;
    
    // Only apply commission if LOT is 0.1 or more
    if (lotSize < 0.1) {
      return {
        layer1: 0,
        layer2: 0,
        layer3: 0,
        layer4: 0,
        layer5: 0,
        layer6: 0,
        layer7: 0
      };
    }
    
    // Use configured dollar amounts per layer (multiplied by LOT size)
    const l1 = parseFloat(layer1) || 0;
    const l2 = parseFloat(layer2) || 0;
    const l3 = parseFloat(layer3) || 0;
    const l4 = parseFloat(layer4) || 0;
    const l5 = parseFloat(layer5) || 0;
    const l6 = parseFloat(layer6) || 0;
    const l7 = parseFloat(layer7) || 0;
    
    return {
      layer1: l1 * lotSize,
      layer2: l2 * lotSize,
      layer3: l3 * lotSize,
      layer4: l4 * lotSize,
      layer5: l5 * lotSize,
      layer6: l6 * lotSize,
      layer7: l7 * lotSize
    };
  };
  
  // Calculate total layer distribution for all deals
  const totalLayerDistribution = safeDeals.reduce((acc, deal) => {
    const distribution = getLayerDistribution(deal.commission, deal.volume, deal.entry);
    acc.layer1 += distribution.layer1;
    acc.layer2 += distribution.layer2;
    acc.layer3 += distribution.layer3;
    acc.layer4 += distribution.layer4;
    acc.layer5 += distribution.layer5;
    acc.layer6 += distribution.layer6;
    acc.layer7 += distribution.layer7;
    return acc;
  }, { layer1: 0, layer2: 0, layer3: 0, layer4: 0, layer5: 0, layer6: 0, layer7: 0 });
  
  const totalFee = safeDeals.reduce((sum, deal) => sum + deal.fee, 0);
  const totalStorage = safeDeals.reduce((sum, deal) => sum + deal.storage, 0);
  const totalVolume = safeDeals.reduce((sum, deal) => sum + deal.volume, 0);
  const totalVolumeClosed = safeDeals.reduce((sum, deal) => sum + deal.volumeclosed, 0);
  const profitableDeals = safeDeals.filter(deal => deal.profit > 0).length;
  const losingDeals = safeDeals.filter(deal => deal.profit < 0).length;
  const neutralDeals = safeDeals.filter(deal => deal.profit === 0).length;

  // Calculate IDR values
  const rate = parseFloat(idrRate) || 10000;
  const commissionSplitInIDR = commissionSplitIn * rate;
  const commissionSplitOutIDR = commissionSplitOut * rate;
  const totalCommissionIDR = commissionSplitInIDR + commissionSplitOutIDR;
  const totalFeeIDR = Math.abs(totalFee) * rate;
  const totalStorageIDR = Math.abs(totalStorage) * rate;
  const totalFeesIDR = totalCommissionIDR + totalFeeIDR + totalStorageIDR;

  const uniqueSymbols = Array.from(new Set(safeDeals.map(deal => deal.symbol)));
  const uniquePositions = Array.from(new Set(safeDeals.map(deal => deal.position)));
  const totalLots = uniquePositions.length;

  const exportToCSV = () => {
    const headers = [
      'Deal ID', 'Position ID', 'Symbol', 'Action', 'Price', 'LOT', 
      'Volume Closed', 'S/L', 'T/P', 'Total Commission', 
      'Fee', 'Storage', 'Profit', 
      'Contract Size', 'Digits', 'Rate Profit', 'Time', 'Date'
    ];
    
    const csvData = safeFilteredDeals.map(deal => {
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
        formatDate(deal.time)
      ];
    });
    
    // Add summary row at the end
    const summaryRow = [
      'SUMMARY', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''
    ];
    
    const csv = [headers, ...csvData, summaryRow].map(row => row.join(',')).join('\n');
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
      setCustomFromDate('');
      setCustomToDate('');
    }
    
    // Use Inertia.js to navigate with new parameters
    const params: any = {
      login: login,
      dateRange: range,
    };
    
    router.get('/commissions/deals', params, {
      preserveState: false,
      onSuccess: (page) => {
        setDeals(page.props.deals || []);
        setFilteredDeals(page.props.deals || []);
        setApiResponse(page.props.apiResponse || null);
        setUserProfile(page.props.userProfile || null);
        setError('');
      },
      onError: (errors) => {
        setError('Failed to update data');
      }
    });
  };

  const handleCustomDateSearch = () => {
    if (customFromDate || customToDate) {
      handleDateRangeChange('custom');
    }
  };

  const handleLoginChange = (newLogin: string) => {
    setLogin(newLogin);
    
    // Use Inertia.js to navigate with new parameters
    const params: any = {
      login: newLogin,
      dateRange: dateRange,
    };
    
    if (dateRange === 'custom' && customFromDate) {
      params.from = customFromDate;
    }
    
    if (dateRange === 'custom' && customToDate) {
      params.to = customToDate;
    }
    
    router.get('/commissions/deals', params, {
      preserveState: false,
      onSuccess: (page) => {
        setDeals(page.props.deals || []);
        setFilteredDeals(page.props.deals || []);
        setApiResponse(page.props.apiResponse || null);
        setUserProfile(page.props.userProfile || null);
        setCurrentUser(page.props.currentUser || null);
        setError('');
      },
      onError: (errors) => {
        setError('Failed to update data');
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">GLORI Dashboard</h1>
            <p className="text-sm text-gray-600">Mobile Trading View</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="bg-white w-80 h-full shadow-xl p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Menu</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="space-y-6">
              {/* Login ID */}
              <div>
                <Label htmlFor="mobile-login">Login ID:</Label>
                <Select value={login} onValueChange={handleLoginChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Login ID" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5000311">5000311</SelectItem>
                    <SelectItem value="5000312">5000312</SelectItem>
                    <SelectItem value="5000313">5000313</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
                <Button 
                  onClick={refreshData} 
                  disabled={loading}
                  className="w-full"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh Data
                </Button>
                <Button 
                  onClick={exportToCSV} 
                  variant="outline" 
                  disabled={(filteredDeals?.length || 0) === 0}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Header */}
      <div className="hidden lg:block bg-white shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">GLORI Transaction Dashboard</h1>
            <p className="text-gray-600 mt-1">Complete trading transaction data and analytics with full date range</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="login">Login ID:</Label>
              <Select value={login} onValueChange={handleLoginChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select Login ID" />
                 </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5000311">5000311</SelectItem>
                  <SelectItem value="5000312">5000312</SelectItem>
                  <SelectItem value="5000313">5000313</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="rate">Rate:</Label>
              <Input
                id="rate"
                type="number"
                value={idrRate}
                onChange={(e) => setIdrRate(e.target.value)}
                className="w-24"
                placeholder="10000"
                min="1"
                step="100"
              />
            </div>
            <Button onClick={refreshData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={exportToCSV} variant="outline" disabled={(filteredDeals?.length || 0) === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg lg:text-base">
              <Calculator className="h-5 w-5" />
              Currency Configuration
            </CardTitle>
            <CardDescription className="text-sm">
              Set USD to IDR conversion rate for fee calculations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
              <div className="flex-1 w-full sm:w-auto">
                <Label htmlFor="idrRate">USD to IDR Rate:</Label>
                <Input
                  id="idrRate"
                  type="number"
                  value={idrRate}
                  onChange={(e) => setIdrRate(e.target.value)}
                  className="w-full text-base"
                  placeholder="10000"
                  min="1"
                  step="100"
                />
              </div>
              <div className="text-sm text-gray-600 space-y-2">
                <p>Current Rate: 1 USD = {rate.toLocaleString('id-ID')} IDR</p>
                <p>Commission IN: {formatCurrency(commissionSplitIn)} → {formatIDR(commissionSplitInIDR)}</p>
                <p>Commission OUT: {formatCurrency(commissionSplitOut)} → {formatIDR(commissionSplitOutIDR)}</p>
                <p className="font-semibold">Total Commission: {formatCurrency(totalCommission)} → {formatIDR(totalCommissionIDR)}</p>
                <p>Fee: {formatCurrency(totalFee)} → {formatIDR(totalFeeIDR)}</p>
                <p>Storage: {formatCurrency(totalStorage)} → {formatIDR(totalStorageIDR)}</p>
                <p className="font-semibold">Total Fees: {formatIDR(totalFeesIDR)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards - Mobile Optimized */}
      <div className="px-4 lg:px-6 pb-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3 lg:gap-4">
          <Card className="p-3 lg:p-4">
            <div className="flex items-center justify-between mb-1 lg:mb-2">
              <DollarSign className="h-4 w-4 lg:h-5 lg:w-5 text-green-600" />
              <span className="text-xs lg:text-sm text-gray-500">Total P&L</span>
            </div>
            <div className={`text-lg lg:text-xl font-bold ${getProfitColor(totalProfit)}`}>
              {formatCurrency(totalProfit)}
            </div>
            <div className="text-xs text-gray-600">Net Profit/Loss</div>
          </Card>

          <Card className="p-3 lg:p-4">
            <div className="flex items-center justify-between mb-1 lg:mb-2">
              <TrendingDown className="h-4 w-4 lg:h-5 lg:w-5 text-red-600" />
              <span className="text-xs lg:text-sm text-gray-500">Commission</span>
            </div>
            <div className="text-lg lg:text-xl font-bold text-red-600">
              {formatCurrency(totalCommission)}
            </div>
            <div className="text-xs text-gray-600">Total Fees</div>
            <div className="text-xs text-gray-600 font-semibold">
              {formatIDR(totalCommissionIDR)} (Rate: {rate.toLocaleString('id-ID')})
            </div>
          </Card>

          <Card className="p-3 lg:p-4">
            <div className="flex items-center justify-between mb-1 lg:mb-2">
              <TrendingUp className="h-4 w-4 lg:h-5 lg:w-5 text-purple-600" />
              <span className="text-xs lg:text-sm text-gray-500">Win Rate</span>
            </div>
            <div className="text-lg lg:text-xl font-bold text-purple-600">
              {safeDeals.length > 0 ? Math.round((profitableDeals / safeDeals.length) * 100) : 0}%
            </div>
            <div className="text-xs text-gray-600">{profitableDeals}/{safeDeals.length} wins</div>
          </Card>

          {/* Account Profile Card */}
          <Card className="p-3 lg:p-4">
            <div className="flex items-center justify-between mb-1 lg:mb-2">
              <User className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600" />
              <span className="text-xs lg:text-sm text-gray-500">Account Profile</span>
            </div>
            <div className="text-lg lg:text-xl font-bold text-blue-600">
              {userProfile?.name || `Login ${login}`}
            </div>
            <div className="text-xs text-gray-600">
              Account {login}
            </div>
            <div className="text-xs text-gray-600 mt-1">
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
                <span className={`font-semibold ${userProfile?.status ? 'text-green-600' : 'text-gray-600'}`}>
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

          <Card className="p-3 lg:p-4 lg:col-span-2 xl:col-span-2">
            <div className="flex items-center justify-between mb-1 lg:mb-2">
              <Activity className="h-4 w-4 lg:h-5 lg:w-5 text-orange-600" />
              <span className="text-xs lg:text-sm text-gray-500">Total LOT</span>
            </div>
            <div className="text-lg lg:text-xl font-bold text-orange-600">
              {totalLotIn.toFixed(1)}
            </div>
            <div className="text-xs text-gray-600">Total dari semua transaksi IN (exclude Close)</div>
          </Card>
        </div>
      </div>

      {/* Main Content - Mobile Optimized */}
      <div className="p-4 lg:p-6">
        <Tabs defaultValue="deals" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 lg:flex">
            <TabsTrigger value="deals" className="text-sm">
              Transactions ({filteredDeals?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="analysis" className="text-sm">
              Analysis
            </TabsTrigger>
            <TabsTrigger value="distribution" className="text-sm">
              7-Layer Distribution
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deals">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">Trading Transactions</CardTitle>
                    <CardDescription className="text-sm">
                      {apiResponse && `Showing ${filteredDeals?.length || 0} of ${apiResponse.size} deals`}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAllColumns(!showAllColumns)}
                      className="text-xs lg:text-sm"
                    >
                      {showAllColumns ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
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
                    <div className="flex flex-col lg:flex-row gap-4">
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
                          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <Label htmlFor="symbol">Symbol:</Label>
                        <select
                          id="symbol"
                          value={selectedSymbol}
                          onChange={(e) => setSelectedSymbol(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                        >
                          <option value="all">All Symbols</option>
                          {uniqueSymbols.map(symbol => (
                            <option key={symbol} value={symbol}>{symbol}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Date Range Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        variant={dateRange === 'today' ? "default" : "outline"} 
                        size="sm" 
                        onClick={() => handleDateRangeChange('today')} 
                        className="text-xs lg:text-sm"
                      >
                        Today
                      </Button>
                      <Button 
                        variant={dateRange === 'week' ? "default" : "outline"} 
                        size="sm" 
                        onClick={() => handleDateRangeChange('week')} 
                        className="text-xs lg:text-sm"
                      >
                        Last 7 Days
                      </Button>
                      <Button 
                        variant={dateRange === 'month' ? "default" : "outline"} 
                        size="sm" 
                        onClick={() => handleDateRangeChange('month')} 
                        className="text-xs lg:text-sm"
                      >
                        Last 30 Days
                      </Button>
                      <Button 
                        variant={dateRange === 'year' ? "default" : "outline"} 
                        size="sm" 
                        onClick={() => handleDateRangeChange('year')} 
                        className="text-xs lg:text-sm"
                      >
                        Last Year
                      </Button>
                      <Button 
                        variant={dateRange === 'all' ? "default" : "outline"} 
                        size="sm" 
                        onClick={() => handleDateRangeChange('all')} 
                        className="text-xs lg:text-sm"
                      >
                        All Time
                      </Button>
                    </div>

                    {/* Custom Date Range - Mobile Optimized */}
                    <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end">
                      <div className="flex-1">
                        <Label htmlFor="fromDate">From Date:</Label>
                        <Input
                          id="fromDate"
                          type="date"
                          value={customFromDate}
                          onChange={(e) => setCustomFromDate(e.target.value)}
                          className="w-full text-base"
                        />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor="toDate">To Date:</Label>
                        <Input
                          id="toDate"
                          type="date"
                          value={customToDate}
                          onChange={(e) => setCustomToDate(e.target.value)}
                          className="w-full text-base"
                        />
                      </div>
                      <Button onClick={handleCustomDateSearch} disabled={!customFromDate && !customToDate} className="w-full sm:w-auto">
                        <Search className="h-4 w-4 mr-2" />
                        Search
                      </Button>
                    </div>

                    {/* Results Count */}
                    <div className="text-sm text-gray-600">
                      {filteredDeals?.length || 0} of {deals?.length || 0} deals shown
                    </div>

                    {/* Mobile Table View */}
                    <div className="lg:hidden">
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {safeFilteredDeals.map((deal) => (
                          <Card key={deal.deal} className="p-3">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <div className="font-semibold text-sm">{deal.symbol}</div>
                                <div className="text-xs text-gray-600">#{deal.deal}</div>
                              </div>
                              <div className="flex flex-col items-end">
                                {getActionBadge(deal.action, deal.entry)}
                                <div className="text-xs text-gray-600 mt-1">{getEntryText(deal.entry)}</div>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-gray-600">Price:</span> {deal.price.toFixed(deal.digits)}
                              </div>
                              <div>
                                <span className="text-gray-600">LOT:</span> {deal.entry === 1 ? '0' : ((deal.volume / 100000) * 10).toFixed(1)}
                              </div>
                              <div>
                                <span className="text-gray-600">Total Commission:</span> 
                                <span className={deal.commission < 0 ? 'text-red-600' : 'text-gray-600'}>
                                  {formatCurrency(deal.commission)}
                                </span>
                              </div>
                              <div className={getProfitColor(deal.profit)}>
                                <span className="text-gray-600">Profit:</span> {formatCurrency(deal.profit)}
                              </div>
                            </div>
                            <div className="text-xs text-gray-600 mt-2">
                              {formatTimestamp(deal.time)}
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                    
                    {/* Mobile SUM Row */}
                    <div className="lg:hidden mt-4 pt-2 border-t border-gray-200">
                      <div className="flex justify-between items-center">
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
                    <div className="hidden lg:block overflow-x-auto">
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
                              <TableCell className="text-xs font-mono">{deal.deal}</TableCell>
                              <TableCell className="text-xs font-mono">{deal.position}</TableCell>
                              <TableCell className="text-xs font-medium">{deal.symbol}</TableCell>
                              <TableCell className="text-xs">{getActionBadge(deal.action, deal.entry)}</TableCell>
                              <TableCell className="text-xs">{deal.price.toFixed(deal.digits)}</TableCell>
                              <TableCell className="text-xs">{deal.entry === 1 ? '0' : ((deal.volume / 100000) * 10).toFixed(1)}</TableCell>
                              <TableCell className="text-xs">{deal.sl > 0 ? deal.sl.toFixed(deal.digits) : '-'}</TableCell>
                              <TableCell className="text-xs">{deal.tp > 0 ? deal.tp.toFixed(deal.digits) : '-'}</TableCell>
                              <TableCell className={`text-xs font-semibold ${deal.commission < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                                {formatCurrency(deal.commission)}
                              </TableCell>
                              <TableCell className="text-xs">{formatCurrency(deal.fee)}</TableCell>
                              <TableCell className="text-xs">{formatCurrency(deal.storage)}</TableCell>
                              <TableCell className={`text-xs font-semibold ${getProfitColor(deal.profit)}`}>
                                {formatCurrency(deal.profit)}
                              </TableCell>
                              {showAllColumns && (
                                <>
                                  <TableCell className="text-xs">{deal.contractSize}</TableCell>
                                  <TableCell className="text-xs">{deal.digits}</TableCell>
                                  <TableCell className="text-xs">{deal.rateprofit}</TableCell>
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
                      <div className="mt-4 pt-2 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold text-gray-700">SUM LOT:</span>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Symbol Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    {Object.entries(
                      safeDeals.reduce((acc, deal) => {
                        if (!acc[deal.symbol]) {
                          acc[deal.symbol] = {
                            profit: 0,
                            count: 0,
                            volume: 0
                          };
                        }
                        acc[deal.symbol].profit += deal.profit;
                        acc[deal.symbol].count += 1;
                        acc[deal.symbol].volume += deal.volume;
                        return acc;
                      }, {} as Record<string, { profit: number; count: number; volume: number }>)
                    ).map(([symbol, data]) => (
                      <div key={symbol} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div>
                          <p className="font-medium text-sm">{symbol}</p>
                          <p className="text-xs text-gray-600">{data.count} deals</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold text-sm ${getProfitColor(data.profit)}`}>
                            {formatCurrency(data.profit)}
                          </p>
                          <p className="text-xs text-gray-600">{((data.volume / 100000) * 10).toFixed(1)} LOT</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Trading Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <span className="text-sm">Total Positions</span>
                      <span className="font-semibold text-sm">{uniquePositions.length}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <span className="text-sm">Profitable Deals</span>
                      <span className="font-semibold text-green-600 text-sm">{profitableDeals}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <span className="text-sm">Losing Deals</span>
                      <span className="font-semibold text-red-600 text-sm">{losingDeals}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <span className="text-sm">Neutral Deals</span>
                      <span className="font-semibold text-gray-600 text-sm">{neutralDeals}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <span className="text-sm">Win Rate</span>
                      <span className="font-semibold text-sm">
                        {deals?.length > 0 ? Math.round((profitableDeals / safeDeals.length) * 100) : 0}%
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
                    <div className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <span className="text-sm">Total Profit</span>
                      <span className={`font-semibold text-sm ${getProfitColor(totalProfit)}`}>
                        {formatCurrency(totalProfit)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <span className="text-sm">Commission IN</span>
                      <div className="text-right">
                        <span className="font-semibold text-red-600 text-sm block">{formatCurrency(commissionSplitIn)}</span>
                        <span className="text-xs text-gray-600">{formatIDR(commissionSplitInIDR)}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <span className="text-sm">Commission OUT</span>
                      <div className="text-right">
                        <span className="font-semibold text-red-600 text-sm block">{formatCurrency(commissionSplitOut)}</span>
                        <span className="text-xs text-gray-600">{formatIDR(commissionSplitOutIDR)}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <span className="text-sm">Total Commission</span>
                      <div className="text-right">
                        <span className="font-semibold text-red-600 text-sm block">{formatCurrency(totalCommission)}</span>
                        <span className="text-xs text-gray-600">{formatIDR(totalCommissionIDR)}</span>
                      </div>
                    </div>
                    
                    {/* Commission Split Summary */}
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">7-Layer Commission Distribution</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors bg-indigo-50">
                          <span className="text-sm font-medium text-indigo-700">BM – Business Manager</span>
                          <div className="text-right">
                            <span className="font-semibold text-indigo-600 text-sm block">{formatCurrency(totalLayerDistribution.layer1)}</span>
                            <span className="text-xs text-gray-600">{formatIDR(totalLayerDistribution.layer1 * rate)}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors bg-blue-50">
                          <span className="text-sm font-medium text-blue-700">DM – Deputy Manager</span>
                          <div className="text-right">
                            <span className="font-semibold text-blue-600 text-sm block">{formatCurrency(totalLayerDistribution.layer2)}</span>
                            <span className="text-xs text-gray-600">{formatIDR(totalLayerDistribution.layer2 * rate)}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors bg-green-50">
                          <span className="text-sm font-medium text-green-700">AM – Assistant Manager</span>
                          <div className="text-right">
                            <span className="font-semibold text-green-600 text-sm block">{formatCurrency(totalLayerDistribution.layer3)}</span>
                            <span className="text-xs text-gray-600">{formatIDR(totalLayerDistribution.layer3 * rate)}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors bg-yellow-50">
                          <span className="text-sm font-medium text-yellow-700">SMT – Senior Marketing Team</span>
                          <div className="text-right">
                            <span className="font-semibold text-yellow-600 text-sm block">{formatCurrency(totalLayerDistribution.layer4)}</span>
                            <span className="text-xs text-gray-600">{formatIDR(totalLayerDistribution.layer4 * rate)}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors bg-orange-50">
                          <span className="text-sm font-medium text-orange-700">STL – Senior Team Leader</span>
                          <div className="text-right">
                            <span className="font-semibold text-orange-600 text-sm block">{formatCurrency(totalLayerDistribution.layer5)}</span>
                            <span className="text-xs text-gray-600">{formatIDR(totalLayerDistribution.layer5 * rate)}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors bg-red-50">
                          <span className="text-sm font-medium text-red-700">MT – Marketing Team / Marketing Officer</span>
                          <div className="text-right">
                            <span className="font-semibold text-red-600 text-sm block">{formatCurrency(totalLayerDistribution.layer6)}</span>
                            <span className="text-xs text-gray-600">{formatIDR(totalLayerDistribution.layer6 * rate)}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors bg-purple-50">
                          <span className="text-sm font-medium text-purple-700">Freelance / IB – Introducing Broker</span>
                          <div className="text-right">
                            <span className="font-semibold text-purple-600 text-sm block">{formatCurrency(totalLayerDistribution.layer7)}</span>
                            <span className="text-xs text-gray-600">{formatIDR(totalLayerDistribution.layer7 * rate)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <span className="text-sm">Total Fees</span>
                      <span className="font-semibold text-red-600 text-sm">{formatCurrency(totalFee)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <span className="text-sm">Total Storage</span>
                      <span className="font-semibold text-red-600 text-sm">{formatCurrency(totalStorage)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <span className="text-sm">Net Result</span>
                      <span className={`font-semibold text-sm ${getProfitColor(totalProfit + totalCommission + totalFee + totalStorage)}`}>
                        {formatCurrency(totalProfit + totalCommission + totalFee + totalStorage)}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {deals?.length > 0 ? formatCurrency(totalProfit / safeDeals.length) : '$0.00'}
                      </div>
                      <div className="text-sm text-gray-600">Average Profit per Deal</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {losingDeals > 0 ? (profitableDeals / losingDeals).toFixed(2) : profitableDeals > 0 ? '∞' : '0.00'}
                      </div>
                      <div className="text-sm text-gray-600">Profit Factor</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {deals?.length > 0 ? formatCurrency(Math.max(...safeDeals.map(d => d.profit))) : '$0.00'}
                      </div>
                      <div className="text-sm text-gray-600">Best Deal</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {deals?.length > 0 ? formatCurrency(Math.min(...safeDeals.map(d => d.profit))) : '$0.00'}
                      </div>
                      <div className="text-sm text-gray-600">Worst Deal</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="distribution">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Layer Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    7-Layer Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure dollar amounts per LOT for each layer (applied to 0.1 LOT and above, non-close positions only)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                      <div>
                        <Label htmlFor="layer1" className="text-sm">BM – Business Manager ($/LOT)</Label>
                        <Input
                          id="layer1"
                          type="number"
                          value={layer1}
                          onChange={(e) => setLayer1(e.target.value)}
                          className="w-full"
                          placeholder="0"
                          min="0"
                          step="0.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="layer2" className="text-sm">DM – Deputy Manager ($/LOT)</Label>
                        <Input
                          id="layer2"
                          type="number"
                          value={layer2}
                          onChange={(e) => setLayer2(e.target.value)}
                          className="w-full"
                          placeholder="0"
                          min="0"
                          step="0.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="layer3" className="text-sm">AM – Assistant Manager ($/LOT)</Label>
                        <Input
                          id="layer3"
                          type="number"
                          value={layer3}
                          onChange={(e) => setLayer3(e.target.value)}
                          className="w-full"
                          placeholder="0"
                          min="0"
                          step="0.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="layer4" className="text-sm">SMT – Senior Marketing Team ($/LOT)</Label>
                        <Input
                          id="layer4"
                          type="number"
                          value={layer4}
                          onChange={(e) => setLayer4(e.target.value)}
                          className="w-full"
                          placeholder="0"
                          min="0"
                          step="0.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="layer5" className="text-sm">STL – Senior Team Leader ($/LOT)</Label>
                        <Input
                          id="layer5"
                          type="number"
                          value={layer5}
                          onChange={(e) => setLayer5(e.target.value)}
                          className="w-full"
                          placeholder="0"
                          min="0"
                          step="0.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="layer6" className="text-sm">MT – Marketing Team / Marketing Officer ($/LOT)</Label>
                        <Input
                          id="layer6"
                          type="number"
                          value={layer6}
                          onChange={(e) => setLayer6(e.target.value)}
                          className="w-full"
                          placeholder="0"
                          min="0"
                          step="0.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="layer7" className="text-sm">Freelance / IB – Introducing Broker ($/LOT)</Label>
                        <Input
                          id="layer7"
                          type="number"
                          value={layer7}
                          onChange={(e) => setLayer7(e.target.value)}
                          className="w-full"
                          placeholder="0"
                          min="0"
                          step="0.5"
                        />
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm font-semibold text-gray-700">
                        Total per LOT: ${parseFloat(layer1 || '0') + parseFloat(layer2 || '0') + parseFloat(layer3 || '0') + parseFloat(layer4 || '0') + parseFloat(layer5 || '0') + parseFloat(layer6 || '0') + parseFloat(layer7 || '0')}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Dollar amount per LOT (0.1 LOT+, non-close positions only)
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Distribution Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Distribution Results</CardTitle>
                  <CardDescription>
                    Total commission distribution across all layers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors bg-indigo-50">
                      <span className="text-sm font-medium text-indigo-700">BM – Business Manager</span>
                      <div className="text-right">
                        <span className="font-semibold text-indigo-600 text-sm block">{formatCurrency(totalLayerDistribution.layer1)}</span>
                        <span className="text-xs text-gray-600">{formatIDR(totalLayerDistribution.layer1 * rate)}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors bg-blue-50">
                      <span className="text-sm font-medium text-blue-700">DM – Deputy Manager</span>
                      <div className="text-right">
                        <span className="font-semibold text-blue-600 text-sm block">{formatCurrency(totalLayerDistribution.layer2)}</span>
                        <span className="text-xs text-gray-600">{formatIDR(totalLayerDistribution.layer2 * rate)}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors bg-green-50">
                      <span className="text-sm font-medium text-green-700">AM – Assistant Manager</span>
                      <div className="text-right">
                        <span className="font-semibold text-green-600 text-sm block">{formatCurrency(totalLayerDistribution.layer3)}</span>
                        <span className="text-xs text-gray-600">{formatIDR(totalLayerDistribution.layer3 * rate)}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors bg-yellow-50">
                      <span className="text-sm font-medium text-yellow-700">SMT – Senior Marketing Team</span>
                      <div className="text-right">
                        <span className="font-semibold text-yellow-600 text-sm block">{formatCurrency(totalLayerDistribution.layer4)}</span>
                        <span className="text-xs text-gray-600">{formatIDR(totalLayerDistribution.layer4 * rate)}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors bg-orange-50">
                      <span className="text-sm font-medium text-orange-700">STL – Senior Team Leader</span>
                      <div className="text-right">
                        <span className="font-semibold text-orange-600 text-sm block">{formatCurrency(totalLayerDistribution.layer5)}</span>
                        <span className="text-xs text-gray-600">{formatIDR(totalLayerDistribution.layer5 * rate)}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors bg-red-50">
                      <span className="text-sm font-medium text-red-700">MT – Marketing Team / Marketing Officer</span>
                      <div className="text-right">
                        <span className="font-semibold text-red-600 text-sm block">{formatCurrency(totalLayerDistribution.layer6)}</span>
                        <span className="text-xs text-gray-600">{formatIDR(totalLayerDistribution.layer6 * rate)}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors bg-purple-50">
                      <span className="text-sm font-medium text-purple-700">Freelance / IB – Introducing Broker</span>
                      <div className="text-right">
                        <span className="font-semibold text-purple-600 text-sm block">{formatCurrency(totalLayerDistribution.layer7)}</span>
                        <span className="text-xs text-gray-600">{formatIDR(totalLayerDistribution.layer7 * rate)}</span>
                      </div>
                    </div>
                    
                    <div className="border-t pt-3 mt-4">
                      <div className="flex justify-between items-center p-3 border rounded-lg bg-gray-100">
                        <span className="text-sm font-bold text-gray-700">Total Commission</span>
                        <div className="text-right">
                          <span className="font-bold text-gray-800 text-sm block">{formatCurrency(totalCommission)}</span>
                          <span className="text-xs text-gray-600">{formatIDR(totalCommissionIDR)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Per-Transaction Distribution Table */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Per-Transaction Layer Distribution</CardTitle>
                <CardDescription>
                  Detailed commission distribution for each transaction
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Deal ID</TableHead>
                        <TableHead className="text-xs">Symbol</TableHead>
                        <TableHead className="text-xs">LOT</TableHead>
                        <TableHead className="text-xs">Total Comm</TableHead>
                        <TableHead className="text-xs">BM</TableHead>
                        <TableHead className="text-xs">DM</TableHead>
                        <TableHead className="text-xs">AM</TableHead>
                        <TableHead className="text-xs">SMT</TableHead>
                        <TableHead className="text-xs">STL</TableHead>
                        <TableHead className="text-xs">MT</TableHead>
                        <TableHead className="text-xs">Freelance/IB</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {safeFilteredDeals.slice(0, 10).map((deal) => {
                        const distribution = getLayerDistribution(deal.commission, deal.volume, deal.entry);
                        return (
                          <TableRow key={deal.deal} className="hover:bg-gray-50">
                            <TableCell className="text-xs font-mono">{deal.deal}</TableCell>
                            <TableCell className="text-xs font-medium">{deal.symbol}</TableCell>
                            <TableCell className="text-xs">{deal.entry === 1 ? '0' : ((deal.volume / 100000) * 10).toFixed(1)}</TableCell>
                            <TableCell className={`text-xs font-semibold ${deal.commission < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                              {formatCurrency(deal.commission)}
                            </TableCell>
                            <TableCell className="text-xs font-semibold text-indigo-600">
                              {formatCurrency(distribution.layer1)}
                            </TableCell>
                            <TableCell className="text-xs font-semibold text-blue-600">
                              {formatCurrency(distribution.layer2)}
                            </TableCell>
                            <TableCell className="text-xs font-semibold text-green-600">
                              {formatCurrency(distribution.layer3)}
                            </TableCell>
                            <TableCell className="text-xs font-semibold text-yellow-600">
                              {formatCurrency(distribution.layer4)}
                            </TableCell>
                            <TableCell className="text-xs font-semibold text-orange-600">
                              {formatCurrency(distribution.layer5)}
                            </TableCell>
                            <TableCell className="text-xs font-semibold text-red-600">
                              {formatCurrency(distribution.layer6)}
                            </TableCell>
                            <TableCell className="text-xs font-semibold text-purple-600">
                              {formatCurrency(distribution.layer7)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  {safeFilteredDeals.length > 10 && (
                    <div className="text-center text-sm text-gray-600 mt-4">
                      Showing first 10 transactions of {safeFilteredDeals.length} total
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}