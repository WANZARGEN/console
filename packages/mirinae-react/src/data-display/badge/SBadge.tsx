import { colors } from '@cloudforet/mirinae-foundation/styles';
import React, { useRef } from 'react';
import { getColor } from '@cloudforet/mirinae-foundation';
import { BADGE_FONT_WEIGHT, BADGE_SHAPE, BADGE_TYPE } from './constant';
import './SBadge.css';
import type {
  BadgeFontWeight,
  BadgeShape,
  BadgeStyleType,
  BadgeType,
} from './constant';

interface BadgeProps {
    badgeType: BadgeType;
    styleType: BadgeStyleType;
    textColor?: string;
    backgroundColor?: string;
    outlineColor?: string;
    shape: BadgeShape;
    fontWeight: BadgeFontWeight;
    children: React.ReactNode;
}
const SBadge: React.FC<BadgeProps> = ({
  badgeType = BADGE_TYPE.SOLID,
  styleType = 'primary',
  textColor,
  backgroundColor,
  outlineColor,
  shape = BADGE_SHAPE.ROUND,
  fontWeight = BADGE_FONT_WEIGHT.REGULAR,
  children,
}) => {
  // const badgeClassList = useMemo(() => {
  //   if (!backgroundColor || !textColor) {
  //     return [`badge-${badgeType}`, `badge-${styleType}`];
  //   }
  //   return [];
  // }, [backgroundColor, textColor, badgeType, styleType]);
  //
  // const inlineStyles = useMemo(() => {
  //   if (backgroundColor || textColor || outlineColor) {
  //     const inlineStyle: React.CSSProperties = {};
  //     if (backgroundColor) inlineStyle.backgroundColor = getColor(backgroundColor);
  //     if (textColor) inlineStyle.color = getColor(textColor);
  //     if (outlineColor) {
  //       inlineStyle.borderColor = getColor(outlineColor);
  //       inlineStyle.borderWidth = '1px';
  //     }
  //     return inlineStyle;
  //   }
  //
  //   const styleTypeNum = styleType.match(/\d{3}/)?.[0];
  //   let badgeColor = getColor(styleType);
  //   if (styleTypeNum) {
  //     const colStr = styleType.match(/[a-z]+/)?.[0] ?? '';
  //     const color = colors[colStr]?.[styleTypeNum];
  //     if (color) badgeColor = color;
  //   }
  //
  //   if (badgeType === BADGE_TYPE.SOLID) {
  //     return {
  //       backgroundColor: badgeColor,
  //       color: getColor('white'),
  //     };
  //   } if (badgeType === BADGE_TYPE.SOLID_OUTLINE) {
  //     return {
  //       backgroundColor: getColor('white'),
  //       color: badgeColor,
  //       borderColor: badgeColor,
  //       borderWidth: '1px',
  //     };
  //   }
  //   return {};
  // }, [backgroundColor, textColor, outlineColor, styleType, badgeType]);

  // return (
  //   <span
  //     className={`s-badge badge-${shape} ${badgeClassList} ${fontWeight}`}
  //     style={inlineStyles}
  //   >
  //     {children}
  //   </span>
  // );
  const count = useRef(0);
  setInterval(() => {
    console.debug('badge', count.current);
    count.current += 1;
  }, 10000);
  return (
    <span
      className={`s-badge badge-${shape} badge-${badgeType} badge-${styleType} ${fontWeight}`}
    >
      {children} {count.current}
    </span>
  );
};

export default SBadge;
