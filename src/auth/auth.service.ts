import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
// import * as jwt from 'jsonwebtoken';

// @Injectable()
// export class AuthService {
//   constructor(private jwtService: JwtService) {}
//
//   // Function to generate a JWT token
//   async generateToken(payload: any): Promise<string> {
//     return this.jwtService.sign(payload);
//   }
//
//   // Function to verify the JWT token
//   async validateToken(token: string): Promise<any> {
//     try {
//       return await this.jwtService.verifyAsync(token);
//     } catch (error) {
//       return null;
//     }
//   }
// }

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  verifyToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return payload;
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('Invalid token');
    }
  }
}

// this option uses 'jsonwebtoken' package
// @Injectable()
// export class AuthService {
//   private readonly jwtSecret = process.env.JWT_SECRET || 'your_secret_key';
//
//   verifyToken(token: string): any {
//     try {
//       return jwt.verify(token, this.jwtSecret);
//     } catch (error) {
//       throw new Error('Invalid token');
//     }
//   }
// }
