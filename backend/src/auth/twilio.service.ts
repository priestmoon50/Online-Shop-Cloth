import { Injectable, Logger } from '@nestjs/common';
import { Twilio } from 'twilio';

@Injectable()
export class TwilioService {
  private readonly logger = new Logger(TwilioService.name);
  private readonly twilioClient: Twilio;
  private readonly verifyServiceSid: string;

  constructor() {
    this.twilioClient = new Twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    );
    this.verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID!;
  }

  async sendVerificationCode(phone: string): Promise<void> {
    try {
      const verification = await this.twilioClient.verify.v2.services(this.verifyServiceSid)
        .verifications
        .create({ to: phone, channel: 'sms' });

      this.logger.log(`✅ Verification code sent to ${phone}. SID: ${verification.sid}`);
    } catch (error: any) {
      this.logger.error(`❌ Failed to send verification code to ${phone}: ${error.message}`);
      throw error;
    }
  }

  async verifyCode(phone: string, code: string): Promise<boolean> {
    try {
      const result = await this.twilioClient.verify.v2.services(this.verifyServiceSid)
        .verificationChecks
        .create({ to: phone, code });

      if (result.status === 'approved') {
        this.logger.log(`✅ Code verified successfully for ${phone}`);
        return true;
      } else {
        this.logger.warn(`⚠️ Invalid code for ${phone}. Status: ${result.status}`);
        return false;
      }
    } catch (error: any) {
      this.logger.error(`❌ Error verifying code for ${phone}: ${error.message}`);
      throw error;
    }
  }
}