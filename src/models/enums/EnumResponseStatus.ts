/**
 * 0: Success<br/>
 * 1: ValidationFailed<br/>
 * 2: AccountExists<br/>
 * 3: AccountNotExist<br/>
 * 4: BalanceNotEnough<br/>
 * 5: GiverNotExist<br/>
 * 6: ReceiverNotExist<br/>
 */
enum EnumResponseStatus {
  Success,
  ValidationFailed,
  AccountExists,
  AccountNotExist,
  BalanceNotEnough,
  GiverNotExist,
  ReceiverNotExist,
}

export default EnumResponseStatus;
