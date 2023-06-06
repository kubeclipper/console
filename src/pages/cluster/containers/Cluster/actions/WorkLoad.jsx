import { LinkAction } from 'containers/Action';
import { setLocalStorageItem } from 'utils/localStorage';
import cookie from 'utils/cookie';

export default class LinkLog extends LinkAction {
  static allowed() {
    const { env: { ADD_WORKLOAD = '' } = {} } = process.env;
    return Promise.resolve(ADD_WORKLOAD);
  }

  static title = t('WorkLoad');

  static path(item) {
    setLocalStorageItem('isNewEcs', false);
    cookie.setItem('region_id', item.name);
    return `/kube/node/nodes`;
  }

  policy = true;
}
