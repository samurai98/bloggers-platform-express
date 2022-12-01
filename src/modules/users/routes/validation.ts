import { checkBearerAuth, checkUserRightsToEntity, getQueryValidation } from '../../../middlewares';

export const usersQueryValidation = getQueryValidation(query => {
  const { searchEmailTerm, searchLoginTerm } = query;

  query.searchEmailTerm = typeof searchEmailTerm === 'string' ? searchEmailTerm : '';
  query.searchLoginTerm = typeof searchLoginTerm === 'string' ? searchLoginTerm : '';
});

export const deleteUserValidation = [checkBearerAuth, checkUserRightsToEntity('user')];
