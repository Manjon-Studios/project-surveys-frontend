export interface IResponseSurveyThemeGlobal {
  _id: string;
  fontFamily: string;
  bgColorGeneric: string;
  textColorElements: string;
  textColorElementsSelectable: string;
  __v: number;
}

export interface ISurveyThemeGlobal {
  fontFamily: string;
  bgColorGeneric: string;
  textColorElements: string;
  textColorElementsSelectable: string;
}

export const themeGlobal = {
  fontFamily: 'Quicksand',
  bgColorGeneric: '#ea6161',
  textColorElements: '#303030',
  textColorElementsSelectable: getContrastColor('#ea6161'),
};

export function getContrastColor(bgColor: string): string {
  // Eliminar "#" si está presente
  let color = bgColor.replace("#", "");

  // Convertir HEX a valores RGB
  let r = parseInt(color.substring(0, 2), 16);
  let g = parseInt(color.substring(2, 4), 16);
  let b = parseInt(color.substring(4, 6), 16);

  // Calcular luminancia relativa según WCAG
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

  // Función para calcular contraste según WCAG
  function contrastRatio(lum1: number, lum2: number): number {
    return (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);
  }

  let textColors = ["#000000", "#FFFFFF"];
  let bestColor = textColors[0];
  let maxContrast = 0;

  for (let textColor of textColors) {
    let textLum = textColor === "#000000" ? 0 : 1;
    let contrast = contrastRatio(luminance, textLum);

    if (contrast > maxContrast) {
      maxContrast = contrast;
      bestColor = textColor;
    }
  }

  if (maxContrast < 7) {
    r = Math.min(255, r + 50);
    g = Math.min(255, g + 50);
    b = Math.min(255, b + 50);
    bestColor = `rgb(${r}, ${g}, ${b})`;
  }

  return bestColor;
}
