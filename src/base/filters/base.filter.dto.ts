// import { ApiProperty } from '@nestjs/swagger'
// import { IsNumberString, IsOptional, IsString } from 'class-validator'

// export class BaseFilterDto {
//   @IsOptional()
//   filters?: Record<string, unknown> = {}

//   @ApiProperty({
//     type: String,
//     required: false,
//     description: 'name,slug',
//   })
//   @IsOptional()
//   @IsString()
//   readonly fields?: string

//   @ApiProperty({
//     type: String,
//     required: false,
//     description: 'name,-slug',
//   })
//   @IsOptional()
//   @IsString()
//   readonly sorts?: string

//   @ApiProperty({
//     type: String,
//     required: false,
//     description: 'search query',
//   })
//   @IsOptional()
//   @IsString()
//   readonly search?: string

//   @ApiProperty({
//     type: String,
//     required: false,
//     description: 'related_data',
//   })
//   @IsOptional()
//   @IsString()
//   readonly includes?: string

//   @ApiProperty({
//     type: Number,
//     required: false,
//     description: '1',
//     default: 1,
//   })
//   @IsOptional()
//   @IsNumberString()
//   readonly page: number = 1

//   @ApiProperty({
//     type: Number,
//     description: 'Limit the number of results',
//     default: 10,
//     required: false,
//   })
//   @IsOptional()
//   @IsNumberString()
//   readonly limit: number = 10
// }
