import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';


export class CreatePostDto {
    @IsString()
    title: string

    @ApiProperty({
        type: "string",
        required: false,
        nullable: true
    })
    content: string | null

    @ApiProperty({
        type: "array",
        required: false,
        items: {
            type: "string",
            format: "binary",
        }
    })
    files: string[]
}

export interface PostMediaType {
    title: string
    content: string | null
    authorId: number | null
    media: {
        create: {
            mimetype: string,
            path: string
        }[]
    }
}