'use strict';

const HOCL_YELLOW_MAP = [
    { max: 0,    hex: '#e6e6e6' },
    { max: 0.5,  hex: '#fde9b8' },
    { max: 1.0,  hex: '#f4d47a' },
    { max: 1.6,  hex: '#f1c25a' },
    { max: 2.0,  hex: '#e8b94a' },
    { max: 2.5,  hex: '#e3b245' },
    { max: 99,   hex: '#c98a2b' },
];

const HOCL_BLUE_MAP = [
    { max: 0,    hex: '#e6e6e6' },
    { max: 0.5,  hex: '#bcd9ec' },
    { max: 1.0,  hex: '#5b9fd6' },
    { max: 1.6,  hex: '#5293ce' },
    { max: 2.0,  hex: '#4a8fcb' },
    { max: 2.5,  hex: '#3f86c2' },
    { max: 3.0,  hex: '#3279bb' },
    { max: 99,   hex: '#1f5f97' },
];

const PH_MAP = [
    { max: 0,    hex: '#e6e6e6' },
    { max: 6.5,  hex: '#d2e2b1' },
    { max: 7.0,  hex: '#cfe0ad' },
    { max: 7.2,  hex: '#9cc7a0' },
    { max: 7.5,  hex: '#8fc095' },
    { max: 8.0,  hex: '#7fb589' },
    { max: 14,   hex: '#4f8a5c' },
];

const MAP_REGISTRY = {
    HOCl:      HOCL_YELLOW_MAP,
    HOCl_blue: HOCL_BLUE_MAP,
    pH:        PH_MAP,
};

const INVALID_HEX = '#e6e6e6';

const getColorHex = (testType, value) => {
    if (value === null || value === undefined) return INVALID_HEX;

    const map = MAP_REGISTRY[testType];
    if (!map) return INVALID_HEX;

    const v = parseFloat(value);
    if (isNaN(v) || v < 0) return INVALID_HEX;

    const match = map.find(r => v <= r.max);
    return match ? match.hex : INVALID_HEX;
};

const getColorLabel = (hex) => {
    return hex === INVALID_HEX ? 'No color detected' : null;
};

module.exports = { getColorHex, getColorLabel };