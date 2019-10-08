import constant from '~/factories/ConstantsFactory';
import helper from '~/factories/HelperFactory';
import repository from '~/factories/RepositoryFactory';

const factories = {
  constant,
  helper,
  repository
};

export default (type, key) => factories[type].get(key);