import { Controller, Req, Post, UnauthorizedException, Body, Get, ParseIntPipe, Param } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { User } from '@prisma/client';
import { Public } from './auth.decorators';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './auth.dto';
import { AccessTokenEntity, UserEntity, UserEntityWithFollows } from './user.entity';

@Controller()
@ApiBearerAuth()
@ApiTags('authentication')
export class AppController {
    constructor(private authService: AuthService) { }

    @Public()
    @ApiBody({ type: CreateUserDto })
    @ApiOkResponse({
        type: AccessTokenEntity 
    })
    @Post('login')
    async login(@Body() data: CreateUserDto) {
        const user = await this.authService.validateUser(
            data.username, data.password);
        if (!user) {
            throw new UnauthorizedException("Username and Password does not match");
        }
        return this.authService.login(user)
    }

    @Public()
    @ApiCreatedResponse({ type: UserEntity })
    @ApiBody({ type: CreateUserDto })
    @Post('register')
    async signupUser(
        @Body() userData: CreateUserDto,
    ): Promise<UserEntity> {
        return this.authService.register(userData);
    }

    @Post('follow/:id')
    @ApiOkResponse({
        type: UserEntityWithFollows
    })
    async follow(@Param('id', ParseIntPipe) id: number, @Req() req: Request,) {
        return this.authService.follow({
            userId: (req.user as User).id,
            otherId: +id
        });
    }

    @Post('unfollow/:id')
    @ApiOkResponse({
        type: UserEntityWithFollows
    })
    async unfollow(@Param('id', ParseIntPipe) id: number, @Req() req: Request,) {
        return this.authService.unfollow({
            userId: (req.user as User).id,
            otherId: +id
        });
    }

    @Get('followers')
    @ApiOkResponse({
        type: [UserEntity]
    })
    async followers(@Req() req: Request): Promise<UserEntity[]> {
        return this.authService.getFollowers((req.user as User).id);
    }
}