export class CreateUserDto {
  readonly clerkId: string;
  readonly email: string;
  readonly username: string;
  readonly country: string;
  readonly wallet: number;
}

export class UpdateUserDto {
  readonly clerkId: string;
  readonly wallet: number;
  readonly operation: string;
}