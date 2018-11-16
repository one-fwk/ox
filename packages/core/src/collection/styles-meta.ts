import { ComponentOptions, ModeStyles, StylesMeta } from '../interfaces';
import { DEFAULT_STYLE_MODE } from '../constants';

export function getStylesMeta(componentOptions: ComponentOptions) {
  let stylesMeta: StylesMeta = {};

  if (typeof componentOptions.styles === 'string') {
    // styles: 'div { padding: 10px }'
    componentOptions.styles = componentOptions.styles.trim();
    if (componentOptions.styles.length > 0) {
      stylesMeta = {
        [DEFAULT_STYLE_MODE]: {
          styleStr: componentOptions.styles,
        },
      };
    }
  }

  if (typeof componentOptions.styleUrl === 'string' && componentOptions.styleUrl.trim()) {
    // styleUrl: 'my-styles.css'
    stylesMeta = {
      [DEFAULT_STYLE_MODE]: {
        externalStyles: [{
          originalComponentPath: componentOptions.styleUrl.trim(),
        }],
      },
    };

  } else if (Array.isArray(componentOptions.styleUrls)) {
    // styleUrls: ['my-styles.css', 'my-other-styles']
    stylesMeta = {
      [DEFAULT_STYLE_MODE]: {
        externalStyles: componentOptions.styleUrls.map(sUrl => ({
          originalComponentPath: sUrl.trim(),
        })),
      },
    };

  } else {
    // styleUrls: {
    //   ios: 'badge.ios.css',
    //   md: 'badge.md.css',
    //   wp: 'badge.wp.css'
    // }

    Object.keys(componentOptions.styleUrls || {}).reduce((stylesMeta, styleType) => {
      const styleUrls = componentOptions.styleUrls as ModeStyles;

      const sUrls = [].concat(styleUrls[styleType]);

      stylesMeta[styleType] = {
        externalStyles: sUrls.map(sUrl => ({
          originalComponentPath: sUrl,
        })),
      };

      return stylesMeta;
    }, stylesMeta);
  }

  return stylesMeta;
}