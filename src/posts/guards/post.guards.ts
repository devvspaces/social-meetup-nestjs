import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { User } from '@prisma/client';
import { PostsService } from '../posts.service';

export class EntityGuard implements CanActivate {
    validateEntity(id: number, user: User): boolean | Promise<boolean> | Observable<boolean> {
        throw new Error('Method not implemented.');
    }

    canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest<Request>();
        const { id } = request.params
        const user = request.user as User;
        return this.validateEntity(+id, user);
    }
}


@Injectable()
export class PostGuard extends EntityGuard {

    constructor(private postsService: PostsService) {
        super();
    }

    validateEntity(id: number, user: User): boolean | Promise<boolean> | Observable<boolean> {
        return this.postsService.findAll({
            where: {
                authorId: user.id,
                id
            }
        }).then(posts => {
            return posts.length > 0;
        })
    }
}
