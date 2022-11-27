import { checkBasicAuth, getQueryValidation, inputValidation } from '../../../middlewares';
import {
  emailValidation,
  loginValidation,
  passwordValidation,
  uniqueLoginAndEmailValidation,
} from '../../auth/routes/validation';

export const usersQueryValidation = getQueryValidation(query => {
  const { searchEmailTerm, searchLoginTerm } = query;

  query.searchEmailTerm = typeof searchEmailTerm === 'string' ? searchEmailTerm : '';
  query.searchLoginTerm = typeof searchLoginTerm === 'string' ? searchLoginTerm : '';
});

export const userValidation = [
  checkBasicAuth,
  loginValidation,
  emailValidation,
  passwordValidation('password'),
  uniqueLoginAndEmailValidation,
  inputValidation,
];

export { checkBasicAuth };
