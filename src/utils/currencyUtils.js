/**
 * Utility for formatting currency across the RMS suite.
 * Uses Intl.NumberFormat for locale-aware formatting.
 */

/**
 * Formats a numeric value as currency.
 * @param {number} value - The amount to format
 * @param {string} code - ISO 4217 Currency Code (e.g., 'USD', 'EUR')
 * @param {string} symbol - Fallback symbol if formatting fails
 */
export const formatCurrency = (value, code = 'USD', symbol = '$') => {
    if (value === undefined || value === null) value = 0;
    
    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: code,
        }).format(value);
    } catch (e) {
        // Fallback for custom or unsupported currency codes
        return `${symbol}${parseFloat(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
};

/**
 * Hook-ready configuration fetcher for components.
 * Scans the AuthContext and Dashboard stats for active currency info.
 */
export const getActiveCurrency = (stats, selectedBranch) => {
    return {
        code: stats?.currencyCode || selectedBranch?.currencyCode || 'USD',
        symbol: stats?.currencySymbol || selectedBranch?.currencySymbol || '$'
    };
};
