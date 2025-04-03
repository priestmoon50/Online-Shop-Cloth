import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // تولید توکن JWT
  public generateJwtToken(user: any): string {
    const payload: JwtPayload = {
      userId: user._id.toString(),
      phone: user.phone,
    };
    return this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_EXPIRATION_TIME || '1h',
      secret: process.env.JWT_SECRET || 'secretKey',
    });
  }

  // تولید کد تایید (OTP) ۴ رقمی
  async generateVerificationCode(phone: string): Promise<string> {
    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
    this.logger.log(`✅ Generated verification code for ${phone}: ${verificationCode}`);
    return verificationCode;
  }

  // ثبت‌نام کاربر با استفاده از شماره تلفن
  async register({ phone }: { phone: string }) {
    const existingUser = await this.usersService.findByPhone(phone);
    if (existingUser) {
      throw new ConflictException('Phone number already registered');
    }

    const newUser = await this.usersService.create({ phone });
    this.logger.log(`✅ New user created with phone: ${phone}`);
    return newUser;
  }

  // مدیریت کاربران موجود
  async handleExistingUser(phone: string): Promise<any> {
    const user = await this.usersService.findByPhone(phone);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.usersService.updateUserVerificationStatus(phone, true);
    const token = this.generateJwtToken(user);

    return {
      message: 'Login successful',
      accessToken: token,
      user: {
        phone: user.phone,
        email: user.email,
        address: user.address,
        fullname: user.fullname,
      },
    };
  }

  // مدیریت کاربران جدید
  async handleNewUser(phone: string): Promise<any> {
    let newUser = await this.register({ phone });
    newUser = await this.usersService.updateUserVerificationStatus(phone, true);
    const token = this.generateJwtToken(newUser);

    return {
      message: 'Registration and login successful',
      accessToken: token,
      user: {
        phone: newUser.phone,
        email: newUser.email,
        address: newUser.address,
        fullname: newUser.fullname,
      },
    };
  }

  // تأیید کد (توسط Twilio انجام میشه، این متد فقط مسیر رو ادامه می‌ده)
  async confirmCode(phone: string, code: string): Promise<any> {
    // این متد دیگه تأیید مستقیم نمی‌کنه، وظیفه تأیید با TwilioService هست

    const user = await this.usersService.findByPhone(phone);
    if (user) {
      return this.handleExistingUser(phone);
    } else {
      return this.handleNewUser(phone);
    }
  }
}
