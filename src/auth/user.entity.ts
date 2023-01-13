import { ApiProperty } from "@nestjs/swagger";


export class UserEntity {
    @ApiProperty()
    id: number

    @ApiProperty()
    username: string
}

export class UserEntityWithFollows {
    @ApiProperty()
    id: number

    @ApiProperty()
    username: string

    @ApiProperty()
    following: number
}

export class AccessTokenEntity{
    access: string
}
