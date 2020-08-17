import { LevelUp } from 'levelup'
import { Failable, Success } from '../../common/utils/failable'
import { ErrorCode } from './ErrorCode'
import { RepositoryError } from './RepositoryError'

export async function getRepositoryResult<T>(
  db: LevelUp,
  key: string
): Promise<Failable<T, RepositoryError>> {
  try {
    const value = (await db.get(key)) as T
    return Success(value)
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
