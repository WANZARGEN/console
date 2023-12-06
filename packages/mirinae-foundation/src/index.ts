import { get } from 'lodash';

import { tailwindColors } from './styles/colors';

export const getColor = (col?: string|null) => {
    if (!col) return col;
    if (col.startsWith('#')) return col;
    const color = get(tailwindColors, col);
    if (color) return color;
    return col;
};
