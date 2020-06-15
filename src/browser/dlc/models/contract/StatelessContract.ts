import { Contract } from '../../../../common/models/dlc/Contract'

export type StatelessContract<C extends Contract> = Omit<C, 'state'>
