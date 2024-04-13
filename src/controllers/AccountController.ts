/* eslint-disable import/prefer-default-export */
/* eslint-disable class-methods-use-this */
import {
  Controller, Get, Route, Tags,
} from 'tsoa';
import AccountService from '../services/AccountService';

@Route('account')
@Tags('Account')
export class AccountController extends Controller {
  private accountService = new AccountService();

  /**
   * Get Hello World.
   */
  @Get('/hello-world')
  public async helloWorld(): Promise<string> {
    return 'Hello World';
  }
}
