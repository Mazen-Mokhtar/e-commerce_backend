import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfirmDTO, loginDTO, SignupDTO } from './dto';
import { UserRepository } from 'src/DB/models/User/user.repository';
import { EmailEvents } from 'src/commen/event/send-email';
import * as Randomstring from 'randomstring';
import { compareHash } from 'src/commen/security/compare';
import { generateHash } from 'src/commen/security/hash';
import { ITokenTypes, TokenService } from 'src/commen/jwt';
import { RoleTypes } from 'src/DB/models/User/user.schema';


@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailEvent: EmailEvents,
    private readonly tokenService: TokenService) { }
  async signup(body: SignupDTO) {
    const check = await this.userRepository.findByEmail({ email: body.email })
    if (check)
      throw new ConflictException("user already exist")
    const generateOTP = Randomstring.generate({ length: 6, charset: '1234567890' });
    this.emailEvent.sendEmail(body.email, generateOTP);
    const user = await this.userRepository.create(body)
    user.code = generateHash(generateOTP)
    await user.save()
    return { data: "Email is created but active frist" };
  }
  async confrim(body: ConfirmDTO) {
    const user = await this.userRepository.findByEmail({ email: body.email, isConfirm: { $exists: false } })
    if (!user)
      throw new NotFoundException("User not found or already confrimed");
    if (!compareHash(body.code, user.code || " "))
      throw new BadRequestException("In-valid OTP")
    user.isConfirm = true;
    user.code = undefined
    await user.save()
    return { data: "email confirmed successfully" }
  }
  async login(body: loginDTO) {
    const user = await this.userRepository.findByEmail({ email: body.email })
    if (!user)
      throw new BadRequestException("In-valid-user")
    if (!user.isConfirm)
      throw new BadRequestException("Sorry confirm your email first 😔");
    if (!compareHash(body.password, user.password))
      throw new BadRequestException("In-valid-user")
    const accessToken: string = this.tokenService.sign({
      payload: { userId: user._id.toString() },
      type: ITokenTypes.access,
      role: user.role as RoleTypes,
      expiresIn: "1d"
    })
    const refreshToken: string = this.tokenService.sign({
      payload: { userId: user._id.toString() },
      type: ITokenTypes.refresh,
      role: user.role as RoleTypes,
      expiresIn: "7d"
    })
    return { data: { accessToken: `${user.role} ${accessToken}`, refreshToken } }
  }

}
