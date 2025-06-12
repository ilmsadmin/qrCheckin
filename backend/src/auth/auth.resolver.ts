import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => String)
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
  ) {
    const result = await this.authService.login(email, password);
    return result.access_token;
  }

  @Mutation(() => String)
  async register(
    @Args('email') email: string,
    @Args('username') username: string,
    @Args('password') password: string,
    @Args('firstName') firstName: string,
    @Args('lastName') lastName: string,
  ) {
    await this.authService.register({
      email,
      username,
      password,
      firstName,
      lastName,
    });
    return 'User registered successfully';
  }
}