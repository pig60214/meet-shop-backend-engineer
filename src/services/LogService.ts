/* eslint-disable class-methods-use-this */
export default class LogService {
  log(content: any) {
    console.info(new Date(), content instanceof Object ? JSON.stringify(content) : content);
  }
}
