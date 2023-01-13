import { ApiProperty } from "@nestjs/swagger";

export class MediaEntity {
    id: number
    mimetype: string
    path: string
}

export class Post {
    id: number
    title: string
    content: string | null
    media: MediaEntity[]
    likes_count: number
    createdAt: Date
}

export class PaginatedDto<TData> {
    @ApiProperty()
    total: number;

    @ApiProperty()
    limit: number;

    @ApiProperty()
    cursor: number;

    @ApiProperty()
    results: TData[];

    constructor (limit: number, cursor: number, results: TData[]) {
        this.total = results.length;
        this.limit = limit;
        this.cursor = cursor;
        this.results = results;
    }
}