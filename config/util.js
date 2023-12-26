const fs = require('fs');
const path = require('path');

const yaml = require('js-yaml');
const { merge } = require('lodash');

const root = (dir) =>
  `${path.resolve(__dirname, './')}/${dir}`.replace(/(\/+)/g, '/');

const frontendRoot = (dir) =>
  `${path.resolve(__dirname, '../')}/${dir}`.replace(/(\/+)/g, '/');

const styleRoot = (dir) =>
  `${path.resolve(__dirname, '../packages')}/${dir}`.replace(/(\/+)/g, '/');

const loadYaml = (filePath) => {
  try {
    return yaml.load(fs.readFileSync(filePath), 'utf8');
  } catch (e) {
    return false;
  }
};

const getConfig = (key) => {
  // parse config yaml
  const config = loadYaml(root('./config.yaml')) || {};

  const tryFile = root('./local_config.yaml');
  if (fs.existsSync(tryFile)) {
    // merge local_config
    const local_config = loadYaml(tryFile);
    if (typeof local_config === 'object') {
      merge(config, local_config);
    }
  }

  return key ? config[key] : config;
};

const getThemeConfig = (type = 'common') => {
  const key = type === 'common' ? 'theme' : 'baseTheme';

  const file = getConfig(key);

  const themeFile = frontendRoot(file);

  // eslint-disable-next-line no-console
  console.log('themeFile', themeFile);

  if (fs.existsSync(themeFile)) {
    const config = require(themeFile);

    return config;
  }

  // eslint-disable-next-line no-console
  console.error('the theme file not exist');
  return {};
};

const getCustomStyleVariables = () => {
  const lessFile = getConfig('lessVariablesName');
  const defaultLessFile = 'common/styles/variables';
  if (lessFile === defaultLessFile) {
    return false;
  }
  const customFile = styleRoot(`${lessFile}.less`);
  // eslint-disable-next-line no-console
  console.log('customFile', customFile);
  const result = fs.existsSync(customFile) && lessFile;
  // eslint-disable-next-line no-console
  console.log('getCustomStyleVariables', result);
  return result;
};

const getGlobalVariables = () => {
  const variables = getConfig('globalVariables') || {};
  const result = Object.keys(variables).reduce((pre, cur) => {
    pre[cur] = JSON.stringify(variables[cur]);
    return pre;
  }, {});
  console.log('globalVariables', result);
  return result;
};

module.exports = {
  getConfig,
  root,
  getThemeConfig,
  getCustomStyleVariables,
  getGlobalVariables,
};
