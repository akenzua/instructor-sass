import { Controller, Post, Get, Put, Body, UseGuards, Request } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SignupDto, LoginDto, MagicLinkDto, VerifyMagicLinkDto, UpdateLearnerProfileDto } from "./dto/auth.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  async signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post("login")
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  async getMe(@Request() req: { user: { id: string } }) {
    return this.authService.getMe(req.user.id);
  }

  // Magic link endpoints for learners
  @Post("magic-link")
  async requestMagicLink(@Body() dto: MagicLinkDto) {
    return this.authService.requestMagicLink(dto);
  }

  @Post("verify-magic-link")
  async verifyMagicLink(@Body() dto: VerifyMagicLinkDto) {
    return this.authService.verifyMagicLink(dto);
  }

  @Get("learner/me")
  @UseGuards(JwtAuthGuard)
  async getLearnerMe(@Request() req: { user: { id: string } }) {
    return this.authService.getLearnerMe(req.user.id);
  }

  @Put("learner/me")
  @UseGuards(JwtAuthGuard)
  async updateLearnerProfile(
    @Request() req: { user: { id: string } },
    @Body() dto: UpdateLearnerProfileDto
  ) {
    return this.authService.updateLearnerProfile(req.user.id, dto);
  }
}
