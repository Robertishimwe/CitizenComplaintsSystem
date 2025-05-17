import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterCitizenDto, LoginDto } from './dto';
import catchAsync from '@/utils/catchAsync';
import { ApiError } from '@/utils/ApiError'; // If needed for direct error throwing

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  registerCitizen = catchAsync(async (req: Request, res: Response) => {
    const dto: RegisterCitizenDto = req.body;
    const newUser = await this.authService.registerCitizen(dto);
    res.status(201).json({
      status: 'success',
      message: 'Citizen registered successfully.',
      data: newUser,
    });
  });

  login = catchAsync(async (req: Request, res: Response) => {
    const dto: LoginDto = req.body;
    const loginResponse = await this.authService.login(dto);
    res.status(200).json({
      status: 'success',
      message: 'Login successful.',
      data: loginResponse,
    });
  });

  getMe = catchAsync(async (req: Request, res: Response) => {
    // req.user is populated by the `protect` or `requireAuth` middleware
    if (!req.user) {
        // This should ideally be caught by requireAuth middleware if used before this handler
        throw new ApiError(401, 'User not authenticated');
    }
    // The authService.getMe can re-fetch or use req.user data
    // Re-fetching ensures fresh data, using req.user is faster but might be stale if not updated on every request
    const userProfile = await this.authService.getMe(req.user.id);

    if (!userProfile) {
        throw new ApiError(404, 'User profile not found.'); // Should not happen if req.user exists
    }

    res.status(200).json({
        status: 'success',
        data: userProfile,
    });
  });
}
