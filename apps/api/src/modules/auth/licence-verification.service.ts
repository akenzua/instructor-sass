import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface LicenceVerificationResult {
  valid: boolean;
  status: 'verified' | 'failed' | 'format_valid';
  error?: string;
  details?: {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
  };
}

@Injectable()
export class LicenceVerificationService {
  private readonly logger = new Logger(LicenceVerificationService.name);
  private readonly dvlaApiKey: string | undefined;
  private readonly dvlaApiUrl =
    'https://driver-vehicle-licensing.api.gov.uk/driver-licence/driving-licence';

  constructor(private configService: ConfigService) {
    this.dvlaApiKey = this.configService.get<string>('DVLA_API_KEY');
    if (!this.dvlaApiKey) {
      this.logger.warn(
        'DVLA_API_KEY not set - licence verification will use format validation only',
      );
    }
  }

  /**
   * Validate age from date of birth string (YYYY-MM-DD). Must be 17+.
   */
  validateAge(dateOfBirth: string): { valid: boolean; age: number; error?: string } {
    const dob = new Date(dateOfBirth);
    if (isNaN(dob.getTime())) {
      return { valid: false, age: 0, error: 'Invalid date of birth' };
    }

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    if (age < 17) {
      return { valid: false, age, error: 'You must be at least 17 years old to book driving lessons' };
    }

    if (age > 100) {
      return { valid: false, age, error: 'Please enter a valid date of birth' };
    }

    return { valid: true, age };
  }

  /**
   * Validate UK provisional driving licence number format.
   *
   * UK driving licence numbers are 16 characters:
   *   Chars 1-5: First 5 chars of surname (padded with 9s)
   *   Char  6:   Decade digit of birth year
   *   Chars 7-8: Month of birth (with +5 on first digit for female)
   *   Chars 9-10: Day of birth
   *   Char  11:  Year digit of birth year
   *   Chars 12-13: Initials or 9
   *   Char  14:  Check digit (usually 9)
   *   Chars 15-16: Two letters (AA, AB, etc.)
   */
  validateLicenceFormat(
    licenceNumber: string,
    lastName?: string,
    dateOfBirth?: string,
  ): { valid: boolean; error?: string } {
    const cleaned = licenceNumber.toUpperCase().replace(/\s/g, '');

    if (cleaned.length !== 16) {
      return { valid: false, error: 'UK driving licence number must be 16 characters' };
    }

    // Basic pattern: 5 alphanum + 6 digits + 2 alphanum + 1 digit + 2 letters
    const pattern = /^[A-Z9]{5}\d{6}[A-Z9]{2}\d[A-Z]{2}$/;
    if (!pattern.test(cleaned)) {
      return { valid: false, error: 'Invalid licence number format' };
    }

    // Cross-check surname if provided
    if (lastName) {
      const expectedSurname = lastName
        .toUpperCase()
        .replace(/[^A-Z]/g, '')
        .padEnd(5, '9')
        .substring(0, 5);
      const licenceSurname = cleaned.substring(0, 5);
      if (licenceSurname !== expectedSurname) {
        return {
          valid: false,
          error: 'Licence number does not match your surname',
        };
      }
    }

    // Cross-check date of birth if provided
    if (dateOfBirth) {
      const dob = new Date(dateOfBirth);
      if (!isNaN(dob.getTime())) {
        const year = dob.getFullYear();
        const month = dob.getMonth() + 1; // 1-based
        const day = dob.getDate();

        const decadeDigit = cleaned[5];
        const yearDigit = cleaned[10];
        const expectedDecade = String(Math.floor(year / 10) % 10);
        const expectedYear = String(year % 10);

        if (decadeDigit !== expectedDecade || yearDigit !== expectedYear) {
          return {
            valid: false,
            error: 'Licence number does not match your date of birth',
          };
        }

        // Month digits (chars 7-8). Female licences add 50 to the month.
        const monthDigits = parseInt(cleaned.substring(6, 8), 10);
        if (monthDigits !== month && monthDigits !== month + 50) {
          return {
            valid: false,
            error: 'Licence number does not match your date of birth',
          };
        }

        // Day digits (chars 9-10)
        const dayDigits = parseInt(cleaned.substring(8, 10), 10);
        if (dayDigits !== day) {
          return {
            valid: false,
            error: 'Licence number does not match your date of birth',
          };
        }
      }
    }

    return { valid: true };
  }

  /**
   * Verify a licence with the DVLA API, or fall back to format validation.
   */
  async verifyLicence(
    licenceNumber: string,
    lastName: string,
    dateOfBirth: string,
  ): Promise<LicenceVerificationResult> {
    // Always validate format first
    const formatCheck = this.validateLicenceFormat(licenceNumber, lastName, dateOfBirth);
    if (!formatCheck.valid) {
      return { valid: false, status: 'failed', error: formatCheck.error };
    }

    // If DVLA API key is available, call the real API
    if (this.dvlaApiKey) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(this.dvlaApiUrl, {
          method: 'POST',
          headers: {
            'x-api-key': this.dvlaApiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ drivingLicenceNumber: licenceNumber.toUpperCase().replace(/\s/g, '') }),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (response.ok) {
          const data = await response.json();
          this.logger.log('DVLA verification successful for licence ' + licenceNumber.substring(0, 5) + '***');
          return {
            valid: true,
            status: 'verified',
            details: {
              firstName: data.firstName,
              lastName: data.lastName,
              dateOfBirth: data.dateOfBirth,
            },
          };
        }

        if (response.status === 404) {
          return { valid: false, status: 'failed', error: 'Licence number not found in DVLA records' };
        }

        return { valid: false, status: 'failed', error: 'Licence could not be verified with DVLA' };
      } catch (err: any) {
        this.logger.error('DVLA API error: ' + err.message);
        // Fall back to format validation on API errors
        this.logger.warn('Falling back to format-only validation due to DVLA API error');
        return { valid: true, status: 'format_valid' };
      }
    }

    // No DVLA API key - format validation passed
    this.logger.log('Licence format valid (no DVLA API): ' + licenceNumber.substring(0, 5) + '***');
    return { valid: true, status: 'format_valid' };
  }
}
