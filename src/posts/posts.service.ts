import { Injectable } from '@nestjs/common';
import { PostMediaType } from './dto/create-post.dto';
import { UpdatePostMediaType } from './dto/update-post.dto';
import { PrismaService } from './prisma.service';
import { Post, Prisma } from '@prisma/client';
import { Post as PostEntity } from './entities/post.entity';
import { unlink, unlinkSync } from 'fs';
import { UPLOAD_DIR } from './post.constants';
import { BadRequestException, ForbiddenException, UnprocessableEntityException } from '@nestjs/common/exceptions';

@Injectable()
export class PostsService {
    constructor(private prisma: PrismaService) { }

    defaultSelection(){
        return {
            id: true,
            title: true,
            content: true,
            media: {
                select: {
                    id: true,
                    mimetype: true,
                    path: true
                }
            },
            likes_count: true,
            createdAt: true,
        }
    }

    async create(data: PostMediaType): Promise<Post> {
        return this.prisma.post.create({
            data,
            include: {
                media: {
                    select: {
                        mimetype: true,
                        path: true
                    }
                }
            }
        });
    }

    async getFeed(
        { userId, cursor, limit }: { userId: number, cursor?: number, limit: number }
    ): Promise<PostEntity[]> {
        const followers = ((await this.prisma.user.findUnique({
            where: {
                id: userId
            },
        }).following()) || []).map(({ id }) => id)

        const cursorObj = cursor ? {
            id: cursor
        }: undefined;
        const skip = cursorObj ? 1 : 0;

        return this.prisma.post.findMany({
            skip,
            take: limit,
            cursor: undefined,
            where: {
                authorId: {
                    in: followers
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            select: this.defaultSelection(),
        });
    }

    async findAll(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.PostWhereUniqueInput;
        where?: Prisma.PostWhereInput;
        orderBy?: Prisma.PostOrderByWithRelationInput;
    }): Promise<PostEntity[]> {
        const { skip, take, cursor, where, orderBy } = params;
        return this.prisma.post.findMany({
            skip,
            take,
            cursor,
            where,
            orderBy,
            select: this.defaultSelection(),
        });
    }

    async findOne(id: number) {
        return this.prisma.post.findUnique({
            where: { id },
            select: this.defaultSelection(),
        })
    }

    async update(id: number, data: UpdatePostMediaType) {
        return this.prisma.post.update({
            where: {
                id,
            },
            data,
            include: {
                media: {
                    select: {
                        mimetype: true,
                        path: true
                    }
                }
            }
        })
    }

    async remove(id: number, authorId: number) {
        const post = await this.prisma.post.findUnique({
            where: {
                id
            },
            include: {
                media: {
                    select: {
                        path: true
                    }
                }
            }
        })

        if (!post) {
            throw new BadRequestException([
                "Post not found"
            ])
        }

        if (post.authorId !== authorId){
            throw new ForbiddenException([
                "You are not allowed to delete this post"
            ])
        }

        const postDeleteResponse = this.prisma.post.delete({
            where: {
                id
            },
            include: {
                media: {
                    select: {
                        id: true,
                        path: true,
                        mimetype: true,
                    }
                }
            }
        })

        post.media.map(({ path }) => {
            // Delete media from disk
            if (path){
                unlink(`${UPLOAD_DIR}/${path}`, (err) => {
                    if (err) {
                        throw new BadRequestException([
                            "Media not found"
                        ])
                    }
                })
            }
        })

        return postDeleteResponse;
    }

    async removeImage(id: number, authorId: number){
        const media = await this.prisma.media.findUnique({
            where: {
                id
            },
            include: {
                Post: {
                    select: {
                        authorId: true
                    }
                }
            }
        })

        if (!media) {
            throw new BadRequestException([
                "Media not found"
            ])
        }

        if (media.Post.authorId !== authorId){
            throw new ForbiddenException([
                "You are not allowed to delete this media"
            ])
        }

        unlink(`${UPLOAD_DIR}/${media.path}`, (err) => {
            if (err) {
                throw new BadRequestException([
                    "Media not found"
                ])
            }
        })

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { postId, ...response } = await this.prisma.media.delete({
            where: { id }
        })
        return response
    }

    async likePostOrNot(id: number, userId: number){
        const liked = (await this.prisma.post.findUnique({
            where: {
                id
            },
        }).likes({
            where: {
                id: userId
            }
        })).length > 0

        let action: 'connect' | 'disconnect';

        if (liked) {
            action = 'disconnect'
        } else {
            action = 'connect'
        }

        const post = await this.prisma.post.update({
            where: {
                id
            },
            data: {
                likes: {
                    [action]: {
                        id: userId
                    }
                }
            }
        })
        
        return this.prisma.post.update({
            where: {
                id
            },
            data: {
                likes_count: post.likes_count + (action === 'connect' ? 1 : -1)
            }
        })
    }
}
