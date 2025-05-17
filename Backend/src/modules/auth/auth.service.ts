import jwt from 'jsonwebtoken';
import { User, UserRole, ResourceStatus } from '@prisma/client';
import prisma from '@/config/prisma';
import { env } from '@/config/environment';
import { ApiError } from '@/utils/ApiError';
import { hashPassword, comparePassword } from '@/utils/password.utils';
import { RegisterCitizenDto, LoginDto } from './dto';
import { LoginResponse, JwtPayload } from './interfaces/auth.interfaces';
import { UserRepository } from '@/modules/users/user.repository'; // For checking existing users

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository(); // Uses the existing user repository
  }

  private generateAccessToken(user: User): string {
    const payload: JwtPayload = {
      userId: user.id,
      role: user.role,
      // Add other necessary claims for your application
    };
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: `${env.JWT_ACCESS_EXPIRATION_MINUTES}m`,
    });
  }

  // Helper to strip password from user object
  private sanitizeUser(user: User): Omit<User, 'password'> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  async registerCitizen(dto: RegisterCitizenDto): Promise<Omit<User, 'password'>> {
    // Check if email or phone already exists
    const existingEmailUser = await this.userRepository.findByEmail(dto.email.toLowerCase());
    if (existingEmailUser) {
      throw new ApiError(409, 'User with this email already exists.');
    }
    const existingPhoneUser = await this.userRepository.findByPhone(dto.phone);
    if (existingPhoneUser) {
      throw new ApiError(409, 'User with this phone number already exists.');
    }

    const hashedPassword = await hashPassword(dto.password);

    const newUser = await prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email.toLowerCase(),
        phone: dto.phone,
        password: hashedPassword,
        role: UserRole.CITIZEN,
        status: ResourceStatus.ACTIVE, // Or PENDING_VERIFICATION if you implement email/phone verification
      },
    });

    return this.sanitizeUser(newUser);
  }

  async login(dto: LoginDto): Promise<LoginResponse> {
    const user = await this.userRepository.findByPhone(dto.phone);

    if (!user) {
      throw new ApiError(401, 'Invalid phone number or password.');
    }

    if (user.status === ResourceStatus.INACTIVE) {
        throw new ApiError(403, 'Your account is inactive. Please contact support.');
    }
    // Add other status checks if needed (e.g., PENDING_VERIFICATION)

    const isPasswordMatch = await comparePassword(dto.password, user.password);
    if (!isPasswordMatch) {
      throw new ApiError(401, 'Invalid phone number or password.');
    }

    const accessToken = this.generateAccessToken(user);

    return {
      user: this.sanitizeUser(user),
      tokens: {
        accessToken,
      },
    };
  }

  async getMe(userId: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.userRepository.findById(userId); // findById should ideally not return password
    if (!user) {
        return null;
    }
    return this.sanitizeUser(user);
  }
}
