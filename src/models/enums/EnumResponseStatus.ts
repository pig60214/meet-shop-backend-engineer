/**
 * 0: Success<br/>
 * 1: ValidationFailed<br/>
 * 2: AccountExists<br/>
 * 3: AccountNotExist<br/>
 * 4: BalanceNotEnough<br/>
 * 5: ReceiverNotExist<br/>
 */
enum EnumResponseStatus {
  Success,
  ValidationFailed,
  AccountExists,
  AccountNotExist,
  BalanceNotEnough,
  ReceiverNotExist,
}

export default EnumResponseStatus;
