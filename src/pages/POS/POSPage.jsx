import React, { useState, useEffect, useRef, lazy, Suspense, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { 
  FiSearch, 
  FiPlus, 
  FiPause, 
  FiFileText, 
  FiPrinter, 
  FiTruck, 
  FiShoppingBag, 
  FiCoffee,
  FiX,
  FiChevronRight,
  FiFilter,
  FiLogOut,
  FiWifi,
  FiWifiOff
} from 'react-icons/fi';
import { FaTrash, FaCheckCircle, FaHistory, FaUserCircle, FaMoneyBillWave, FaClock, FaCloudUploadAlt } from 'react-icons/fa';

import POSLayout from '../../layouts/POSLayout';
import ProductPanel from './components/ProductPanel';
import CartPanel from './components/CartPanel';
import BillListModal from './components/BillListModal';
import ReceiptTemplate from '../../components/ReceiptTemplate';
import VoiceCommandButton from '../../components/VoiceCommandButton';
import textToSpeechService from '../../utils/TextToSpeechService';

const CheckoutModal = lazy(() => import('../../components/CheckoutModal'));
const DineInDetailsModal = lazy(() => import('../../components/DineInDetailsModal'));
const DeliveryDetailsModal = lazy(() => import('../../components/DeliveryDetailsModal'));

import { getAllProducts } from '../../services/productService';
import { getAllCategories } from '../../services/categoryService';
import { getAllCustomers } from '../../services/customerService';
import { getAllDiningTables, updateDiningTableStatus } from '../../services/diningTableService';
import { getAllStaff } from '../../services/staffService';
import { createOrder, processPaymentForOrder, getAllOrders, updateOrder, getOrderById } from '../../services/orderService';
import { systemSettingService } from '../../services/systemSettingService';
import { 
  saveOrderOffline, 
  savePaymentOffline, 
  syncOfflineData, 
  getOfflineStats, 
  cacheProductsOffline, 
  cacheCategoriesOffline, 
  searchProductsOffline,
  cacheBillsOffline,
  getOfflineBills
} from '../../services/offlineService';

import { useLayout } from '../../context/LayoutContext';
import { useAuth } from '../../context/AuthContext';
import useSignalR from '../../useSignalR'; 
import config from '../../config'; 

const POSPage = () => {
  const { t } = useTranslation();
  const { setCollapsed } = useLayout();
  const { selectedBranch } = useAuth();
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const receiptRef = useRef(null);

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  const updateSyncCount = useCallback(async () => {
    const stats = await getOfflineStats();
    setPendingSyncCount(stats.pendingCount);
  }, []);

  // Connectivity Monitoring
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      toast.success("Connection restored. Synchronizing data...");
      const synced = await syncOfflineData();
      if (synced > 0) toast.success(`${synced} items synchronized with server.`);
      updateSyncCount();
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.warn("System is offline. Orders will be saved locally.");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    updateSyncCount();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [updateSyncCount]);

  const { connection, isConnected, error } = useSignalR(config.SIGNALR_HUB_URL); 

  useEffect(() => {
    if (isConnected && connection) {
      connection.on("OrderUpdate", (data) => {
        const msg = typeof data === 'string' ? data : data.message || data.Message || "Order updated";
        toast.info(`Order Update: ${msg}`);
        fetchAllBills(billStatusFilter); 
      });

      connection.on("InventoryUpdate", (data) => {
        console.log("POS: Received InventoryUpdate Signal:", data);
        const productId = data.productId || data.ProductId;
        const newQuantity = data.newQuantity !== undefined ? data.newQuantity : data.NewQuantity;
        const productName = data.productName || data.ProductName || "Product";
        
        if (productId !== undefined && newQuantity !== undefined) {
          setProducts(prevProducts => prevProducts.map(p => {
            const pId = p.id || p.productID || p.productId || p.Id;
            if (Number(pId) === Number(productId)) {
              console.log(`POS: Updating stock for ${productName} (ID: ${productId}) to ${newQuantity}`);
              return { ...p, stockQuantity: Number(newQuantity) };
            }
            return p;
          }));
          // Optional: toast.info(`${productName} stock updated to ${newQuantity}`);
        }
      });

      return () => { 
        connection.off("OrderUpdate"); 
        connection.off("InventoryUpdate");
      };
    }
  }, [isConnected, connection]);

  useEffect(() => {
    setCollapsed(true);
    searchInputRef.current?.focus();
    return () => { setCollapsed(false); };
  }, [setCollapsed]);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [diningTables, setDiningTables] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [systemSettings, setSystemSettings] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search term for API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const [billList, setBillList] = useState([]);
  const [showBillListModal, setShowBillListModal] = useState(false);
  const [billStatusFilter, setBillStatusFilter] = useState('');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showDineInModal, setShowDineInModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [recalledOrderId, setRecalledOrderId] = useState(null);
  const [currentRecalledTableName, setCurrentRecalledTableName] = useState(null);
  const [lastPaidOrder, setLastPaidOrder] = useState(null);

  const [orderFormData, setOrderFormData] = useState({
    orderDate: new Date().toISOString().split('T')[0],
    orderTime: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    tableName: '',
    waiterName: '',
    staffID: null,
    orderStatus: 'Pending',
    orderType: '',
    discountAmount: 0,
    discountPercentage: 0,
    promotionID: null,
    received: 0,
    changeAmount: 0,
    tipAmount: 0,
    driverID: null,
    customerID: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const [selectedCartItemIndex, setSelectedCartItemIndex] = useState(null);
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        
        // Relaxing the KOT requirement for fast-paced checkout (TakeAway/Delivery)
        if (!recalledOrderId && orderFormData.orderType === 'DineIn') {
          toast.warn("Please send the order to KOT first for Dine-In.");
          return;
        }

        // Only block Dine-In if food isn't ready (optional business rule, keeping it but relaxing for others)
        if (orderFormData.orderType === 'DineIn') {
          if (recalledOrderId && orderFormData.orderStatus !== 'Ready' && orderFormData.orderStatus !== 'Completed') {
            toast.warn("Dine-In Checkout: It is recommended to wait until food is 'Ready'.");
          }
        } 

        const errors = validateOrder();
        if (Object.keys(errors).length > 0) {
          Object.values(errors).forEach(err => toast.error(err));
          return;
        }
        if (cart.length > 0) {
          setShowCheckoutModal(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, orderFormData, recalledOrderId]);

  const fetchInitialData = useCallback(async () => {
    // Categories
    try {
      const res = await getAllCategories({ pageNumber: 1, pageSize: 1000, status: true });
      const items = res?.data?.data?.items || res?.data?.data?.Items || res?.data?.items || [];
      setCategories(items);
      if (items.length > 0) cacheCategoriesOffline(items);
    } catch (e) { 
      console.error("Categories fetch failed:", e);
      toast.error("Failed to load categories.");
    }

    // Customers
    try {
      const res = await getAllCustomers({ pageNumber: 1, pageSize: 1000, status: true });
      const items = res?.data?.data?.items || res?.data?.data?.Items || res?.data?.items || [];
      setCustomers(items);
    } catch (e) { 
      console.error("Customers fetch failed:", e);
      toast.error("Failed to load customers.");
    }

    // Dining Tables
    try {
      const res = await getAllDiningTables({ pageNumber: 1, pageSize: 1000 });
      console.log("POS: Dining Tables API Raw Response:", res.data);
      const items = res?.data?.data?.items || res?.data?.data?.Items || res?.data?.items || [];
      console.log("POS: Extracted Dining Tables:", items);
      setDiningTables(items);
      if (items.length === 0) {
        console.warn("Dining Tables list is empty from server.");
        toast.warn("No active dining tables found in database.");
      }
    } catch (e) { 
      console.error("Dining Tables fetch failed:", e);
      toast.error("Failed to load dining tables.");
    }

    // Staff
    try {
      const res = await getAllStaff({ pageNumber: 1, pageSize: 1000, status: true });
      const items = res?.data?.data?.items || res?.data?.data?.Items || res?.data?.items || [];
      setStaffMembers(items);
      if (items.length === 0) {
        toast.warn("No active staff members found.");
      }
    } catch (e) { 
      console.error("Staff fetch failed:", e);
      toast.error("Failed to load staff list.");
    }

    // System Settings
    try {
      const res = await systemSettingService.getAllSettings();
      const settings = res?.data || res || [];
      setSystemSettings(settings);
    } catch (e) {
      console.error("System settings fetch failed:", e);
    }
  }, []);

  useEffect(() => { fetchInitialData(); }, [fetchInitialData]);

  useEffect(() => {
    setSelectedProductIndex(0);
  }, [products]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!isOnline) {
        const localItems = await searchProductsOffline(debouncedSearchTerm, selectedCategory);
        setProducts(localItems);
        setHasMoreProducts(false);
        return;
      }

      try {
        const res = await getAllProducts({ 
          pageNumber: currentPage, 
          pageSize: 20, 
          searchQuery: debouncedSearchTerm, 
          categoryId: selectedCategory, 
          status: true 
        });
        const items = res?.data?.data?.items || [];
        setProducts(prev => currentPage === 1 ? items : [...prev, ...items]);
        setHasMoreProducts(items.length >= 20);

        if (currentPage === 1 && !debouncedSearchTerm && !selectedCategory) {
            cacheProductsOffline(items);
        }
      } catch (error) {}
    };
    fetchProducts();
  }, [debouncedSearchTerm, selectedCategory, currentPage, isOnline]);

  const handleHoldOrder = async () => {
    const validationErrors = validateOrder();
    if (Object.keys(validationErrors).length > 0) {
      Object.values(validationErrors).forEach(error => toast.error(error));
      return;
    }

    const orderToHold = {
      ...orderFormData,
      total: calculateTotal(),
      orderStatus: 'Held',
      orderDetails: cart.map(item => ({
        productID: item.productID,
        quantity: item.quantity,
        price: item.price,
        discountPrice: 0,
        amount: item.amount,
      })),
    };

    if (!isOnline) {
      await saveOrderOffline(orderToHold);
      toast.info("Order saved locally (Offline).");
      updateSyncCount();
      clearOrderFormAndCart();
      return;
    }

    try {
      await createOrder(orderToHold);
      toast.success("Order held.");
      clearOrderFormAndCart();
    } catch (error) {
      toast.error("Failed to hold order.");
    }
  };

  const fetchAllBills = async (status) => {
    try {
      if (!isOnline) {
        const localBills = await getOfflineBills();
        if (status) {
          setBillList(localBills.filter(b => b.orderStatus === status));
        } else {
          setBillList(localBills);
        }
        return;
      }

      const params = { pageNumber: 1, pageSize: 50 };
      if (status) params.status = status;
      const response = await getAllOrders(params);
      
      // Handle multiple possible response structures
      const responseData = response?.data?.data?.data || response?.data?.data || response?.data || {};
      
      let items = [];
      if (Array.isArray(responseData)) {
        items = responseData;
      } else if (responseData.items && Array.isArray(responseData.items)) {
        items = responseData.items;
      } else if (responseData.Items && Array.isArray(responseData.Items)) {
        items = responseData.Items;
      } else if (responseData.data && Array.isArray(responseData.data)) {
        items = responseData.data;
      }
      
      console.log("POS: Fetched Bills:", items);
      setBillList(items);
      
      // Cache for offline
      if (!status) {
        await cacheBillsOffline(items);
      }
    } catch (error) {
      console.error("Fetch orders failed:", error);
      toast.error("Failed to fetch orders.");
    }
  };

  const handleRecallOrder = async (orderSummary) => {
    try {
      if (!orderSummary) {
        toast.error("Recall failed: Order data is null.");
        return;
      }

      const orderId = orderSummary.orderID || orderSummary.orderId || orderSummary.id || orderSummary.Id;
      console.log(`Fetching full details for order SR-${orderId}...`);
      
      let fullOrder = orderSummary;
      
      // If orderDetails is missing or empty, fetch the full order by ID to get the items
      const hasNoItems = !orderSummary.orderDetails || (Array.isArray(orderSummary.orderDetails) && orderSummary.orderDetails.length === 0);
      const hasNoItemsPascal = !orderSummary.OrderDetails || (Array.isArray(orderSummary.OrderDetails) && orderSummary.OrderDetails.length === 0);

      if (hasNoItems && hasNoItemsPascal) {
        try {
          const response = await getOrderById(orderId);
          if (response.data && response.data.isSuccess) {
            fullOrder = response.data.data;
          } else {
            console.warn("Could not fetch full order details, proceeding with summary data.");
          }
        } catch (err) {
          console.error("Error fetching order by ID:", err);
        }
      }

      console.log("Processing order for recall:", fullOrder);

      // Normalize property access (handle both PascalCase and camelCase)
      const details = fullOrder.orderDetails || fullOrder.OrderDetails || [];
      const orderDateRaw = fullOrder.orderDate || fullOrder.OrderDate;
      const orderTime = fullOrder.orderTime || fullOrder.OrderTime;
      const orderType = fullOrder.orderType || fullOrder.OrderType || '';
      const orderStatus = fullOrder.orderStatus || fullOrder.OrderStatus || 'Pending';
      const tableName = fullOrder.tableName || fullOrder.TableName || '';
      const waiterName = fullOrder.waiterName || fullOrder.WaiterName || '';

      // Safe Date Parsing
      let formattedDate = new Date().toISOString().split('T')[0];
      if (orderDateRaw) {
        const d = new Date(orderDateRaw);
        if (!isNaN(d.getTime())) {
          formattedDate = d.toISOString().split('T')[0];
        }
      }

      // Map order details safely
      const items = details.map(detail => {
        const pId = detail.productID || detail.productId || detail.id || detail.Id;
        const pName = detail.productName || detail.ProductName || detail.product?.productName || detail.product?.ProductName || 'Unknown Product';
        const qty = detail.quantity || detail.Quantity || 1;
        const prc = detail.price || detail.Price || detail.product?.productPrice || detail.product?.ProductPrice || 0;
        const amt = detail.amount || detail.Amount || (qty * prc) || 0;
        const odId = detail.orderDetailID || detail.OrderDetailID || 0;

        return {
          orderDetailID: odId,
          productID: pId,
          productName: pName,
          quantity: qty,
          price: prc,
          discountPrice: detail.discountPrice || detail.DiscountPrice || 0,
          amount: amt,
          stockQuantity: detail.product?.stockQuantity || detail.Product?.StockQuantity || detail.product?.StockQuantity || 0,
        };      });

      if (items.length === 0) {
        toast.warn("The recalled order has no items in its record.");
      }

      // SMART MERGE: Add to existing cart items if productID matches
      setCart(prevCart => {
        const newCart = [...prevCart];
        items.forEach(newItem => {
          const existingIndex = newCart.findIndex(item => item.productID === newItem.productID);
          if (existingIndex > -1) {
            // Update existing item: add quantity, update amount, and keep orderDetailID if the new one has one
            newCart[existingIndex].quantity += newItem.quantity;
            newCart[existingIndex].amount = newCart[existingIndex].quantity * newCart[existingIndex].price;
            if (newItem.orderDetailID) {
              newCart[existingIndex].orderDetailID = newItem.orderDetailID;
            }
          } else {
            newCart.push(newItem);
          }
        });
        return newCart;
      });

      setOrderFormData({
        orderDate: formattedDate,
        orderTime: orderTime || new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        tableName: tableName,
        waiterName: waiterName,
        orderStatus: orderStatus,
        orderType: orderType,
        discountAmount: fullOrder.discountAmount || fullOrder.DiscountAmount || 0,
        discountPercentage: fullOrder.discountPercentage || fullOrder.DiscountPercentage || 0,
        taxAmount: fullOrder.taxAmount || fullOrder.TaxAmount || 0,
        serviceChargeAmount: fullOrder.serviceChargeAmount || fullOrder.ServiceChargeAmount || 0,
        promotionID: fullOrder.promotionID || fullOrder.PromotionID || null,
        driverID: fullOrder.driverID || fullOrder.DriverID || null,
        customerID: fullOrder.customerID || fullOrder.CustomerID || null,
        lastModified: fullOrder.modifiedDate || fullOrder.ModifiedDate || null,
      });

      setRecalledOrderId(orderId);
      setCurrentRecalledTableName(tableName);
      setShowBillListModal(false);
      
      toast.success(`Order ${orderId ? 'SR-' + orderId : ''} items added to cart.`, {
        icon: "➕"
      });
      
    } catch (error) {
      console.error("Critical recall error:", error);
      toast.error(`Recall failed: ${error.message}`);
    }
  };

  const handleKOT = async () => {
    const validationErrors = validateOrder();
    if (Object.keys(validationErrors).length > 0) {
        Object.values(validationErrors).forEach(error => toast.error(error));
        return;
    }

    const orderToProcess = {
      ...orderFormData,
      total: calculateTotal(),
      orderStatus: 'Pending',
      orderDetails: cart.map(item => ({
        orderDetailID: item.orderDetailID || 0,
        productID: item.productID,
        quantity: item.quantity,
        price: item.price,
        discountPrice: 0,
        amount: item.amount,
      })),
    };

    if (!isOnline) {
        await saveOrderOffline(orderToProcess);
        toast.info("KOT saved locally. Kitchen will be updated once online.");
        updateSyncCount();
        clearOrderFormAndCart();
        return;
    }

    try {
      if (recalledOrderId) {
        orderToProcess.orderID = recalledOrderId;
        await updateOrder(recalledOrderId, orderToProcess);
      } else {
        await createOrder(orderToProcess);
      }
      toast.success("Order sent to kitchen.");
      clearOrderFormAndCart();
      setRecalledOrderId(null);
    } catch (error) {
      console.error("KOT Full Error Object:", error);
      const errorData = error.response?.data;
      let detailedMsg = "Failed to send to kitchen.";
      
      if (errorData) {
        if (errorData.message) {
          detailedMsg = errorData.message;
        }
        if (errorData.details && typeof errorData.details === 'string') {
          detailedMsg += ` (${errorData.details})`;
        } else if (errorData.details && Array.isArray(errorData.details)) {
          errorData.details.forEach(detail => toast.error(detail.errorMessage || detail));
          return;
        }
      }
      
      toast.error(detailedMsg);
    }
  };

  const handleProcessPayment = async (paymentData) => {
    const total = calculateTotal();
    const finalAmount = total - paymentData.DiscountAmount + (paymentData.TipAmount || 0);

    const orderToProcess = {
      ...orderFormData,
      total: total,
      discountAmount: paymentData.DiscountAmount,
      tipAmount: paymentData.TipAmount || 0,
      received: paymentData.AmountReceived,
      changeAmount: paymentData.ChangeAmount,
      orderStatus: orderFormData.orderStatus || 'Pending',
      orderDetails: cart.map(item => ({
        orderDetailID: item.orderDetailID || 0,
        productID: item.productID,
        quantity: item.quantity,
        price: item.price,
        discountPrice: 0,
        amount: item.amount,
      })),
    };

    if (!isOnline) {
        // Offline Payment Flow
        const offlineOrderId = await saveOrderOffline(orderToProcess);
        await savePaymentOffline({
            offlineOrderID: offlineOrderId,
            amountReceived: paymentData.AmountReceived,
            amountPaid: finalAmount,
            changeAmount: paymentData.ChangeAmount,
            discountAmount: paymentData.DiscountAmount,
            tipAmount: paymentData.TipAmount,
            promotionID: paymentData.PromotionID,
            paymentMethod: paymentData.IsSplit ? 'Split' : 'Cash',
            isSplit: paymentData.IsSplit,
            splitPayments: paymentData.SplitPayments
        });

        // Set local print data
        setLastPaidOrder({
            ...orderToProcess,
            orderID: `OFF-${offlineOrderId}`,
            tokenNumber: 'OFFLINE',
            orderDetails: cart.map(item => ({ ...item }))
        });

        toast.warn("Payment saved locally. Receipt printed.");
        updateSyncCount();
        clearOrderFormAndCart();
        setShowCheckoutModal(false);
        return;
    }

    try {
        let response;
        if (recalledOrderId) {
            orderToProcess.orderID = recalledOrderId;
            response = await updateOrder(recalledOrderId, orderToProcess);
        } else {
            response = await createOrder(orderToProcess);
        }

        const processedOrder = response.data.data;

        const paymentPayload = {
            orderID: processedOrder.orderID,
            amountReceived: paymentData.AmountReceived,
            amountPaid: finalAmount,
            changeAmount: paymentData.ChangeAmount,
            discountAmount: paymentData.DiscountAmount,
            tipAmount: paymentData.TipAmount,
            promotionID: paymentData.PromotionID,
            paymentMethod: paymentData.IsSplit ? 'Split' : 'Cash',
            isSplit: paymentData.IsSplit,
            splitPayments: paymentData.SplitPayments
        };
        
        console.log("Sending payment request:", paymentPayload);
        const paymentResponse = await processPaymentForOrder(paymentPayload);

        // Store order data for printing before clearing
        setLastPaidOrder({
            ...orderToProcess,
            orderID: processedOrder.orderID,
            tokenNumber: processedOrder.tokenNumber,
            received: paymentData.AmountReceived,
            changeAmount: paymentData.ChangeAmount,
            discountAmount: paymentData.DiscountAmount,
            tipAmount: paymentData.TipAmount,
            orderDetails: cart.map(item => ({
              ...item, // Includes productName
              orderDetailID: item.orderDetailID || 0,
            }))
        });

        toast.success(`Order Paid. Token: ${processedOrder.tokenNumber || 'SR-' + processedOrder.orderID}`, {
            style: { background: '#1e293b', color: '#fff', borderRadius: '1.5rem', fontWeight: 'bold' }
        });

        clearOrderFormAndCart();
        setRecalledOrderId(null);
        setShowCheckoutModal(false);

    } catch (error) {
        console.error("Payment Error:", error);
        let detailedMsg = error.response?.data?.message || error.response?.data?.Message || "Failed to process payment.";
        
        // If there are validation details, append the first one to the message
        const details = error.response?.data?.details || error.response?.data?.Details;
        if (Array.isArray(details) && details.length > 0) {
            detailedMsg += `: ${details[0].errorMessage || details[0].ErrorMessage || JSON.stringify(details[0])}`;
        } else if (error.response?.data) {
            // If no structured details, show the raw data
            detailedMsg += ` (Raw: ${JSON.stringify(error.response.data)})`;
        }
        
        toast.error(detailedMsg);
    }
  };

  const handleSearchKeyDown = async (e) => {
    if (e.key === 'Enter') {
        if (searchTerm) {
            // First check locally for immediate feedback
            const localMatch = products.find(p => p.productBarcode === searchTerm);
            if (localMatch) {
                handleProductAddToCart(localMatch);
                setSearchTerm('');
                return;
            }

            // If not found locally, search the whole database (ignoring pagination)
            try {
                const res = await getAllProducts({ 
                    pageNumber: 1, 
                    pageSize: 1, 
                    searchQuery: searchTerm, 
                    status: true 
                });
                const foundProduct = res?.data?.data?.items?.[0];
                if (foundProduct && (foundProduct.productBarcode === searchTerm || foundProduct.productName.toLowerCase() === searchTerm.toLowerCase())) {
                    handleProductAddToCart(foundProduct);
                    setSearchTerm('');
                } else {
                    toast.warn("Product not found.");
                }
            } catch (err) {
                toast.error("Search failed.");
            }
        } else if (products.length > 0 && selectedProductIndex >= 0) {
            // Add the currently highlighted product if search is empty
            handleProductAddToCart(products[selectedProductIndex]);
        }
    } else if (e.key === 'ArrowRight') {
      setSelectedProductIndex(prev => (prev === products.length - 1) ? 0 : prev + 1);
    } else if (e.key === 'ArrowLeft') {
      setSelectedProductIndex(prev => (prev === 0) ? products.length - 1 : prev - 1);
    }
  }

  const handleProductAddToCart = (product, index = -1) => {
    if (index !== -1) setSelectedProductIndex(index);
    const existingItemIndex = cart.findIndex(item => item.productID === (product.id || product.productID));
    const currentQtyInCart = existingItemIndex > -1 ? cart[existingItemIndex].quantity : 0;

    if (product.stockQuantity <= currentQtyInCart) {
        toast.warn(`Insufficient stock for ${product.productName}. (Available: ${product.stockQuantity})`);
        return;
    }

    if (existingItemIndex > -1) {
      const newCart = [...cart];
      newCart[existingItemIndex].quantity += 1;
      newCart[existingItemIndex].amount = newCart[existingItemIndex].quantity * newCart[existingItemIndex].price;
      setCart(newCart);
    } else {
      setCart([...cart, {
        productID: product.id || product.productID,
        productName: product.productName,
        quantity: 1,
        price: product.productPrice,
        amount: product.productPrice,
        stockQuantity: product.stockQuantity, // Added
      }]);
    }    searchInputRef.current?.focus();
  };

  const handleVoiceCommand = (intent) => {
    switch (intent.action) {
      case 'ADD_TO_CART': {
        const product = products.find(p => 
          p.productName.toLowerCase().includes(intent.productName.toLowerCase())
        );
        if (product) {
          const existingItemIndex = cart.findIndex(item => item.productID === product.id);
          if (existingItemIndex > -1) {
            const newCart = [...cart];
            newCart[existingItemIndex].quantity += intent.quantity;
            newCart[existingItemIndex].amount = newCart[existingItemIndex].quantity * newCart[existingItemIndex].price;
            setCart(newCart);
          } else {
            setCart([...cart, {
              productID: product.id,
              productName: product.productName,
              quantity: intent.quantity,
              price: product.productPrice,
              amount: product.productPrice * intent.quantity,
            }]);
          }
          const msg = `${t('added')} ${intent.quantity} ${product.productName} ${t('to_cart')}`;
          toast.success(msg);
          textToSpeechService.speak(msg);
        } else {
          const msg = `${t('product')} "${intent.productName}" ${t('not_found')}`;
          toast.warn(msg);
          textToSpeechService.speak(msg);
        }
        break;
      }
      case 'REMOVE_FROM_CART': {
        const index = cart.findIndex(item => 
          item.productName.toLowerCase().includes(intent.productName.toLowerCase())
        );
        if (index > -1) {
          const name = cart[index].productName;
          removeCartItem(index);
          const msg = `${t('removed')} ${name} ${t('from_cart')}`;
          toast.info(msg);
          textToSpeechService.speak(msg);
        } else {
          const msg = `${t('item')} "${intent.productName}" ${t('not_in_cart')}`;
          toast.warn(msg);
          textToSpeechService.speak(msg);
        }
        break;
      }
      case 'OPEN_CHECKOUT':
        if (cart.length > 0) {
          setShowCheckoutModal(true);
          textToSpeechService.speak(t('opening_checkout'));
        } else {
          toast.warn(t('cart_is_empty'));
          textToSpeechService.speak(t('cart_is_empty'));
        }
        break;
      case 'CLEAR_CART':
        setCart([]);
        toast.info(t('cart_cleared'));
        textToSpeechService.speak(t('cart_cleared'));
        break;
      default:
        toast.info(t('command_not_understood'));
        textToSpeechService.speak(t('command_not_understood'));
        break;
    }
  };

  const handleCartItemQuantityChange = (index, newQuantity) => {
    const q = parseInt(newQuantity) || 1;
    const item = cart[index];

    if (q > item.stockQuantity) {
        toast.warn(`Insufficient stock. Only ${item.stockQuantity} available.`);
        return;
    }

    const newCart = [...cart];
    newCart[index].quantity = q;
    newCart[index].amount = q * newCart[index].price;
    setCart(newCart);
  };

  const removeCartItem = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const calculateTotal = () => cart.reduce((sum, item) => sum + item.amount, 0);

  const calculateTax = () => {
    const taxRate = parseFloat(systemSettings.find(s => (s.settingKey || s.SettingKey) === 'DefaultTaxRate')?.settingValue || 0);
    return (calculateTotal() * taxRate) / 100;
  };

  const calculateServiceCharge = () => {
    const serviceRate = parseFloat(systemSettings.find(s => (s.settingKey || s.SettingKey) === 'ServiceChargeRate')?.settingValue || 0);
    return (calculateTotal() * serviceRate) / 100;
  };

  const calculateGrandTotal = () => {
    return calculateTotal() + calculateTax() + calculateServiceCharge();
  };

  function validateOrder() {
    const newErrors = {};
    if (cart.length === 0) newErrors.cart = "Cart is empty.";
    
    if (!orderFormData.orderType) {
      newErrors.orderType = "Please select an Order Type (Dine-In, Take Away, or Delivery).";
    }
    
    if (orderFormData.orderType === 'DineIn') {
      if (!orderFormData.tableName) newErrors.table = "Please select a table for Dine-In.";
      if (!orderFormData.waiterName) newErrors.waiter = "Please assign a waiter for Dine-In.";
    }
    
    if (orderFormData.orderType === 'Delivery') {
      if (!orderFormData.customerID) newErrors.customer = "Please select a customer for Delivery.";
      if (!orderFormData.driverID) newErrors.driver = "Please assign a driver for Delivery.";
    }
    
    return newErrors;
  }

  const clearOrderFormAndCart = () => {
    setCart([]);
    setOrderFormData({
      orderDate: new Date().toISOString().split('T')[0],
      orderTime: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      tableName: '', waiterName: '', orderStatus: 'Pending', orderType: '',
      discountAmount: 0, discountPercentage: 0, promotionID: null, 
      received: 0, changeAmount: 0, tipAmount: 0,
      driverID: null, customerID: null,
    });
    setRecalledOrderId(null);
  };

  const handlePrintOrder = async (orderSummary) => {
    if (!orderSummary) return;

    const orderId = orderSummary.orderID || orderSummary.orderId || orderSummary.id || orderSummary.Id;
    let fullOrder = orderSummary;

    // If orderDetails is missing or empty, fetch the full order by ID to get the items
    const hasNoItems = !orderSummary.orderDetails || (Array.isArray(orderSummary.orderDetails) && orderSummary.orderDetails.length === 0);
    const hasNoItemsPascal = !orderSummary.OrderDetails || (Array.isArray(orderSummary.OrderDetails) && orderSummary.OrderDetails.length === 0);

    if (hasNoItems && hasNoItemsPascal) {
      try {
        const response = await getOrderById(orderId);
        if (response.data && response.data.isSuccess) {
          fullOrder = response.data.data;
        }
      } catch (err) {
        console.error("Error fetching order by ID for printing:", err);
      }
    }

    const rawDetails = fullOrder.orderDetails || fullOrder.OrderDetails || [];

    const enrichedOrder = {
      ...fullOrder,
      orderID: fullOrder.orderID ?? fullOrder.orderId ?? fullOrder.id ?? fullOrder.Id ?? 'N/A',
      orderDate: fullOrder.orderDate ?? fullOrder.OrderDate ?? new Date().toISOString(),
      orderTime: fullOrder.orderTime ?? fullOrder.OrderTime ?? new Date().toLocaleTimeString(),
      orderType: fullOrder.orderType ?? fullOrder.OrderType ?? 'Standard',
      tableName: fullOrder.tableName ?? fullOrder.TableName ?? '',
      waiterName: fullOrder.waiterName ?? fullOrder.WaiterName ?? '',
      total: fullOrder.total ?? fullOrder.Total ?? 0,
      taxAmount: fullOrder.taxAmount ?? fullOrder.TaxAmount ?? 0,
      serviceChargeAmount: fullOrder.serviceChargeAmount ?? fullOrder.ServiceChargeAmount ?? 0,
      received: fullOrder.received ?? fullOrder.Received ?? 0,
      changeAmount: fullOrder.changeAmount ?? fullOrder.ChangeAmount ?? 0,
      discountAmount: fullOrder.discountAmount ?? fullOrder.DiscountAmount ?? 0,
      tipAmount: fullOrder.tipAmount ?? fullOrder.TipAmount ?? 0,
      orderDetails: rawDetails.map(detail => ({
        productID: detail.productID ?? detail.ProductID ?? detail.productId ?? 0,
        productName: detail.productName ?? detail.ProductName ?? detail.product?.productName ?? detail.product?.ProductName ?? `Product #${detail.productID ?? detail.productId ?? 'N/A'}`,
        quantity: detail.quantity ?? detail.Quantity ?? 1,
        price: detail.price ?? detail.Price ?? detail.product?.productPrice ?? detail.product?.ProductPrice ?? 0,
        amount: detail.amount ?? detail.Amount ?? 0
      }))
    };

    setLastPaidOrder(enrichedOrder);
  };
  useEffect(() => {
    if (lastPaidOrder && receiptRef.current) {
        // Check if this was an auto-print from payment OR a manual print from Bill List
        const isAutoPrint = systemSettings.find(s => (s.settingKey || s.SettingKey) === 'AutoPrintReceipt')?.settingValue === 'true';
        
        // We always print if it's explicitly called via handlePrintOrder (recalledOrderId is null or orderStatus is already Paid)
        // For auto-print, we check the setting.
        
        // Logic: if handlePrintOrder was called, we want to print. 
        // We'll use a simple approach: if lastPaidOrder is set, try to print.
        setTimeout(() => {
            receiptRef.current.print();
            setLastPaidOrder(null);
        }, 300);
    }
  }, [lastPaidOrder, systemSettings]);

  const topBarButtons = [
    { label: t('common.new'), onClick: clearOrderFormAndCart, icon: <FiPlus />, color: 'blue' },
    { label: t('pos.hold_order'), onClick: handleHoldOrder, icon: <FiPause />, color: 'yellow' },
    { label: t('pos.view_bills'), onClick: () => { setShowBillListModal(true); fetchAllBills(billStatusFilter); }, icon: <FiFileText />, color: 'gray' },
    { label: 'KOT', onClick: handleKOT, icon: <FiPrinter />, color: 'purple' },
    { label: t('pos.delivery'), onClick: () => setShowDeliveryModal(true), icon: <FiTruck />, color: 'green' },
    { label: t('pos.take_away'), onClick: () => setOrderFormData({...orderFormData, orderType: 'TakeOut'}), icon: <FiShoppingBag />, color: 'orange' },
    { label: t('pos.dine_in'), onClick: () => setShowDineInModal(true), icon: <FiCoffee />, color: 'red' },
    { label: t('pos.exit'), onClick: () => navigate('/dashboard'), icon: <FiLogOut />, color: 'black' },
  ];
  return (
    <>
      {/* Offline Status Bar */}
      {(!isOnline || pendingSyncCount > 0) && (
        <div className={`fixed top-0 left-0 right-0 z-[200] px-8 py-3 flex items-center justify-between shadow-2xl transition-all duration-500 ${isOnline ? 'bg-indigo-600' : 'bg-red-500'} text-white`}>
          <div className="flex items-center gap-4">
            {isOnline ? <FiWifi size={18} /> : <FiWifiOff size={18} className="animate-pulse" />}
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">
              {isOnline ? t('common.network_restored') : t('common.terminal_offline')}
            </span>
          </div>
          {pendingSyncCount > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold opacity-80 uppercase tracking-widest">{pendingSyncCount} {t('pos.items_pending')}</span>
              {isOnline && (
                <>
                  <button 
                    onClick={async () => {
                      const synced = await syncOfflineData();
                      if (synced > 0) {
                        toast.success(`${synced} ${t('pos.items_synced')}`);
                      } else {
                        toast.error("Failed to sync. Items might be malformed from previous errors. Check console.");
                      }
                      updateSyncCount();
                    }}
                    className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                  >
                    {t('pos.sync_now')}
                  </button>
                  <button 
                    onClick={async () => {
                      if (window.confirm("Are you sure you want to delete all pending offline items? This will clear stuck orders.")) {
                        const { db } = await import('../../services/offlineService');
                        await db.pendingOrders.clear();
                        await db.pendingPayments.clear();
                        updateSyncCount();
                        toast.success("Offline queue cleared.");
                      }
                    }}
                    className="bg-red-900/50 hover:bg-red-900/80 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ml-2"
                  >
                    Clear Stuck Queue
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      <POSLayout
        topBarButtons={topBarButtons}
        productPanel={
          <ProductPanel 
            products={products} 
            selectedProductIndex={selectedProductIndex} 
            handleProductAddToCart={handleProductAddToCart} 
            categories={categories} 
            setSelectedCategory={setSelectedCategory} 
            hasMoreProducts={hasMoreProducts} 
            setCurrentPage={setCurrentPage} 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm} 
            handleSearchKeyDown={handleSearchKeyDown} 
            currencyCode={selectedBranch?.currencyCode}
            currencySymbol={selectedBranch?.currencySymbol}
          />
        }
        cartPanel={
          <CartPanel 
            cart={cart} 
            selectedCartItemIndex={selectedCartItemIndex} 
            handleCartItemQuantityChange={handleCartItemQuantityChange} 
            removeCartItem={removeCartItem} 
            calculateTotal={calculateTotal} 
            calculateTax={calculateTax}
            calculateServiceCharge={calculateServiceCharge}
            calculateGrandTotal={calculateGrandTotal}
            setShowCheckoutModal={setShowCheckoutModal} 
            validateOrder={validateOrder} 
            orderFormData={orderFormData} 
            recalledOrderId={recalledOrderId} 
            handlePrintOrder={handlePrintOrder}
            currencyCode={selectedBranch?.currencyCode}
            currencySymbol={selectedBranch?.currencySymbol}
          />
        }
      />
      <Suspense fallback={<div className="fixed inset-0 bg-white/80 backdrop-blur-md flex items-center justify-center z-[100] font-black text-blue-600 uppercase tracking-widest">Loading...</div>}>
        <CheckoutModal 
          isOpen={showCheckoutModal} 
          onClose={() => setShowCheckoutModal(false)} 
          totalAmount={calculateTotal()} 
          grandTotal={calculateGrandTotal()}
          onProcessPayment={handleProcessPayment} 
          currencyCode={selectedBranch?.currencyCode}
          currencySymbol={selectedBranch?.currencySymbol}
        />
        <DineInDetailsModal 
          isOpen={showDineInModal} 
          onClose={() => setShowDineInModal(false)} 
          onSave={({table, waiter, staffID}) => { 
            setOrderFormData({...orderFormData, orderType: 'DineIn', tableName: table, waiterName: waiter, staffID: staffID}); 
            setShowDineInModal(false); 
          }} 
          diningTables={diningTables} 
          staffMembers={staffMembers} 
        />
        <DeliveryDetailsModal isOpen={showDeliveryModal} onClose={() => setShowDeliveryModal(false)} onSave={({customer, driver}) => { setOrderFormData({...orderFormData, orderType: 'Delivery', customerID: customer, driverID: driver}); setShowDeliveryModal(false); }} customers={customers} staffMembers={staffMembers} />
      </Suspense>

      <BillListModal 
        isOpen={showBillListModal} 
        onClose={() => setShowBillListModal(false)} 
        billList={billList} 
        billStatusFilter={billStatusFilter} 
        setBillStatusFilter={setBillStatusFilter} 
        fetchAllBills={fetchAllBills} 
        handleRecallOrder={handleRecallOrder} 
        handlePrintOrder={handlePrintOrder}
        currencyCode={selectedBranch?.currencyCode}
        currencySymbol={selectedBranch?.currencySymbol}
      />

      <ReceiptTemplate ref={receiptRef} order={lastPaidOrder} settings={systemSettings} />
      <VoiceCommandButton onCommand={handleVoiceCommand} products={products} />
    </>
  );
};

export default POSPage;