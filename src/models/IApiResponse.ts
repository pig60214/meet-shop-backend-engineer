import IStatus from './IStatus';

export default interface IApiResponse<T = void> {
  status: IStatus
  data?: T
}
