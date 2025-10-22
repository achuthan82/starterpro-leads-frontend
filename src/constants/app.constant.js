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

export const LEAD_STATUS = {1: 'NEW', 2: 'FIRST CALL', 3: 'SECOND CALL', 4: 'THIRD CALL', 5: 'TEXT',
    6: 'APPOINTMENT', 7: 'SOLD', 8: 'NOT INTERESTED', 9: 'SIT / NO SALE', 
    10:  'NO SHOW',  11: 'DNC', 12: 'SUPPRESSED', 13: 'Suppression Denied', 19: 'UNKNOWN'}

export const STATUS_NAME_TO_ID = {'NEW': 1, 'FIRST CALL': 2, 'SECOND CALL': 3, 'THIRD CALL': 4, 'TEXT': 5,
    'APPOINTMENT': 6, 'SOLD': 7, 'NOT INTERESTED': 8, 'SIT / NO SALE': 9, 'NO SHOW': 10, 'DNC': 11, 'SUPPRESSED': 12, 'Suppression Denied': 13}

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
    { value: 11, label: 'DNC' }
];

export const SOURCE_MAPPING = {
    1: 'NEW MTG',
    2: 'RETRO MTG',
    3: 'FEX',
    // Add more source mappings as needed
  };
  