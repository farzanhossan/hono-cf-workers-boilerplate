// import { ClsService } from 'nestjs-cls'
// import { IUser } from 'src/modules/user/interfaces'
// import { DbType, db } from 'src/shared/services/DBService'
// import { CLS_USER_KEY } from './base.constants'

// export class BaseService {
//   protected db: DbType
//   protected clsService: ClsService

//   constructor(clsService: ClsService) {
//     this.db = db
//     this.clsService = clsService
//   }

//   getAuthenticatedUser() {
//     return this.clsService.get<IUser>(CLS_USER_KEY)
//   }

//   async executeInTransaction<T>(
//     operation: (transactionClient: DbType) => Promise<T>,
//   ): Promise<T> {
//     return await this.db.$transaction(
//       async (transactionClient: DbType) => {
//         try {
//           // Set the transaction client in CLS context
//           this.clsService.set('transaction', transactionClient)

//           // Execute the operation within the transaction context
//           return await operation(transactionClient)
//         } catch (error) {
//           // Log the error if necessary
//           console.error('Transaction error:', error)
//           throw error
//         } finally {
//           console.log('Clearing transaction context')
//           // Clear the transaction client from CLS context
//           this.clsService.set('transaction', null)
//         }
//       },
//       {
//         timeout: 20000,
//       },
//     )
//   }
// }
