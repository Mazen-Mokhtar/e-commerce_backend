import { Body, Controller, Get, HttpCode, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfirmDTO, loginDTO, SignupDTO } from './dto';
import { UserRepository } from 'src/DB/models/User/user.repository';
import { log } from 'console';
@UsePipes(new ValidationPipe({whitelist :true }))
@Controller("auth")
export class AuthController {
  constructor(private readonly AuthService: AuthService) {}

  @Post("singup")
  async signup( @Body() signupDTO : SignupDTO){
    log(signupDTO)
    const data = await this.AuthService.signup(signupDTO)
    return {message : "success" , data}
  }
  @HttpCode(200)
  @Post("confirm-email")
  async confirm(@Body() confirmDTO : ConfirmDTO){
    return this.AuthService.confrim(confirmDTO)
  }
  @HttpCode(200)
  @Post("login")
  async login(@Body() loginDTO : loginDTO){
    return this.AuthService.login(loginDTO)
  }
}
