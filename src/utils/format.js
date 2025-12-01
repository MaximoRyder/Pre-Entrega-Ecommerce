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
    s = s.replace(/[^0-9,.-]+/g, "");
    const commaCount = (s.match(/,/g) || []).length;
    const dotCount = (s.match(/\./g) || []).length;
    let normalized = s;
    if (commaCount === 1 && dotCount > 0) {
        normalized = s.replace(/\./g, "").replace(",", ".");
    } else if (commaCount === 1 && dotCount === 0) {
        normalized = s.replace(",", ".");
    } else if (commaCount === 0 && dotCount > 0) {
        normalized = s.replace(/\./g, "");
    } else {
        normalized = s;
    }
    const n = Number(normalized);
    return isFinite(n) ? n : 0;
}

export function tryParseDate(val) {
    if (!val && val !== 0) return null;
    if (val instanceof Date && !isNaN(val)) return val;
    if (typeof val === "number") {
        const d = new Date(val);
        if (!isNaN(d)) return d;
    }
    if (typeof val === "string") {
        const s = val.trim();
        const t = Date.parse(s);
        if (!isNaN(t)) return new Date(t);
        if (/^\d{10}$/.test(s)) {
            const d = new Date(Number(s) * 1000);
            if (!isNaN(d)) return d;
        }
        if (/^\d{13}$/.test(s)) {
            const d = new Date(Number(s));
            if (!isNaN(d)) return d;
        }
    }
    return null;
}

export function formatOrderDate(value) {
    if (!value && value !== 0) return "-";
    const parsed = tryParseDate(value);
    if (parsed) {
        const d = parsed;
        const pad = (n) => String(n).padStart(2, "0");
        return `${pad(d.getHours())}:${pad(d.getMinutes())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
    }
    if (typeof value === "string") return value;
    return "-";
}

export default { formatNumber, formatCurrency, parseNumber, tryParseDate, formatOrderDate };
