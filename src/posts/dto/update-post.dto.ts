import { PartialType } from '@nestjs/swagger';
import { CreatePostDto } from './create-post.dto';

export class UpdatePostDto extends PartialType(CreatePostDto) {}

export interface UpdatePostMediaType {
    title: string
    content: string | null
    media: {
        create: {
            mimetype: string,
            path: string
        }[]
    }
}
