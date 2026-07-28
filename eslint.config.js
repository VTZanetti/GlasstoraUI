import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier'

const vueRecommended = pluginVue.configs['flat/recommended'] ?? pluginVue.configs.recommended

export default tseslint.config(
  { ignores: ['dist/**', 'dist-demo/**', 'coverage/**', 'node_modules/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...vueRecommended,
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: { parser: tseslint.parser },
    },
    rules: {
      // Browser globals inside SFC scripts are validated by vue-tsc, which
      // resolves the DOM lib. The base no-undef rule cannot see them.
      'no-undef': 'off',
    },
  },
  eslintConfigPrettier,
)
