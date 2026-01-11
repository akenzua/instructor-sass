import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { AuthService } from "../auth.service";

interface JwtPayload {
  sub: string;
  email: string;
  type?: 'learner' | 'instructor';
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private authService: AuthService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_SECRET"),
    });
  }

  async validate(payload: JwtPayload) {
    // Check if it's a learner token
    if (payload.type === 'learner') {
      return { id: payload.sub, email: payload.email, type: 'learner' };
    }

    // Otherwise validate as instructor
    const instructor = await this.authService.validateInstructor(payload.sub);
    if (!instructor) {
      throw new UnauthorizedException();
    }
    return { id: instructor._id.toString(), email: instructor.email, type: 'instructor' };
  }
}
