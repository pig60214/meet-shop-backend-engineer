import EnumResponseStatus from './enums/EnumResponseStatus';

export default interface IDto<T> {
  errorCode: EnumResponseStatus
  data?: T
}
