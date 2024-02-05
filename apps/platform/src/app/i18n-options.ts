import {I18nJsonLoader, I18nOptions} from "@softkit/i18n";
import * as path from "path";

export const i18nOptions = ({
  fallbackLanguage: 'en',
  loaders: [
    new I18nJsonLoader({
      path: path.join(__dirname, '/i18n/'),
    })
  ]
} satisfies I18nOptions)
