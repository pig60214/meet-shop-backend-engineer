import IApiResponse from './IApiResponse';
import Status from './Status';
import EnumResponseStatus from './enums/EnumResponseStatus';

export default class ApiResponse<T = void> implements IApiResponse<T> {
  status: Status = new Status(EnumResponseStatus.Success);

  data?: T;

  constructor();
  constructor(data: T);
  constructor(data?: T) {
    if (typeof data !== 'undefined') {
      this.data = data;
    }
  }
}
