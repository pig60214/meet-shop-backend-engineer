/* eslint-disable import/prefer-default-export */
/* eslint-disable class-methods-use-this */
import {
  Body, Controller, Route, Tags, Post,
} from 'tsoa';
import AccountService from '../services/AccountService';
import IAccount from '../models/IAccount';
import IApiResponse from '../models/IApiResponse';

@Route('account')
@Tags('Account')
export class AccountController extends Controller {
  private accountService = new AccountService();

  /**
   * Potential response status: ValidationFailed, AccountExists
   * @summary Create an account with name and balance
   */
  @Post('/create')
  public async create(@Body() account: IAccount): Promise<IApiResponse> {
    const response = await this.accountService.create(account);
    return response;
  }
}
