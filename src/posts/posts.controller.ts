import { Controller, Query, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Request } from 'express';
import { ParamsDictionary } from "express-serve-static-core"
import { User } from '@prisma/client';
import { POSTS_PER_PAGE } from './post.constants';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiExtraModels, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ValidationPipe } from 'src/auth/auth.validation';
import { ParseIntPipe } from '@nestjs/common/pipes';
import { AcceptMultipleFiles, MultipartBody, PostUploadedFiles } from './post.decorators';
import { PostGuard } from './guards/post.guards';
import { Post as PostEntity, MediaEntity } from './entities/post.entity';
import { PaginatedDto } from './entities/post.entity';
import { ApiPaginatedResponse } from './pagination.helper';

@Controller('posts')
@ApiBearerAuth()
@ApiTags('posts')
@ApiExtraModels(PaginatedDto, PostEntity, MediaEntity)
export class PostsController {
    constructor(private readonly postsService: PostsService) { }

    @Post()
    @MultipartBody()
    @ApiBody({
        description: 'Create a new post',
        type: CreatePostDto,
    })
    @ApiCreatedResponse({
        type: PostEntity
    })
    @AcceptMultipleFiles()
    async create(
        @Req() request: Request,
        @Body(new ValidationPipe()) createPostDto: CreatePostDto,
        @PostUploadedFiles() files: Express.Multer.File[]
    ) {
        const { title, content } = createPostDto

        if (!content && !files.length) throw new BadRequestException(['Content or files are required.'])

        return this.postsService.create({
            authorId: (request.user as User).id,
            title,
            content,
            media: {
                create: files.map(item => ({
                    mimetype: item.mimetype,
                    path: item.filename
                }))
            }
        });
    }

    @Get()
    @ApiPaginatedResponse(PostEntity)
    @ApiQuery({
        name: 'limit',
        required: false,
        description: 'Limit of posts per page',
    })
    @ApiQuery({
        name: 'cursor',
        required: false,
        description: 'Cursor of the last post',
    })
    @ApiQuery({
        name: 'skip',
        required: false,
        description: 'Skip posts',
    })
    async findAll(@Query() query: ParamsDictionary) {
        const { limit, skip, cursor } = query
        const results = await this.postsService.findAll({
            take: limit ? +limit : POSTS_PER_PAGE,
            skip: skip ? +skip : 0,
            cursor: cursor ? { id: +cursor } : undefined,
            orderBy: {
                createdAt: 'desc'
            },
        });
        return new PaginatedDto(+limit, +cursor, results)
    }

    @Get('feed')
    @ApiPaginatedResponse(PostEntity)
    @ApiQuery({
        name: 'limit',
        required: false,
        description: 'Limit of posts per page',
    })
    @ApiQuery({
        name: 'cursor',
        required: false,
        description: 'Cursor of the last post',
    })
    async getFeed(@Req() req: Request, @Query() query: ParamsDictionary) {
        req.params
        const { id } = req.user as User
        const { limit, cursor } = query
        const results = await this.postsService.getFeed({
            userId: id,
            limit: limit ? +limit : POSTS_PER_PAGE,
            cursor: cursor ? +cursor : 0
        })
        return new PaginatedDto(limit ? +limit : POSTS_PER_PAGE, cursor ? +cursor : 0, results)
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.postsService.findOne(+id);
    }

    @MultipartBody()
    @Patch(':id')
    @UseGuards(PostGuard)
    @ApiBody({
        description: 'Update a post',
        type: UpdatePostDto,
    })
    @ApiOkResponse({
        description: 'The post has been successfully updated.',
        type: PostEntity,
    })
    @AcceptMultipleFiles()
    async update(
        @Param('id') id: string,
        @Body(new ValidationPipe()) updatePostDto: UpdatePostDto,
        @PostUploadedFiles() files: Express.Multer.File[]
    ) {
        const { title, content } = updatePostDto
        const post = await this.postsService.update(+id, {
            title,
            content,
            media: {
                create: files.map(item => ({
                    mimetype: item.mimetype,
                    path: item.filename
                }))
            }
        });
        return post
    }

    @Post('like/:id')
    async likePostorNot(@Param('id', ParseIntPipe) id: number, @Req() req: Request,) {
        return this.postsService.likePostOrNot(+id, (req.user as User).id);
    }

    @Delete(':id')
    @ApiOkResponse({
        description: 'The post has been successfully deleted.',
        type: PostEntity,
    })
    async remove(@Param('id', ParseIntPipe) id: number, @Req() req: Request,) {
        return this.postsService.remove(+id, (req.user as User).id);
    }

    @Delete('image/:id')
    @ApiOkResponse({
        description: 'The post media has been successfully deleted.',
        type: MediaEntity,
    })
    async removeImage(@Param('id', ParseIntPipe) id: number, @Req() req: Request,) {
        return this.postsService.removeImage(+id, (req.user as User).id);
    }
}
