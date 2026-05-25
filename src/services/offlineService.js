import { createOrder, updateOrder, processPaymentForOrder } from './orderService';

const DB_NAME = 'RMS_Storage_v3';
const DB_VERSION = 21;

let dbInstance = null;

// Initialize Native IndexedDB
export const initDB = () => {
    return new Promise((resolve, reject) => {
        if (dbInstance) {
            resolve(dbInstance);
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            if (!db.objectStoreNames.contains('pendingOrders')) {
                const store = db.createObjectStore('pendingOrders', { keyPath: 'id', autoIncrement: true });
                store.createIndex('isSynced', 'isSynced', { unique: false });
            }
            if (!db.objectStoreNames.contains('pendingPayments')) {
                const store = db.createObjectStore('pendingPayments', { keyPath: 'id', autoIncrement: true });
                store.createIndex('isSynced', 'isSynced', { unique: false });
            }
            if (!db.objectStoreNames.contains('cachedProducts')) {
                const store = db.createObjectStore('cachedProducts', { keyPath: 'id' });
                store.createIndex('categoryID', 'categoryID', { unique: false });
            }
            if (!db.objectStoreNames.contains('cachedCategories')) {
                db.createObjectStore('cachedCategories', { keyPath: 'categoryID' });
            }
            if (!db.objectStoreNames.contains('cachedBills')) {
                db.createObjectStore('cachedBills', { keyPath: 'orderID' });
            }
        };

        request.onsuccess = (event) => {
            dbInstance = event.target.result;
            resolve(dbInstance);
        };

        request.onerror = (event) => {
            console.error("Native IndexedDB init error:", event.target.error);
            reject(event.target.error);
        };
    });
};

// Database Helpers
const clearStore = async (storeName) => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const req = tx.objectStore(storeName).clear();
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
    });
};

const putMany = async (storeName, items) => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        items.forEach(item => store.put(item));
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
};

const getAll = async (storeName) => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const req = tx.objectStore(storeName).getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
};

const addRecord = async (storeName, data) => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const req = tx.objectStore(storeName).add(data);
        req.onsuccess = () => resolve(req.result); // returns the new autoIncrement ID
        req.onerror = () => reject(req.error);
    });
};

const deleteRecord = async (storeName, id) => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const req = tx.objectStore(storeName).delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
    });
};

const putRecord = async (storeName, data) => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const req = tx.objectStore(storeName).put(data);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
};

export const getPendingOrderById = async (id) => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('pendingOrders', 'readonly');
        const req = tx.objectStore('pendingOrders').get(id);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
};

export const updatePendingOrder = async (order) => {
    return await putRecord('pendingOrders', order);
};

export const getPendingOrdersArray = async () => {
    return await getAll('pendingOrders');
};

/**
 * Caches products for offline search
 */
export const cacheProductsOffline = async (products) => {
    try {
        const normalized = products.map(p => ({
            id: p.id || p.productID || p.ProductID,
            productName: p.productName || p.ProductName,
            categoryID: p.categoryID || p.CategoryID,
            productBarcode: p.productBarcode || p.ProductBarcode,
            productPrice: p.productPrice || p.ProductPrice,
            productImage: p.productImage || p.ProductImage,
            categoryName: p.categoryName || p.CategoryName,
            stockQuantity: p.stockQuantity || p.StockQuantity || 0
        }));
        await clearStore('cachedProducts');
        await putMany('cachedProducts', normalized);
    } catch (err) {
        console.error("Native DB Product Cache Error:", err);
    }
};

/**
 * Searches products locally from cache
 */
export const searchProductsOffline = async (query, categoryId) => {
    try {
        const allProducts = await getAll('cachedProducts');
        let results = allProducts;
        
        if (categoryId) {
            results = results.filter(p => p.categoryID === parseInt(categoryId));
        }
        
        if (!query) return results;

        const lowerQuery = query.toLowerCase();
        return results.filter(p => 
            p.productName.toLowerCase().includes(lowerQuery) || 
            (p.productBarcode && p.productBarcode.toLowerCase().includes(lowerQuery))
        );
    } catch (err) {
        console.error("Native DB Search Error:", err);
        return [];
    }
};

/**
 * Caches categories for offline filtering
 */
export const cacheCategoriesOffline = async (categories) => {
    try {
        const normalized = categories.map(c => ({
            categoryID: c.categoryID || c.CategoryID || c.id,
            categoryName: c.categoryName || c.CategoryName || c.name
        }));
        await clearStore('cachedCategories');
        await putMany('cachedCategories', normalized);
    } catch (err) {
        console.error("Native DB Category Cache Error:", err);
    }
};

/**
 * Caches recent bills for offline viewing
 */
export const cacheBillsOffline = async (bills) => {
    try {
        const recentBills = bills.slice(0, 50).map(b => ({
            ...b,
            orderID: b.orderID || b.OrderID || b.id || b.Id,
            orderDate: b.orderDate || b.OrderDate,
            orderStatus: b.orderStatus || b.OrderStatus
        }));
        await clearStore('cachedBills');
        await putMany('cachedBills', recentBills);
    } catch (err) {
        console.error("Native DB Bills Cache Error:", err);
    }
};

/**
 * Retrieves cached bills
 */
export const getOfflineBills = async () => {
    try {
        return await getAll('cachedBills');
    } catch (err) {
        console.error("Native DB Get Bills Error:", err);
        return [];
    }
};

/**
 * Saves an order to local storage if offline
 */
export const saveOrderOffline = async (orderData) => {
    try {
        const data = {
            ...orderData,
            isSynced: 0,
            offlineTimestamp: new Date().toISOString()
        };
        return await addRecord('pendingOrders', data);
    } catch (err) {
        console.error("Native DB Save Order Error:", err);
        throw err;
    }
};

/**
 * Saves a payment to local storage if offline
 */
export const savePaymentOffline = async (paymentData) => {
    try {
        const data = {
            ...paymentData,
            isSynced: 0,
            offlineTimestamp: new Date().toISOString()
        };
        return await addRecord('pendingPayments', data);
    } catch (err) {
        console.error("Native DB Save Payment Error:", err);
        throw err;
    }
};

/**
 * Background Synchronizer
 */
export const syncOfflineData = async () => {
    try {
        const allOrders = await getAll('pendingOrders');
        const orders = allOrders.filter(o => o.isSynced === 0 || o.isSynced === false);
        
        const allPayments = await getAll('pendingPayments');
        let payments = allPayments.filter(p => p.isSynced === 0 || p.isSynced === false);

        if (orders.length === 0 && payments.length === 0) return 0;

        console.log(`[OfflineSync] Starting Native synchronization for ${orders.length} orders and ${payments.length} payments.`);
        let syncedCount = 0;

        // 1. Sync Orders first
        for (const localOrder of orders) {
            try {
                const { id, isSynced, offlineTimestamp, ...rawPayload } = localOrder;
                
                const orderPayload = {
                    OrderDate: rawPayload.orderDate || rawPayload.OrderDate || new Date().toISOString(),
                    OrderTime: rawPayload.orderTime || rawPayload.OrderTime || new Date().toLocaleTimeString(),
                    TableName: rawPayload.tableName || rawPayload.TableName || "N/A",
                    WaiterName: rawPayload.waiterName || rawPayload.WaiterName || "N/A",
                    StaffID: rawPayload.staffID || rawPayload.StaffID,
                    OrderStatus: rawPayload.orderStatus || rawPayload.OrderStatus || "Pending",
                    OrderType: rawPayload.orderType || rawPayload.OrderType || "TakeOut",
                    Total: rawPayload.total || rawPayload.Total || 0,
                    TaxAmount: rawPayload.taxAmount || rawPayload.TaxAmount || 0,
                    ServiceChargeAmount: rawPayload.serviceChargeAmount || rawPayload.ServiceChargeAmount || 0,
                    DiscountAmount: rawPayload.discountAmount || rawPayload.DiscountAmount || 0,
                    DiscountPercentage: rawPayload.discountPercentage || rawPayload.DiscountPercentage || 0,
                    PromotionID: rawPayload.promotionID || rawPayload.PromotionID,
                    Received: rawPayload.received || rawPayload.Received || 0,
                    ChangeAmount: rawPayload.changeAmount || rawPayload.ChangeAmount || 0,
                    DriverID: rawPayload.driverID || rawPayload.DriverID,
                    CustomerID: rawPayload.customerID || rawPayload.CustomerID,
                    TipAmount: rawPayload.tipAmount || rawPayload.TipAmount || 0,
                    OrderDetails: (rawPayload.orderDetails || rawPayload.OrderDetails || []).map(d => ({
                        ProductID: d.productID || d.ProductID,
                        Quantity: d.quantity || d.Quantity,
                        Price: d.price || d.Price,
                        DiscountPrice: d.discountPrice || d.DiscountPrice || 0,
                        Amount: d.amount || d.Amount
                    }))
                };

                let response;
                const updateId = rawPayload.orderID || rawPayload.OrderID;
                
                if (updateId) {
                    console.log(`[OfflineSync] Syncing Update for Order ${updateId}...`, orderPayload);
                    response = await updateOrder(updateId, orderPayload);
                } else {
                    console.log(`[OfflineSync] Syncing New Order ${id}...`, orderPayload);
                    response = await createOrder(orderPayload);
                }
                
                const responseData = response?.data || response;
                const isSuccess = responseData.isSuccess || responseData.IsSuccess;
                
                if (isSuccess || (response.status >= 200 && response.status < 300)) {
                    await deleteRecord('pendingOrders', id);
                    syncedCount++;
                    console.log(`[OfflineSync] Order ${id} synced successfully.`);
                    
                    const newServerOrderId = responseData.data?.orderID || responseData.data?.OrderID || responseData.orderID || updateId;
                    
                    // Refresh payments array to ensure we get any in-memory updates
                    payments = await getAll('pendingPayments');
                    const relatedPayment = payments.find(p => p.offlineOrderID === id);
                    if (relatedPayment && newServerOrderId) {
                        relatedPayment.orderID = newServerOrderId;
                        await putRecord('pendingPayments', relatedPayment);
                    }
                }
            } catch (err) {
                console.error(`[OfflineSync] Sync failed for Order ${localOrder.id}:`, err?.response?.data || err);
            }
        }

        // 2. Sync Payments
        // Fetch fresh state from DB in case orders updated them
        const freshPaymentsList = await getAll('pendingPayments');
        const updatedPayments = freshPaymentsList.filter(p => p.isSynced === 0 || p.isSynced === false);
        
        for (const localPayment of updatedPayments) {
            if (!localPayment.orderID && localPayment.offlineOrderID) {
                continue; // Wait for order to sync first
            }

            try {
                const { id, isSynced, offlineTimestamp, offlineOrderID, ...rawPayment } = localPayment;
                
                const paymentPayload = {
                    OrderID: rawPayment.orderID || rawPayment.OrderID,
                    AmountReceived: rawPayment.amountReceived || rawPayment.AmountReceived || 0,
                    AmountPaid: rawPayment.amountPaid || rawPayment.AmountPaid || 0,
                    ChangeAmount: rawPayment.changeAmount || rawPayment.ChangeAmount || 0,
                    DiscountAmount: rawPayment.discountAmount || rawPayment.DiscountAmount || 0,
                    TipAmount: rawPayment.tipAmount || rawPayment.TipAmount || 0,
                    PromotionID: rawPayment.promotionID || rawPayment.PromotionID,
                    PaymentMethod: rawPayment.paymentMethod || rawPayment.PaymentMethod || "Cash",
                    IsSplit: rawPayment.isSplit || rawPayment.IsSplit || false,
                    SplitPayments: rawPayment.splitPayments || rawPayment.SplitPayments || []
                };

                console.log(`[OfflineSync] Syncing Payment for Order ${paymentPayload.OrderID}...`, paymentPayload);
                
                const response = await processPaymentForOrder(paymentPayload);
                const responseData = response?.data || response;
                const isSuccess = responseData.isSuccess || responseData.IsSuccess;

                if (isSuccess || (response.status >= 200 && response.status < 300)) {
                    await deleteRecord('pendingPayments', id);
                    syncedCount++;
                    console.log(`[OfflineSync] Payment ${id} synced successfully.`);
                }
            } catch (err) {
                console.error(`[OfflineSync] Sync failed for Payment ${localPayment.id}:`, err?.response?.data || err);
            }
        }

        return syncedCount;
    } catch (err) {
        console.error("[OfflineSync] Global Sync Error:", err);
        return 0;
    }
};

/**
 * Hook logic for connectivity monitoring
 */
export const getOfflineStats = async () => {
    try {
        const orders = await getAll('pendingOrders');
        const payments = await getAll('pendingPayments');
        return { pendingCount: orders.length + payments.length };
    } catch (err) {
        console.warn("Offline stats unavailable:", err);
        return { pendingCount: 0 };
    }
};
