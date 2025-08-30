// import { NotFoundException } from '@nestjs/common'
// import { type Prisma } from '@prisma/client'
// import { ClsService } from 'nestjs-cls'

// export default class BaseRepository<DatabaseType> {
//   protected db: DatabaseType
//   protected model: Prisma.ModelName
//   protected clsService: ClsService

//   constructor(
//     db: DatabaseType,
//     model: Prisma.ModelName,
//     clsService: ClsService,
//   ) {
//     this.db = db
//     this.model = model
//     this.clsService = clsService
//   }

//   private addUserFields(
//     data: Record<string, any>,
//     type = 'create',
//   ): Record<string, any> {
//     const currentUser = this.getCurrentUser()
//     const userFields = {
//       ...(type === 'create' && {
//         created_by_id: currentUser?.id,
//         created_by: currentUser?.firstName
//           ? `${currentUser?.firstName ?? ''} ${currentUser?.lastName ?? ''}`
//           : null,
//       }),
//       last_updated_by_id: currentUser?.id,
//       last_updated_by: currentUser?.firstName
//         ? `${currentUser?.firstName ?? ''} ${currentUser?.lastName ?? ''}`
//         : null,
//     }
//     return { ...data, ...userFields }
//   }

//   protected getClient(): DatabaseType {
//     return (this.clsService.get('transaction') as DatabaseType) || this.db
//   }

//   protected getCurrentUser() {
//     return this.clsService.get('user')
//   }

//   public async create<FormattedTypeData, PrismaTypeData>(
//     data: Partial<PrismaTypeData>,
//     transformer: (data: PrismaTypeData) => FormattedTypeData,
//   ): Promise<FormattedTypeData> {
//     try {
//       const client = this.getClient()
//       const newItem = await client?.[this.model].create({
//         data,
//       })
//       return transformer(newItem)
//     } catch (error) {
//       throw error
//     }
//   }

//   public async createMany<PrismaTypeData>(
//     data: Partial<PrismaTypeData>[],
//   ): Promise<boolean> {
//     const client = this.getClient()
//     await client?.[this.model].createMany({ data })
//     return true
//   }

//   public async update<FormattedDataType, PrismaTableType>(
//     id: string,
//     data: Partial<PrismaTableType>,
//     transformer: (data: PrismaTableType) => FormattedDataType,
//   ): Promise<FormattedDataType> {
//     const client = this.getClient()
//     const updatedItem = await client?.[this.model].update({
//       where: { id },
//       data: this.addUserFields(data, 'update'),
//     })
//     return transformer(updatedItem)
//   }

//   public async updateMany<PrismaTableType>(
//     filters: Partial<PrismaTableType>,
//     data: Partial<PrismaTableType>,
//   ): Promise<boolean> {
//     const client = this.getClient()
//     const dataWithUserFields = this.addUserFields(data, 'update')
//     await client?.[this.model].updateMany({
//       where: filters,
//       data: dataWithUserFields,
//     })
//     return true
//   }

//   public async findOneByConditions<FormattedDataType, PrismaTableType>(
//     filters: Partial<PrismaTableType>,
//     transform: (data: PrismaTableType) => FormattedDataType,
//     includes?: Record<string, boolean>,
//   ): Promise<FormattedDataType> {
//     try {
//       const client = this.getClient()
//       const data = await client?.[this.model].findFirst({
//         where: filters,
//         include: includes,
//       })

//       return data ? transform(data) : null
//     } catch (error) {
//       throw error
//     }
//   }

//   public async get<FormattedDataType, PrismaTableType>(
//     id: string,
//     transform: (data: PrismaTableType) => FormattedDataType,
//     options?: {
//       includes?: any | any[] // You can customize the type here
//     },
//     key?: string,
//     value?: string,
//   ): Promise<FormattedDataType> {
//     try {
//       const client = this.getClient()

//       const data: PrismaTableType = await client?.[this.model].findUnique({
//         where: {
//           id: !!key ? value : id,
//         },
//         include: options?.includes,
//       })
//       if (!data) {
//         throw new NotFoundException(
//           `This data do not Exits data: ${!!key ? value : id}`,
//         )
//       }
//       return transform(data)
//     } catch (error) {
//       throw error
//     }
//   }

//   public async getAll<FormattedDataType, PrismaTableType>(
//     transformCollection: (data: PrismaTableType[]) => FormattedDataType[],
//     options?: {
//       orderBy?: any[] | any
//       includes?: any | any[] // You can customize the type here
//       where?: any
//       distinct?: string[]
//     },
//   ): Promise<FormattedDataType[]> {
//     try {
//       const client = this.getClient()
//       const allRawData = await client?.[this.model].findMany({
//         orderBy: options?.orderBy,
//         include: options?.includes,
//         where: options?.where,
//         distinct: options?.distinct,
//       })
//       return transformCollection(allRawData)
//     } catch (error) {
//       throw error
//     }
//   }

//   public async findUniqueByKey<PrismaTableType>(
//     key: string,
//     value: any,
//   ): Promise<PrismaTableType> {
//     try {
//       const client = this.getClient()
//       const data = await client?.[this.model].findUnique({
//         where: {
//           [key]: value,
//         },
//       })
//       if (!data) {
//         throw new NotFoundException(`No Data Found with this value: ${value}`)
//       }

//       return data
//     } catch (err) {
//       throw err
//     }
//   }

//   public async findUniqueBySpecificKey<PrismaTableType>(
//     specificKey: string,
//     value: any,
//     include?: Record<string, boolean>,
//   ): Promise<PrismaTableType> {
//     try {
//       const client = this.getClient()
//       const data = await client?.[this.model].findFirst({
//         where: {
//           [specificKey]: value,
//         },
//         include,
//       })

//       if (!data) {
//         throw new NotFoundException(`No Data Found with this value: ${value}`)
//       }

//       return data
//     } catch (error) {
//       throw error
//     }
//   }

//   public async findBySpecificKey<PrismaTableType>(
//     specificKey: string,
//     value: any,
//     include?: Record<string, boolean>,
//   ): Promise<PrismaTableType | null> {
//     try {
//       const client = this.getClient()
//       const data = await client?.[this.model].findFirst({
//         where: {
//           [specificKey]: value,
//         },
//         include,
//       })

//       return data
//     } catch (error) {
//       throw error
//     }
//   }

//   public async delete<T>(
//     id: string,
//     transformer?: (data: any) => T,
//   ): Promise<T> {
//     try {
//       const client = this.getClient()
//       const currentUser = this.getCurrentUser()
//       const deletedUser = await client?.[this.model].update({
//         where: {
//           id: id,
//           deleted_at: null,
//         },
//         data: {
//           last_updated_by_id: currentUser?.id,
//           last_updated_by: currentUser.firstName
//             ? `${currentUser.firstName ?? ''} ${currentUser?.lastName ?? ''}`
//             : null,
//           deleted_at: new Date(),
//         },
//       })
//       return transformer(deletedUser)
//     } catch (error) {
//       throw error
//     }
//   }

//   public async paginate<FormattedDataType, PrismaTableType>({
//     page,
//     pageSize,
//     transformCollection,
//     options = {} as {
//       where?: any
//       orderBy?: any[] | any
//       includes?: any | any[]
//       selects?: any[]
//     },
//   }: {
//     page: number
//     pageSize: number
//     transformCollection: (data: PrismaTableType[]) => FormattedDataType[]
//     options?: {
//       where?: any
//       orderBy?: any[] | any
//       includes?: any | any[] // You can customize the type here
//       selects?: any[]
//     }
//   }) {
//     page = Number(page ?? 1)
//     pageSize = Number(pageSize ?? 10)
//     const skip = (page - 1) * pageSize

//     try {
//       const client = this.getClient()
//       const queryOptions = {
//         where: options?.where,
//         orderBy: options?.orderBy,
//         skip,
//         take: pageSize,
//       }

//       const totalItems = await client?.[this.model].count({
//         where: options?.where,
//       }) // Get the total count of items

//       if (!!options?.selects && Object.keys(options?.selects)?.length) {
//         queryOptions['select'] = options?.selects
//       } else {
//         queryOptions['include'] = options?.includes
//       }
//       const data = await client?.[this.model].findMany(queryOptions)

//       const totalPages = totalItems != 0 ? Math.ceil(totalItems / pageSize) : 0
//       return {
//         data: transformCollection(data),
//         meta: {
//           totalItems,
//           totalPages,
//           perPage: pageSize,
//           currentPage: page,
//         },
//       }
//     } catch (error) {
//       throw error
//     }
//   }

//   public async countByKey(key: string, value: string): Promise<number> {
//     try {
//       const client = this.getClient()

//       const count = await client?.[this.model].count({
//         where: {
//           [key]: value,
//         },
//       })

//       return count
//     } catch (error) {
//       throw error
//     }
//   }

//   public async countByConditions(options: { where?: any }): Promise<number> {
//     try {
//       const client = this.getClient()

//       const count = await client?.[this.model].count({
//         where: options?.where,
//       })

//       return count
//     } catch (error) {
//       throw error
//     }
//   }

//   public async deleteMany<PrismaTypeData>(
//     filters: Partial<PrismaTypeData>[],
//   ): Promise<boolean> {
//     try {
//       const client = this.getClient()
//       const currentUser = this.getCurrentUser()

//       // Applying user fields to all items being deleted
//       const dataWithUserFields = {
//         deleted_at: new Date(), // Assuming this is how you mark an item as deleted
//         last_updated_by_id: currentUser?.id,
//         last_updated_by: currentUser?.firstName
//           ? `${currentUser?.firstName ?? ''} ${currentUser?.lastName ?? ''}`
//           : null,
//       }

//       // Execute delete operation
//       await client?.[this.model].updateMany({
//         where: {
//           ...filters,
//           deleted_at: null, // Only update items that are not already deleted
//         },
//         data: dataWithUserFields,
//       })

//       return true
//     } catch (error) {
//       throw error
//     }
//   }

//   public async permanentDeleteMany<PrismaTypeData>({
//     where,
//   }: {
//     where?: Partial<PrismaTypeData>
//   }): Promise<boolean> {
//     try {
//       const client = this.getClient()
//       await client?.[this.model].deleteMany({
//         where,
//       })

//       return true
//     } catch (error) {
//       throw error
//     }
//   }

//   public async permanentDelete<PrismaTypeData>({
//     where,
//   }: {
//     where?: Partial<PrismaTypeData>
//   }): Promise<boolean> {
//     try {
//       const client = this.getClient()
//       await client?.[this.model].deleteMany({
//         where,
//       })

//       return true
//     } catch (error) {
//       throw error
//     }
//   }
// }
