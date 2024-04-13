import IStatus from './IStatus';
import EnumResponseStatus from './enums/EnumResponseStatus';

export default class Status implements IStatus {
  code: EnumResponseStatus;

  message: string;

  detail?: string;

  constructor(code: EnumResponseStatus) {
    this.code = code;
    this.message = EnumResponseStatus[this.code];
  }
}
