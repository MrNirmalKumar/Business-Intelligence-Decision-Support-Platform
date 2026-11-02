export function formatCurrency(n) {
    n = n || 0;
    const abs = Math.abs(n);
    const sign = n < 0 ? '-' : '';
    if (abs >= 10000000) return sign + String.fromCharCode(8377) + (abs / 10000000).toFixed(2) + ' Cr';
    if (abs >= 100000) return sign + String.fromCharCode(8377) + (abs / 100000).toFixed(1) + ' L';
    if (abs >= 1000) return sign + String.fromCharCode(8377) + (abs / 1000).toFixed(1) + 'K';
    return sign + String.fromCharCode(8377) + Math.round(abs);
}
