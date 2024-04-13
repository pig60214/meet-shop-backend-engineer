import IApiResponse from './IApiResponse';
import Status from './Status';
import EnumResponseStatus from './enums/EnumResponseStatus';

export default class ApiResponseError implements IApiResponse {
  status: Status;

  constructor(statusCode: EnumResponseStatus) {
    this.status = new Status(statusCode);
  }
}
