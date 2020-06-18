import { LevelUp } from 'levelup'
import { ErrorCode } from './ErrorCode'
import { RepositoryError } from './RepositoryError'
import { Failable } from '../../common/utils/failable'

export async function getRepositoryResult<T>(
  db: LevelUp,
  key: string
): Promise<Failable<T, RepositoryError>> {
  try {
    const value = await db.get(key)
    return {
      success: true,
      value: value as T,
    }
  } catch (error) {
    if (error.notFound) {
      return {
        success: false,
        error: new RepositoryError(
          ErrorCode.NotFound,
          'Not Found: ' + error.message
        ),
      }
    }

    return {
      success: false,
      error: new RepositoryError(
        ErrorCode.InternalError,
        'Internal Error: ' + error.message
      ),
    }
  }
}
