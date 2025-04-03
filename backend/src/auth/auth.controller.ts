import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { TwilioService } from './twilio.service';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly twilioService: TwilioService,
    private readonly usersService: UsersService,
  ) {}

  // مدیریت کاربر موجود
  async handleExistingUser(phone: string) {
    this.logger.log(`🔁 Handling existing user: ${phone}`);

    const otp = await this.authService.generateVerificationCode(phone);
    const otpExpiryTime = Date.now() + 10 * 60 * 1000;
    await this.usersService.updateUserOtp(phone, otp, otpExpiryTime);

    await this.twilioService.sendVerificationCode(phone);
    this.logger.log(`📩 OTP sent via Twilio to existing user: ${phone}`);

    return { message: 'Verification code sent to existing user' };
  }

  // مدیریت کاربر جدید
  async handleNewUser(
    phone: string,
    email?: string,
    address?: string,
    fullname?: string,
  ) {
    this.logger.log(`🆕 Handling new user: ${phone}`);

    const otp = await this.authService.generateVerificationCode(phone);
    const otpExpiryTime = Date.now() + 10 * 60 * 1000;

    try {
      await this.usersService.createTemporaryUser(
        phone,
        otp,
        otpExpiryTime,
        email,
        address,
        fullname,
      );
      this.logger.log(`✅ Temporary user created for ${phone}`);
    } catch (error) {
      this.logger.error(`❌ Error creating temporary user: ${error.message || error}`);
      throw error;
    }

    await this.twilioService.sendVerificationCode(phone);
    this.logger.log(`📩 OTP sent via Twilio to new user: ${phone}`);

    return { message: 'Verification code sent to new user' };
  }

  // ارسال کد تایید به شماره تلفن
  @Post('verify-phone')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async verifyPhone(
    @Body()
    {
      phone,
      email,
      address,
      fullname,
    }: { phone: string; email?: string; address?: string; fullname?: string },
  ) {
    this.logger.log(`📞 Verifying phone number: ${phone}`);

    const user = await this.usersService.findByPhone(phone);
    if (user) {
      return this.handleExistingUser(phone);
    } else {
      return this.handleNewUser(phone, email, address, fullname);
    }
  }

  // تایید کد و ورود
  @Post('confirm-code')
  @HttpCode(HttpStatus.OK)
  async confirmCode(
    @Body() { phone, code }: { phone: string; code: string },
  ) {
    this.logger.log(`🔐 Confirming code for: ${phone}`);

    const isValid = await this.twilioService.verifyCode(phone, code);
    if (!isValid) {
      this.logger.warn(`❌ Invalid verification code for ${phone}`);
      return { message: 'Invalid verification code', success: false };
    }

    const user = await this.usersService.findByPhone(phone);
    if (!user) {
      return { message: 'User not found', success: false };
    }

    await this.usersService.updateUserVerificationStatus(phone, true);

    const token = await this.authService.generateJwtToken(user);

    return {
      message: 'Login successful',
      accessToken: token,
      user: {
        phone: user.phone,
        email: user.email,
        address: user.address,
        fullname: user.fullname,
        role: user.role,
      },
    };
  }

  // ارسال کد لاگین
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async sendLoginCode(@Body() { phone }: { phone: string }) {
    this.logger.log(`🔑 Sending login code to: ${phone}`);

    const user = await this.usersService.findByPhone(phone);
    if (user) {
      return this.handleExistingUser(phone);
    } else {
      return this.handleNewUser(phone);
    }
  }

  // تایید لاگین با کد
  @Post('login-confirm')
  @HttpCode(HttpStatus.OK)
  async loginConfirm(@Body() { phone, code }: { phone: string; code: string }) {
    this.logger.log(`✅ Confirming login for: ${phone}`);

    const isValid = await this.twilioService.verifyCode(phone, code);
    if (!isValid) {
      return { message: 'Invalid verification code', success: false };
    }

    let user = await this.usersService.findByPhone(phone);
    if (!user) {
      user = await this.authService.register({ phone });
    }

    await this.usersService.updateUserVerificationStatus(phone, true);

    const token = await this.authService.generateJwtToken(user);

    return {
      message: 'Login successful',
      accessToken: token,
      user: {
        phone: user.phone,
        email: user.email,
        address: user.address,
        fullname: user.fullname,
        role: user.role,
      },
    };
  }
}