const LOCALE = "es-AR";

export function formatNumber(value, { minimumFractionDigits = 0, maximumFractionDigits = 2 } = {}) {
    const n = Number(value);
    if (!isFinite(n)) return String(value ?? "");
    return new Intl.NumberFormat(LOCALE, {
        minimumFractionDigits,
        maximumFractionDigits,
    }).format(n);
}

export function formatCurrency(value, currency = "ARS") {
    const n = Number(value);
    if (!isFinite(n)) return String(value ?? "");
    return new Intl.NumberFormat(LOCALE, {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(n);
}

export function parseNumber(input) {
    if (input == null) return 0;
    if (typeof input === "number") return input;
    let s = String(input).trim();
    if (!s) return 0;
    // Remove currency symbols and spaces
    s = s.replace(/[^0-9,.-]+/g, "");
    // If format is like 1.234,56 (thousand separator dot, decimal comma)
    const commaCount = (s.match(/,/g) || []).length;
    const dotCount = (s.match(/\./g) || []).length;
    let normalized = s;
    if (commaCount === 1 && dotCount > 0) {
        normalized = s.replace(/\./g, "").replace(",", ".");
    } else if (commaCount === 1 && dotCount === 0) {
        normalized = s.replace(",", ".");
    } else {
        // remove any thousands separators (commas) if dots used for decimals
        // or leave as-is
        normalized = s;
    }
    const n = Number(normalized);
    return isFinite(n) ? n : 0;
}

export default { formatNumber, formatCurrency, parseNumber };
