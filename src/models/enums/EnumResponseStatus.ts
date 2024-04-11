/**
 * 0: Success<br/>
 * 1: ValidationFailed<br/>
 * 2: AccountExists<br/>
 * 3: AccountNotExists<br/>
 * 4: BalanceNotEnough<br/>
 */
enum EnumResponseStatus {
  Success,
  ValidationFailed,
  AccountExists,
  AccountNotExists,
  BalanceNotEnough,
}

export default EnumResponseStatus;
