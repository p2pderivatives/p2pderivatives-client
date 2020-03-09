module.exports = {
  stories: ['../src/renderer/**/*.stories.tsx'],
  addons: [
    '@storybook/addon-backgrounds/register', 
    '@storybook/addon-knobs/register',
    '@storybook/addon-actions/register'
  ]
}
