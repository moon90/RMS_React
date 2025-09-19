import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { toast } from 'react-toastify';
import { FiSearch, FiPlus, FiPause, FiFileText, FiPrinter, FiTruck, FiShoppingBag, FiCoffee } from 'react-icons/fi';
import { FaTrash } from 'react-icons/fa';

import POSLayout from '../../layouts/POSLayout';
const CheckoutModal = lazy(() => import('../../components/CheckoutModal'));
const DineInDetailsModal = lazy(() => import('../../components/DineInDetailsModal'));
const DeliveryDetailsModal = lazy(() => import('../../components/DeliveryDetailsModal'));

import { getAllProducts } from '../../services/productService';
import { getAllCategories } from '../../services/categoryService';
import { getAllCustomers } from '../../services/customerService';
import { getAllDiningTables, updateDiningTableStatus } from '../../services/diningTableService';
import { getAllStaff } from '../../services/staffService';
import { createOrder, processPaymentForOrder, getAllOrders, updateOrder } from '../../services/orderService';

import { useLayout } from '../../context/LayoutContext';
import '../../styles/POS.css';
import useSignalR from '../../useSignalR'; // Import the custom hook
import config from '../../config'; // Import config file

const ProductPanel = React.memo(({ products, selectedProductIndex, handleProductAddToCart, categories, setSelectedCategory, searchTerm, setSearchTerm, handleSearchKeyDown, hasMoreProducts, setCurrentPage }) => (
    <div>
      <div className="mb-4 flex items-center space-x-4">
        <div className="relative flex-grow">
          <FiSearch className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
          <input
            id="search-input"
            type="text"
            placeholder="Scan barcode or search by name..."
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
        </div>
        <div className="relative">
            <select
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-full px-4 py-3 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.categoryID} value={category.categoryID}>
                  {category.categoryName}
                </option>
              ))}
            </select>
        </div>
      </div>
      <div className="flex flex-wrap gap-4">
        {products.map((product, index) => (
            <div
                key={product.id}
                className={`flex-shrink-0 w-40 bg-white rounded-lg shadow-md p-3 text-center transform hover:scale-105 transition-transform duration-300 ease-in-out cursor-pointer product-card ${selectedProductIndex === index ? 'selected' : ''}`}
                onClick={() => handleProductAddToCart(product)}
            >
                <img 
                src={product.productImage || '/images/placeholder.png'} 
                alt={product.productName} 
                className="w-24 h-24 mx-auto mb-2 rounded-full object-cover"
                />
                <p className="text-sm font-semibold text-gray-800 truncate">{product.productName}</p>
                <p className="text-xs text-gray-500">${product.productPrice.toFixed(2)}</p>
          </div>
        ))}
      </div>
      {hasMoreProducts && (
        <div className="mt-6 text-center">
            <button 
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
                Load More
            </button>
        </div>
      )}
    </div>
  ));

  const CartPanel = React.memo(({ cart, selectedCartItemIndex, handleCartItemQuantityChange, removeCartItem, calculateTotal, setShowCheckoutModal }) => (
    <div className="flex flex-col h-full bg-white p-4 shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4 border-b pb-2">Order Details</h2>
      <div className="flex-grow overflow-y-auto mb-4 pr-2">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
            <tr>
              <th scope="col" className="p-2 serial-no-col">#</th>
              <th scope="col" className="p-2 product-col">Product</th>
              <th scope="col" className="p-2 qty-col">Qty</th>
              <th scope="col" className="p-2 price-col">Price</th>
              <th scope="col" className="p-2 amount-col">Amount</th>
              <th scope="col" className="p-2 actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cart.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-10 text-gray-500">Your cart is empty.</td>
              </tr>
            ) : (
              cart.map((item, index) => (
                <tr key={index} className={`border-b hover:bg-gray-100 cart-item ${selectedCartItemIndex === index ? 'selected' : ''}`}>
                  <td className="p-2 font-medium text-gray-500 serial-no-col">{index + 1}</td>
                  <td className="p-2 font-bold text-gray-900 product-col">{item.productName}</td>
                  <td className="p-2 qty-col">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleCartItemQuantityChange(index, e.target.value)}
                      className="w-16 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-center"
                      min="1"
                    />
                  </td>
                  <td className="p-2 price-col">${item.price.toFixed(2)}</td>
                  <td className="p-2 font-semibold text-gray-800 amount-col">${item.amount.toFixed(2)}</td>
                  <td className="p-2 actions-col">
                    <button onClick={() => removeCartItem(index)} className="text-red-500 hover:text-red-700">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="border-t-2 border-gray-200 pt-4">
        <div className="flex justify-between text-2xl font-bold text-gray-800 mb-4">
          <span>Total:</span>
          <span>${calculateTotal().toFixed(2)}</span>
        </div>
        <button
          onClick={() => setShowCheckoutModal(true)}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-lg text-xl transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          Checkout (Alt+C)
        </button>
      </div>
    </div>
  ));

const POSPage = () => {
  const { setCollapsed } = useLayout();
  const searchInputRef = useRef(null);

  // SignalR Integration
  const { connection, isConnected, error } = useSignalR(config.SIGNALR_HUB_URL); // Use your backend SignalR URL

  {error && <div className="text-red-500 text-center mb-4">SignalR Connection Error: {error}</div>}

  useEffect(() => {
    if (isConnected && connection) {
      connection.on("OrderUpdate", (message) => {
        console.log("Received OrderUpdate:", message);
        toast.info(`Order Update: ${message}`);
        // Optionally, refresh bill list or update specific order in UI
        fetchAllBills(billStatusFilter); // Refresh bill list on order update
      });

      // Clean up the event listener when the component unmounts or connection changes
      return () => {
        connection.off("OrderUpdate");
      };
    }
  }, [isConnected, connection]);

  useEffect(() => {
    setCollapsed(true);
    searchInputRef.current?.focus();
    return () => {
      setCollapsed(false);
    };
  }, [setCollapsed]);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [diningTables, setDiningTables] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [billList, setBillList] = useState([]);
  const [showBillListModal, setShowBillListModal] = useState(false);
  const [billStatusFilter, setBillStatusFilter] = useState('');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showDineInModal, setShowDineInModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [recalledOrderId, setRecalledOrderId] = useState(null);
  const [currentRecalledTableName, setCurrentRecalledTableName] = useState(null);
  const [orderFormData, setOrderFormData] = useState({
    orderDate: new Date().toISOString().split('T')[0],
    orderTime: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    tableName: '',
    waiterName: '',
    orderStatus: 'Pending',
    orderType: 'TakeOut',
    discountAmount: 0,
    discountPercentage: 0,
    promotionID: null,
    driverID: null,
    customerID: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const [selectedCartItemIndex, setSelectedCartItemIndex] = useState(null);
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
        if (e.altKey && e.key === 'n') { // Alt + N for New Order
            clearOrderFormAndCart();
        } else if (e.altKey && e.key === 'h') { // Alt + H for Hold Order
            handleHoldOrder();
        } else if (e.altKey && e.key === 'b') { // Alt + B for Bill List
            setShowBillListModal(true);
            fetchAllBills(billStatusFilter);
        } else if (e.altKey && e.key === 'k') { // Alt + K for KOT
            handleKOT();
        } else if (e.altKey && e.key === 'c') { // Alt + C for Checkout
            setShowCheckoutModal(true);
        } else if (e.altKey && e.key === 'd') { // Alt + D for Dine In
            setShowDineInModal(true);
        } else if (e.altKey && e.key === 't') { // Alt + T for Take Away
            setOrderFormData({...orderFormData, orderType: 'TakeOut'});
        } else if (e.altKey && e.key === 'l') { // Alt + L for Delivery
            setShowDeliveryModal(true);
        }

        // Cart navigation
        if (document.activeElement.id !== 'search-input') {
            if (cart.length > 0) {
                if (e.key === 'ArrowUp') {
                    setSelectedCartItemIndex(prev => (prev === null || prev === 0) ? cart.length - 1 : prev - 1);
                    e.preventDefault();
                } else if (e.key === 'ArrowDown') {
                    setSelectedCartItemIndex(prev => (prev === null || prev === cart.length - 1) ? 0 : prev + 1);
                    e.preventDefault();
                } else if (selectedCartItemIndex !== null) {
                    if (e.key === '+' || e.key === '=') {
                        const newQuantity = cart[selectedCartItemIndex].quantity + 1;
                        handleCartItemQuantityChange(selectedCartItemIndex, newQuantity);
                        e.preventDefault();
                    } else if (e.key === '-') {
                        const newQuantity = cart[selectedCartItemIndex].quantity - 1;
                        if (newQuantity > 0) {
                            handleCartItemQuantityChange(selectedCartItemIndex, newQuantity);
                        }
                        e.preventDefault();
                    } else if (e.key === 'Delete') {
                        removeCartItem(selectedCartItemIndex);
                        e.preventDefault();
                    }
                }
            }
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
}, [cart, selectedCartItemIndex]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          categoriesResponse,
          customersResponse,
          diningTablesResponse,
          staffResponse,
        ] = await Promise.all([
          getAllCategories(),
          getAllCustomers(),
          getAllDiningTables(),
          getAllStaff(),
        ]);

        setCategories(categoriesResponse?.data?.data?.items || categoriesResponse?.data?.data || []);
        setCustomers(customersResponse?.data?.data?.items || customersResponse?.data?.data || []);
        setDiningTables(diningTablesResponse?.data?.data?.data?.items || diningTablesResponse?.data?.data?.data || []);
        setStaffMembers(staffResponse?.data?.data?.items || staffResponse?.data?.data || []);
      } catch (error) {
        toast.error("Failed to load initial data.");
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsResponse = await getAllProducts({ pageNumber: currentPage, pageSize: 10, searchQuery: searchTerm, categoryId: selectedCategory });
        const newProducts = productsResponse?.data?.data?.items || productsResponse?.data?.data || [];
        
        setProducts(prev => currentPage === 1 ? newProducts : [...prev, ...newProducts]);
        setHasMoreProducts(newProducts.length > 0);

      } catch (error) {
        toast.error("Failed to load products.");
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, [searchTerm, selectedCategory, currentPage]);

  const handleSearchKeyDown = (e) => {
      if (e.key === 'Enter' && searchTerm) {
          const barcodeMatch = products.find(p => p.productBarcode === searchTerm);
          if (barcodeMatch) {
              handleProductAddToCart(barcodeMatch);
              setSearchTerm('');
          } else if(products.length === 1){
              handleProductAddToCart(products[0]);
              setSearchTerm('');
          } else if (products.length > 0) {
              handleProductAddToCart(products[selectedProductIndex]);
          }
      } else if (e.key === 'ArrowRight') {
        setSelectedProductIndex(prev => (prev === products.length - 1) ? 0 : prev + 1);
        e.preventDefault();
      } else if (e.key === 'ArrowLeft') {
        setSelectedProductIndex(prev => (prev === 0) ? products.length - 1 : prev - 1);
        e.preventDefault();
      }
  }

  const handleProductAddToCart = (product) => {
    const existingItemIndex = cart.findIndex(item => item.productID === product.id);
    if (existingItemIndex > -1) {
      const newCart = [...cart];
      newCart[existingItemIndex].quantity += 1;
      newCart[existingItemIndex].price = product.productPrice;
      newCart[existingItemIndex].amount = newCart[existingItemIndex].quantity * newCart[existingItemIndex].price;
      setCart(newCart);
    } else {
      setCart([...cart, {
        productID: product.id,
        productName: product.productName,
        quantity: 1,
        price: product.productPrice,
        discountPrice: 0,
        amount: product.productPrice,
      }]);
    }
    searchInputRef.current?.focus();
  };

  const handleCartItemQuantityChange = (index, newQuantity) => {
    const newCart = [...cart];
    newCart[index].quantity = parseInt(newQuantity);
    newCart[index].amount = newCart[index].quantity * newCart[index].price;
    setCart(newCart);
  };

  const removeCartItem = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    setSelectedCartItemIndex(null);
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.amount, 0);
  };

  const validateOrder = () => {
    const newErrors = {};
    if (cart.length === 0) newErrors.cart = "Order cannot be empty.";
    if (!orderFormData.orderType) newErrors.orderType = "Order Type is required.";
    if (orderFormData.orderType === "DineIn" && !orderFormData.tableName) newErrors.tableName = "Table Name is required for Dine-In.";
    if (orderFormData.orderType === "DineIn" && !orderFormData.waiterName) newErrors.waiterName = "Waiter Name is required for Dine-In.";
    if (orderFormData.orderType === "Delivery" && !orderFormData.driverID) newErrors.driverID = "Driver is required for Delivery.";
    if (orderFormData.orderType === "Delivery" && !orderFormData.customerID) newErrors.customerID = "Customer is required for Delivery.";

    return newErrors;
  };

  const clearOrderFormAndCart = () => {
    setCart([]);
    setOrderFormData({
      orderDate: new Date().toISOString().split('T')[0],
      orderTime: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      tableName: '',
      waiterName: '',
      orderStatus: 'Pending',
      orderType: 'TakeOut',
      discountAmount: 0,
      discountPercentage: 0,
      promotionID: null,
      driverID: null,
      customerID: null,
    });
  };

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

    try {
      await createOrder(orderToHold);
      toast.success("Order held successfully!");
      clearOrderFormAndCart();
    } catch (error) {
      toast.error("Failed to hold order.");
      console.error("Error holding order:", error);
    }
  };

  const fetchAllBills = async (status) => {
    try {
      const params = {};
      if (status) {
        params.status = status;
      }
      const response = await getAllOrders(params);
      setBillList(response?.data?.data?.data?.items || []);
    } catch (error) {
      toast.error("Failed to fetch bills.");
      console.error("Error fetching bills:", error);
    }
  };

  const handleRecallOrder = (order) => {
    if (currentRecalledTableName && currentRecalledTableName !== order.tableName) {
      const prevTable = diningTables.find(t => t.tableName === currentRecalledTableName);
      if (prevTable) {
        updateDiningTableStatus({ tableID: prevTable.tableID, status: true });
      }
    }

    setCart(order.orderDetails.map(detail => ({
      productID: detail.productID,
      productName: products.find(p => p.id === detail.productID)?.productName || 'Unknown Product',
      quantity: detail.quantity,
      price: detail.price,
      discountPrice: detail.discountPrice,
      amount: detail.amount,
    })));

    setOrderFormData({
      orderDate: new Date(order.orderDate).toISOString().split('T')[0],
      orderTime: order.orderTime,
      tableName: order.tableName || '',
      waiterName: order.waiterName || '',
      orderStatus: order.orderStatus,
      orderType: order.orderType,
      discountAmount: order.discountAmount,
      discountPercentage: order.discountPercentage,
      promotionID: order.promotionID,
      driverID: order.driverID,
      customerID: order.customerID,
    });
    setRecalledOrderId(order.orderID);
    setCurrentRecalledTableName(order.tableName);
    setShowBillListModal(false);
    toast.info(`Order ${order.orderID} recalled.`);

    if (order.orderType === "DineIn" && order.tableName) {
      const table = diningTables.find(t => t.tableName === order.tableName);
      if (table) {
        updateDiningTableStatus({ tableID: table.tableID, status: false });
      }
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
        productID: item.productID,
        quantity: item.quantity,
        price: item.price,
        discountPrice: 0,
        amount: item.amount,
      })),
    };

    try {
      if (recalledOrderId) {
        orderToProcess.orderID = recalledOrderId;
        await updateOrder(recalledOrderId, orderToProcess);
        toast.success("Order updated and sent to kitchen!");
      } else {
        await createOrder(orderToProcess);
        toast.success("Order sent to kitchen successfully!");
      }
      
      if (orderToProcess.orderType === "DineIn" && orderToProcess.tableName) {
        const table = diningTables.find(t => t.tableName === orderToProcess.tableName);
        if (table) {
          await updateDiningTableStatus({ tableID: table.tableID, status: false });
        }
      }

      clearOrderFormAndCart();
      setRecalledOrderId(null);
      setCurrentRecalledTableName(null);

    } catch (error) {
      toast.error("Failed to send order to kitchen.");
      console.error("Error sending order to kitchen:", error);
    }
  };

  const handleProcessPayment = async (paymentData) => {
    const total = calculateTotal();
    const finalAmount = total - paymentData.DiscountAmount;

    if (paymentData.AmountReceived < finalAmount && !paymentData.IsSplit) {
      toast.error("Amount received is less than the total amount.");
      return;
    }

    const orderToProcess = {
      ...orderFormData,
      total: total,
      discountAmount: paymentData.DiscountAmount,
      received: paymentData.AmountReceived,
      change: paymentData.ChangeAmount,
      orderStatus: 'Paid',
      orderDetails: cart.map(item => ({
        productID: item.productID,
        quantity: item.quantity,
        price: item.price,
        discountPrice: 0,
        amount: item.amount,
      })),
    };

    try {
        let response;
        if (recalledOrderId) {
            orderToProcess.orderID = recalledOrderId;
            response = await updateOrder(recalledOrderId, orderToProcess);
        } else {
            response = await createOrder(orderToProcess);
        }

        const processedOrder = response.data.data;

        await processPaymentForOrder({
            orderID: processedOrder.orderID,
            amountReceived: paymentData.AmountReceived,
            amountPaid: finalAmount,
            changeAmount: paymentData.ChangeAmount,
            paymentMethod: paymentData.IsSplit ? 'Split' : 'Cash',
            isSplit: paymentData.IsSplit,
            splitPayments: paymentData.SplitPayments
        });

        toast.success("Payment processed successfully!");

        if (processedOrder.orderType === "DineIn" && processedOrder.tableName) {
            const table = diningTables.find(t => t.tableName === processedOrder.tableName);
            if (table) {
                await updateDiningTableStatus({ tableID: table.tableID, status: true });
            }
        }

        if (currentRecalledTableName && currentRecalledTableName !== orderToProcess.tableName) {
            const prevTable = diningTables.find(t => t.tableName === currentRecalledTableName);
            if (prevTable) {
                await updateDiningTableStatus({ tableID: prevTable.tableID, status: true });
            }
        }

        clearOrderFormAndCart();
        setRecalledOrderId(null);
        setCurrentRecalledTableName(null);
        setShowCheckoutModal(false);

    } catch (error) {
        toast.error("Failed to process payment.");
        console.error("Error processing payment:", error);
    }
  };

  const topBarButtons = [
    { label: 'New (Alt+N)', onClick: clearOrderFormAndCart, icon: <FiPlus />, color: 'blue' },
    { label: 'Hold (Alt+H)', onClick: handleHoldOrder, icon: <FiPause />, color: 'yellow' },
    { label: 'Bill List (Alt+B)', onClick: () => { setShowBillListModal(true); fetchAllBills(billStatusFilter); }, icon: <FiFileText />, color: 'gray' },
    { label: 'KOT (Alt+K)', onClick: handleKOT, icon: <FiPrinter />, color: 'purple' },
    { label: 'Delivery (Alt+L)', onClick: () => setShowDeliveryModal(true), icon: <FiTruck />, color: 'green' },
    { label: 'Take Away (Alt+T)', onClick: () => setOrderFormData({...orderFormData, orderType: 'TakeOut'}), icon: <FiShoppingBag />, color: 'orange' },
    { label: 'Dine In (Alt+D)', onClick: () => setShowDineInModal(true), icon: <FiCoffee />, color: 'red' },
    { label: 'Checkout (Alt+C)', onClick: () => setShowCheckoutModal(true), icon: <FiShoppingBag />, color: 'green' },
  ];

  return (
    <>
      <POSLayout
        topBarButtons={topBarButtons}
        productPanel={<ProductPanel products={products} selectedProductIndex={selectedProductIndex} handleProductAddToCart={handleProductAddToCart} categories={categories} setSelectedCategory={setSelectedCategory} hasMoreProducts={hasMoreProducts} setCurrentPage={setCurrentPage} searchTerm={searchTerm} setSearchTerm={setSearchTerm} handleSearchKeyDown={handleSearchKeyDown} />}
        cartPanel={<CartPanel cart={cart} selectedCartItemIndex={selectedCartItemIndex} handleCartItemQuantityChange={handleCartItemQuantityChange} removeCartItem={removeCartItem} calculateTotal={calculateTotal} setShowCheckoutModal={setShowCheckoutModal} />}
      />
      <Suspense fallback={<div>Loading...</div>}>
        <CheckoutModal
          isOpen={showCheckoutModal}
          onClose={() => setShowCheckoutModal(false)}
          totalAmount={calculateTotal()}
          onProcessPayment={handleProcessPayment}
        />
        <DineInDetailsModal 
          isOpen={showDineInModal}
          onClose={() => setShowDineInModal(false)}
          onSave={({table, waiter}) => {
              setOrderFormData({...orderFormData, orderType: 'DineIn', tableName: table, waiterName: waiter});
              setShowDineInModal(false);
          }}
          diningTables={diningTables}
          staffMembers={staffMembers}
        />
        <DeliveryDetailsModal
          isOpen={showDeliveryModal}
          onClose={() => setShowDeliveryModal(false)}
          onSave={({customer, driver}) => {
              setOrderFormData({...orderFormData, orderType: 'Delivery', customerID: customer, driverID: driver});
              setShowDeliveryModal(false);
          }}
          customers={customers}
          staffMembers={staffMembers}
        />
      </Suspense>
      {showBillListModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-60 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-6 border w-11/12 md:w-3/4 lg:w-1/2 shadow-2xl rounded-xl bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-800">Bill List</h3>
              <div className="flex items-center space-x-4">
                <select
                  value={billStatusFilter}
                  onChange={(e) => {
                    setBillStatusFilter(e.target.value);
                    fetchAllBills(e.target.value);
                  }}
                  className="appearance-none bg-white border border-gray-300 rounded-full px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                >
                  <option value="">All</option>
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Held">Held</option>
                  <option value="Completed">Completed</option>
                </select>
                <button onClick={() => setShowBillListModal(false)} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 border-b text-left">Order ID</th>
                    <th className="py-3 px-4 border-b text-left">Type</th>
                    <th className="py-3 px-4 border-b text-left">Total</th>
                    <th className="py-3 px-4 border-b text-left">Status</th>
                    <th className="py-3 px-4 border-b text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {billList.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-6 text-gray-500">No bills found.</td>
                    </tr>
                  ) : (
                    billList.map(order => (
                      <tr key={order.orderID} className="hover:bg-gray-50">
                        <td className="py-3 px-4 border-b">{order.orderID}</td>
                        <td className="py-3 px-4 border-b">{order.orderType}</td>
                        <td className="py-3 px-4 border-b">${order.total.toFixed(2)}</td>
                        <td className="py-3 px-4 border-b">
                          <span className={`py-1 px-3 rounded-full text-xs ${order.orderStatus === 'Paid' ? 'bg-green-200 text-green-800' : order.orderStatus === 'Held' ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-200 text-gray-800'}`}>
                            {order.orderStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 border-b">
                          <button
                            onClick={() => handleRecallOrder(order)}
                            className={`text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors duration-200 ${order.orderStatus === 'Held' ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 cursor-not-allowed'}`}
                            disabled={order.orderStatus !== 'Held'}
                          >
                            Recall
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default POSPage;