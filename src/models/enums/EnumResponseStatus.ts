/**
 * 0: Success<br/>
 * 1: ValidationFailed<br/>
 * 2: AccountExists<br/>
 * 3: AccountNotExists<br/>
 */
enum EnumResponseStatus {
  Success,
  ValidationFailed,
  AccountExists,
  AccountNotExists,
}

export default EnumResponseStatus;
