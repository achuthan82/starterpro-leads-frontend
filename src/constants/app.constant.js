export const APP_NAME = "AegisSuite";
export const APP_KEY = "aegissuite";

// Redirect Paths
export const REDIRECT_URL_KEY = "redirect";
export const HOME_PATH = "/"
export const GHOST_ENTRY_PATH = "/login"

// Navigation Types
export const NAV_TYPE_ROOT = 'root'
export const NAV_TYPE_GROUP = 'group';
export const NAV_TYPE_COLLAPSE = 'collapse';
export const NAV_TYPE_ITEM = 'item';
export const NAV_TYPE_DIVIDER = 'divider';

export const COLORS = ['neutral', 'primary', 'secondary', 'info', 'success', 'warning', 'error']

export const LEAD_STATUS = {
    1: 'NEW', 2: 'FIRST CALL', 3: 'SECOND CALL', 4: 'THIRD CALL', 5: 'TEXT',
    6: 'APPOINTMENT', 7: 'SOLD', 8: 'NOT INTERESTED', 9: 'SIT / NO SALE',
    10: 'NO SHOW', 11: 'DNC', 12: 'SUPPRESSED', 13: 'SUPPRESSION DENIED', 14: 'SHOW UP', 15: 'WRONG NUMBER', 16: 'INCOMPLETE NUMBER', 17: 'CALL BACK', 18: 'HANG UP', 19: 'SPANISH', 20:'SUPPRESSION REQUESTED'
}

export const STATUS_NAME_TO_ID = {
    'NEW': 1, 'FIRST CALL': 2, 'SECOND CALL': 3, 'THIRD CALL': 4, 'TEXT': 5,
    'APPOINTMENT': 6, 'SOLD': 7, 'NOT INTERESTED': 8, 'SIT / NO SALE': 9, 'NO SHOW': 10, 'DNC': 11, 'SUPPRESSED': 12, 'SUPPRESSION DENIED': 13, 'SHOW UP': 14, 'WRONG NUMBER': 15,
    'INCOMPLETE NUMBER': 16,
    'CALL BACK': 17,
    'HANG UP': 18,
    'SPANISH': 19,
    "SUPPRESSION REQUESTED":20
}

export const LEAD_STATUSES = [
    { value: 1, label: 'New' },
    { value: 2, label: 'First call' },
    { value: 3, label: 'Second call' },
    { value: 4, label: 'Third Call' },
    { value: 5, label: 'Text' },
    { value: 6, label: 'Appointment' },
    { value: 7, label: 'Sold' },
    { value: 8, label: 'Not interested' },
    { value: 9, label: 'Sit/No Sale' },
    { value: 10, label: 'No Show' },
    { value: 11, label: 'DNC' },
    { value: 12, label: 'Suppressed' },
    { value: 13, label: 'Suppression Denied' },
    { value: 14, label: 'Show Up' },
    { value: 15, label: 'Wrong Number' },
    { value: 16, label: 'Incomplete Number' },
    { value: 17, label: 'Call Back' },
    { value: 18, label: 'Hang Up' },
    { value: 19, label: 'Spanish' },
    {value:20, label:'Suppression Requested'}
];

export const SOURCE_MAPPING = {
    1: 'NEW MTG',
    2: 'RETRO MTG',
    3: 'FEX',
    // Add more source mappings as needed
};
export const STATUS_COLORS = {
    1: 'bg-[var(--atoll)]', // NEW
    2: 'bg-[var(--atoll)]', // FIRST CALL
    3: 'bg-[var(--atlantis)]', // SECOND CALL
    4: 'bg-[#f97316]', // THIRD CALL
    5: 'bg-[#8b5cf6]', // TEXT
    6: 'bg-[#3b82f6]', // APPOINTMENT
    7: 'bg-[var(--fern)]', // SOLD
    8: 'bg-[var(--waterloo)]', // NOT INTERESTED
    9: 'bg-[var(--gray-suit)]', // SIT / NO SALE
    10: 'bg-[#F9A8D4]', // NO SHOW
    11: 'bg-[#7fa8eb]', // DNC
    12: 'bg-[#727592]', // SUPPRESSED
    13: 'bg-[#10151d]', // Suppression Denied
    14: 'bg-[#eab308]', // Show Up
    15: 'bg-[#0d9488]',  // WRONG NUMBER
    16: 'bg-[#9333ea]',  // INCOMPLETE NUMBER
    17: 'bg-[#0369a1]',  // CALL BACK
    18: 'bg-[#e11d48]',  // HANG UP
    19: 'bg-[#ca8a04]',  // SPANISH
    20:'bg-[#ca8a04]', // SUPPRESSION Requested
}
// export const STATUS_COLORS = {
//   1: 'bg-[#ff0000]', // Red
//   2: 'bg-[#ff8c00]', // Orange
//   3: 'bg-[#ffff00]', // Yellow
//   4: 'bg-[#80ff00]', // Chartreuse Green
//   5: 'bg-[#00ff00]', // Green
//   6: 'bg-[#00ff80]', // Spring Green
//   7: 'bg-[#00ffff]', // Cyan
//   8: 'bg-[#0080ff]', // Azure/Capri
//   9: 'bg-[#0000ff]', // Blue
//   10: 'bg-[#8000ff]', // Violet
//   11: 'bg-[#ff00ff]', // Magenta/Fuchsia
//   12: 'bg-[#ff0080]', // Rose
//   13: 'bg-[#800000]', // Dark Red/Maroon
//   14: 'bg-[#808000]', // Olive
//   15: 'bg-[#008080]', // Dark Green/Teal
//   16: 'bg-[#000080]', // Navy Blue
//   17: 'bg-[#4b0082]', // Purple/Indigo
//   18: 'bg-[#ffd700]', // Gold
//   19: 'bg-[#ff1493]'  // Hot Pink/Cerise
// }
