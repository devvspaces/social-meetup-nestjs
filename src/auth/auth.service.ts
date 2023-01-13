import { JwtService } from '@nestjs/jwt';
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../posts/prisma.service';
import { User, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UserEntity, UserEntityWithFollows } from '../auth/user.entity';


@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService, private prisma: PrismaService) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.findOne(email);
        if (user && await bcrypt.compare(pass, user.password)) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async findOne(username: string): Promise<User> {
        return this.prisma.user.findUnique({
            where: { username },
        });
    }

    async login(user: User) {
        console.log(user)
        const payload = { username: user.username, sub: user.id };
        return {
            access: this.jwtService.sign(payload),
        };
    }

    async register(data: Prisma.UserCreateInput): Promise<UserEntity> {
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const hash = await bcrypt.hash(data.password, salt);
        data = { ...data, password: hash }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...results } = await this.prisma.user.create({
            data,
        });
        return results
    }

    async _follow(params: {
        userId: number;
        otherId: number;
        action: 'connect' | 'disconnect'
    }) {
        const { userId, otherId, action } = params;

        const message = {
            connect: 'follow',
            disconnect: 'unfollow'
        }

        if (userId === otherId) {
            throw new BadRequestException(`You cannot ${message[action]} yourself`)
        }

        const followingObj = {}
        followingObj[action] = {
            id: otherId
        }

        try {
            const userPromise = this.prisma.user.update({
                where: {
                    id: userId
                },
                data: {
                    following: followingObj
                }
            })
            const following = (await userPromise.following()).length
            const { password, ...results } = await userPromise
            return {
                following,
                ...results
            }
        } catch (e) {
            throw new BadRequestException(`You cannot ${message[action]} this user`)
        }
    }

    async follow(params: {
        userId: number;
        otherId: number;
    }) {
        return this._follow({ ...params, action: 'connect' })
    }

    async unfollow(params: {
        userId: number;
        otherId: number;
    }): Promise<UserEntityWithFollows> {
        return this._follow({ ...params, action: 'disconnect' })
    }

    async getFollowers(userId: number) {
        return this.prisma.user.findUnique({
            where: {
                id: userId
            },
        }).followedBy({
            select: {
                id: true,
                username: true,
            }
        })
    }

}