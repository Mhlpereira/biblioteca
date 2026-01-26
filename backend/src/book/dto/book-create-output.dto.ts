import { ApiProperty } from "@nestjs/swagger";


export class BookCreateOutput{

    @ApiProperty({ example: "O guia dos mochileiro das galáxias" })
    title:string;

    @ApiProperty({ example: "Douglas Adams" })
    author: string;

    @ApiProperty({example:'http://xxxx.xxxx'})
    imageUrl: string;

}