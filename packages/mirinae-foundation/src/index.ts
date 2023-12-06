import { get } from 'lodash';

import colors from './styles/colors.cjs';

export const getColor = (col?: string|null) => {
    if (!col) return col;
    if (col.startsWith('#')) return col;
    const color = get(colors, col);
    if (color) return color;
    return col;
};
