import {
  checkBasicAuth,
  getQueryValidation,
  inputValidation,
} from "middlewares";
import {
  emailValidation,
  loginValidation,
  passwordValidation,
  uniqueLoginAndEmailValidation,
} from "modules/auth/routes/validation";

export const usersQueryValidation = getQueryValidation((query) => {
  const { searchEmailTerm, searchLoginTerm } = query;

  query.searchEmailTerm =
    typeof searchEmailTerm === "string" ? searchEmailTerm : "";
  query.searchLoginTerm =
    typeof searchLoginTerm === "string" ? searchLoginTerm : "";
});

export const userValidation = [
  checkBasicAuth,
  loginValidation,
  emailValidation,
  passwordValidation,
  uniqueLoginAndEmailValidation,
  inputValidation,
];

export { checkBasicAuth };
