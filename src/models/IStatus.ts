import EnumResponseStatus from './enums/EnumResponseStatus';

export default interface IStatus {
  code: EnumResponseStatus;

  message: string;

  detail?: string;
}
